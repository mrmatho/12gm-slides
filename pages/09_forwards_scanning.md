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

