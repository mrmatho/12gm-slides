// Diagram renderers for the Networks Diagram Generator.
//
// Each renderer is a plain-JS port of the matching Vue component in ../components/ — same
// geometry/layout math, stripped of Vue reactivity (no `computed`, props are plain objects) and
// emitting a self-contained SVG string (inline colors, no Tailwind classes) instead of a
// template. Kept in sync by hand with the source components; if you change a component's layout
// logic, mirror the change here.
//
// Every render*(props) function returns { width, height, svg } where `svg` is the *inner*
// markup (defs/lines/nodes/etc) — the caller wraps it in an <svg viewBox="..."> root.

const COLORS = {
  edge: '#475569',
  labelBg: '#e2e8f0',
  labelText: '#1e293b',
  nodeFill: '#e0f2fe',
  nodeStroke: '#0369a1',
  nodeText: '#0c4a6e',
  groupLabel: '#64748b',
  cut: '#ef4444',
  cutText: '#dc2626',
  dummyText: '#64748b',
  criticalEdge: '#ef4444',
  criticalLabelText: '#dc2626',
  criticalNodeFill: '#fecaca',
  bg: '#ffffff'
}

function esc(str) {
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function arrowMarker(id, color) {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z" fill="${color}" /></marker>`
}

// Point where the line from (node.x,node.y) toward (dx,dy) crosses the node's ellipse boundary.
function ellipseBoundaryPoint(node, dx, dy) {
  const dist = Math.hypot(dx, dy) || 1
  const ux = dx / dist
  const uy = dy / dist
  const denom = Math.hypot(ux / node.rx, uy / node.ry) || 1
  const t = 1 / denom
  return { x: node.x + ux * t, y: node.y + uy * t }
}

// Node radius/shape for a given label position: 'inside' sizes an ellipse to fit the label (the
// original component behaviour); 'above'/'below'/'left'/'right' draw a small fixed-size dot
// instead, since the label sits outside it as its own text element (see nodeMarkup).
function nodeRxRy(label, nodeRadius, labelPosition, dotRadius) {
  if (labelPosition === 'inside') {
    return { rx: Math.max(nodeRadius, String(label).length * 6.5 + 14), ry: nodeRadius }
  }
  return { rx: dotRadius, ry: dotRadius }
}

function sizeNode(node, nodeRadius, labelPosition = 'left', dotRadius = 6) {
  return { ...node, ...nodeRxRy(node.label, nodeRadius, labelPosition, dotRadius) }
}

function labelBox(midX, midY, text, opts = {}) {
  const w = opts.width ?? (String(text).length * 7.2 + 8)
  const h = opts.height ?? 16
  const fill = opts.critical ? COLORS.criticalLabelText : COLORS.labelText
  return `<rect x="${midX - w / 2}" y="${midY - h / 2}" width="${w}" height="${h}" fill="${COLORS.labelBg}" />` +
    `<text x="${midX}" y="${midY}" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" fill="${fill}">${esc(text)}</text>`
}

// 'inside' draws the label centered inside the (label-sized) node ellipse, matching every
// existing slide component — the ellipse is already an opaque shape, so the text needs no
// background of its own. 'above'/'below'/'left'/'right' draw the node as a small dot instead,
// with the label as a separate text element sitting just outside it (the style
// ActivityNetwork/ForwardScanNetwork use for event vertices when showTimes is off, offered here
// as a general per-diagram option) — floating over whatever else is on the canvas (edges,
// other labels), so it gets a subtle background box for legibility, same idea as labelBox().
function nodeMarkup(node, labelPosition = 'left') {
  if (labelPosition === 'inside') {
    return `<ellipse cx="${node.x}" cy="${node.y}" rx="${node.rx}" ry="${node.ry}" stroke-width="2" fill="${COLORS.nodeFill}" stroke="${COLORS.nodeStroke}" />` +
      `<text x="${node.x}" y="${node.y}" text-anchor="middle" dominant-baseline="central" style="font-size: 15px; font-weight: 600" fill="${COLORS.nodeText}">${esc(node.label)}</text>`
  }

  const gap = 10
  let tx = node.x
  let ty = node.y
  let anchor = 'middle'
  if (labelPosition === 'above') ty = node.y - node.ry - gap
  else if (labelPosition === 'below') ty = node.y + node.ry + gap
  else if (labelPosition === 'left') { tx = node.x - node.rx - gap; anchor = 'end' }
  else if (labelPosition === 'right') { tx = node.x + node.rx + gap; anchor = 'start' }

  const label = String(node.label)
  const textWidth = label.length * 7.2 + 8
  const textHeight = 16
  const rectX = anchor === 'middle' ? tx - textWidth / 2 : anchor === 'end' ? tx - textWidth : tx

  return `<circle cx="${node.x}" cy="${node.y}" r="${node.ry}" fill="${COLORS.nodeStroke}" />` +
    `<rect x="${rectX}" y="${ty - textHeight / 2}" width="${textWidth}" height="${textHeight}" rx="3" fill="${COLORS.labelBg}" />` +
    `<text x="${tx}" y="${ty}" text-anchor="${anchor}" dominant-baseline="central" style="font-size: 15px; font-weight: 600" fill="${COLORS.nodeText}">${esc(label)}</text>`
}

// ---------------------------------------------------------------------------------------------
// Simple Graph — plain nodes + edges, explicit x/y (no auto-layout). Not modelled on any
// existing component; a hand-placed alternative to the Mermaid `graph LR/TD` fences used
// throughout pages/*.md, for when you want an exportable static image instead. Undirected by
// default (plain lines, no arrowheads); renderDirectedSimpleGraph below is the same renderer
// with the default flipped, exposed as a separate diagram type rather than a checkbox so the two
// get distinct example JSON and aren't easy to mix up mid-edit.
// `labelPosition`: 'left' (default) | 'right' | 'above' | 'below' | 'inside' — 'inside' fits an
// ellipse to the label, as the slide components do; the others draw a small `dotRadius`
// (default 6) dot instead, with the label as its own text (on a subtle background box for
// legibility) sitting just outside it, on the given side.
export function renderSimpleGraph(props) {
  const width = props.width ?? 420
  const height = props.height ?? 240
  const nodeRadius = props.nodeRadius ?? 22
  const directed = props.directed ?? false
  const labelPosition = props.labelPosition ?? 'left'
  const dotRadius = props.dotRadius ?? 6

  const sizedNodes = (props.nodes ?? []).map(n => sizeNode(n, nodeRadius, labelPosition, dotRadius))
  const byId = new Map(sizedNodes.map(n => [n.id, n]))

  const arrowId = 'sg-arrow'
  let svg = directed ? `<defs>${arrowMarker(arrowId, COLORS.edge)}</defs>` : ''

  const edgeGeoms = (props.edges ?? []).map(edge => {
    const from = byId.get(edge.from)
    const to = byId.get(edge.to)
    const isDirected = edge.directed ?? directed
    const start = ellipseBoundaryPoint(from, to.x - from.x, to.y - from.y)
    const end = ellipseBoundaryPoint(to, from.x - to.x, from.y - to.y)
    return { ...edge, isDirected, x1: start.x, y1: start.y, x2: end.x, y2: end.y, midX: (start.x + end.x) / 2, midY: (start.y + end.y) / 2 }
  })

  for (const e of edgeGeoms) {
    svg += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${COLORS.edge}" stroke-width="2"${e.isDirected ? ` marker-end="url(#${arrowId})"` : ''} />`
  }
  for (const e of edgeGeoms) {
    if (e.label === undefined || e.label === null || e.label === '') continue
    svg += labelBox(e.midX, e.midY, e.label)
  }
  for (const n of sizedNodes) svg += nodeMarkup(n, labelPosition)

  return { width, height, svg }
}

export function renderDirectedSimpleGraph(props) {
  return renderSimpleGraph({ ...props, directed: props.directed ?? true })
}

// ---------------------------------------------------------------------------------------------
// Flow Network — port of components/FlowNetwork.vue. Explicit node x/y, capacity edges, optional
// dashed "cut" lines. `labelPosition`/`dotRadius` — see the note on renderSimpleGraph above.
export function renderFlowNetwork(props) {
  const width = props.width ?? 480
  const height = props.height ?? 220
  const nodeRadius = props.nodeRadius ?? 22
  const labelPosition = props.labelPosition ?? 'left'
  const dotRadius = props.dotRadius ?? 6

  const sizedNodes = (props.nodes ?? []).map(n => sizeNode(n, nodeRadius, labelPosition, dotRadius))
  const byId = new Map(sizedNodes.map(n => [n.id, n]))

  const arrowId = 'fn-arrow'
  let svg = `<defs>${arrowMarker(arrowId, COLORS.edge)}</defs>`

  const edgeLines = (props.edges ?? []).map(edge => {
    const from = byId.get(edge.from)
    const to = byId.get(edge.to)
    const start = ellipseBoundaryPoint(from, to.x - from.x, to.y - from.y)
    const end = ellipseBoundaryPoint(to, from.x - to.x, from.y - to.y)
    return { capacity: edge.capacity, x1: start.x, y1: start.y, x2: end.x, y2: end.y, midX: (start.x + end.x) / 2, midY: (start.y + end.y) / 2 }
  })

  for (const e of edgeLines) {
    svg += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${COLORS.edge}" stroke-width="2" marker-end="url(#${arrowId})" />`
  }
  for (const e of edgeLines) svg += labelBox(e.midX, e.midY, e.capacity, { width: 20 })

  for (const cut of props.cuts ?? []) {
    svg += `<line x1="${cut.x1}" y1="${cut.y1}" x2="${cut.x2}" y2="${cut.y2}" style="stroke-width: 2.5px" stroke-dasharray="6 5" stroke="${COLORS.cut}" />`
    if (cut.label) {
      const lx = cut.labelX ?? cut.x1
      const ly = cut.labelY ?? cut.y1 - 10
      svg += `<text x="${lx}" y="${ly}" text-anchor="middle" dominant-baseline="central" style="font-size: 13px; font-weight: 600; paint-order: stroke; stroke-width: 4px" fill="${COLORS.cutText}" stroke="${COLORS.bg}">${esc(cut.label)}</text>`
    }
  }

  for (const n of sizedNodes) svg += nodeMarkup(n, labelPosition)

  return { width, height, svg }
}

// ---------------------------------------------------------------------------------------------
// Bipartite / Matching Graph — port of components/BipartiteGraph.vue. Two auto-stacked columns,
// undirected edges (a possible pairing, not a direction). `labelPosition`/`dotRadius` — see the
// note on renderSimpleGraph above; in dot mode, column spacing grows a little to leave room for
// the external label text.
export function renderBipartiteGraph(props) {
  const width = props.width ?? 360
  const height = props.height ?? 240
  const nodeRadius = props.nodeRadius ?? 20
  const columnInset = props.columnInset ?? 70
  const leftLabel = props.leftLabel ?? ''
  const rightLabel = props.rightLabel ?? ''
  const leftNodes = props.leftNodes ?? []
  const rightNodes = props.rightNodes ?? []
  const labelPosition = props.labelPosition ?? 'left'
  const dotRadius = props.dotRadius ?? 6

  // Dot mode draws much smaller nodes than label-sized ellipses, but still needs headroom for
  // the label text sitting above/below each one — hence the extra allowance below.
  const effectiveRadius = labelPosition === 'inside' ? nodeRadius : dotRadius
  const marginTop = (leftLabel || rightLabel) ? 34 : 16
  const bottomMargin = 16
  const minSpacing = effectiveRadius * 2 + (labelPosition === 'inside' ? 8 : 24)
  const maxColumnCount = Math.max(leftNodes.length, rightNodes.length, 1)
  const effectiveHeight = Math.max(height, marginTop + bottomMargin + minSpacing * (maxColumnCount + 1))

  function layoutColumn(nodes, x) {
    const usableHeight = effectiveHeight - marginTop - bottomMargin
    const spacing = usableHeight / (nodes.length + 1)
    return nodes.map((node, i) => ({
      ...node,
      x,
      y: marginTop + spacing * (i + 1),
      ...nodeRxRy(node.label, nodeRadius, labelPosition, dotRadius)
    }))
  }

  const leftX = columnInset
  const rightX = width - columnInset
  const leftCol = layoutColumn(leftNodes, leftX)
  const rightCol = layoutColumn(rightNodes, rightX)
  const sizedNodes = [...leftCol, ...rightCol]
  const byId = new Map(sizedNodes.map(n => [n.id, n]))

  const edgeLines = (props.edges ?? []).map(edge => {
    const from = byId.get(edge.from)
    const to = byId.get(edge.to)
    const start = ellipseBoundaryPoint(from, to.x - from.x, to.y - from.y)
    const end = ellipseBoundaryPoint(to, from.x - to.x, from.y - to.y)
    return { label: edge.label, x1: start.x, y1: start.y, x2: end.x, y2: end.y, midX: (start.x + end.x) / 2, midY: (start.y + end.y) / 2 }
  })

  let svg = ''
  for (const e of edgeLines) {
    svg += `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${COLORS.edge}" stroke-width="2" />`
  }
  for (const e of edgeLines) {
    if (!e.label) continue
    svg += labelBox(e.midX, e.midY, e.label, { width: 20 })
  }
  if (leftLabel) svg += `<text x="${leftX}" y="16" text-anchor="middle" dominant-baseline="central" style="font-size: 13px; font-weight: 600" fill="${COLORS.groupLabel}">${esc(leftLabel)}</text>`
  if (rightLabel) svg += `<text x="${rightX}" y="16" text-anchor="middle" dominant-baseline="central" style="font-size: 13px; font-weight: 600" fill="${COLORS.groupLabel}">${esc(rightLabel)}</text>`
  for (const n of sizedNodes) svg += nodeMarkup(n, labelPosition)

  return { width, height: effectiveHeight, svg }
}

// ---------------------------------------------------------------------------------------------
// Activity Network (AOA) — port of components/ActivityNetwork.vue +
// composables/useActivityNetworkLayout.js (static/full-reveal form only — the progressive-reveal
// behaviour of ForwardScanNetwork.vue is a presentation feature that doesn't apply to a one-shot
// export). Describes *tasks* + predecessors; event nodes, EST/LST and critical path are derived.
// `showTimes` defaults to false here (the source component defaults it true) — the generator is
// for one-off exports, where a plain dot-vertex diagram (durations only, on the edges) is the
// more commonly wanted starting point; `highlightCriticalPath` defaults false, matching the
// source component.
const START = '__start__'
const END = '__end__'

function groupKey(predecessors) {
  return predecessors.length ? [...predecessors].sort().join('|') : START
}

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

function buildActivityGraph(tasksIn) {
  const tasks = tasksIn.map(t => ({
    id: t.id,
    duration: t.dummy ? 0 : (t.duration ?? 0),
    predecessors: t.predecessors ?? [],
    dummy: !!t.dummy
  }))

  const groupEventOf = new Map()
  groupEventOf.set(START, START)
  for (const task of tasks) {
    const key = groupKey(task.predecessors)
    if (!groupEventOf.has(key)) groupEventOf.set(key, key)
  }

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
      toEvent = task.id
      for (const groupKey_ of downstream) {
        if (groupKey_ === task.id) continue
        edges.push({ key: `auto-dummy-${task.id}-${groupKey_}`, from: toEvent, to: groupKey_, duration: 0, dummy: true, label: 'dummy,0' })
      }
    } else {
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
}

function layoutActivityGraph(graph, props, nodeRadius) {
  const { nodeIds, edges } = graph
  const { rank, order, outEdges } = topoRank(nodeIds, edges)

  const inEdgesOf = new Map(nodeIds.map(id => [id, []]))
  for (const edge of edges) inEdgesOf.get(edge.to).push(edge)

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
      if (Math.abs(other.y - lineY) < nodeRadius * 2) nudgeDown.add(id)
    }
  }

  const height = props.height ?? (baseHeight + (nudgeDown.size ? NUDGE : 0))
  const positions = computePositions(height)
  for (const id of nudgeDown) {
    const p = positions.get(id)
    positions.set(id, { x: p.x, y: p.y + NUDGE })
  }

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
    const radius = nodeRadius

    const parallelGroup = parallelGroups.get(`${edge.from}|${edge.to}`)
    const parallelCount = parallelGroup.length
    const parallelIndex = parallelGroup.indexOf(edge.key)

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
      critical: (props.highlightCriticalPath ?? false) && critical.has(edge.key)
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

  return { width, height, nodes, edges: laidOutEdges, order }
}

export function renderActivityNetwork(props) {
  const showTimes = props.showTimes ?? false
  const nodeRadius = props.nodeRadius ?? 26
  const dotRadius = props.dotRadius ?? 6
  const displayRadius = showTimes ? nodeRadius : dotRadius

  const graph = buildActivityGraph(props.tasks ?? [])
  const layout = layoutActivityGraph(graph, props, displayRadius)

  const arrowId = 'an-arrow'
  const arrowIdCritical = 'an-arrow-critical'
  let svg = `<defs>${arrowMarker(arrowId, COLORS.edge)}${arrowMarker(arrowIdCritical, COLORS.criticalEdge)}</defs>`

  for (const edge of layout.edges) {
    svg += `<path d="${edge.path}" fill="none" stroke="${edge.critical ? COLORS.criticalEdge : COLORS.edge}" stroke-width="${edge.critical ? 3 : 2}"${edge.dummy ? ' stroke-dasharray="6 5"' : ''} marker-end="url(#${edge.critical ? arrowIdCritical : arrowId})" />`
  }
  for (const edge of layout.edges) {
    if (!edge.label) continue
    const w = edge.label.length * (edge.dummy ? 4.2 : 7.2) + (edge.dummy ? 6 : 8)
    const h = edge.dummy ? 12 : 16
    const fill = edge.critical ? COLORS.criticalLabelText : (edge.dummy ? COLORS.dummyText : COLORS.labelText)
    svg += `<rect x="${edge.midX - w / 2}" y="${edge.midY - h / 2}" width="${w}" height="${h}" fill="${COLORS.labelBg}" />`
    svg += `<text x="${edge.midX}" y="${edge.midY}" text-anchor="middle" dominant-baseline="central" style="font-size: ${edge.dummy ? 13 : 22}px" fill="${fill}">${esc(edge.label)}</text>`
  }

  for (const node of layout.nodes) {
    const critical = node.critical && (props.highlightCriticalPath ?? false)
    if (showTimes) {
      const fill = critical ? COLORS.criticalNodeFill : COLORS.nodeFill
      svg += `<ellipse cx="${node.x}" cy="${node.y}" rx="${displayRadius}" ry="${displayRadius}" stroke-width="2" fill="${fill}" stroke="${critical ? COLORS.cut : COLORS.nodeStroke}" />`
      svg += `<line x1="${node.x}" y1="${node.y - displayRadius}" x2="${node.x}" y2="${node.y + displayRadius}" stroke-width="1.5" stroke="${COLORS.nodeStroke}" />`
      svg += `<text x="${node.x - displayRadius * 0.5}" y="${node.y}" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" fill="${COLORS.nodeText}">${node.est}</text>`
      svg += `<text x="${node.x + displayRadius * 0.5}" y="${node.y}" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" fill="${COLORS.nodeText}">${node.lst}</text>`
    } else {
      svg += `<circle cx="${node.x}" cy="${node.y}" r="${displayRadius}" fill="${critical ? COLORS.cut : COLORS.nodeStroke}" />`
    }
  }

  return { width: layout.width, height: layout.height, svg }
}

export const DIAGRAM_TYPES = {
  simple: { label: 'Simple Graph', render: renderSimpleGraph },
  simpleDirected: { label: 'Directed Simple Graph', render: renderDirectedSimpleGraph },
  flow: { label: 'Flow Network', render: renderFlowNetwork },
  bipartite: { label: 'Bipartite / Matching', render: renderBipartiteGraph },
  activity: { label: 'Activity Network (AOA)', render: renderActivityNetwork }
}
