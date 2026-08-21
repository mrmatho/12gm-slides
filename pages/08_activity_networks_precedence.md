---
layout: center
hideInToc: false
---

# Activity Networks and Precedence Tables

## Introduction to the Scheduling Problem

---
layout: center
---

# The Scheduling Problem

## Projects have tasks to complete

- Each task has a **duration** (time to complete)
- Some tasks can be done at the same time (in parallel)
- Some tasks cannot start until other tasks are completed (precedence)

The **scheduling problem** is about finding the **minimum time** to complete all tasks, given the durations and precedence information.

## For today's lesson we are interested in

- Understanding a **precedence table**
- Drawing an **activity network** from the precedence table
- Using **dummy activities** to make the network precedence accurate

---
layout: two-cols-header
---

# Precedence Tables

A precedence table shows which tasks must be completed before other tasks can start. 

::left::

| Task | Duration | Predecessors |
| :---: | :---: | :---: |
| A | 3 | - |
| B | 3 | - |
| C | 2 | A |
| D | 4 | B |
| E | 2 | C, D |

::right::

This table shows that:

- Task A takes 3 days. It can start immediately (no predecessors).
- Task B takes 3 days. It can also start immediately (no predecessors).
- Task C takes 2 days. It cannot start until Task A is completed.
- Task D takes 4 days. It cannot start until Task B is completed.
- Task E takes 2 days. It cannot start until both Task C and Task D are completed.

---
layout: two-cols-header
zoom: 0.95
---

# Graphing an Activity Network

We can represent the project tasks from a precedence table as a directed graph, called an **activity network**.

An **activity network** is a directed graph where:

- Each **edge** represents a task
- Each **vertex** demonstrates the precedence relationship - predecessor tasks point to successor tasks
- The **weight** of each edge represents the duration of the task

::left::

| Task | Duration | Predecessors |
| :---: | :---: | :---: |
| A | 3 | - |
| B | 3 | - |
| C | 2 | A |
| D | 4 | B |
| E | 2 | C, D |

::right::

<ActivityNetwork :tasks="[
  { id: 'A', duration: 3, predecessors: [] },
  { id: 'B', duration: 3, predecessors: [] },
  { id: 'C', duration: 2, predecessors: ['A'] },
  { id: 'D', duration: 4, predecessors: ['B'] },
  { id: 'E', duration: 2, predecessors: ['C', 'D'] },
]"  :show-times="false"/>

> [!TIP]
> The edges (not the vertices) represent the tasks. The vertices become the points in time when tasks have been completed.

---
layout: center
zoom: 0.95
---

# Practice: Identify the Precedence Table

Write the precedence table for the following activity network:

<ActivityNetwork :tasks="[
  { id: 'A', duration: 10, predecessors: [] },
  { id: 'B', duration: 21, predecessors: [] },
  { id: 'C', duration: 12, predecessors: ['A'] },
  { id: 'D', duration: 23, predecessors: ['B'] },
  { id: 'E', duration: 10, predecessors: ['A'] },
  { id: 'F', duration: 11, predecessors: ['C', 'D', 'E'] }
]" :show-times="false" />

<v-clicks>

| Task | Duration | Predecessors |
| :---: | :---: | :---: |
| A | 10 | - |
| B | 21 | - |
| C | 12 | A |
| D | 23 | B |
| E | 10 | A |
| F | 11 | C, D, E |

</v-clicks>

---
layout: default
zoom: 0.95
---

# Practice: Draw the Activity Network

Draw the activity network for the following precedence table:

<div style="text-size: 0.8em; width: 60%; text-align: center; margin: auto;">

| Task | Duration | Predecessors |
| :---: | :---: | :---: |
| A | 2 | - |
| B | 3 | A |
| C | 4 | A |
| D | 2 | B |
| E | 3 | D |
| F | 1 | C, E |

</div>

<v-clicks>

<ActivityNetwork :tasks="[
  { id: 'A', duration: 2, predecessors: [] },
  { id: 'B', duration: 3, predecessors: ['A'] },
  { id: 'C', duration: 4, predecessors: ['A'] },
  { id: 'D', duration: 2, predecessors: ['B'] },
  { id: 'E', duration: 3, predecessors: ['D'] },
  { id: 'F', duration: 1, predecessors: ['C', 'E'] }
]" :show-times="false" />

</v-clicks>

---
layout: default
---

# A more complicated example

<ActivityNetwork :tasks="[
  { id: 'A', duration: 2, predecessors: [] },
  { id: 'B', duration: 3, predecessors: [] },
  { id: 'C', duration: 4, predecessors: [] },
  { id: 'D', duration: 2, predecessors: ['A'] },
  { id: 'E', duration: 3, predecessors: ['B'] },
  { id: 'F', duration: 1, predecessors: ['C', 'D'] },
  { id: 'G', duration: 2, predecessors: ['E'] },
  { id: 'H', duration: 3, predecessors: ['F', 'G'] }
]" :show-times="false" />

<div style="font-size: 0.7em;  width: 60%; text-align: center; margin: auto;">

<v-clicks>

| Task | Duration | Predecessors |
| :---: | :---: | :---: |
| A | 2 | - |
| B | 3 | - |
| C | 4 | - |
| D | 2 | A |
| E | 3 | B |
| F | 1 | C, D |
| G | 2 | E |
| H | 3 | F, G |

</v-clicks>

</div>

---
layout: default
---

# Dummy Activities

When the precedence table has a mis-match of predecessors, we sometimes need a **dummy activity** to make the activity network accurate.

A **dummy activity** is a task that has no duration: only used to show precedence relationships in the activity network.

Dummy activities are shown using a dashed line in the activity network.


<ActivityNetwork :tasks="[
  { id: 'A', duration: 2, predecessors: [] },
  { id: 'B', duration: 3, predecessors: ['A'] },
  { id: 'C', duration: 4, predecessors: ['A'] },
  { id: 'D', duration: 2, predecessors: ['B', 'C'] },
  { id: 'E', duration: 3, predecessors: ['C'] },
  { id: 'F', duration: 1, predecessors: ['D', 'E'] }
]" :show-times="false" />

In this graph - the dummy shows that `Task D` cannot start until both `Task B` and `Task C` are completed. `Task E` can start as soon as task C is completed (it doesn't have a relationship with `Task C`)

---
layout: default
zoom: 0.95
---

# Dummy Activities Continued

<ActivityNetwork :tasks="[
  { id: 'A', duration: 2, predecessors: [] },
  { id: 'B', duration: 3, predecessors: ['A'] },
  { id: 'C', duration: 4, predecessors: ['A'] },
  { id: 'D', duration: 2, predecessors: ['B', 'C'] },
  { id: 'E', duration: 3, predecessors: ['C'] },
  { id: 'F', duration: 1, predecessors: ['D', 'E'] }
]" :show-times="false" />

The dummy activity has to be there to add the extra precedence relationship between `Task B` and `Task D`.

<div style="font-size: 0.7em;  width: 60%; text-align: center; margin: auto;">

| Task | Duration | Predecessors |
| :---: | :---: | :---: |
| A | 2 | - |
| B | 3 | A |
| C | 4 | A |
| D | 2 |**B, C** |
| E | 3 | **C** |
| F | 1 | D, E |

</div>

---
layout: center
zoom: 1.5
---

# Edrolo 8H, p. 614

Questions: 1-3, 5, 8, 10, 13-15

