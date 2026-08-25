<!--
  ForwardScanNetwork: same activity-on-arrow diagram as ActivityNetwork (built on the shared
  composables/useActivityNetworkLayout.js), but reveals EST/LST values progressively instead of
  showing them all at once — for walking through forward/backward scanning one event at a time
  on a single slide, driven by Slidev's click count, instead of many near-duplicate slides.

  EST/LST are shown in small two-cell boxes (EST | LST) sitting above each event's vertex dot,
  rather than split inside the vertex circle the way ActivityNetwork does it. A node with more
  than one activity leaving it (including auto-inserted dummies — see
  useActivityNetworkLayout.js) gets one box per departing arrow, stacked vertically above the
  node (closest box = first activity), each labelled with that activity's id. The EST half is
  the event's own (shared) earliest time, since every activity leaving an event can't start
  before that event occurs. The LST half is that *activity's own* latest start
  (head event's LST minus this activity's own duration) — not the event's shared LST — because
  activities leaving the same event can have different float (e.g. one is on the critical path
  and one isn't); showing the event's shared LST there would hide that difference. A sink event
  (nothing leaves it) still gets exactly one, unlabelled box, showing the event's own EST/LST
  pair (there's no "activity" to compute a per-activity LST from).

  Props: same `tasks` shape as ActivityNetwork (see its doc comment).
    revealStep   Number, default Infinity (reveal everything — acts like a static diagram).
                 Bind to Slidev's click count, e.g. :reveal-step="$clicks".

                 Steps 1..N reveal EST values one event at a time in forward-scan (topological)
                 order. Steps N+1..2N then reveal LST values one event at a time in
                 backward-scan (reverse topological) order, where N is the number of event
                 vertices in the diagram. Once every LST is revealed, critical-path highlighting
                 (if enabled) switches on.

                 To find N for a slide's `clicks:` frontmatter, count the event vertices drawn
                 in the diagram (dots — not the EST/LST boxes or the tasks/edges) once, then set
                 `clicks: N*2` (or `N*2 - 1` if you don't want a trailing empty click after the
                 last LST reveals).

    highlightCriticalPath   optional bool, default false. Only takes effect once every LST value
                             has been revealed (revealStep >= 2*N) — critical path is a
                             conclusion drawn from a *complete* EST/LST pass, so it doesn't make
                             sense to show it mid-scan.
    width, height   optional, same meaning as ActivityNetwork.
    dotRadius       optional, default 6. Radius of the plain vertex dot — EST/LST live in the
                     boxes above it, not inside the node, so there's no "big circle for text"
                     mode here the way ActivityNetwork has.
    boxWidth, boxHeight   optional, default 48 x 20. Size of each EST/LST box — grow these if the
                           text feels cramped. Box label font size scales with boxHeight
                           automatically; there's no separate font-size prop.
    scale        optional, default 1. Uniformly scales the whole rendered diagram (nodes, boxes,
                  text, everything) independent of the surrounding slide text — use this instead
                  of Slidev's `zoom` frontmatter when you want the diagram bigger/smaller without
                  also resizing the bullet points around it. E.g. :scale="1.4".

  Example:
    <ForwardScanNetwork :reveal-step="$clicks" :tasks="[
      { id: 'A', duration: 3, predecessors: [] },
      { id: 'B', duration: 3, predecessors: [] },
      { id: 'C', duration: 2, predecessors: ['A'] },
      { id: 'D', duration: 4, predecessors: ['B'] },
      { id: 'E', duration: 2, predecessors: ['C', 'D'] },
    ]" />
    with `clicks: N*2` (or `N*2 - 1`) in the slide frontmatter, N = number of event vertices.
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
        :class="edge.critical && criticalPathReady ? 'stroke-red-500 dark:stroke-red-400' : 'stroke-slate-600 dark:stroke-slate-300'"
        :stroke-width="edge.critical && criticalPathReady ? 3 : 2"
        :stroke-dasharray="edge.dummy ? '6 5' : null"
        :marker-end="`url(#${edge.critical && criticalPathReady ? arrowIdCritical : arrowId})`"
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
          :class="edge.critical && criticalPathReady ? 'fill-red-600 dark:fill-red-300' : (edge.dummy ? 'fill-slate-500 dark:fill-slate-400' : 'fill-slate-800 dark:fill-slate-100')"
        >{{ edge.label }}</text>
      </g>

      <g v-for="node in layout.nodes" :key="node.id">
        <circle
          :cx="node.x"
          :cy="node.y"
          :r="dotRadius"
          :class="node.critical && criticalPathReady ? 'fill-red-500 dark:fill-red-400' : 'fill-sky-700 dark:fill-sky-300'"
        />

        <g v-for="(box, i) in nodeBoxes(node)" :key="node.id + '-box-' + i">
          <rect
            :x="box.x"
            :y="box.y"
            :width="props.boxWidth"
            :height="props.boxHeight"
            stroke-width="1.5"
            :class="box.critical && criticalPathReady ? 'fill-red-200 dark:fill-red-950 stroke-red-500 dark:stroke-red-400' : 'fill-sky-100 dark:fill-sky-900 stroke-sky-700 dark:stroke-sky-300'"
          />
          <line
            :x1="box.x + props.boxWidth / 2"
            :y1="box.y"
            :x2="box.x + props.boxWidth / 2"
            :y2="box.y + props.boxHeight"
            stroke-width="1"
            class="stroke-sky-700 dark:stroke-sky-300"
          />
          <text :x="box.x + props.boxWidth * 0.25" :y="box.y + props.boxHeight / 2" text-anchor="middle" dominant-baseline="central" :style="{ fontSize: boxFontSize + 'px' }" class="fill-sky-900 dark:fill-sky-100">{{ estRevealed(node) ? box.est : '' }}</text>
          <text :x="box.x + props.boxWidth * 0.75" :y="box.y + props.boxHeight / 2" text-anchor="middle" dominant-baseline="central" :style="{ fontSize: boxFontSize + 'px' }" class="fill-sky-900 dark:fill-sky-100">{{ lstRevealed(node) ? box.lst : '' }}</text>
          <text
            v-if="box.label"
            :x="box.x + props.boxWidth + 6"
            :y="box.y + props.boxHeight / 2"
            text-anchor="start"
            dominant-baseline="central"
            :style="{ fontSize: boxFontSize + 'px' }"
            class="fill-slate-500 dark:fill-slate-400"
          >{{ box.label }}</text>
        </g>
      </g>
    </svg>
  </div>
</template>

<script setup>
import { computed, useId } from 'vue'
import { useActivityNetworkLayout } from '../composables/useActivityNetworkLayout'

const arrowId = `forward-scan-network-arrow-${useId()}`
const arrowIdCritical = `forward-scan-network-arrow-critical-${useId()}`

const props = defineProps({
  tasks: {
    type: Array,
    required: true
  },
  revealStep: {
    type: Number,
    default: Infinity
  },
  highlightCriticalPath: {
    type: Boolean,
    default: false
  },
  width: {
    type: Number,
    default: null
  },
  height: {
    type: Number,
    default: null
  },
  dotRadius: {
    type: Number,
    default: 6
  },
  boxWidth: {
    type: Number,
    default: 48
  },
  boxHeight: {
    type: Number,
    default: 20
  },
  scale: {
    type: Number,
    default: 1
  }
})

const displayWidth = computed(() => Math.min(layout.value.width, 720) * props.scale)
const dotRadius = computed(() => props.dotRadius)
const boxFontSize = computed(() => Math.max(9, Math.round(props.boxHeight * 0.8)))

const { graph, layout } = useActivityNetworkLayout(props, dotRadius)

// EST/LST box above each vertex: one per activity leaving that event (minimum 1, for sinks),
// stacked vertically in alphabetical order reading top (farthest from the node) to bottom
// (closest to the node), each labelled with that activity's id. EST is the event's shared
// value; LST is computed per-activity (see nodeBoxes) so differing float is visible.
const BOX_GAP = 4
const BOX_MARGIN = 8

function edgeLabel(edge) {
  return edge.dummy ? 'dummy' : edge.key
}

const edgesFromId = computed(() => {
  const map = new Map()
  for (const edge of graph.value.edges) {
    if (!map.has(edge.from)) map.set(edge.from, [])
    map.get(edge.from).push(edge)
  }
  for (const list of map.values()) {
    // Descending, because index 0 renders closest to the node (see nodeBoxes) — so the box
    // stack read top-to-bottom ends up ascending alphabetically.
    list.sort((a, b) => edgeLabel(b).localeCompare(edgeLabel(a)))
  }
  return map
})

const nodeById = computed(() => new Map(layout.value.nodes.map(n => [n.id, n])))
const edgeCriticalByKey = computed(() => new Map(layout.value.edges.map(e => [e.key, e.critical])))

function nodeBoxes(node) {
  const edges = edgesFromId.value.get(node.id) ?? []
  const items = edges.length ? edges : [null]
  const x = node.x - props.boxWidth / 2
  return items.map((edge, i) => {
    const bottom = node.y - dotRadius.value - BOX_MARGIN - i * (props.boxHeight + BOX_GAP)
    // EST is the event's own (shared) value; LST is per-activity — the head event's LST minus
    // this specific activity's duration — so activities leaving the same event can show
    // different float instead of all echoing the event's shared (minimum) LST.
    const lst = edge ? nodeById.value.get(edge.to).lst - edge.duration : node.lst
    // Critical is per-activity too: a box's own departing edge determines its highlight, not
    // the event's shared zero-float status — two activities can leave the same event with only
    // one of them actually critical (see doc comment above on per-activity LST).
    const critical = edge ? !!edgeCriticalByKey.value.get(edge.key) : node.critical
    return {
      x,
      y: bottom - props.boxHeight,
      label: edge ? edgeLabel(edge) : null,
      est: node.est,
      lst,
      critical
    }
  })
}

// Position of each node within the forward-scan (EST) and backward-scan (LST) reveal orders.
const estStepOf = computed(() => new Map(layout.value.order.map((id, i) => [id, i + 1])))
const lstStepOf = computed(() => {
  const n = layout.value.order.length
  return new Map([...layout.value.order].reverse().map((id, i) => [id, n + i + 1]))
})

function estRevealed(node) {
  return props.revealStep >= estStepOf.value.get(node.id)
}
function lstRevealed(node) {
  return props.revealStep >= lstStepOf.value.get(node.id)
}

const criticalPathReady = computed(() => props.highlightCriticalPath && props.revealStep >= layout.value.order.length * 2)
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
