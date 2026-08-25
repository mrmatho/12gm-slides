---
layout: center
hideInToc: false
zoom: 1.2
---

# Backward Scanning and Critical Path

## Finding the Latest Start Times

Now that we have found the earliest start times, we can find the **latest start times** for each task in the project.

The **latest start time** for a task is the *latest possible time that the task can start without delaying the project,* given the task durations and precedence relationships. Sometimes this is the same as the earliest start time - but not always.

---
layout: center
clicks: 8
---

# Backward Scanning Process

- Start at the **end of the project** and work backwards to the start.
- Travel backwards along the arrows of the network, subtracting the durations from the latest start times.
- The duration of the project is the **latest finish time** of the last task(s) in the project.
- When a task has multiple successors, use the latest start time with the **minimum** value.

> Remember:
>
> - Forward scanning - Earliest Start time - Adding - Maximum value
> - Backward scanning - Latest Start time - Subtracting - Minimum value

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 3, predecessors: [] },
  { id: 'B', duration: 2, predecessors: ['A'] },
  { id: 'C', duration: 4, predecessors: ['A'] },
  { id: 'D', duration: 1, predecessors: ['B', 'C'] }
]" :reveal-step="$clicks" :scale="1.5" />

---
layout: default
zoom: 1.2
clicks: 15
---

## Try Together

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 10, predecessors: [] },
  { id: 'B', duration: 8, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 17, predecessors: ['A','B'] },
  { id: 'E', duration: 11, predecessors: ['C'] },
  { id: 'F', duration: 12, predecessors: ['D'] },
  { id: 'G', duration: 23, predecessors: ['D','E'] },
  { id: 'H', duration: 5, predecessors: ['F','G'] },
  { id: 'I', duration: 6, predecessors: ['F', 'G'] }
]" :reveal-step="$clicks" :height="250"/>

> [!TIP]
> You should always finish with at least one task with 0|0 - if not then you have made a mistake somewhere.

---
layout: default
zoom: 1
---

# The Critical Path

- Tasks that have the same EST and LST *cannot be delayed without delaying the whole project*. These tasks are called **critical tasks**.
- These tasks form the **critical path** of the project.
- There is always at least one critical path in a project network: from start to end.

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 10, predecessors: [] },
  { id: 'B', duration: 8, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 17, predecessors: ['A','B'] },
  { id: 'E', duration: 11, predecessors: ['C'] },
  { id: 'F', duration: 12, predecessors: ['D'] },
  { id: 'G', duration: 23, predecessors: ['D','E'] },
  { id: 'H', duration: 5, predecessors: ['F','G'] },
  { id: 'I', duration: 6, predecessors: ['F', 'G'] }
]" :highlight-critical-path="true" :height="220"/>

**The critical path for this project is A → D → G → I.**

It could also be written as A → D → dummy → G → I.

---
layout: center
---

# Critical Path 

The critical path is always the **longest path** through the network. 

It is the path that takes the longest time to complete, and therefore determines the **minimum time** required to complete the project.

If asked to find the critical path you can either:

- Use forward and backward scanning to find the EST and LST for each task, then identify the critical tasks.
- Identify the longest path through the network by inspection.

### Float Time

**Float time** is the amount of time a task can be delayed without delaying the project. It can be calculated as:

$\text{Float Time} = \text{LST} - \text{EST}$

Tasks on the critical path have a float time of 0.

---
layout: center
zoom: 1.8
---

## Edrolo 8I p. 630

Questions 5-12, 14, 16-18
