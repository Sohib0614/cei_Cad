# CEI Estimation LLC — Next-Gen Precision CAD Takeoff & Estimating Suite

![CEI Estimation LLC Logo](/branding/logo_horizontal.png)

A high-performance, clean-room CAD blueprint takeoff and architectural estimation web & desktop application engineered for **CEI Estimation LLC**, replicating and modernizing the core workflows of ScopeCAD (v2.5.7.2).

---

## 🏗️ Supported Construction Trades

1. **Roofing Takeoff (`Roofing`)**: True surface area calculation using pitch multipliers ($\sqrt{1 + (P/12)^2}$), squares conversion ($1 \text{ SQ} = 100 \text{ SF}$), sliding waste matrices (4% to 15%), and edge classification (Eaves, Ridges, Hips, Valleys, Rakes, Step/Headwall Flashings, Parapets, Copings).
2. **Accelerated Aerial & CAD Takeoff (`RoofScopeX`)**: Rapid facet area and slope split assignments with percentage breakdown.
3. **Siding & Exterior Wall Cladding (`Siding`)**: 4-side elevation management (North, South, East, West), lap siding, shake, brick, stone, openings subtractions, and corner trim.
4. **Gutter & Downspout Takeoff (`Gutter`)**: Linear feet of gutter, vertical downspouts, elbows, endcaps, and corner miters.
5. **Integrated Roof & Gutter Takeoff (`RoofingGutter`)**: Combined dual-trade takeoff with unified schedules.
6. **Concrete & Flatwork Takeoff (`Concrete`)**: Slab footprint (SF), formwork perimeter (LF), and automated Cubic Yards (CY) calculated for 2", 4", and 6" nominal thickness.
7. **Thermal Insulation Takeoff (`Insulation`)**: Building envelope area tiering across standard R-Values (R-19 through R-60).
8. **Exterior & Interior Painting (`Paint` / `PaintPro`)**: Wall surface area, trim linear footage, coat coverage multipliers, and gallon requirements.

---

## 🚀 Key Features & Capabilities

- **Interactive Vector Canvas**: 60fps pan and smooth mouse-wheel zoom with architectural grid, scale ruler, crosshairs, and live coordinate feedback.
- **Dual Snapping Engine**: Magnetic vertex snapping (snaps to existing points to close polygons) and orthogonal snapping (locks to 0°, 45°, 90°, 135°, 180°).
- **Scale Calibration Engine**: Interactive 2-point ground distance calibration converting screen pixels directly into real-world feet (`PPF`), supporting standard architectural ratios (`1/8" = 1'`, `1/4" = 1'`, `1" = 10'`, `1" = 20'`).
- **Fail-Safe Geometric Audit**: Automated verification engine detecting unclosed boundary loops, negative/self-intersecting area anomalies, and zero-slope drainage errors before report export.
- **Official CEI Multi-Page PDF Deliverables**: Generates multi-page branded PDF reports:
  - **Page 1**: Executive Cover Sheet, Key Metrics, and 4%–15% Waste Factor Matrix (10% highlighted).
  - **Page 2**: Detailed Line Item Breakdown (Linear Feet of all edge types, Facet-by-Facet Schedule).
  - **Page 3**: High-Resolution Annotated Blueprint Drawing Sheet with Color Legend and Compass Rose.
- **Insurance Estimation Integration**: One-click CSV export compatible with Xactimate and Symbility.
- **Audit Stopwatch Timers**: Real-time Technician and Quality Control (QC) drafting stopwatches.

---

## 💻 Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript (Strict).
- **Styling**: Tailwind CSS with CEI Design System Tokens (CEI Orange `#DD8427`, Dark Slate `#0A1128`).
- **Icons**: Lucide React.
- **Geometry & Math Core**: Custom deterministic TypeScript geometry engine (Shoelace formula, slope multipliers, Ray-Casting point-in-polygon).
- **Reporting Engine**: `jspdf` & `jspdf-autotable`.
- **Database & Storage**: PostgreSQL schema with Supabase Row Level Security (RLS) support (`schema.sql`).
- **Testing**: Vitest & Playwright E2E browser automation.

---

## 🛠️ Quick Start & Local Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build for Production
```bash
npm run build
npm start
```

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `B` | Activate Polygon Boundary Tool |
| `S` | Activate Split Plane Tool |
| `M` | Activate Tape Measure Tool |
| `C` | Activate Punch / Count Marker Tool |
| `R` | Classify Edge as Ridge |
| `V` | Classify Edge as Valley |
| `E` | Classify Edge as Eave |
| `H` | Classify Edge as Hip |
| `Ctrl + Z` | Undo last geometry change |
| `Ctrl + Y` | Redo geometry change |
| `Ctrl + S` | Save project |
| `Space + Drag` | Pan canvas |
| `Escape` | Reset to Select Mode |

---

## 📄 License & Attribution
Clean-room software implementation authored exclusively for **CEI Estimation LLC**. All rights reserved.

