---
layout: center
hideInToc: false
zoom: 1.2
---

# Forward Scanning

## Finding the Earliest Start Times

In the scheduling problem, the most important question is "How long will the project take to complete?" To answer this, we find the **earliest start times** for each task in the project.

The earliest start time for a task is the *earliest possible time after commencing the project* that the task can start, given the task durations and precedence relationships.

To find the earliest start times we can use a method called **forward scanning**. Forward scanning is literally scanning through the activity network from the start to the end, calculating the earliest start times for each task as we go.

---
layout: center
clicks: 4
---

# Forward Scanning Principles

- When a task has no predecessors, its earliest start time is 0.
- Tasks with predecessors wait until all their predecessors are completed before they can start.
- When a task has multiple predecessors, its earliest start time is the **maximum/largest** of the finish times of all its predecessors.


<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 3, predecessors: [] },
  { id: 'B', duration: 2, predecessors: ['A'] },
  { id: 'C', duration: 4, predecessors: ['A'] },
  { id: 'D', duration: 1, predecessors: ['B', 'C'] }
]" :reveal-step="$clicks" />

---
layout: default
zoom: 1.3
clicks: 7
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

- **Note:** The dummy task means that Task G cannot start until both Task D and Task E are completed.
- Record the duration of the project on the handout.

---
layout: center
zoom: 1.5
---

# Important reminders

- When two tasks meet at a vertex: we take the **maximum** of the finish times for the earliest start time of the next task.
- Be careful to follow dummy tasks to ensure the precedence relationships are correct.

---
layout: center
zoom: 1.8
---

## Edrolo 8I p. 630

Questions 1 - 4, 15

---
