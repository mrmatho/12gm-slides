---
layout: center
hideInToc: false
zoom: 1.2
---

# Crashing the Network

## Reducing Project Completion Time

---
layout: center
zoom: 1.2
---

# Why Crash a Network?

- **Crashing** is the process of reducing the project completion time by reducing the duration of one or more tasks in the project.
- Most of the time when we are crashing a network, we have some restriction on:
  - The **cost** of crashing a task
  - The **amount of time** we can crash a task
  - The **number of tasks** we can crash

To crash a network, we start by reducing the duration of the tasks on the **critical path**. This is because the **length of the critical path determines the project completion time.**

<!-- Notes: Definition of crashing, but then ask "What defines the project completion time?"-->
---
layout: two-cols
zoom: 0.95
---

# Simple Crashing Example

The project network below has a project completion time of 10 days. Find the minimum completion time if we can reduce any one task by up to 3 days.

### Step 1: Identify the critical path.

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 2, predecessors: [] },
  { id: 'B', duration: 4, predecessors: ['A'] },
  { id: 'C', duration: 6, predecessors: ['A'] },
  { id: 'D', duration: 2, predecessors: ['B', 'C'] }
]" :highlight-critical-path="true" />

**Critical path** is  `A → C → D`

::right::
<v-clicks> 

### Step 2: Identify the best candidate(s) for crashing and reduce their duration

Of `A`, `C` and `D`, the only task that can be reduced by 3 days is `C`.

 **However** if we reduce `C` by 3 days, we will get this network:

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 2, predecessors: [] },
  { id: 'B', duration: 4, predecessors: ['A'] },
  { id: 'C', duration: 3, predecessors: ['A'] },
  { id: 'D', duration: 2, predecessors: ['B', 'C'] }
]" :highlight-critical-path="true" />

Which creates a new critical path of `A → B → D` with a project completion time of 8 days. We only reduced the project by 2 days, not 3.

Because we can only reduce one task, we have exhaused all options for crashing.

The minimum project completion time is **8 days**.

</v-clicks>

---
layout: two-cols
zoom: 0.9
---

## Making multiple reductions - Method 1

*Sample Question:* For the project shown below, tasks can be reduced by a maximum of 1 day per task, at a cost of $100 each. Find the minimum project completion time and the cost of crashing the network.

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 18, predecessors: [] },
  { id: 'B', duration: 20, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 13, predecessors: ['A'] },
  { id: 'E', duration: 12, predecessors: ['B', 'C'] },
  { id: 'F', duration: 10, predecessors: ['D', 'E'] },
  { id: 'G', duration: 10, predecessors: ['D', 'E'] },
  { id: 'H', duration: 6, predecessors: ['F', 'G'] }
]" :highlight-critical-path="true" :scale="0.8"/>

<v-clicks>

We have found our critical path - and there are two! `B → E → F → H` and `B → E → G → H`. We can reduce any of the tasks on the critical path by 1 day, at a cost of $100.



</v-clicks>

::right::

<v-clicks>

We want to start by reducing the activities that are on both. We reduce `H` by 1 day. This has cost us $100 and gives us a new network:

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 18, predecessors: [] },
  { id: 'B', duration: 20, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 13, predecessors: ['A'] },
  { id: 'E', duration: 12, predecessors: ['B', 'C'] },
  { id: 'F', duration: 10, predecessors: ['D', 'E'] },
  { id: 'G', duration: 10, predecessors: ['D', 'E'] },
  { id: 'H', duration: 5, predecessors: ['F', 'G'] }
]" :highlight-critical-path="true" :scale="0.8"/>

Note that the critical paths haven't changed. We reduce `E` by 1 day, at a cost of $100. Another new network:

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 18, predecessors: [] },
  { id: 'B', duration: 20, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 13, predecessors: ['A'] },
  { id: 'E', duration: 11, predecessors: ['B', 'C'] },
  { id: 'F', duration: 10, predecessors: ['D', 'E'] },
  { id: 'G', duration: 10, predecessors: ['D', 'E'] },
  { id: 'H', duration: 5, predecessors: ['F', 'G'] }
]" :highlight-critical-path="true" :scale="0.75"/>

But now we have a new set of critical paths: `A → D → F → H` and `A → D → G → H`.  We have reduced the project completion time by 2 days (`E` & `H`), at a cost of **$200**.

</v-clicks>
---
layout: two-cols
zoom: 0.95
---

# Method 1 (continued)
<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 18, predecessors: [] },
  { id: 'B', duration: 20, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 13, predecessors: ['A'] },
  { id: 'E', duration: 11, predecessors: ['B', 'C'] },
  { id: 'F', duration: 10, predecessors: ['D', 'E'] },
  { id: 'G', duration: 10, predecessors: ['D', 'E'] },
  { id: 'H', duration: 5, predecessors: ['F', 'G'] }
]" :highlight-critical-path="true" :scale="0.75"/>

<v-clicks>
Now that almost every task is on a critical path - it is clear we need to reduce lots of the tasks. *We can reduce*

- `B` by a day, but we will also need to reduce `A` or `D` as well to get any benefit. We'll choose `A`.
  - No point reducing `D` as well - it won't help reduce the project completion time.
- `F` and `G` by a day each.
- We can't reduce `H` or `E` because we already reduced them.
- There is no point reducing `C` because it will never be on the critical path.


</v-clicks>

::right::

<v-clicks>

**Total Reductions:** `A, B, E, F, G, H -> 6 days` at a cost of *$600*. We rescan to double check our completion times.

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 17, predecessors: [] },
  { id: 'B', duration: 19, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 13, predecessors: ['A'] },
  { id: 'E', duration: 11, predecessors: ['B', 'C'] },
  { id: 'F', duration: 9, predecessors: ['D', 'E'] },
  { id: 'G', duration: 9, predecessors: ['D', 'E'] },
  { id: 'H', duration: 5, predecessors: ['F', 'G'] }
]" :highlight-critical-path="true" :scale="0.75"/>

After rescanning, we can see that we have reduced the project time by 4 days, at a cost of $600.

</v-clicks>

<style>

ul li{
  line-height: 1.3em;
}

</style>
---
layout: two-cols-header
zoom: 0.9
---

# Making multiple reductions - Method 2

**We know the critical path is always the longest path.** If we identify the length of *every path*, we can choose tasks to reduce the longest path until there is no way to reduce it further. This is often easier than constantly rescanning the network.

*Sample Question:* For the project shown below, tasks can be reduced by a maximum of 1 day per task, at a cost of $100 each. Find the minimum project completion time and the cost of crashing the network.

::left::

<ActivityNetwork :tasks="[
  { id: 'A', duration: 18, predecessors: [] },
  { id: 'B', duration: 20, predecessors: [] },
  { id: 'C', duration: 14, predecessors: [] },
  { id: 'D', duration: 13, predecessors: ['A'] },
  { id: 'E', duration: 12, predecessors: ['B', 'C'] },
  { id: 'F', duration: 10, predecessors: ['D', 'E'] },
  { id: 'G', duration: 10, predecessors: ['D', 'E'] },
  { id: 'H', duration: 6, predecessors: ['F', 'G'] }
]" :show-times="false" :scale="0.8"/>



## Paths:

- `A(18) → D(13) → F(10) → H(6)` = 47
- `A(18) → D(13) → G(10) → H(6)` = 47
- `B(20) → E(12) → F(10) → H(6)` = 48
- `B(20) → E(12) → G(10) → H(6)` = 48
- `C(14) → E(12) → F(10) → H(6)` = 42
- `C(14) → E(12) → G(10) → H(6)` = 42

::right::

- Choose an activity to reduce the longest path
- Update the lengths of the paths. 
- Keep doing this until there is no way to reduce the longest path any further.


<table class="crash-table">
<thead>
<tr>
  <th>Path</th>
  <th>Length</th>
  <th v-click="1">H</th>
  <th v-click="2">E</th>
  <th v-click="3">F</th>
  <th v-click="4">G</th>
  <th v-click="5">A</th>
  <th v-click="6">B</th>
</tr>
</thead>
<tbody>
<tr>
  <td>A → D → F → H</td>
  <td>47</td>
  <td v-click="1">46</td>
  <td v-click="2"><strong>46</strong></td>
  <td v-click="3">45</td>
  <td v-click="4"><strong>45</strong></td>
  <td v-click="5">44</td>
  <td v-click="6"><strong>44</strong></td>
</tr>
<tr>
  <td>A → D → G → H</td>
  <td>47</td>
  <td v-click="1">46</td>
  <td v-click="2"><strong>46</strong></td>
  <td v-click="3"><strong>46</strong></td>
  <td v-click="4"><strong>45</strong></td>
  <td v-click="5">44</td>
  <td v-click="6"><strong>44</strong></td>
</tr>
<tr>
  <td>B → E → F → H</td>
  <td><strong>48</strong></td>
  <td v-click="1"><strong>47</strong></td>
  <td v-click="2"><strong>46</strong></td>
  <td v-click="3">45</td>
  <td v-click="4"><strong>45</strong></td>
  <td v-click="5"><strong>45</strong></td>
  <td v-click="6"><strong>44</strong></td>
</tr>
<tr>
  <td>B → E → G → H</td>
  <td><strong>48</strong></td>
  <td v-click="1"><strong>47</strong></td>
  <td v-click="2"><strong>46</strong></td>
  <td v-click="3"><strong>46</strong></td>
  <td v-click="4"><strong>45</strong></td>
  <td v-click="5"><strong>45</strong></td>
  <td v-click="6"><strong>44</strong></td>
</tr>
<tr>
  <td>C → E → G → H</td>
  <td>42</td>
  <td v-click="1">41</td>
  <td v-click="2">40</td>
  <td v-click="3">40</td>
  <td v-click="4">39</td>
  <td v-click="5">39</td>
  <td v-click="6">39</td>
</tr>
<tr>
  <td>C → E → F → H</td>
  <td>42</td>
  <td v-click="1">41</td>
  <td v-click="2">40</td>
  <td v-click="3">39</td>
  <td v-click="4">39</td>
  <td v-click="5">39</td>
  <td v-click="6">39</td>
</tr>
</tbody>
</table>

**We reduced 6 tasks (H, E, F, G, A, B) by 1 day each, at a cost of $600.** The new project completion time is 44 days.

<style>

ul li{
  line-height: 1.3em;
}

.crash-table {
  width: 100%;
  border-collapse: collapse;
}

.crash-table th,
.crash-table td {
  text-align: center;
}

</style>

---
layout: center
zoom: 1.1
---

# Try yourself

<ActivityNetwork :tasks="[
  { id: 'A', duration: 5, predecessors: [] },
  { id: 'B', duration: 9, predecessors: [] },
  { id: 'C', duration: 7, predecessors: ['A'] },
  { id: 'D', duration: 11, predecessors: ['B', 'C'] },
  { id: 'E', duration: 12, predecessors: ['B', 'C'] },
  { id: 'F', duration: 8, predecessors: ['D', 'E'] },
  { id: 'G', duration: 6, predecessors: ['E'] }
]" :show-times="false" :scale="0.9"/>

You can reduce the duration of any task by up to 3 days, with the following costs:

<table style="width: 50%; text-align: center">
<tbody>
<tr><th style="text-align: center;">Tasks A - C </th><td> $200 per day </td></tr>
<tr><th style="text-align: center;"> Tasks D - G </th><td> $400 per day </td></tr>
</tbody>
</table>

**You have a budget of $1500** to reduce the project completion time. Find the minim um project completion time and indicate which tasks you would reduce (and by how much).

---
layout: two-cols
zoom: 1
---

# Suggested approach

<ForwardScanNetwork :tasks="[
  { id: 'A', duration: 5, predecessors: [] },
  { id: 'B', duration: 9, predecessors: [] },
  { id: 'C', duration: 7, predecessors: ['A'] },
  { id: 'D', duration: 11, predecessors: ['B', 'C'] },
  { id: 'E', duration: 12, predecessors: ['B', 'C'] },
  { id: 'F', duration: 8, predecessors: ['D', 'E'], boxPosition: 'below'},
  { id: 'G', duration: 6, predecessors: ['E']}
]" :show-times="false" :scale="0.9"/>

### Paths: 

- `A(5) → C(7) → D(11) → F(8)` = 31
- `A(5) → C(7) → E(12) → F(8)` = 32
- `A(5) → C(7) → E(12) → G(6)` = 30
- `B(9) → D(11) → F(8)` = 28
- `B(9) → E(12) → F(8)` = 29
- `B(9) → E(12) → G(6)` = 27

::right::

### Reducing the longest (critical) path

| Path    | Length | A (3) | F (2) |
| :---: | :---: | :---: | :---: |
| ACDF | 31 | 28 | 26 |
| ACEF | **32** | **29** | **27** |
| ACEG | 30 | 27 | **27** |
| BDF | 28 | 28 | 26 |
| BEF | 29 | **29** | **27** |
| BEG | 27 | 27 | 26 |

- A(3) uses $600 of budget
- F(2) uses $800 of budget - total $1400 of budget

**No further improvements possible.**

Some other options possible (*swap A for C and/or E for F*) for same time and cost.

---
layout: center
---

# Important Crashing Tips to Remember

- Read the question carefully - each question will have different restrictions on how many tasks you can reduce, by how much, and the cost of reducing each task.
- The critical path is always the longest path.
  If you can identify all the paths, you can reduce the longest path until there is no way to reduce it further.
- **Watch for new critical paths**
  - If you reduce a task on the critical path, it may create a new critical path.
  - If you reduce a task that is not on the critical path, it will not reduce the project completion time.

---
layout: center
zoom: 1.6
---

## Edrolo 8J

Questions 1, 3, 5-7, 9, 11, 12

---
