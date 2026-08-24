// Shared activity-on-arrow (AOA) graph derivation + layout, used by both ActivityNetwork.vue
// (static/final diagrams) and ForwardScanNetwork.vue (step-revealed EST/LST teaching diagrams).
// Both components describe *tasks* and their predecessors; this derives event nodes, lays them
// out into columns/rows, and runs the forward/backward pass for EST/LST + critical path. See the
// doc comment at the top of ActivityNetwork.vue for the task/predecessor shape and derivation
// rules (shared event grouping, forced dummies on structural fan-out, etc).
//
// `props` is a component's reactive props object exposing `tasks`, `width`, `height` and
// `highlightCriticalPath`. `nodeRadius` is a computed/ref of the radius to lay edges out
// against — callers decide what that radius means visually (a full EST/LST circle, a small dot,
// etc); this module only uses it for geometry (trimming edge endpoints to the circle boundary,
// deciding when a node sits too close to a skip-edge's path to nudge/bow around).
//
// Returns `{ graph, layout }`, both computed refs.
import { computed } from 'vue'

const START = '__start__'
const END = '__end__'

function groupKey(predecessors) {
  return predecessors.length ? [...predecessors].sort().join('|') : START
}

// Kahn's algorithm: topological order + longest-path-from-start rank (used for the x column).
// Dummy edges contribute 0 to the rank step (they take no time) so a dummy's target shares its
// source's column instead of being pushed out an extra column with nothing to show for it.
function topoRank(nodeIds, edges) {
  const outEdges = new Map(nodeIds.map(id => [id, []]))
  const inDegree = new Map(nodeIds.map(id => [id, 0]))
  for (const edge of edges) {
    outEdges.get(edge.from).push(edge)
    inDegree.set(edge.to, inDegree.get(edge.to) + 1)
  }

  const rank = new Map(nodeIds.map(id => [id, 0]))
  const order = []
  const queue = nodeIds.filter(id => inDegree.get(id) === 0)
  const remaining = new Map(inDegree)

  while (queue.length) {
    const id = queue.shift()
    order.push(id)
    for (const edge of outEdges.get(id)) {
      rank.set(edge.to, Math.max(rank.get(edge.to), rank.get(id) + (edge.dummy ? 0 : 1)))
      remaining.set(edge.to, remaining.get(edge.to) - 1)
      if (remaining.get(edge.to) === 0) queue.push(edge.to)
    }
  }

  return { rank, order, outEdges }
}

const COLUMN_SPACING = 130
const ROW_SPACING = 84
const MARGIN_X = 70
const MARGIN_Y = 55

export function useActivityNetworkLayout(props, nodeRadius) {
  // Derives event nodes + edges (including forced dummies) from the task/predecessor list.
  const graph = computed(() => {
    const tasks = props.tasks.map(t => ({
      id: t.id,
      duration: t.dummy ? 0 : (t.duration ?? 0),
      predecessors: t.predecessors ?? [],
      dummy: !!t.dummy
    }))

    // One event per distinct predecessor-set; that event is the shared start event for every
    // task in the set.
    const groupEventOf = new Map()
    groupEventOf.set(START, START)
    for (const task of tasks) {
      const key = groupKey(task.predecessors)
      if (!groupEventOf.has(key)) groupEventOf.set(key, key)
    }

    // Which group-keys (by their predecessor list) does each task feed into?
    const downstreamGroupsOf = new Map()
    for (const task of tasks) {
      for (const pred of task.predecessors) {
        if (!downstreamGroupsOf.has(pred)) downstreamGroupsOf.set(pred, new Set())
        downstreamGroupsOf.get(pred).add(groupKey(task.predecessors))
      }
    }

    const edges = []
    let usesEnd = false

    for (const task of tasks) {
      const fromEvent = groupEventOf.get(groupKey(task.predecessors))
      const downstream = [...(downstreamGroupsOf.get(task.id) ?? [])]

      let toEvent
      if (downstream.length === 0) {
        toEvent = END
        usesEnd = true
      } else if (downstream.length === 1) {
        toEvent = downstream[0]
      } else if (downstream.includes(task.id)) {
        // One of the fan-out targets is this task's own singleton group (some other task
        // depends on this task alone) — that group's event *is* this task's end event, no
        // dummy needed for it. Only the genuinely different merge group(s) need a dummy out.
        toEvent = task.id
        for (const groupKey_ of downstream) {
          if (groupKey_ === task.id) continue
          edges.push({ key: `auto-dummy-${task.id}-${groupKey_}`, from: toEvent, to: groupKey_, duration: 0, dummy: true, label: 'dummy,0' })
        }
      } else {
        // Structural fan-out: this task feeds genuinely different predecessor-sets, so it needs
        // its own event with dummy edges radiating out to each place that needs it.
        toEvent = `__dedicated_${task.id}__`
        for (const groupKey_ of downstream) {
          edges.push({ key: `auto-dummy-${task.id}-${groupKey_}`, from: toEvent, to: groupKey_, duration: 0, dummy: true, label: 'dummy,0' })
        }
      }

      edges.push({ key: task.id, from: fromEvent, to: toEvent, duration: task.duration, dummy: task.dummy, label: task.dummy ? 'dummy,0' : `${task.id},${task.duration}` })
    }

    const nodeIds = new Set([START])
    if (usesEnd) nodeIds.add(END)
    for (const edge of edges) {
      nodeIds.add(edge.from)
      nodeIds.add(edge.to)
    }

    return { nodeIds: [...nodeIds], edges }
  })

  const layout = computed(() => {
    const { nodeIds, edges } = graph.value
    const { rank, order, outEdges } = topoRank(nodeIds, edges)

    const inEdgesOf = new Map(nodeIds.map(id => [id, []]))
    for (const edge of edges) inEdgesOf.get(edge.to).push(edge)

    // Order nodes within each column by the average row of their already-placed predecessors
    // (barycenter heuristic) to keep crossings low; ties fall back to topological order.
    const rowOf = new Map()
    const maxRank = Math.max(...[...rank.values()])
    for (let r = 0; r <= maxRank; r++) {
      const inColumn = order.filter(id => rank.get(id) === r)
      const withKey = inColumn.map(id => {
        const preds = inEdgesOf.get(id).map(e => rowOf.get(e.from)).filter(v => v !== undefined)
        const key = preds.length ? preds.reduce((a, b) => a + b, 0) / preds.length : order.indexOf(id)
        return { id, key }
      })
      withKey.sort((a, b) => a.key - b.key)
      withKey.forEach((entry, i) => rowOf.set(entry.id, i))
    }

    const nodesPerColumn = new Map()
    for (const id of nodeIds) {
      const r = rank.get(id)
      nodesPerColumn.set(r, (nodesPerColumn.get(r) ?? 0) + 1)
    }
    const maxNodesInColumn = Math.max(...[...nodesPerColumn.values()])

    const autoWidth = MARGIN_X * 2 + maxRank * COLUMN_SPACING
    const baseHeight = Math.max(160, MARGIN_Y * 2 + Math.max(0, maxNodesInColumn - 1) * ROW_SPACING)
    const width = props.width ?? Math.max(360, autoWidth)
    const BOW = ROW_SPACING * 0.65
    const NUDGE = ROW_SPACING * 0.55

    function computePositions(forHeight) {
      const positions = new Map()
      for (const id of nodeIds) {
        const r = rank.get(id)
        const rowsInColumn = nodesPerColumn.get(r)
        const columnHeight = Math.max(0, rowsInColumn - 1) * ROW_SPACING
        const columnTop = (forHeight - columnHeight) / 2
        positions.set(id, {
          x: MARGIN_X + (maxRank === 0 ? width / 2 - MARGIN_X : (r / maxRank) * (width - MARGIN_X * 2)),
          y: columnTop + rowOf.get(id) * ROW_SPACING
        })
      }
      return positions
    }

    // A "skip" edge spans more than one column — its from/to events ended up several ranks
    // apart because a parallel branch (e.g. B->D) takes more steps than this one (e.g. C
    // alone) before they merge again. On a draft layout, find the nodes sitting directly on
    // such a skip edge's straight-line path (e.g. B and D) and nudge just those down a row,
    // so the longer branch reads as a visually distinct lower path instead of overlapping it.
    const draftPositions = computePositions(baseHeight)
    const nudgeDown = new Set()
    for (const edge of edges) {
      const fromRank = rank.get(edge.from)
      const toRank = rank.get(edge.to)
      if (toRank - fromRank <= 1) continue
      const from = draftPositions.get(edge.from)
      const to = draftPositions.get(edge.to)
      for (const id of nodeIds) {
        if (id === edge.from || id === edge.to) continue
        const otherRank = rank.get(id)
        if (otherRank <= fromRank || otherRank >= toRank) continue
        const other = draftPositions.get(id)
        const t = (other.x - from.x) / (to.x - from.x)
        const lineY = from.y + t * (to.y - from.y)
        if (Math.abs(other.y - lineY) < nodeRadius.value * 2) nudgeDown.add(id)
      }
    }

    const height = props.height ?? (baseHeight + (nudgeDown.size ? NUDGE : 0))
    const positions = computePositions(height)
    for (const id of nudgeDown) {
      const p = positions.get(id)
      positions.set(id, { x: p.x, y: p.y + NUDGE })
    }

    // Forward pass (EST) then backward pass (LST) over the derived event graph.
    const est = new Map(nodeIds.map(id => [id, 0]))
    for (const id of order) {
      for (const edge of outEdges.get(id)) {
        est.set(edge.to, Math.max(est.get(edge.to), est.get(id) + edge.duration))
      }
    }

    const sinks = nodeIds.filter(id => outEdges.get(id).length === 0)
    const projectEnd = Math.max(0, ...sinks.map(id => est.get(id)))
    const lst = new Map(nodeIds.map(id => [id, sinks.includes(id) ? projectEnd : Infinity]))
    for (let i = order.length - 1; i >= 0; i--) {
      const id = order[i]
      for (const edge of outEdges.get(id)) {
        lst.set(id, Math.min(lst.get(id), lst.get(edge.to) - edge.duration))
      }
    }

    const critical = new Set(edges.filter(e => est.get(e.from) + e.duration === lst.get(e.to)).map(e => e.key))
    const criticalNodes = new Set(nodeIds.filter(id => est.get(id) === lst.get(id)))

    const nodes = nodeIds.map(id => ({
      id,
      est: est.get(id),
      lst: lst.get(id),
      critical: criticalNodes.has(id),
      x: positions.get(id).x,
      y: positions.get(id).y
    }))

    // Two different tasks can legitimately share the same from/to event (e.g. two parallel
    // activities out of the same start that both merge into the same event) — group edges by
    // endpoint pair so those get spread apart instead of drawn as identical, mutually-hiding paths.
    const parallelGroups = new Map()
    for (const edge of edges) {
      const key = `${edge.from}|${edge.to}`
      if (!parallelGroups.has(key)) parallelGroups.set(key, [])
      parallelGroups.get(key).push(edge.key)
    }

    const nodeById = new Map(nodes.map(n => [n.id, n]))
    const laidOutEdges = edges.map(edge => {
      const from = nodeById.get(edge.from)
      const to = nodeById.get(edge.to)
      const fromRank = rank.get(edge.from)
      const toRank = rank.get(edge.to)
      const radius = nodeRadius.value

      const parallelGroup = parallelGroups.get(`${edge.from}|${edge.to}`)
      const parallelCount = parallelGroup.length
      const parallelIndex = parallelGroup.indexOf(edge.key)

      // Would a straight line from `from` to `to` run through some unrelated node sitting in
      // a column strictly between them? If so, bow the curve away from it.
      let bow = 0
      if (toRank - fromRank > 1) {
        for (const other of nodes) {
          if (other.id === from.id || other.id === to.id) continue
          const otherRank = rank.get(other.id)
          if (otherRank <= fromRank || otherRank >= toRank) continue
          const t = (other.x - from.x) / (to.x - from.x)
          const lineY = from.y + t * (to.y - from.y)
          if (Math.abs(other.y - lineY) < radius * 2) {
            bow += other.y >= lineY ? -1 : 1
          }
        }
      }

      const base = {
        key: edge.key,
        dummy: edge.dummy,
        label: edge.label,
        critical: props.highlightCriticalPath && critical.has(edge.key)
      }

      if (bow === 0 && parallelCount <= 1) {
        const dx = to.x - from.x
        const dy = to.y - from.y
        const dist = Math.hypot(dx, dy) || 1
        const ux = dx / dist
        const uy = dy / dist
        const x1 = from.x + ux * radius
        const y1 = from.y + uy * radius
        const x2 = to.x - ux * radius
        const y2 = to.y - uy * radius
        return { ...base, path: `M ${x1} ${y1} L ${x2} ${y2}`, midX: (x1 + x2) / 2, midY: (y1 + y2) / 2 }
      }

      const midX = (from.x + to.x) / 2
      const midY = (from.y + to.y) / 2
      const dx = to.x - from.x
      const dy = to.y - from.y
      const dist = Math.hypot(dx, dy) || 1
      const bowDist = parallelCount > 1
        ? BOW * (parallelIndex - (parallelCount - 1) / 2)
        : BOW * Math.sign(bow)
      const cx = midX + (-dy / dist) * bowDist
      const cy = midY + (dx / dist) * bowDist

      const startDx = cx - from.x
      const startDy = cy - from.y
      const startDist = Math.hypot(startDx, startDy) || 1
      const x1 = from.x + (startDx / startDist) * radius
      const y1 = from.y + (startDy / startDist) * radius

      const endDx = to.x - cx
      const endDy = to.y - cy
      const endDist = Math.hypot(endDx, endDy) || 1
      const x2 = to.x - (endDx / endDist) * radius
      const y2 = to.y - (endDy / endDist) * radius

      return {
        ...base,
        path: `M ${x1} ${y1} Q ${cx} ${cy} ${x2} ${y2}`,
        midX: 0.25 * x1 + 0.5 * cx + 0.25 * x2,
        midY: 0.25 * y1 + 0.5 * cy + 0.25 * y2
      }
    })

    // `order` (forward topological order) is exposed so callers can drive a forward-scan /
    // backward-scan reveal sequence (forward = order, backward = [...order].reverse()) without
    // recomputing topo sort themselves.
    return { width, height, nodes, edges: laidOutEdges, order }
  })

  return { graph, layout }
}
