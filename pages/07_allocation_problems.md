---
layout: cover
hideInToc: false
---

# Allocation (Matching) Problems

---
layout: two-cols-header
zoom: 0.9
---

# Allocation Problems

An allocation (or matching) problem refers to a situation where we need to assign activities, resources or tasks in a one-to-one manner, while minimising costs or maximising profits. We can model each matching problem as a graph, shown below. 

::left::

<BipartiteGraph
  :leftNodes="[{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }, { id: 'C', label: 'C' }]"
  :rightNodes="[{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }]"
  :edges="[{ from: 'A', to: '1' }, { from: 'A', to: '3' }, { from: 'B', to: '1' }, { from: 'B', to: '2' }, { from: 'C', to: '3' }]"
  leftLabel="People"
  rightLabel="Tasks"
/>

- This type of graph is called a **bipartite graph**, because the vertices are divided into two separate sets:
- In bipartite graphs, edges **only** connect from one set to another, never within the same set.


::right::

<v-clicks depth=3>

- **Edges** represent possible allocations
- **Vertices** represent the people (A, B, C) and the tasks (1, 2, 3)
- *For this example:*
  - Person A can do Task 1 or Task 3
  - Person B can do Task 1 or Task 2
  - Person C can do Task 3
 
*What would be the only valid allocation, if each person can only do one task?*

**Allocation:** A → 1, B → 2, C → 3

</v-clicks>

---
layout: two-cols-header
---

# Allocation with Costs

Allocation problems with costs usually show a **cost matrix**, where the rows represent the people, the columns represent the tasks (or resources), and the entries represent the cost of assigning a person to a task.

::left::

| | Task 1 | Task 2 | Task 3 |
| --- | --- | --- | --- |
| A | 4 | 2 | 5 |
| B | 3 | 6 | 1 |
| C | 7 | 4 | 2 |

The goal is to find the allocation that minimises the **total cost**.

::right::

*In this example:*
<v-clicks depth=3>

- The cheapest allocation of Task 1 is to B (3), Task 2 to A (2), and Task 3 to C (2).
- The total cost of this allocation is 3 + 2 + 2 = 7.

Any other allocation would results in a higher total cost.
</v-clicks>

---
layout: center
zoom: 1.3
---

# The Hungarian Algorithm

**The Hungarian algorithm** is a method for solving more complex allocation problems, where there are multiple possible allocations.

The algorithm finds the allocation with the **minimum total cost** and is guaranteed to find the optimal solution.

---
layout: two-cols-header
zoom: 0.7
---

## Hungarian Algorithm: Worked Example

<!-- Step through row reduction, column reduction, covering zeros, and testing for optimal allocation -->

::left::

Below is a cost matrix for allocating 4 people to 4 tasks. The goal is to find the allocation that minimises the total cost.

|   |  1 |  2 |  3 |  4 |
|---|--- |--- |--- |--- |
| A | 20 | 30 | 20 | 25 |
| B | 50 | 20 | 20 | 50 |
| C | 30 | 20 | 40 | 30 |
| D | 60 | 50 | 30 | 40 |



 **Step 1: Row Reduction:** Subtract the minimum value in each row from all entries in that row.

<v-clicks>

|   |  1 |  2 |  3 |  4 |
|---|--- |--- |--- |--- |
| A | 0 | 10 | 0 | 5 |
| B | 30 | 0 | 0 | 30 |
| C | 10 | 0 | 20 | 10 |
| D | 30 | 20 | 0 | 10 |

> Can we cover all zeros with less than 4 lines? (**Yes**, we can cover all zeros with 3 lines)
</v-clicks>

::right::

<v-clicks>

**Step 2: Column Reduction** Subtract the minimum value in each column from all entries in that column. 


|   |  1 |  2 |  3 |  4 |
|---|--- |--- |--- |--- |
| A | 0 | 10 | 0 | 0 |
| B | 30 | 0 | 0 | 25 |
| C | 10 | 0 | 20 | 5 |
| D | 30 | 20 | 0 | 5 |

> Can we cover all zeros with less than 4 lines? (**Yes**, we can still cover all zeros with 3 lines)

**Step 3: Lowest Uncovered Number** Find the lowest uncovered number (5) and:

- Subtract it from all uncovered elements
- Add it to all elements that are covered twice.

|   |  1 |  2 |  3 |  4 |
|---|--- |--- |--- |--- |
| A | 0  | **15** | **5** | 0 |
| B | 25 | 0 | 0 | 25 |
| C | **5**  | 0 | 20 | **0** |
| D | **25** | 20 | 0 | **0** |

> Can we cover all zeros with less than 4 lines? (**No**, we now need 4 lines - which is equal to the number of rows. **We are ready to allocate**)

</v-clicks>

---
layout: two-cols-header
zoom: 0.8
---

# Converting to a Bipartite Graph to find the optimal allocation

::left::

(From step 3)

|   |  1 |  2 |  3 |  4 |
|---|--- |--- |--- |--- |
| A | **0**  | 15 | 5 | **0** |
| B | 25 | **0** | **0** | 25 |
| C | 5  | **0** | 20 | **0** |
| D | 25 | 20 | **0** | **0** |


<v-clicks>

**Step 4: Draw the bipartite graph**, connecting vertices with edges where the cost is zero. Use the graph to find the optimal allocation.


<BipartiteGraph
  :leftNodes="[{ id: 'A', label: 'A' }, { id: 'B', label: 'B' }, { id: 'C', label: 'C' }, { id: 'D', label: 'D' }]"
  :rightNodes="[{ id: '1', label: '1' }, { id: '2', label: '2' }, { id: '3', label: '3' }, { id: '4', label: '4' }]"
  :edges="[{ from: 'A', to: '1' }, { from: 'A', to: '4' }, { from: 'B', to: '2' }, { from: 'B', to: '3' }, { from: 'C', to: '2' }, { from: 'C', to: '4' }, { from: 'D', to: '3' }, { from: 'D', to: '4' }]"
  leftLabel="People"
  rightLabel="Tasks"
/>

</v-clicks>

::right:: 

<v-clicks>

**Step 5.** Identify the optimal allocation by finding a matching that covers all vertices in one set (people) with edges that connect to the other set (tasks).

**A -> 1, B -> 2, C -> 4, D -> 3** is one possible optimal allocation.

**Step 6.** If required: use the original cost matrix to calculate the total cost of your allocation. 

|   |  1 |  2 |  3 |  4 |
|---|--- |--- |--- |--- |
| A | **20** | 30 | 20 | 25 |
| B | 50 | **20** | 20 | 50 |
| C | 30 | 20 | 40 | **30** |
| D | 60 | 50 | **30** | 40 |

Total cost for this allocation $20 + 20 + 30 + 30 = 100$

</v-clicks>
---
layout: center
zoom: 0.95
---

# Hungarian Algorithm Steps (Recap)

1. **Row reduction:** Subtract the minimum value in each row from all the entries in that row. Cover the zeros with the minimum number of lines (horizontal or vertical) needed to cover all zeros. If you need the same number of lines as rows, then go to step 4. If not, continue with the algorithm.
2. **Column reduction:** If the number of lines was less than the number of rows, subtract the minimum value in each column from all the entries in that column. Check zeros again.
3. **Lowest uncovered number:** If the number of lines is still less than the number of rows, find the lowest uncovered number (when you drew the lines) in the matrix.
    - Subtract the lowest uncovered number from all uncovered elements 
    - Add it to all elements that are covered twice. 
    - Check zeros again.
    - Repeat until the number of lines is equal to the number of rows.
4. **Draw the bipartite graph**, connecting vertices with edges where the cost is zero. Use the graph to find the optimal allocation.
5. **Calculate total cost** of the allocation using the original cost matrix (if required).

<!-- In the notes, write these steps out with key terms as blanks for students to fill in -->

---
layout: center
---

# More demos - using the camera and your notes

<!-- In the notes, give 3 allocation matrices: the first that just needs row reduction, second that uses row and column, and third that requires the whole algorithm to solve. Provide space for the whole process to happen. -->

---
layout: center
zoom: 1.4
---

# Maximisation Problems

If the goal is to **maximise** the total profit, we can convert the problem into a minimisation problem by:

1. Subtracting each entry in the cost matrix from the **largest entry** in the matrix.
2. Running the Hungarian algorithm on the new matrix to find the optimal allocation.

---
layout: center
zoom: 1.2
---

# Questions

**Edrolo 8G p. 602**

Questions 1, 3, 5-8, 10, 12, 13

> [!TIP]
>
> - The Hungarian algorithm always finds the optimal allocation, unlike inspection.
> - Watch out for maximisation problems - these need to be converted before applying the algorithm.
