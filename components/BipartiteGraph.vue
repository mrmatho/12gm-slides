<!--
  BipartiteGraph: hand-drawn SVG diagram for two-set matching/allocation slides (e.g. people <-> tasks).
  Modelled on FlowNetwork.vue but lays nodes out automatically instead of taking explicit x/y: each set
  is stacked vertically into its own column (left set on the left, right set on the right), evenly spaced.

  Props:
    leftNodes, rightNodes  Array<{ id, label }>   required. Each set is stacked vertically, one column
                                                   per set, in the order given.
    edges  Array<{ from, to, label? }>            optional. from/to reference node ids from either set;
                                                   drawn as a plain (undirected) line, since allocation
                                                   edges represent a possible pairing, not a direction.
                                                   `label` (e.g. a cost) is shown at the midpoint if given.
    leftLabel, rightLabel   optional group headings shown above each column (e.g. "People" / "Tasks").
    width, height   optional, default 360x240. `height` is a floor, not a fixed size — it auto-grows
                                                so the longest column's nodes never overlap, so you only
                                                need to raise it to add breathing room, not to fit nodes.
    columnInset     optional, default 70. Distance in svg units from each side to its column of nodes.
    nodeRadius      optional, default 20. Minimum node half-height; longer labels widen automatically.

  Example:
    <BipartiteGraph
      :leftNodes="[{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }, { id: 'C', label: 'C' }]"
      :rightNodes="[{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }]"
      :edges="[{ from: 'A', to: '1' }, { from: 'A', to: '3' }, { from: 'B', to: '1' }, { from: 'B', to: '2' }, { from: 'C', to: '3' }]"
      leftLabel="People"
      rightLabel="Tasks"
    />
-->
<template>
  <div class="bipartite-graph-wrap">
    <svg :viewBox="`0 0 ${width} ${effectiveHeight}`" class="bipartite-graph" :style="{ width: displayWidth + 'px' }">
      <line
        v-for="(edge, i) in edgeLines"
        :key="'edge-line-' + i"
        :x1="edge.x1"
        :y1="edge.y1"
        :x2="edge.x2"
        :y2="edge.y2"
        class="stroke-slate-600 dark:stroke-slate-300"
        stroke-width="2"
      />

      <g v-for="(edge, i) in edgeLines" :key="'edge-label-' + i">
        <template v-if="edge.label">
          <rect :x="edge.midX - 10" :y="edge.midY - 9" width="20" height="16" class="fill-slate-200 dark:fill-slate-800" />
          <text :x="edge.midX" :y="edge.midY" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" class="fill-slate-800 dark:fill-slate-100">{{ edge.label }}</text>
        </template>
      </g>

      <text
        v-if="leftLabel"
        :x="leftColumn.x"
        y="16"
        text-anchor="middle"
        dominant-baseline="central"
        style="font-size: 13px; font-weight: 600"
        class="fill-slate-500 dark:fill-slate-400"
      >{{ leftLabel }}</text>

      <text
        v-if="rightLabel"
        :x="rightColumn.x"
        y="16"
        text-anchor="middle"
        dominant-baseline="central"
        style="font-size: 13px; font-weight: 600"
        class="fill-slate-500 dark:fill-slate-400"
      >{{ rightLabel }}</text>

      <g v-for="node in sizedNodes" :key="node.id">
        <ellipse :cx="node.x" :cy="node.y" :rx="node.rx" :ry="node.ry" stroke-width="2" class="fill-sky-100 dark:fill-sky-900 stroke-sky-700 dark:stroke-sky-300" />
        <text :x="node.x" :y="node.y" text-anchor="middle" dominant-baseline="central" style="font-size: 15px; font-weight: 600" class="fill-sky-900 dark:fill-sky-100">{{ node.label }}</text>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  leftNodes: {
    type: Array,
    required: true
  },
  rightNodes: {
    type: Array,
    required: true
  },
  edges: {
    type: Array,
    default: () => []
  },
  leftLabel: {
    type: String,
    default: ''
  },
  rightLabel: {
    type: String,
    default: ''
  },
  width: {
    type: Number,
    default: 360
  },
  height: {
    type: Number,
    default: 240
  },
  columnInset: {
    type: Number,
    default: 70
  },
  nodeRadius: {
    type: Number,
    default: 20
  }
})

// Fixed px (not a % of the surrounding layout) so the rendered size only depends on
// `width`, not on how much other text is on the slide — see FlowNetwork.vue for the same reasoning.
const displayWidth = computed(() => Math.min(props.width, 400))

const marginTop = computed(() => (props.leftLabel || props.rightLabel) ? 34 : 16)
const bottomMargin = 16

// `height` is a floor, not a fixed size: grow it so the longest column always gets at least
// one node-diameter of spacing, otherwise a column with many nodes overlaps itself.
const minSpacing = computed(() => props.nodeRadius * 2 + 8)
const maxColumnCount = computed(() => Math.max(props.leftNodes.length, props.rightNodes.length, 1))
const effectiveHeight = computed(() => Math.max(
  props.height,
  marginTop.value + bottomMargin + minSpacing.value * (maxColumnCount.value + 1)
))

function layoutColumn(nodes, x) {
  const usableHeight = effectiveHeight.value - marginTop.value - bottomMargin
  const spacing = usableHeight / (nodes.length + 1)
  return nodes.map((node, i) => ({
    ...node,
    x,
    y: marginTop.value + spacing * (i + 1),
    rx: Math.max(props.nodeRadius, String(node.label).length * 6.5 + 14),
    ry: props.nodeRadius
  }))
}

const leftColumn = computed(() => ({
  x: props.columnInset,
  nodes: layoutColumn(props.leftNodes, props.columnInset)
}))

const rightColumn = computed(() => ({
  x: props.width - props.columnInset,
  nodes: layoutColumn(props.rightNodes, props.width - props.columnInset)
}))

const sizedNodes = computed(() => [...leftColumn.value.nodes, ...rightColumn.value.nodes])

function sizedNodeById(id) {
  return sizedNodes.value.find(n => n.id === id)
}

// Point where the line from (cx,cy) toward (dx,dy) crosses the node's ellipse boundary.
function ellipseBoundaryPoint(node, dx, dy) {
  const dist = Math.hypot(dx, dy) || 1
  const ux = dx / dist
  const uy = dy / dist
  const denom = Math.hypot(ux / node.rx, uy / node.ry) || 1
  const t = 1 / denom
  return { x: node.x + ux * t, y: node.y + uy * t }
}

const edgeLines = computed(() => props.edges.map(edge => {
  const from = sizedNodeById(edge.from)
  const to = sizedNodeById(edge.to)
  const start = ellipseBoundaryPoint(from, to.x - from.x, to.y - from.y)
  const end = ellipseBoundaryPoint(to, from.x - to.x, from.y - to.y)
  return {
    label: edge.label,
    x1: start.x,
    y1: start.y,
    x2: end.x,
    y2: end.y,
    midX: (start.x + end.x) / 2,
    midY: (start.y + end.y) / 2
  }
}))
</script>

<style scoped>
.bipartite-graph-wrap {
  display: flex;
  justify-content: center;
}

.bipartite-graph {
  max-width: 100%;
  height: auto;
}
</style>
