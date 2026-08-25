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
    scale           optional, default 1. Uniformly scales the whole rendered diagram (nodes,
                     text, everything) independent of the surrounding slide text — use this
                     instead of Slidev's `zoom` frontmatter when you want the diagram
                     bigger/smaller without also resizing the bullet points around it.
                     E.g. :scale="1.4".

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
import { useActivityNetworkLayout } from '../composables/useActivityNetworkLayout'

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
  },
  scale: {
    type: Number,
    default: 1
  }
})

const displayWidth = computed(() => Math.min(layout.value.width, 720) * props.scale)
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

const { layout } = useActivityNetworkLayout(props, nodeDisplayRadius)
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
