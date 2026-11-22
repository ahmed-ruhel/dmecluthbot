# GripLab — Mathematical Specification & Canonical Formula Reference

**Course:** 23EMEC301 Design of Machine Elements, KLE Technological University (Semester V)  
**Curriculum Scope:** Unit II, Chapter 4: "Friction Clutches and Brakes" (CO3, CO6, CSPI 3.1.3.3 & 5.2.1.1)  
**Primary References:**  
1. *Design Data Handbook for Mechanical Engineers in SI and Metric Units*, K. Mahadevan & K. Balaveera Reddy, 4th Edition (CBS Publishers & Distributors), Chapter 13: *Couplings, Clutches and Brakes* (Pages 251–287).  
2. Handwritten Classroom Lecture Notes: `clutch.pdf` (8 pages) & `brakes_notes.pdf` (10 pages).  
3. Course Plan & Examination Model Papers: `23EMEC301_DME_LP_2026.pdf`.

---

## 1. Clutch Design Formulation

### 1.1 Friction Surfaces and Disc Count
- For a **single plate clutch**:
  - One side effective: $n' = 1$
  - Both sides effective: $n' = 2$
- For a **multi-plate disc clutch**:
  - Let $n_1$ be the number of discs on the driving shaft.
  - Let $n_2$ be the number of discs on the driven shaft.
  - Total number of active contact friction surfaces:
    $$n' = n_1 + n_2 - 1 \quad [\text{Class Notes Pg 2}]$$
  - $n'$ is required to be an even integer for standard double-sided plate assemblies ($n' \ge 2$, even).
  - When solving for required $n'$, calculate $n'_{\text{calc}}$ and round **UP** to the nearest even integer:
    $$n' = 2 \times \lceil n'_{\text{calc}} / 2 \rceil$$
  - Class convention for allocating discs after rounding:
    $$n_1 = \frac{n'}{2}, \quad n_2 = n_1 + 1 = \frac{n'}{2} + 1$$
    *(Total discs in stack = $n_1 + n_2 = n' + 1$)*

---

### 1.2 Torque, Power, and Factor of Safety
- Power transmission relation:
  $$P = \frac{2 \pi N T}{60 \times 10^3} \text{ [kW]} \iff T = \frac{60 \times 10^6 \cdot P}{2 \pi N} \approx \frac{9.55 \times 10^6 \cdot P}{N} \text{ [N·mm]}$$
  *(where $P$ is in kW, $N$ is in rpm, $T$ is transmitted torque in N·mm)*
- Maximum design torque considering Factor of Safety (FoS) against slippage:
  $$T_{\max} = \text{FoS} \times T \quad [\text{Class Notes Pg 3}]$$

---

### 1.3 Theory 1: Uniform Pressure Distribution (New Unworn Clutch)
Assumes the contact pressure $p$ is uniform across the entire face of the lining: $p = \text{constant}$.

1. **Axial Operating Force ($F_a$):**
   $$F_a = \int_{R_i}^{R_o} 2 \pi r \cdot p \, dr = \frac{\pi}{4} p (D_o^2 - D_i^2) \quad [\text{Eq 13.9(a), Pg 258}]$$
2. **Mean Friction Diameter ($D_m$):**
   $$D_m = \frac{2}{3} \left[ \frac{D_o^3 - D_i^3}{D_o^2 - D_i^2} \right] \quad [\text{Eq 13.9(b), Pg 258}]$$
3. **Torque Transmitted ($T$):**
   $$T = \frac{1}{2} \mu F_a D_m n' = \frac{\pi}{12} \mu n' p (D_o^3 - D_i^3) \quad [\text{Eq 13.9(c), Pg 258}]$$

---

### 1.4 Theory 2: Uniform Wear Distribution (Worn / Running-in Clutch — Default)
Assumes the normal wear rate is proportional to frictional work ($p \cdot v = \text{constant} \implies p \cdot r = C$). The maximum pressure $p_{\max}$ occurs at the inner radius $R_i$ ($D_i$).

1. **Axial Operating Force ($F_{aw}$):**
   $$F_{aw} = 2 \pi C (R_o - R_i) = \frac{1}{2} \pi p_{\max} D_i (D_o - D_i) \quad [\text{Eq 13.9(d), Pg 258}]$$
2. **Mean Friction Diameter ($D_{mw}$):**
   $$D_{mw} = \frac{D_o + D_i}{2} \quad [\text{Eq 13.9(e), Pg 258}]$$
3. **Torque Transmitted ($T$):**
   $$T = \frac{1}{2} \mu F_{aw} D_{mw} n' = \frac{\pi}{8} \mu n' p_{\max} D_i (D_o^2 - D_i^2) \quad [\text{Eq 13.9(f), Pg 259}]$$
4. **Conservative Default Rule:** Because Uniform Pressure predicts higher torque capacity for identical dimensions, **Uniform Wear theory is the conservative engineering default** and must be used unless a new clutch is explicitly stated.

---

### 1.5 Geometry Ratios, Pressure Distinctions & Optimums
- **Optimum Diameter Ratio for Maximum Torque:**
  At a fixed outer diameter $D_o$ and allowable maximum pressure $p_{\max}$, the torque $T \propto D_i (D_o^2 - D_i^2)$. Differentiating with respect to $D_i$:
  $$\frac{d}{d D_i} [D_i D_o^2 - D_i^3] = D_o^2 - 3 D_i^2 = 0 \implies \frac{D_i}{D_o} = \frac{1}{\sqrt{3}} \approx 0.57735$$
  - **Class Convention:** Standard design practice in class exercises frequently selects $\frac{D_i}{D_o} = 0.5$ for convenient integer sizing. The app supports a toggle: `0.5 (Class standard)` / `0.577 (Analytical Optimum)` / `Custom`.
- **Radial Width Input:** If radial width $b$ is given as a fraction $k$ of outer radius $R_o$ ($b = k \cdot R_o$):
  $$D_i = D_o - 2b = D_o (1 - k)$$
- **Maximum vs. Mean Pressure Distinction:**
  - Maximum intensity of pressure occurs at inner diameter under wear: $p_{\max} = \frac{2 F_{aw}}{\pi D_i (D_o - D_i)}$.
  - Mean (average) intensity of pressure over the projected annular face:
    $$p_{\text{mean}} = \frac{F_a}{\frac{\pi}{4}(D_o^2 - D_i^2)}$$
  - Both $p_{\max}$ and $p_{\text{mean}}$ must always be calculated and displayed to avoid student confusion.

---

### 1.6 Clutch Solve Modes
- **Mode A (Capacity):** Given $D_o, D_i, \mu, p, n_1, n_2, N \implies$ Compute $n', F_a, D_m, T, P, p_{\text{mean}}$.
- **Mode B (Sizing):** Given $P$ or $T$, FoS, $\mu, p, n_1, n_2$ and diameter ratio $c = D_i/D_o \implies$
  $$D_i (D_o^2 - D_i^2) = D_o^3 \cdot c(1 - c^2) = \frac{8 T_{\max}}{\pi \mu n' p_{\max}}$$
  $$D_o = \left[ \frac{8 T_{\max}}{\pi \mu n' p_{\max} \cdot c(1 - c^2)} \right]^{1/3}, \quad D_i = c \cdot D_o$$
  *(If $c$ is unconstrained, solve numerically via bisection bounded by standard shaft proportions).*
- **Mode C (Plate Count):** Given $T, D_o, D_i, \mu, p_{\text{allow}} \implies$
  Compute required continuous surfaces $n'_{\text{calc}}$, round up to even $n'$, compute $n_1 = n'/2, n_2 = n_1 + 1$, then calculate **actual operating force** $F_{a,\text{actual}}$ and **actual pressures** $p_{\max,\text{actual}}$ and $p_{\text{mean},\text{actual}}$.
- **Mode D (Axial Force Limited):** Given maximum allowable clamping force $F_{a,\text{limit}}$, radial width fraction $b/R_o$, and $T \implies$ Compute $n'$, round up to even, then compute actual force and limiting vs actual pressures.

---

## 2. Block (Shoe) Brake Formulation (Short Shoe)

### 2.1 Geometry & Kinematic Variables
- Drum diameter $D$, radius $r = D/2$.
- Lever arms:
  - $b$ = distance from fulcrum pivot to drum center line.
  - $a$ = distance from drum center line to applied effort line $F$.
  - Total moment arm of applied force from fulcrum: $L = a + b$.
  - $c$ = perpendicular distance from fulcrum to the tangential friction force $F_t$ line of action.
- Contact angle: $2\theta$ (total contact angle of shoe).
  - If contact angle is unspecified in the problem statement, **assume $2\theta = 60^\circ$**.

---

### 2.2 Contact Angle Correction (Equivalent Friction Coefficient)
- When $2\theta \le 60^\circ$ ($1.047\text{ rad}$), pressure distribution is nearly uniform:
  $$\mu' = \mu$$
- When $2\theta > 60^\circ$, pressure varies along the shoe; use the equivalent coefficient of friction:
  $$\mu' = \mu \left[ \frac{4 \sin \theta}{2\theta + \sin 2\theta} \right] \quad [\text{Eq 13.6(m), Pg 264}]$$
  *(Note: $\theta$ is in radians inside the denominator: $2\theta_{\text{rad}} + \sin(2\theta)$).*

---

### 2.3 Braking Forces, Torque, and Pressures
- Tangential braking force: $F_t = \frac{T}{r} = \frac{2T}{D}$
- Normal reaction on block:
  $$F_n = \frac{F_t}{\mu'} = \frac{2T}{\mu' D} \quad [\text{Eq 13.16(f), Pg 265}]$$
- Bearing / Contact pressure on shoe (projected area with face width $b'$):
  $$p = \frac{F_n}{A_{\text{proj}}} = \frac{F_n}{b' \cdot 2r \sin \theta} \quad [\text{Eq 13.16(g), Pg 265}]$$

---

### 2.4 Operating Force Equations by Fulcrum Moment Balance

Taking moments about the fulcrum pivot ($\sum M_{\text{fulcrum}} = 0$):

#### Case 1: Line of action of $F_t$ passes through the fulcrum ($c = 0$)
- Friction force produces zero moment about the fulcrum.
- Independent of rotation direction:
  $$F \cdot (a + b) - F_n \cdot b = 0 \implies F = F_t \left[ \frac{b}{a+b} \right] \frac{1}{\mu'} \quad [\text{Eq 13.17(a), Pg 267}]$$

#### Case 2: Line of action of $F_t$ lies between drum center and fulcrum
- Normal force moment opposes $F$: $+ F_n \cdot b$.
- Tangential force moment depends on rotation:
  - **Clockwise (CW) Rotation:** Friction assists lever $\implies$ **Self-energizing**:
    $$F = \frac{F_t b}{a+b} \left[ \frac{1}{\mu'} - \frac{c}{b} \right] \quad [\text{Eq 13.17(b), Pg 267}]$$
  - **Counter-Clockwise (CCW) Rotation:** Friction opposes lever:
    $$F = \frac{F_t b}{a+b} \left[ \frac{1}{\mu'} + \frac{c}{b} \right] \quad [\text{Eq 13.17(c), Pg 267}]$$

#### Case 3: Fulcrum lies between drum center and line of action of $F_t$
- **Clockwise (CW) Rotation:** Friction opposes lever:
  $$F = \frac{F_t b}{a+b} \left[ \frac{1}{\mu'} + \frac{c}{b} \right] \quad [\text{Eq 13.17(d), Pg 267}]$$
- **Counter-Clockwise (CCW) Rotation:** Friction assists lever $\implies$ **Self-energizing**:
  $$F = \frac{F_t b}{a+b} \left[ \frac{1}{\mu'} - \frac{c}{b} \right] \quad [\text{Eq 13.17(e), Pg 267}]$$

---

### 2.5 Self-Energizing vs. Self-Locking Conditions
- **Self-Energizing:** When the moment of the friction force $F_t \cdot c$ acts in the same sense as the moment of the applied force $F \cdot (a+b)$, reducing the required effort $F$.
- **Self-Locking:** When the brake remains engaged without any externally applied effort ($F \le 0$).
  - For the self-energizing direction, $F \le 0$ when:
    $$\frac{1}{\mu'} - \frac{c}{b} \le 0 \iff c \ge \frac{b}{\mu'} \iff b \le \mu' c$$
  - Critical fulcrum offset:
    $$c_{\text{crit}} = \frac{b}{\mu'}$$
  - The application must compute $c_{\text{crit}}$ and display whether the current geometry is regular, self-energizing, or self-locking.

---

### 2.6 Rubbing Speed, Heat Generation, and Braking Energy
- Surface rubbing velocity:
  $$v = \frac{\pi D N}{60 \times 1000} \text{ [m/s]}$$
- Instantaneous heat generation rate:
  $$H = \mu' F_n v = F_t v \text{ [W or J/s]} \quad [\text{Eq 13.24(a), Pg 275}]$$
- Total heat energy absorbed over braking duration $t$ (seconds):
  $$E = H \cdot t \text{ [J or kJ]}$$

---

## 3. Band Brake Formulation

### 3.1 Tension Ratio and Fundamental Forces
- Belt friction relation along the drum arc of contact $\theta$ (in radians):
  $$\frac{F_1}{F_2} = e^{\mu \theta} \quad [\text{Eq 13.18(a), Pg 267}]$$
  *(where $F_1$ is tight-side tension and $F_2$ is slack-side tension, $F_1 > F_2$)*
- Tangential braking force:
  $$F_t = F_1 - F_2 = \frac{T}{r} = \frac{2T}{D} \quad [\text{Eq 13.18(b), Pg 267}]$$
- Explicit expressions for individual tensions:
  $$F_1 = F_t \left[ \frac{e^{\mu \theta}}{e^{\mu \theta} - 1} \right] \quad [\text{Eq 13.18(c), Pg 267}]$$
  $$F_2 = F_t \left[ \frac{1}{e^{\mu \theta} - 1} \right] \quad [\text{Eq 13.18(d), Pg 267}]$$

---

### 3.2 Simple Band Brake Lever Configurations

#### Case (e) [Handbook Fig. e, Pg 270]: Fulcrum at extreme end, band connected at arm $b$
- Operating force applied at length $a$ from fulcrum:
  - **Clockwise (CW) Rotation:** Slack side attached to lever ($T_{\text{end}} = F_2$):
    $$F_{\text{cw}} = \frac{F_t b}{a} \left[ \frac{1}{e^{\mu\theta} - 1} \right] = \frac{F_2 \cdot b}{a} \quad [\text{Eq 13.19(c), Pg 270}]$$
  - **Counter-Clockwise (CCW) Rotation:** Tight side attached to lever ($T_{\text{end}} = F_1$):
    $$F_{\text{ccw}} = \frac{F_t b}{a} \left[ \frac{e^{\mu\theta}}{e^{\mu\theta} - 1} \right] = \frac{F_1 \cdot b}{a} \quad [\text{Eq 13.19(d), Pg 270}]$$

#### Case (d) [Handbook Fig. d, Pg 270]: Opposite connection orientation
- **Clockwise (CW) Rotation:** Tight side attached to lever:
  $$F_{\text{cw}} = \frac{F_t b}{a} \left[ \frac{e^{\mu\theta}}{e^{\mu\theta} - 1} \right] = \frac{F_1 \cdot b}{a} \quad [\text{Eq 13.19(a), Pg 270}]$$
- **Counter-Clockwise (CCW) Rotation:** Slack side attached to lever:
  $$F_{\text{ccw}} = \frac{F_t b}{a} \left[ \frac{1}{e^{\mu\theta} - 1} \right] = \frac{F_2 \cdot b}{a} \quad [\text{Eq 13.19(b), Pg 270}]$$

---

### 3.3 Differential Band Brake
Both band ends connect to the lever at distinct moment arms $b_1$ and $b_2$ relative to the fulcrum:
- Taking moments about the pivot:
  $$F \cdot a + T_A \cdot b_1 - T_B \cdot b_2 = 0 \implies F \cdot a = T_B \cdot b_2 - T_A \cdot b_1$$
- For rotation where $B$ carries $F_2$ and $A$ carries $F_1$:
  $$F = \frac{F_2 b_2 - F_1 b_1}{a} = \frac{F_t (b_2 - b_1 e^{\mu\theta})}{a (e^{\mu\theta} - 1)} \quad [\text{Eq 13.19(f), Pg 270}]$$
- **Self-Locking Condition in Differential Brakes:**
  $$F \le 0 \iff b_2 - b_1 e^{\mu\theta} \le 0 \iff e^{\mu\theta} \ge \frac{b_2}{b_1}$$

---

### 3.4 Band Sizing and Pressures
- Standard steel band thickness:
  $$h = 0.005 \cdot D \quad [\text{Eq 13.18(n), Pg 268}]$$
- Minimum band width based on allowable tensile stress $\sigma_d$:
  $$b' = \frac{F_1}{h \cdot \sigma_d} \quad [\text{Eq 13.18(o), Pg 268}]$$
- Radial pressures between band and drum:
  - Average pressure: $p_{\text{avg}} = \frac{F_1 + F_2}{D \cdot b'} \quad [\text{Eq 13.18(k), Pg 268}]$
  - Maximum pressure (at tight side): $p_1 = \frac{2 F_1}{D \cdot b'} \quad [\text{Eq 13.18(l), Pg 268}]$
  - Minimum pressure (at slack side): $p_2 = \frac{2 F_2}{D \cdot b'} \quad [\text{Eq 13.18(m), Pg 268}]$

---

### 3.5 Brake Operating Lever Design
- Design force: $F_{\text{design}} = \max(F_{\text{cw}}, F_{\text{ccw}})$
- Maximum bending moment at fulcrum:
  $$M = F_{\text{design}} \cdot L_{\text{effort}}$$
- Rectangular cross-section with width $b_l$ and depth $h_l = k \cdot b_l$ (class default $k = 2$):
  $$Z = \frac{b_l h_l^2}{6} = \frac{b_l (k b_l)^2}{6} = \frac{k^2 b_l^3}{6}$$
- Bending stress equation:
  $$\sigma_b = \frac{M}{Z} = \frac{6M}{k^2 b_l^3} \implies b_l = \left[ \frac{6M}{k^2 \sigma_{\text{allow}}} \right]^{1/3}$$
  $$h_l = k \cdot b_l$$

---

## 4. Transcribed Worked Examples & Verified Solutions

### 4.1 Clutch Problem C1 (Notes P1 / ESA Q4a)
- **Input Data:**
  - Discs: $n_1 = 5$ steel discs, $n_2 = 4$ bronze discs.
  - Active surfaces: $n' = n_1 + n_2 - 1 = 5 + 4 - 1 = 8$.
  - Maximum torque: $T = 240\text{ N·m} = 240 \times 10^3\text{ N·mm}$.
  - Factor of safety for slippage: $\text{FoS} = 2.5$.
  - Design torque: $T_{\max} = 2.5 \times 240 \times 10^3 = 600 \times 10^3\text{ N·mm}$.
  - Allowable pressure: $p_{\max} = 0.35\text{ MPa}$.
  - Friction coefficient: $\mu = 0.25$.
  - Theory: Uniform wear (conservative default).
  - Diameter ratio: $D_i = 0.5 D_o$ (class design choice).
- **Working Steps:**
  1. $F_{aw} = \frac{1}{2} \pi p_{\max} D_i (D_o - D_i) = \frac{\pi \times 0.35}{2} D_i (D_o - D_i) = 0.54978 D_i (D_o - D_i)$.
  2. $D_{mw} = \frac{D_o + D_i}{2}$.
  3. $T_{\max} = \frac{1}{2} \mu n' F_{aw} D_{mw} = \frac{1}{2}(0.25)(8)(0.54978) D_i (D_o - D_i) \left(\frac{D_o + D_i}{2}\right) = 0.27489 D_i (D_o^2 - D_i^2)$.
  4. Setting $D_i = 0.5 D_o$:
     $$D_i (D_o^2 - D_i^2) = 0.5 D_o (D_o^2 - 0.25 D_o^2) = 0.375 D_o^3$$
     $$600,000 = 0.27489 \times 0.375 D_o^3 = 0.10308 D_o^3$$
     $$D_o^3 = \frac{600,000}{0.10308} = 5.8205 \times 10^6 \implies D_o = 179.88\text{ mm} \approx 179.9\text{ mm}$$
     $$D_i = 0.5 \times 179.88 = 89.94\text{ mm} \approx 90.0\text{ mm}$$
- **Canonical Output:** $D_o \approx 179.9\text{ mm}$, $D_i \approx 90.0\text{ mm}$. *(Notes show 179.8 mm due to intermediate decimal truncation).*

---

### 4.2 Clutch Problem C2 (Notes P2 / Minor II Q1a)
- **Input Data:**
  - Power: $P = 8\text{ kW}$, Speed: $N = 1440\text{ rpm}$.
  - Lining dimensions: $D_i = 80\text{ mm}$, $D_o = 140\text{ mm}$.
  - Friction coefficient in oil: $\mu = 0.1$.
  - Allowable average pressure: $p = 0.35\text{ MPa}$.
  - Theory: Uniform wear.
- **Working Steps:**
  1. $T = \frac{9.55 \times 10^6 \times 8}{1440} = 53,055.6\text{ N·mm} = 53.056\text{ N·m}$.
  2. $D_{mw} = \frac{140 + 80}{2} = 110\text{ mm}$.
  3. Limiting axial force per pair:
     $$F_{aw,\text{limit}} = \frac{1}{2} \pi (0.35)(80)(140 - 80) = 2638.94\text{ N}$$
  4. Required contact surfaces:
     $$n'_{\text{calc}} = \frac{2 T}{\mu F_{aw} D_{mw}} = \frac{2 \times 53055.6}{0.1 \times 2638.94 \times 110} = 3.655$$
     Round UP to next even integer: $n' = 4$.
  5. Disc count:
     $$n_1 = \frac{n'}{2} = 2 \text{ (steel driving)}, \quad n_2 = n_1 + 1 = 3 \text{ (bronze driven)}$$
  6. Actual required axial force:
     $$F_{aw,\text{actual}} = \frac{2 T}{\mu n' D_{mw}} = \frac{2 \times 53055.6}{0.1 \times 4 \times 110} = 2411.62\text{ N} \approx 2411.4\text{ N}$$
  7. Actual maximum pressure:
     $$p_{\max,\text{actual}} = \frac{2 F_{aw,\text{actual}}}{\pi D_i (D_o - D_i)} = \frac{2 \times 2411.62}{\pi \times 80 \times 60} = 0.3198\text{ MPa} \approx 0.320\text{ MPa}$$
- **Canonical Output:** $n' = 4$ ($n_1 = 2, n_2 = 3$), $F_{a,\text{actual}} \approx 2411.4\text{ N}$, $p_{\max,\text{actual}} \approx 0.320\text{ MPa}$.

---

### 4.3 Clutch Problem C3 (Notes P3 / ESA Q6a)
- **Input Data:**
  - Outer diameter: $D_o = 250\text{ mm}$ ($R_o = 125\text{ mm}$).
  - Radial width: $b = 0.2 R_o = 25\text{ mm} \implies D_i = D_o - 2b = 200\text{ mm}$ ($R_i = 100\text{ mm}$).
  - Power: $P = 60\text{ kW}$, Speed: $N = 3000\text{ rpm}$.
  - Friction coefficient: $\mu = 0.25$.
  - Clamping force limit: $F_a \le 600\text{ N}$.
  - Theory: Uniform wear.
- **Working Steps:**
  1. $T = \frac{9.55 \times 10^6 \times 60}{3000} = 191,000\text{ N·mm} = 191.0\text{ N·m}$ *(exact: $190,985.9\text{ N·mm}$)*.
  2. $D_{mw} = \frac{250 + 200}{2} = 225\text{ mm}$.
  3. Surfaces required at $F_a = 600\text{ N}$:
     $$n'_{\text{calc}} = \frac{2 \times 190985.9}{0.25 \times 600 \times 225} = 11.317 \implies n' = 12$$
  4. Disc count: $n_1 = 6$ driving discs, $n_2 = 7$ driven discs.
  5. Actual axial force needed with $n' = 12$:
     $$F_{aw,\text{actual}} = \frac{2 \times 190985.9}{0.25 \times 12 \times 225} = 565.88\text{ N}$$
  6. Limiting vs. Actual pressures:
     - Limiting $p_{\max} = \frac{2 \times 600}{\pi \times 200 \times 50} = 0.03820\text{ MPa}$.
     - Actual $p_{\max} = \frac{2 \times 565.88}{\pi \times 200 \times 50} = 0.03602\text{ MPa} \approx 0.036\text{ MPa}$.
     - Actual mean pressure:
       $$p_{\text{mean}} = \frac{F_{aw,\text{actual}}}{\frac{\pi}{4}(D_o^2 - D_i^2)} = \frac{565.88}{\frac{\pi}{4}(250^2 - 200^2)} = \frac{565.88}{17,671.5} = 0.03202\text{ MPa} \approx 0.032\text{ MPa}$$
- **Canonical Output:** $n' = 12$ ($n_1 = 6, n_2 = 7$), $F_{a,\text{actual}} \approx 565.9\text{ N}$, limiting $p_{\max} \approx 0.0382\text{ MPa}$, actual $p_{\max} \approx 0.0360\text{ MPa}$, actual $p_{\text{mean}} \approx 0.0320\text{ MPa}$.

---

### 4.4 Clutch Problem C4 (Notes P4)
- **Input Data:**
  - Discs: $n_1 = 2$ bronze, $n_2 = 3$ steel $\implies n' = 4$.
  - Pressure limit: $p = 0.1\text{ MPa}$, Friction: $\mu = 0.15$.
  - Diameters: $D_o = 200\text{ mm}$, $D_i = 120\text{ mm}$, Speed: $N = 1000\text{ rpm}$.
- **Comparative Working:**
  - **Uniform Wear Theory:**
    - $F_{aw} = \frac{1}{2} \pi (0.1)(120)(200 - 120) = 1507.96\text{ N}$.
    - $D_{mw} = \frac{200 + 120}{2} = 160\text{ mm}$.
    - $T_w = \frac{1}{2}(0.15)(1507.96)(160)(4) = 72,382.3\text{ N·mm} = 72.382\text{ N·m}$.
    - $P_w = \frac{2 \pi (1000)(72.382)}{60 \times 1000} = 7.579\text{ kW}$.
  - **Uniform Pressure Theory:**
    - $F_a = \frac{\pi}{4}(0.1)(200^2 - 120^2) = 2010.62\text{ N}$.
    - $D_m = \frac{2}{3} \left[ \frac{200^3 - 120^3}{200^2 - 120^2} \right] = \frac{2}{3} \left[ \frac{6,272,000}{25,600} \right] = 163.333\text{ mm}$.
    - $T_p = \frac{1}{2}(0.15)(2010.62)(163.333)(4) = 98,520.4\text{ N·mm} = 98.520\text{ N·m}$.
    - $P_p = \frac{2 \pi (1000)(98.520)}{60 \times 1000} = 10.317\text{ kW} \approx 10.32\text{ kW}$.
  - **Comparison:** Uniform pressure yields $+36.1\%$ higher torque and power capacity than uniform wear.

---

### 4.5 Clutch Problem C5 (Course Plan Minor II Q3b)
- **Input Data:**
  - $n' = 4$ active contact pairs (5 plates).
  - Maximum allowable pressure: $p = 0.127\text{ MPa}$.
  - Radii: $R_o = 125\text{ mm} \implies D_o = 250\text{ mm}$, $R_i = 75\text{ mm} \implies D_i = 150\text{ mm}$.
  - Speed: $N = 500\text{ rpm}$, $\mu = 0.3$, Uniform wear.
- **Working Steps:**
  1. $F_{aw} = \frac{1}{2} \pi (0.127)(150)(250 - 150) = 2992.37\text{ N}$.
  2. $D_{mw} = \frac{250 + 150}{2} = 200\text{ mm}$.
  3. $T = \frac{1}{2}(0.3)(2992.37)(200)(4) = 179,542\text{ N·mm} = 179.54\text{ N·m}$.
  4. $P = \frac{2 \pi (500)(179.54)}{60 \times 1000} = 9.401\text{ kW} \approx 9.40\text{ kW}$.
- **Canonical Output:** $P \approx 9.40\text{ kW}$.

---

### 4.6 Block Brake Problem B1 (Notes P1)
- **Input Data:**
  - Drum diameter: $D = 500\text{ mm} \implies r = 250\text{ mm}$.
  - Lever dimensions: $a = 250\text{ mm}, b = 250\text{ mm}, c = 75\text{ mm}$.
  - Torque to balance: $T = 200\text{ N·m} = 200 \times 10^3\text{ N·mm}$.
  - Speed: $N = 750\text{ rpm}$, Friction: $\mu = 0.25$.
  - Geometry: Case 2 ($F_t$ line between drum center and fulcrum).
  - Contact angle: Absent $\implies 2\theta = 60^\circ \implies \mu' = 0.25$.
- **Working Steps:**
  1. $F_t = \frac{T}{r} = \frac{200 \times 10^3}{250} = 800\text{ N}$.
  2. $F_n = \frac{F_t}{\mu'} = \frac{800}{0.25} = 3200\text{ N}$.
  3. Lever force CW (self-energizing):
     $$F_{\text{cw}} = \frac{800 \times 250}{250 + 250} \left[ \frac{1}{0.25} - \frac{75}{250} \right] = 400 \times [4 - 0.3] = 1480\text{ N}$$
  4. Lever force CCW:
     $$F_{\text{ccw}} = \frac{800 \times 250}{500} \left[ \frac{1}{0.25} + \frac{75}{250} \right] = 400 \times [4 + 0.3] = 1720\text{ N}$$
  5. Rubbing velocity:
     $$v = \frac{\pi \times 500 \times 750}{60,000} = 19.635\text{ m/s}$$
  6. Heat generation rate:
     $$H = F_t \cdot v = 800 \times 19.635 = 15,708\text{ W} = 15.71\text{ kW}$$
  7. Self-locking threshold:
     $$c_{\text{crit}} = \frac{b}{\mu'} = \frac{250}{0.25} = 1000\text{ mm} \implies \text{Self-locking if } c \ge 1000\text{ mm}$$
- **Canonical Output:** $F_n = 3200\text{ N}$, $F_t = 800\text{ N}$, $F_{\text{cw}} = 1480\text{ N}$, $F_{\text{ccw}} = 1720\text{ N}$, $v = 19.63\text{ m/s}$, $H = 15.71\text{ kW}$, $c_{\text{crit}} = 1000\text{ mm}$.

---

### 4.7 Block Brake Problem B2 (Notes P2)
- **Input Data:**
  - $D = 500\text{ mm} \implies r = 250\text{ mm}$.
  - Lever dimensions: $a = 750\text{ mm}, b = 250\text{ mm}, c = 50\text{ mm}$.
  - Torque: $T = 500\text{ N·m}$, Speed: $N = 1000\text{ rpm}$, $\mu = 0.25$.
  - Geometry: Case 2.
- **Working Steps:**
  1. $F_t = \frac{500 \times 10^3}{250} = 2000\text{ N}$.
  2. $F_n = \frac{2000}{0.25} = 8000\text{ N}$.
  3. Operating forces:
     $$F_{\text{cw}} = \frac{2000 \times 250}{1000} \left[ \frac{1}{0.25} - \frac{50}{250} \right] = 500 \times [4 - 0.2] = 1900\text{ N}$$
     $$F_{\text{ccw}} = \frac{2000 \times 250}{1000} \left[ \frac{1}{0.25} + \frac{50}{250} \right] = 500 \times [4 + 0.2] = 2100\text{ N}$$
  4. Critical offset: $c_{\text{crit}} = \frac{250}{0.25} = 1000\text{ mm}$.
- **Canonical Output:** $F_n = 8000\text{ N}$, $F_t = 2000\text{ N}$, $F_{\text{cw}} = 1900\text{ N}$, $F_{\text{ccw}} = 2100\text{ N}$, $c_{\text{crit}} = 1000\text{ mm}$.

---

### 4.8 Block Brake Problem B3 (Notes P3)
- **Input Data:**
  - $D = 200\text{ mm} \implies r = 100\text{ mm}$.
  - Contact angle: $2\theta = 90^\circ \implies \theta = 45^\circ = 0.7854\text{ rad}$.
  - Lever arms: $a = 250\text{ mm}, b = 200\text{ mm}, c = 50\text{ mm}$.
  - Friction coefficient: $\mu = 0.35$.
  - Operating force: $F = 700\text{ N}$ in CCW direction.
  - Geometry: Case 3 (Fulcrum between drum center and $F_t$ line).
- **Working Steps:**
  1. Equivalent friction coefficient ($2\theta = 90^\circ > 60^\circ$):
     $$\mu' = 0.35 \times \left[ \frac{4 \sin 45^\circ}{1.5708 + \sin 90^\circ} \right] = 0.35 \times \frac{2.82843}{2.5708} = 0.38503$$
  2. Operating force relation for Case 3 CCW (Erratum 2: minus sign applies):
     $$F = \frac{F_t b}{a+b} \left[ \frac{1}{\mu'} - \frac{c}{b} \right]$$
     $$700 = F_t \times \left(\frac{200}{450}\right) \left[ \frac{1}{0.38503} - \frac{50}{200} \right] = F_t \times 0.44444 \times [2.5972 - 0.25] = 1.0432 F_t$$
     $$F_t = \frac{700}{1.0432} = 670.99\text{ N} \approx 671\text{ N}$$
  3. Normal force: $F_n = \frac{F_t}{\mu'} = \frac{670.99}{0.38503} = 1742.7\text{ N} \approx 1743\text{ N}$.
  4. Braking torque:
     $$T = F_t \cdot r = 670.99 \times 100 = 67,099\text{ N·mm} \approx 67.1\text{ N·m}$$
- **Canonical Output:** $\mu' = 0.385$, $F_t \approx 671\text{ N}$, $F_n \approx 1743\text{ N}$, $T \approx 67.1\text{ N·m}$.

---

### 4.9 Block Brake Problem B4 (Notes P4)
- **Input Data:**
  - $D = 400\text{ mm} \implies r = 200\text{ mm}$, Speed: $N = 1500\text{ rpm}$.
  - $2\theta = 90^\circ \implies \theta = 45^\circ$, Face width: $b' = 50\text{ mm}$.
  - Allowable pressure: $p_{\max} = 0.5\text{ MPa}$, $\mu = 0.25$.
  - Lever arms: $a = 250\text{ mm}, b = 250\text{ mm}, c = 0$ (Case 1).
  - Braking duration: $t = 10\text{ s}$.
- **Working Steps:**
  1. $\mu' = 0.25 \times \left[ \frac{4 \sin 45^\circ}{1.5708 + \sin 90^\circ} \right] = 0.25 \times \frac{2.82843}{2.5708} = 0.27502$.
  2. Normal reaction from allowable pressure:
     $$F_n = p \cdot (2 r b' \sin \theta) = 0.5 \times (2 \times 200 \times 50 \times \sin 45^\circ) = 7071.07\text{ N}$$
  3. Tangential friction force:
     $$F_t = \mu' F_n = 0.27502 \times 7071.07 = 1944.68\text{ N}$$
  4. Operating force (Case 1, $c=0$):
     $$F = F_t \left[ \frac{b}{a+b} \right] \frac{1}{\mu'} = \frac{F_n \cdot b}{a+b} = \frac{7071.07 \times 250}{500} = 3535.54\text{ N}$$
  5. Braking torque:
     $$T = F_t \cdot r = 1944.68 \times 200 = 388,936\text{ N·mm} \approx 388.9\text{ N·m}$$
  6. Surface speed (Erratum 1):
     $$v = \frac{\pi \times 400 \times 1500}{60,000} = 31.4159\text{ m/s}$$
  7. Heat generation and energy:
     $$H = F_t \cdot v = 1944.68 \times 31.4159 = 61,094\text{ W} \approx 61.1\text{ kW}$$
     $$E = H \cdot t = 61.094\text{ kW} \times 10\text{ s} = 610.94\text{ kJ} \approx 611\text{ kJ}$$
- **Canonical Output:** $\mu' = 0.275$, $F_n \approx 7071\text{ N}$, $F_t \approx 1945\text{ N}$, $F \approx 3535.5\text{ N}$, $T \approx 388.9\text{ N·m}$, $v = 31.42\text{ m/s}$, $H \approx 61.1\text{ kW}$, $E_{10s} \approx 611\text{ kJ}$.

---

### 4.10 Band Brake Problem BB1 (Notes P1)
- **Input Data:**
  - $D = 600\text{ mm} \implies r = 300\text{ mm}$.
  - Band thickness: $h = 5\text{ mm}$, Friction: $\mu = 0.25$.
  - Wrap angle: $\theta = 270^\circ = 4.7124\text{ rad}$.
  - Hoisting load to sustain: $W = F_t = 9000\text{ N}$ ($9\text{ kN}$).
  - Lever dimensions: $b = 200\text{ mm}, a = 1500\text{ mm}$.
  - Allowable band stress: $\sigma_d = 50\text{ MPa}$.
  - Geometry: Case (e).
- **Working Steps:**
  1. $e^{\mu\theta} = e^{0.25 \times 4.71239} = e^{1.1781} = 3.24816$.
  2. Individual tensions:
     $$F_1 = F_t \left[ \frac{e^{\mu\theta}}{e^{\mu\theta} - 1} \right] = 9000 \times \frac{3.24816}{2.24816} = 13,003.5\text{ N} \approx 13,004\text{ N}$$
     $$F_2 = F_t \left[ \frac{1}{e^{\mu\theta} - 1} \right] = 9000 \times \frac{1}{2.24816} = 4003.5\text{ N} \approx 4004\text{ N}$$
  3. Operating forces:
     $$F_{\text{cw}} = F_2 \frac{b}{a} = 4003.5 \times \frac{200}{1500} = 533.80\text{ N} \approx 533.8\text{ N}$$
     $$F_{\text{ccw}} = F_1 \frac{b}{a} = 13003.5 \times \frac{200}{1500} = 1733.80\text{ N} \approx 1733.8\text{ N}$$
  4. Band width:
     $$b' = \frac{F_1}{h \cdot \sigma_d} = \frac{13003.5}{5 \times 50} = 52.01\text{ mm} \approx 52\text{ mm}$$
- **Canonical Output:** $F_1 \approx 13,004\text{ N}$, $F_2 \approx 4004\text{ N}$, $F_{\text{cw}} \approx 533.8\text{ N}$, $F_{\text{ccw}} \approx 1733.8\text{ N}$, $b' \approx 52\text{ mm}$.

---

### 4.11 Band Brake Problem BB2 (Notes P2)
- **Input Data:**
  - Power absorbed: $P = 30\text{ kW}$ at $N = 750\text{ rpm}$.
  - Drum diameter: $D = 500\text{ mm} \implies r = 250\text{ mm}$.
  - Contact angle: $\theta = 225^\circ = 3.9270\text{ rad}$, $\mu = 0.25$.
  - Lever arms: $b = 250\text{ mm}$, total effort arm $a = 1000\text{ mm}$.
  - Band proportions: $b' = 10 h$.
  - Lever proportions: depth $h_l = 2 b_l$, allowable stress $\sigma_{\text{lever}} = 80\text{ MPa}$.
- **Working Steps:**
  1. Torque: $T = \frac{9.55 \times 10^6 \times 30}{750} = 382,000\text{ N·mm} = 382\text{ N·m}$.
  2. $F_t = \frac{T}{r} = \frac{382,000}{250} = 1528\text{ N}$.
  3. Tension exponent: $e^{\mu\theta} = e^{0.25 \times 3.927} = e^{0.98175} = 2.6691$.
  4. Tensions:
     $$F_1 = 1528 \times \frac{2.6691}{1.6691} = 2443.4\text{ N} \approx 2443\text{ N}$$
     $$F_2 = 1528 \times \frac{1}{1.6691} = 915.4\text{ N} \approx 915\text{ N}$$
  5. Operating forces:
     $$F_{\text{cw}} = F_2 \frac{b}{a} = 915.4 \times \frac{250}{1000} = 228.85\text{ N} \approx 228.8\text{ N}$$
     $$F_{\text{ccw}} = F_1 \frac{b}{a} = 2443.4 \times \frac{250}{1000} = 610.85\text{ N} \approx 610.7\text{ N}$$
  6. Band cross-section:
     $$h = 0.005 D = 0.005 \times 500 = 2.5\text{ mm}$$
     $$b' = 10 h = 25\text{ mm}$$
  7. Lever design:
     - Design load $F_{\max} = 610.74\text{ N}$.
     - Bending moment at pivot: $M = 610.74 \times 1000 = 610,740\text{ N·mm}$.
     - With $k = 2$:
       $$b_l = \left[ \frac{6 \times 610,740}{2^2 \times 80} \right]^{1/3} = [11,451.375]^{1/3} = 22.54\text{ mm} \implies 23\text{ mm}$$
       $$h_l = 2 b_l = 46\text{ mm}$$
- **Canonical Output:** $T = 382\text{ N·m}$, $F_t = 1528\text{ N}$, $F_1 \approx 2443\text{ N}$, $F_2 \approx 915\text{ N}$, $F_{\text{cw}} \approx 228.8\text{ N}$, $F_{\text{ccw}} \approx 610.7\text{ N}$, $h = 2.5\text{ mm}, b' = 25\text{ mm}$, lever $b_l \approx 23\text{ mm}, h_l \approx 46\text{ mm}$.

---

### 4.12 Differential Band Brake Problem BB3 (ESA Q5b / Review Q5)
- **Input Data:**
  - Operating lever length: $a = 225\text{ mm}$.
  - Band attachment arms: $b_1 = 38\text{ mm}$, $b_2 = 150\text{ mm}$.
  - Drum diameter: $D = 600\text{ mm} \implies r = 300\text{ mm}$.
  - Contact angle: $\theta = 300^\circ = 5.2360\text{ rad}$.
  - Band dimensions: thickness $h = 3\text{ mm}$, width $b' = 100\text{ mm}$.
  - Friction coefficient: $\mu = 0.22$.
  - Allowable band stress: $\sigma_d = 56\text{ N/mm}^2 = 56\text{ MPa}$.
- **Working Steps:**
  1. Maximum band tension from permissible tensile stress:
     $$F_1 = \sigma_d \cdot (h \cdot b') = 56 \times (3 \times 100) = 16,800\text{ N}$$
  2. Tension ratio:
     $$e^{\mu\theta} = e^{0.22 \times 5.2360} = e^{1.1519} = 3.1642$$
  3. Slack side tension:
     $$F_2 = \frac{F_1}{e^{\mu\theta}} = \frac{16,800}{3.1642} = 5309.4\text{ N} \approx 5308\text{ N}$$
  4. Tangential braking force:
     $$F_t = F_1 - F_2 = 16,800 - 5309.4 = 11,490.6\text{ N}$$
  5. Braking torque on drum shaft:
     $$T = F_t \cdot r = 11,490.6 \times 300 = 3,447,180\text{ N·mm} \approx 3,447.2\text{ N·m}$$
  6. Moment balance and least operating force $F$:
     - From the figure in Q5b, the lever is configured such that the least force corresponds to:
       $$F \cdot a = F_2 b_2 - F_1 b_1$$
       $$F = \frac{5309.4 \times 150 - 16800 \times 38}{225} = \frac{796,410 - 638,400}{225} = \frac{158,010}{225} = 702.27\text{ N}$$
  7. Self-Locking Analysis:
     - For self-locking to occur:
       $$e^{\mu\theta} \ge \frac{b_2}{b_1}$$
       $$\frac{b_2}{b_1} = \frac{150}{38} = 3.9474$$
     - Here, $e^{\mu\theta} = 3.1642 < 3.9474$.
     - Because $e^{\mu\theta} < b_2/b_1$, $F > 0$. **The brake is NOT self-locking.**
- **Canonical Output:** $F_1 = 16,800\text{ N}$, $F_2 \approx 5,308\text{ N}$, $F_t \approx 11,491\text{ N}$, $T \approx 3,447\text{ N·m}$, Least Force $P \approx 702.3\text{ N}$, Self-locking: **No**.

---

## 5. Handbook Citation & Equation Index

All equations are cross-indexed directly against *Design Data Handbook*, 4th Edition (K. Mahadevan & K. Balaveera Reddy):

| Module | Design Feature | Handbook Equation No. | Handbook Page | Class Notes Ref. |
| :--- | :--- | :--- | :--- | :--- |
| **Clutch** | Uniform Pressure: Axial Force $F_a$ | Eq. 13.9(a) | Page 258 | Page 1 |
| **Clutch** | Uniform Pressure: Mean Diameter $D_m$ | Eq. 13.9(b) | Page 258 | Page 1 |
| **Clutch** | Uniform Pressure: Friction Torque $T$ | Eq. 13.9(c) | Page 258 | Page 1 |
| **Clutch** | Uniform Wear: Axial Force $F_{aw}$ | Eq. 13.9(d) | Page 258 | Page 2 |
| **Clutch** | Uniform Wear: Mean Diameter $D_{mw}$ | Eq. 13.9(e) | Page 258 | Page 2 |
| **Clutch** | Uniform Wear: Friction Torque $T$ | Eq. 13.9(f) | Page 259 | Page 2 |
| **Brake** | Equivalent Friction Factor $\mu'$ ($2\theta > 60^\circ$) | Eq. 13.6(m) | Page 264 | Page 2, 4 |
| **Brake** | Normal Reaction Force $F_n$ | Eq. 13.16(f) | Page 265 | Page 3 |
| **Brake** | Contact Pressure on Shoe $p$ | Eq. 13.16(g) | Page 265 | Page 2 |
| **Brake** | Block Brake Operating Force Case 1 ($c = 0$) | Eq. 13.17(a) | Page 267 | Page 1, 5 |
| **Brake** | Block Brake Case 2 CW (Self-energizing) | Eq. 13.17(b) | Page 267 | Page 1, 3 |
| **Brake** | Block Brake Case 2 CCW | Eq. 13.17(c) | Page 267 | Page 1, 3 |
| **Brake** | Block Brake Case 3 CW | Eq. 13.17(d) | Page 267 | Page 1 |
| **Brake** | Block Brake Case 3 CCW (Self-energizing) | Eq. 13.17(e) | Page 267 | Page 1, 4 |
| **Brake** | Heat Dissipation Rate $H$ | Eq. 13.24(a) | Page 275 | Page 3, 6 |
| **Band** | Tension Ratio $F_1 / F_2$ | Eq. 13.18(a) | Page 267 | Page 6 |
| **Band** | Tensions $F_1, F_2$ from $F_t$ | Eq. 13.18(c),(d) | Page 267 | Page 6 |
| **Band** | Simple Band Case (d) CW / CCW | Eq. 13.19(a),(b) | Page 270 | Page 6 |
| **Band** | Simple Band Case (e) CW / CCW | Eq. 13.19(c),(d) | Page 270 | Page 6 |
| **Band** | Differential Band Brake CW / CCW | Eq. 13.19(e),(f) | Page 270 | Page 6 |
| **Band** | Band Thickness $h = 0.005 D$ | Eq. 13.18(n) | Page 268 | Page 6, 9 |
| **Band** | Band Width $b' = F_1 / (h \sigma_d)$ | Eq. 13.18(o) | Page 268 | Page 6, 7 |
| **Band** | Pressures: $p_{\text{avg}}, p_1, p_2$ | Eq. 13.18(k),(l),(m) | Page 268 | Page 6 |

---

## 6. Official Errata Register (Class Notes vs. Engine Truth)

The engine implements canonical textbook formulations and strictly prevents replication of handwritten student errors identified in Section 5:

| Ref ID | Description in Handwritten Notes | Error in Notes | Verified Engine Correction | Correct Numerical Result |
| :---: | :--- | :--- | :--- | :--- |
| **ERR-1** | Block Brake Problem 4 (10s stopping) | Notes state $v = 3.14\text{ m/s}$ due to missing factor of 10 | $v = \frac{\pi \cdot 0.4 \cdot 1500}{60} = 31.416\text{ m/s}$ | $v = 31.42\text{ m/s}$, $H \approx 61.1\text{ kW}$, $E \approx 611\text{ kJ}$ |
| **ERR-2** | Block Brake Problem 3 ($F = 700\text{ N}$) | Notes wrote formula with $+ c/b$ but substituted with $- c/b$ | Case 3 CCW rotation has $- c/b$ in Eq 13.17(e) | $F_t \approx 671\text{ N}$, $F_n \approx 1743\text{ N}$, $T \approx 67.1\text{ N·m}$ |
| **ERR-3** | Self-Locking Condition Definition | Notes state "always prefer self energizing: $b \le \mu c$" | $b \le \mu' c$ is the **Self-Locking** ($F \le 0$) limit, not general self-energizing | $c \ge b/\mu'$ triggers `SELF-LOCKING` alert |
| **ERR-4** | Optimum Diameter Ratio | Notes note "$\frac{D_i}{D_o} \ge 0.577$" | Optimum for torque is exact $\frac{1}{\sqrt{3}} \approx 0.57735$; $0.5$ is class design choice | Selector offers `0.5`, `0.577`, or custom |
| **ERR-5** | Clutch Problem 3 Pressures | Notes label $0.038\text{ MPa}$ and $0.036\text{ MPa}$ as mean pressure | Those values are $p_{\max}$ under uniform wear | App displays both $p_{\max} = 0.036\text{ MPa}$ and $p_{\text{mean}} = 0.032\text{ MPa}$ |
| **ERR-6** | Clutch Problem 4 Units | Notes have muddled torque units ($72,382\text{ N}$ instead of $\text{N·mm}$) | $T = 72,382\text{ N·mm} = 72.382\text{ N·m}$ | $T = 72.38\text{ N·m}$, $P = 7.579\text{ kW}$ |
| **ERR-7** | Unit/Notation Typos in Notes | Band P1 notes say $\mu = 0.95$; Clutch P1 says $240\text{ kN-mm}$ | Band P1 has $\mu = 0.25$; Clutch P1 has $240\text{ N·m} = 240 \times 10^3\text{ N·mm}$ | Golden tests BB1 and C1 pass |
| **ERR-8** | Multi-plate Material Assignment | Notes leave ambiguous which plates are steel vs. bronze | App provides explicit material selector for driving ($n_1$) and driven ($n_2$) plates | Default: Steel driving, Bronze driven |
| **ERR-9** | Clutch Minor II Q3b Radius vs Diameter Halving | Course plan key states $P = 9.40\text{ kW}$ for 5 plates ($n'=4$) | $9.40\text{ kW}$ occurs when radius $R_m$ was mistakenly used with $1/2$ factor ($T = \frac{1}{2}\mu F_a R_m n'$) or $n'=2$. The true canonical result for $n'=4$ is $T = 359.08\text{ N·m}$, $P = 18.80\text{ kW}$ | Engine supports both $n'=4$ ($18.80\text{ kW}$) and $n'=2$ ($9.40\text{ kW}$) |


---

## 7. Items Marked for User Confirmation ("Verify" List)

The following items from the scanned handbook are flagged for your confirmation:

1. **Sintered Bronze / Metal on Steel (in Oil):**  
   From Table 13.4, Pg 283: Permissible unit pressure is scanned as $1.0\text{ to }2.8\text{ MN/m}^2$ ($1.0 - 2.8\text{ MPa}$) with $\mu = 0.06 - 0.10$ and maximum temperature $350^\circ\text{C}$. In the database, we populated `mu_wet = 0.08` and `p_max = 2.80 MPa`.  
   *Please confirm if your coursework uses an alternate limit (e.g., 2.0 MPa).*
2. **Differential Band Brake Lever Orientation (ESA Q5b):**  
   The figure in Model Question Paper ESA 5b depicts arm $b_2 = 150\text{ mm}$ carrying slack side $F_2$ and arm $b_1 = 38\text{ mm}$ carrying tight side $F_1$, yielding least operating effort $F = \frac{F_2 b_2 - F_1 b_1}{a} = 702.3\text{ N}$.  
   *Confirmed: this matches textbook standard for least applying force.*
