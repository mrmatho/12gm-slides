---
layout: cover
hideInToc: false
background: /img/flow.png
---

# Flow Problems

---
layout: two-cols-header
zoom: 1
---

# Revision: Recursion and Finance

::left::
For the recurrence relation below:

$$
F_0 = 25000, \qquad F_{n+1} = 1.006\,F_n
$$

where $n$ represents number of months after January 2024.

1. What type of financial scenario is this recurrence relation most likey modelling?
2. Describe what each number in the recurrence relation represents.
3. Calculate the value of $F_3$.
4. Find the annual interest rate represented by this recurrence relation.

::right::

<v-clicks>
<div class="note">

1. Compound interest. (Geometric Growth)
2. 25000 is the initial investment ($25,000). 1.006 means that the monthly interest rate is 0.6% (or 0.006 as a decimal).
3. $F_3 = 1.006^3 \times 25000$

$= 1.0181 \times 25000 = 25452.50$

4. The annual interest rate is

 $1.006^{12} - 1 = 0.0743$ or 7.43%.

</div>
</v-clicks>
---
layout: center
zoom: 1.2
---

# Network Flow

- Network Flow problems occur in **directed**, **weighted** graphs where edge weights represent **capacity**.
- The **source** ($S$) is the vertex where flow begins.
- The **sink** ($T$) is the vertex where flow ends.

```mermaid {scale: 1.3}
graph LR
    S((Source)) -->|4| A((A))
    S -->|2| B((B))
    A -->|3| C((C))
    B -->|5| A
    B -->|2| C
    C -->|2| T((Sink))
```

Flow problems seek to find the **maximum flow** from the source to the sink, understanding that capacities limit the flow along each edge.

---
layout: center
zoom: 1.2
---

# Why is Flow Important?

- Flow problems are important in many real-world applications, including:
  - Traffic flow
  - Water distribution
  - Internet data routing
- Bottlenecks in flow occur when one part of a network has a lower capacity than the rest, restricting the overall flow.

> When a whole network is considered, the **maximum flow is equal to the minimum cut** capacity.

---
layout: center
zoom: 1.2
---

# Where is the bottleneck?

```mermaid {scale: 1.3}
graph LR

    S((Source)) -->|4| A((A))
    S -->|2| B((B))
    A -->|3| C((C))
    B -->|5| A
    B -->|2| C
    C -->|2| T((Sink))
```

Which edge is the bottleneck in this network?

<v-clicks>

- 4 capacity can get to A from S, but A can only send 3 to C. So **A -> C** is a bottleneck.
- B could send 5 to A, but it only has 2 coming in, so **B -> A** is not a bottleneck.
- A can send 3 to C, B can send to to C, but only 2 can continue to T. So **C -> T** is a bottleneck.

</v-clicks>

---
layout: center
zoom: 1.2
---

# Cuts and Cut Capacity

- A **cut** separates the source from the sink, dividing the vertices into two groups.
- The **capacity of a cut** is the sum of the capacities of edges crossing from the source side to the sink side.

<FlowNetwork
  :nodes="[
    { id: 'S', label: 'Source', x: 85, y: 110 },
    { id: 'A', label: 'A', x: 270, y: 50 },
    { id: 'B', label: 'B', x: 270, y: 170 },
    { id: 'C', label: 'C', x: 445, y: 50 },
    { id: 'T', label: 'Sink', x: 500, y: 150 },
  ]"
  :edges="[
    { from: 'S', to: 'A', capacity: 4 },
    { from: 'S', to: 'B', capacity: 2 },
    { from: 'A', to: 'T', capacity: 3 },
    { from: 'B', to: 'A', capacity: 5 },
    { from: 'B', to: 'T', capacity: 2 },
    { from: 'A', to: 'C', capacity: 3 },
    { from: 'C', to: 'T', capacity: 2 },
  ]"
  :width="550"
  :cuts="[{ x1: 160, y1: 25, x2: 160, y2: 210, label: 'Cut A: 6' },
        { x1: 350, y1: 25, x2: 350, y2: 210, label: 'Cut B: 5' },
        { x1: 490, y1: 25, x2: 420, y2: 210, label: 'Cut C: 7' }
  ]"
/>

---
layout: center
zoom: 1.5
---

# Find the Cut Capacity

On your mini-whiteboard, write the capacity for each cut in the diagram below.

<FlowNetwork
  :nodes="[
    { id: 'S', label: 'Source', x: 85, y: 110 },
    { id: 'A', label: 'A', x: 200, y: 50 },
    { id: 'B', label: 'B', x: 200, y: 170 },
    { id: 'C', label: 'C', x: 355, y: 50 },
    { id: 'D', label: 'D', x: 400, y: 180 },
    { id: 'T', label: 'Sink', x: 500, y: 150 },
  ]"
  :edges="[
    { from: 'S', to: 'A', capacity: 1 },
    { from: 'S', to: 'B', capacity: 7 },
    { from: 'A', to: 'T', capacity: 4 },
    { from: 'B', to: 'A', capacity: 3 },
    { from: 'B', to: 'D', capacity: 8 },
    { from: 'A', to: 'C', capacity: 3 },
    { from: 'C', to: 'T', capacity: 2 },
    { from: 'D', to: 'T', capacity: 4 },
  ]"
  :width="550"
  :cuts="[{ x1: 160, y1: 25, x2: 160, y2: 210, label: 'Cut A' },
        { x1: 285, y1: 25, x2: 285, y2: 210, label: 'Cut B'},
        { x1: 450, y1: 25, x2: 250, y2: 210, label: 'Cut C'}
  ]"
/>

---
layout: center
zoom: 1.3
---

# Backwards Edges

- For a given cut, some edges may run backwards: they travel from the **sink side to the source side**.
- Backwards edges do not contribute to the cut capacity.
- An edge that runs backwards on one cut, will likely still run forwards on another cut.

---
layout: center
---

# Backwards Cut Example

<FlowNetwork
  :nodes="[
    { id: 'S', label: 'Start', x: 85, y: 110 },
    { id: 'A', label: 'A', x: 200, y: 50 },
    { id: 'B', label: 'B', x: 380, y: 170 },
    { id: 'C', label: 'C', x: 355, y: 50 },
    { id: 'T', label: 'End', x: 500, y: 150 },
  ]"
  :edges="[
    { from: 'S', to: 'A', capacity: 1 },
    { from: 'S', to: 'B', capacity: 7 },
    { from: 'A', to: 'T', capacity: 4 },
    { from: 'B', to: 'A', capacity: 3 },
    { from: 'A', to: 'C', capacity: 3 },
    { from: 'C', to: 'T', capacity: 2 },
    { from: 'B', to: 'T', capacity: 2 },
  ]"
  :width="550"
  :cuts="[{ x1: 160, y1: 25, x2: 160, y2: 210, label: 'Cut A' },
        { x1: 450, y1: 25, x2: 250, y2: 210, label: 'Cut B'}
  ]"
/>

---
layout: center
---

# Things to note

-
-
-

---
layout: center
zoom: 1.6
---

# Questions

## Edrolo p. TBC

Questions TBC
