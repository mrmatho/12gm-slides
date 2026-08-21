<!--
  ActivityNetwork: hand-drawn SVG activity-on-arrow (AOA) network, auto-built from a precedence
  table. Unlike FlowNetwork (where you place nodes/edges by hand), here you only describe *tasks*
  and their predecessors — event nodes and their layout are derived for you.

  Props:
    tasks   Array<{ id, duration, predecessors?, dummy? }>   required.
      id            unique task id, e.g. 'A'. Shown on the edge as "A,3" (id,duration).
      duration      number. Ignored (treated as 0) when dummy is true.
      predecessors  array of task ids that must finish before this task can start. Omit/[] for
                    a task with no predecessors (it will start from the network's start event).
      dummy         optional bool. A dummy activity: drawn as a dashed edge with a small
                    "dummy,0" label (deliberately smaller than real activity labels so it
                    doesn't compete with them). Give it duration 0 (or omit it) and an id (used
                    only internally/for other tasks to reference as a predecessor — the id
                    itself is never displayed). Add a dummy
                    yourself when the precedence table needs one; the component *also* auto-inserts
                    a dummy wherever one is structurally forced (see below) — you don't need to
                    pre-empt those.

    How events are derived:
      - Tasks that share an identical predecessor set start from the same event (they only ever
        become available at the same time).
      - A task's end event is the start event of whatever it feeds into — unless it feeds two or
        more genuinely different predecessor-sets (i.e. different downstream tasks need it
        combined with different other tasks). That's a structural fan-out that can't be drawn as
        one arrowhead, so the component gives that task its own end event and auto-inserts dummy
        edges from it to each place that needs it. This is the only case dummies are auto-added;
        it's forced by precedence correctness, not a style choice.
      - Tasks with no predecessors all start from the single global start event; tasks nothing
        depends on all finish at the single global end event.

    highlightCriticalPath   optional bool, default false. EST/LST (and hence the critical path)
                             are always computed; this just controls whether critical-path edges
                             and events are drawn in red/thicker. Off by default so it doesn't
                             fight with a lesson that hasn't covered critical path yet.
    showTimes    optional bool, default true. Show events as circles split EST | LST. Set false
                 to draw vertices as plain dots instead, with no times — useful while introducing
                 activity networks, before EST/LST are taught.
    width, height   optional. Auto-sized from the derived layout (columns x rows) if omitted.
    nodeRadius      optional, default 26. Radius of EST/LST event circles.
    dotRadius       optional, default 6. Radius of vertices when showTimes is false.

  Example:
    <ActivityNetwork :tasks="[
      { id: 'A', duration: 3, predecessors: [] },
      { id: 'B', duration: 3, predecessors: [] },
      { id: 'C', duration: 2, predecessors: ['A'] },
      { id: 'D', duration: 4, predecessors: ['B'] },
      { id: 'E', duration: 2, predecessors: ['C', 'D'] },
    ]" />
-->
<template>
  <div class="activity-network-wrap">
    <svg :viewBox="`0 0 ${layout.width} ${layout.height}`" class="activity-network" :style="{ width: displayWidth + 'px' }">
      <defs>
        <marker :id="arrowId" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" class="fill-slate-600 dark:fill-slate-300" />
        </marker>
        <marker :id="arrowIdCritical" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" class="fill-red-500 dark:fill-red-400" />
        </marker>
      </defs>

      <path
        v-for="edge in layout.edges"
        :key="'edge-line-' + edge.key"
        :d="edge.path"
        fill="none"
        :class="edge.critical ? 'stroke-red-500 dark:stroke-red-400' : 'stroke-slate-600 dark:stroke-slate-300'"
        :stroke-width="edge.critical ? 3 : 2"
        :stroke-dasharray="edge.dummy ? '6 5' : null"
        :marker-end="`url(#${edge.critical ? arrowIdCritical : arrowId})`"
      />

      <g v-for="edge in layout.edges.filter(e => e.label)" :key="'edge-label-' + edge.key">
        <rect
          :x="edge.midX - edge.label.length * (edge.dummy ? 2.1 : 3.6) - (edge.dummy ? 3 : 4)"
          :y="edge.midY - (edge.dummy ? 6 : 9)"
          :width="edge.label.length * (edge.dummy ? 4.2 : 7.2) + (edge.dummy ? 6 : 8)"
          :height="edge.dummy ? 12 : 16"
          class="fill-slate-200 dark:fill-slate-800"
        />
        <text
          :x="edge.midX"
          :y="edge.midY"
          text-anchor="middle"
          dominant-baseline="central"
          :style="{ fontSize: (edge.dummy ? '13px' : '22px') }"
          :class="edge.critical ? 'fill-red-600 dark:fill-red-300' : (edge.dummy ? 'fill-slate-500 dark:fill-slate-400' : 'fill-slate-800 dark:fill-slate-100')"
        >{{ edge.label }}</text>
      </g>

      <g v-for="node in layout.nodes" :key="node.id">
        <circle
          :cx="node.x"
          :cy="node.y"
          :r="nodeDisplayRadius"
          :stroke-width="showTimes ? 2 : 0"
          :class="nodeCircleClass(node)"
        />

        <template v-if="showTimes">
          <line :x1="node.x" :y1="node.y - nodeDisplayRadius" :x2="node.x" :y2="node.y + nodeDisplayRadius" stroke-width="1.5" class="stroke-sky-700 dark:stroke-sky-300" />

          <text :x="node.x - nodeDisplayRadius * 0.5" :y="node.y" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" class="fill-sky-900 dark:fill-sky-100">{{ node.est }}</text>
          <text :x="node.x + nodeDisplayRadius * 0.5" :y="node.y" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" class="fill-sky-900 dark:fill-sky-100">{{ node.lst }}</text>
        </template>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'

const arrowId = `activity-network-arrow-${useId()}`
const arrowIdCritical = `activity-network-arrow-critical-${useId()}`

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  highlightCriticalPath: {
    type: Boolean,
    default: false
  },
  showTimes: {
    type: Boolean,
    default: true
  },
  width: {
    type: Number,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  nodeRadius: {
    type: Number,
    default: 26
  },
  dotRadius: {
    type: Number,
    default: 6
  }
})

const displayWidth = computed(() => Math.min(layout.value.width, 720))
const nodeDisplayRadius = computed(() => props.showTimes ? props.nodeRadius : props.dotRadius)

function nodeCircleClass(node) {
  const isCritical = node.critical && props.highlightCriticalPath
  if (!props.showTimes) {
    return isCritical ? 'fill-red-500 dark:fill-red-400' : 'fill-sky-700 dark:fill-sky-300'
  }
  return isCritical
    ? 'fill-sky-100 dark:fill-sky-900 stroke-red-500 dark:stroke-red-400'
    : 'fill-sky-100 dark:fill-sky-900 stroke-sky-700 dark:stroke-sky-300'
}

const START = '__start__'
const END = '__end__'

function groupKey(predecessors) {
  return predecessors.length ? [...predecessors].sort().join('|') : START
}

// Derives event nodes + edges (including forced dummies) from the task/predecessor list, lays
// them out into columns/rows, then runs a forward/backward pass for EST/LST and critical path.
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

// Kahn's algorithm: topological order + longest-path-from-start rank (used for the x column).
// Dummy edges contribute 0 to the rank step (they take no time) so a dummy's target shares its
// source's column instead of being pushed out an extra column with nothing to show for it —
// that extra column was forcing the *real* activities beside it into skip/bow edges (see the
// ActivityNetwork/dummy layout note above).
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
      if (Math.abs(other.y - lineY) < nodeDisplayRadius.value * 2) nudgeDown.add(id)
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
    const radius = nodeDisplayRadius.value

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

  return { width, height, nodes, edges: laidOutEdges }
})
</script>

<style scoped>
.activity-network-wrap {
  display: flex;
  justify-content: center;
}

.activity-network {
  max-width: 100%;
  height: auto;
}
</style>
