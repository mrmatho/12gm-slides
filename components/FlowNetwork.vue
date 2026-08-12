<!--
  FlowNetwork: hand-drawn SVG diagram for flow-network slides (nodes, capacity edges, optional cut lines).
  Use this instead of Mermaid whenever a slide needs to show a "cut" — Mermaid's layout engine has no way
  to draw a line crossing specific edges, but here node/edge/cut positions are explicit props.

  Props:
    nodes  Array<{ id, label, x, y }>          required. x/y are coordinates in the SVG's own space
                                                (0..width, 0..height) — pick them by eye, e.g. against a
                                                480x220 canvas, then adjust to taste.
    edges  Array<{ from, to, capacity }>       optional. from/to reference node ids; drawn as an arrow
                                                from `from` to `to` with `capacity` labelled at the midpoint.
    cuts   Array<{ x1, y1, x2, y2, label?,     optional. Each is a dashed line across the diagram. `label`
                   labelX?, labelY? }>         is shown centred above the line's midpoint by default; pass
                                                labelX/labelY to reposition it (e.g. for a near-horizontal cut).
    width, height   optional, default 480x220. The SVG viewBox size — raise these if a diagram feels cramped.
    nodeRadius      optional, default 22. Minimum node half-height; single-letter nodes use this as their
                                           radius, longer labels (e.g. "Source") widen automatically.

  Example:
    <FlowNetwork
      :nodes="[{ id: 'S', label: 'Source', x: 85, y: 110 }, { id: 'T', label: 'Sink', x: 445, y: 110 }]"
      :edges="[{ from: 'S', to: 'T', capacity: 4 }]"
      :cuts="[{ x1: 160, y1: 10, x2: 160, y2: 210, label: 'Cut 1' }]"
    />
-->
<template>
  <div class="flow-network-wrap">
    <svg :viewBox="`0 0 ${width} ${height}`" class="flow-network">
      <defs>
        <marker id="flow-network-arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 z" class="fill-slate-600 dark:fill-slate-300" />
        </marker>
      </defs>

      <line
        v-for="(edge, i) in edgeLines"
        :key="'edge-line-' + i"
        :x1="edge.x1"
        :y1="edge.y1"
        :x2="edge.x2"
        :y2="edge.y2"
        class="stroke-slate-600 dark:stroke-slate-300"
        stroke-width="2"
        marker-end="url(#flow-network-arrow)"
      />

      <g v-for="(edge, i) in edgeLines" :key="'edge-label-' + i">
        <rect :x="edge.midX - 10" :y="edge.midY - 9" width="20" height="16" class="fill-slate-200 dark:fill-slate-800" />
        <text :x="edge.midX" :y="edge.midY" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" class="fill-slate-800 dark:fill-slate-100">{{ edge.capacity }}</text>
      </g>

      <g v-for="(cut, i) in cuts" :key="'cut-' + i">
        <line
          :x1="cut.x1"
          :y1="cut.y1"
          :x2="cut.x2"
          :y2="cut.y2"
          style="stroke-width: 2.5px"
          stroke-dasharray="6 5"
          class="stroke-red-500 dark:stroke-red-400"
        />
        <text
          v-if="cut.label"
          :x="cut.labelX ?? (cut.x1 + cut.x2) / 2"
          :y="cut.labelY ?? Math.min(cut.y1, cut.y2) - 10"
          text-anchor="middle"
          dominant-baseline="central"
          style="font-size: 13px; font-weight: 600; paint-order: stroke; stroke-width: 4px"
          class="fill-red-600 dark:fill-red-300 stroke-slate-200 dark:stroke-slate-900"
        >{{ cut.label }}</text>
      </g>

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
  nodes: {
    type: Array,
    required: true
  },
  edges: {
    type: Array,
    default: () => []
  },
  cuts: {
    type: Array,
    default: () => []
  },
  width: {
    type: Number,
    default: 480
  },
  height: {
    type: Number,
    default: 220
  },
  nodeRadius: {
    type: Number,
    default: 22
  }
})

const sizedNodes = computed(() => props.nodes.map(node => ({
  ...node,
  rx: Math.max(props.nodeRadius, node.label.length * 6.5 + 14),
  ry: props.nodeRadius
})))

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
    capacity: edge.capacity,
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
.flow-network-wrap {
  display: flex;
  justify-content: center;
}

.flow-network {
  width: 100%;
  max-width: 520px;
  height: auto;
}
</style>
