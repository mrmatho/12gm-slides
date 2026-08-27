---
layout: two-cols-header
zoom: 0.88
hideInToc: false
---

# Networks Review

What do we need to know? 

::left::

- **Types of graphs**: 
  - Directed vs. Undirected
  - Weighted vs. Unweighted
  - Bipartite graphs
  - Simple Graphs
  - Connected vs Disconnected
  - Trees
- **Graph concepts**:
  - Degree
  - Planar graphs
  - Vertices, Edges, Faces
  - Euler's formula
  - Isomorphic graphs
  - Bridges
  - Adjacency matrices (Directed and Undirected)

::right::

- **Traversing Graphs**:
  - Walk, Trail, Path
  - Circuit, Cycle
  - Eulerian Circuit, Eulerian Path
  - Hamiltonian Cycle, Hamiltonian Trail
- **Problems**:
  - Shortest Path Problem (Dijkstra's Algorithm)
  - Minimum Spanning Tree (Prim's Algorithm)
  - Network Flow (Minimum Cut, Maximum Flow)
  - Allocation Problem (Hungarian Algorithm)
  - Scheduling Problem (EST, LST, Critical Path, Crashing)

---
layout: two-cols-header
zoom: 1.2
---

# What type of problem is it?

::left::

### Shortest Path Problem (Dijkstra’s Algorithm)

Moving efficiently between two specific locations. Unlike spanning trees, you only visit the vertices along the path, not every vertex in the network.

**Keywords:** *"Shortest route," "minimum travel time," "least distance between X and Y," "travel from client A to client J".*

::right::

### Minimum Spanning Tree (Prim’s Algorithm, Connector Problem)

Linking an entire network of locations using the absolute minimum total length or cost. Always undirected graph.

**Keywords:** *"Connect all locations," "minimum total length of cable/pipe," "link all towers with fibre-optic cable", "ensure every site is connected."*

---
layout: two-cols-header
zoom: 1.2
---

# What type of problem is it?

::left::

### Network Flow Problem (Maximum Flow, Minimum Cut)

Determining the maximum throughput of material (water, traffic, data) through a network, or finding a critical bottleneck. Always features a distinct Source (where flow enters) and Sink (where flow exits) - but won't always be named sink and source.

**Keywords:** *"Maximum flow," "capacity," "bottleneck," "minimum cut," "source," "sink," "cut value."*

::right::

### Allocation Problem (Hungarian Algorithm)

Pairing individual resources to specific tasks on a strict 1-to-1 basis. Minimising or maximising the total weights. 

**Keywords:** *"Assigning workers to jobs," "matching resources to tasks," "optimising assignments," "1-to-1 pairing."*

---
layout: two-cols-header
zoom: 1.2
---

# What type of problem is it?

::left::

### Scheduling Problem (Forwards and Backwards Scanning) 

Finding timeline of a project to determine minimum overall completion time, start/finish windows for each activity, and which tasks cannot be delayed.

**Keywords:** *"Earliest start time (EST)," "latest start time (LST)," "write down the critical path", "minimum completion time", "float time / slack," "which activity can be delayed for the longest time without affecting project duration".*

::right::

### Scheduling Problem (Crashing)

Reducing overall project completion time by reducing the duration of specific activities, usually at a cost. Often includes a reference table for cost to crash an activity. 

**Keywords:** *"Crash," "reduce the completion time," "minimum cost to reduce project by X weeks," "maximum possible time saved," "cost per week to crash."*

---
layout: two-cols-header
---

# Extra tips

::left::

**Shortest Path (Dijkstra's Algorithm)**

- Trace the route back from the destination to the origin to confirm the exact path
- Write down totals at each node rather than guessing based on small single edges

**Minimum Spanning Tree (Prim's / Kruskal's Algorithm)**

- Apply the $V - 1$ rule: $V$ vertices always require exactly $V - 1$ edges (e.g., 9 communication towers require 8 edges)
- Be careful not to add an edge that creates a cycle, even if it is the shortest edge available.

::right::

**Network Flow (Max Flow / Min Cut)**

- Only add capacities of edges that travel from the Source side to the Sink side (no backwards edges)
- Check the cut completely stops the flow from source to sink.

**Allocation Problem (Hungarian Algorithm)**

- For **maximisation** questions (when you're looking for the largest instead of smallest), subtract every table entry from the largest number in the matrix before doing row/column reductions.

---
layout: center
---

# Scheduling Problem Tips

**Forward and Backward Scanning (EST, LST, Float)**

- Remember **"Max Forward, Min Backward"**: pick the highest incoming total for EST and the lowest outgoing value for LST.
- Calculate float (slack) as $\text{LST} - \text{EST}$.

**Crashing (Project Acceleration)**

- Watch for **path switching**: shortening a critical activity can make a secondary path the new critical path. Always recalculate all path lengths after each reduction step.