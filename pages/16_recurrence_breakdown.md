---
layout: cover
hideInToc: false
---

# Breaking Down Recurrence Relations

---
layout: center
zoom: 1
---

# Recurrence Relations

| Arithmetic | Geometric | Both | 
|---|---|---|
| $V_{n+1} = V_n + d$ | $V_{n+1} = R V_n$ | $V_{n+1} = R V_n + d$ |
| Adds or subtracts a constant ($d$) | Multiplies by a constant ($R$) | Adds or subtracts a constant ($d$) and multiplies by a constant ($R$) |
| Simple Interest (positive $d$) | Compound Interest ($R > 1$) | Annuity Investment ( positive $d$ and $R > 1$) |
| Flat-rate or Unit Cost Depreciation (negative $d$) | Reducing Balance Depreciation ($R < 1$) | Reducing Balance Loan or Annuity (negative $d$ and $R > 1$) |

Note: In the "Both" column, the **interest is always coming from $R$**, with the **$d$ term representing a payment or withdrawal**. 

---
layout: center
---

# Finding an Percentage Rate from a Recurrence Relation

## Arithmetic (Simple Interest or Flat-rate Depreciation)

If $V_{n+1} = V_n + d$, then the percentage rate is given by:

- $R = \frac{d}{V_0} \times 100\%$ - because the Interest or Depreciation is a constant amount ($d$) each period, and the percentage rate is calculated from the initial value ($V_0$).
- Example: 
  - If $V_{n+1} = V_n + 200$, and $V_0 = 1000$, 
  - The **simple interest** rate is $R = \frac{200}{1000} \times 100\% = 20\%$.
  -  If $V_{n+1} = V_n - 450$, and $V_0 = 9000$, 
  - The **flat-rate depreciation** rate is $R = \frac{450}{9000} \times 100\% = 5\%$.

---
layout: center
---

# Finding a Percentage Rate from a Recurrence Relation
## Geometric (Compound Interest or Reducing Balance Depreciation)

If $V_{n+1} = R V_n$, then the percentage rate ($r$) **per compounding period ($n$)** is given by:

- $r = (R - 1) \times 100\%$

After doing this enough times, you should be able to recognise the pattern and identify the percentage rate from the recurrence relation without needing to use this formula.

<v-clicks depth="3">

- Recurrence Relation: $V_0 = 1000, V_{n+1} = 1.05 V_n$  
  - Percentage Rate: $r = (1.05 - 1) \times 100\% = 5\%$
- Recurrence Relation: $V_0 = 9000, V_{n+1} = 0.93 V_n$
  - Percentage Rate: $r = (0.95 - 1) \times 100\% = -5\%$ (so 5% reducing balance depreciation rate)
- Recurrence Relation: $V_0 = 1000, V_{n+1} = 1.02 V_n + 200$  
  - Percentage Rate: $r = (1.02 - 1) \times 100\% = 2\%$ (so 2% interest rate, with a $200$ payment each period) 
  
</v-clicks>

---
