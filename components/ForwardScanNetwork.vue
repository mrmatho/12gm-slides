<!--
  ForwardScanNetwork: same activity-on-arrow diagram as ActivityNetwork (built on the shared
  composables/useActivityNetworkLayout.js), but reveals EST/LST values progressively instead of
  showing them all at once — for walking through forward/backward scanning one event at a time
  on a single slide, driven by Slidev's click count, instead of many near-duplicate slides.

  Props: same `tasks` shape as ActivityNetwork (see its doc comment).
    revealStep   Number, default Infinity (reveal everything — acts like a static diagram).
                 Bind to Slidev's click count, e.g. :reveal-step="$clicks".

                 Steps 1..N reveal EST values one event at a time in forward-scan (topological)
                 order. Steps N+1..2N then reveal LST values one event at a time in
                 backward-scan (reverse topological) order, where N is the number of event
                 vertices in the diagram. Once every LST is revealed, critical-path highlighting
                 (if enabled) switches on.

                 To find N for a slide's `clicks:` frontmatter, count the event vertices drawn
                 in the diagram (dots/circles — not the tasks/edges) once, then set `clicks: N*2`
                 (or `N*2 - 1` if you don't want a trailing empty click after the last LST reveals).

    highlightCriticalPath   optional bool, default false. Only takes effect once every LST value
                             has been revealed (revealStep >= 2*N) — critical path is a
                             conclusion drawn from a *complete* EST/LST pass, so it doesn't make
                             sense to show it mid-scan.
    width, height, nodeRadius   optional, same meaning as ActivityNetwork.

  Example:
    <ForwardScanNetwork :reveal-step="$clicks" :tasks="[
      { id: 'A', duration: 3, predecessors: [] },
      { id: 'B', duration: 3, predecessors: [] },
      { id: 'C', duration: 2, predecessors: ['A'] },
      { id: 'D', duration: 4, predecessors: ['B'] },
      { id: 'E', duration: 2, predecessors: ['C', 'D'] },
    ]" />
    with `clicks: 8` in the slide frontmatter (4 events after start-merging x 2 passes).
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
          :r="nodeRadius"
          stroke-width="2"
          :class="nodeCircleClass(node)"
        />

        <line :x1="node.x" :y1="node.y - nodeRadius" :x2="node.x" :y2="node.y + nodeRadius" stroke-width="1.5" class="stroke-sky-700 dark:stroke-sky-300" />

        <text :x="node.x - nodeRadius * 0.5" :y="node.y" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" class="fill-sky-900 dark:fill-sky-100">{{ estRevealed(node) ? node.est : '' }}</text>
        <text :x="node.x + nodeRadius * 0.5" :y="node.y" text-anchor="middle" dominant-baseline="central" style="font-size: 13px" class="fill-sky-900 dark:fill-sky-100">{{ lstRevealed(node) ? node.lst : '' }}</text>
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
  nodeRadius: {
    type: Number,
    default: 26
  }
})

const displayWidth = computed(() => Math.min(layout.value.width, 720))
const nodeRadius = computed(() => props.nodeRadius)

const { layout } = useActivityNetworkLayout(props, nodeRadius)

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

function nodeCircleClass(node) {
  return node.critical && criticalPathReady.value
    ? 'fill-sky-100 dark:fill-sky-900 stroke-red-500 dark:stroke-red-400'
    : 'fill-sky-100 dark:fill-sky-900 stroke-sky-700 dark:stroke-sky-300'
}
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
