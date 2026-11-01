# Technical Architecture & Systems Engineering
**Application:** CEI Estimation LLC — High-Performance CAD Takeoff Suite  
**Version:** 3.0.0 (Clean-Room Modernization)  
**Classification:** Professional Cloud & Desktop-Ready Web Application  

---

## 1. Architectural Principles & Technology Stack

The reference application was an outdated Windows-only .NET 4.5.2 / DevExpress WPF desktop program. CEI Estimation LLC reimagines this functionality into a responsive, high-performance, modern application running seamlessly in modern web browsers and desktop environments:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        CEI ESTIMATION LLC CLIENT                       │
│                                                                        │
│   ┌───────────────────┐ ┌────────────────────┐ ┌───────────────────┐   │
│   │   Executive UI    │ │  CAD / Takeoff     │ │  Fail-Safe Engine │   │
│   │   & Dashboards    │ │  Vector Canvas     │ │  & Math Core      │   │
│   │ (Next.js / React) │ │ (Canvas2D / WebGL) │ │ (TypeScript Math) │   │
│   └─────────┬─────────┘ └─────────┬──────────┘ └─────────┬─────────┘   │
│             │                     │                      │             │
│   ┌─────────▼─────────────────────▼──────────────────────▼─────────┐   │
│   │                Unified State & Geometry Store                  │   │
│   │            (Zustand / Reactive Undo-Redo Stack)                │   │
│   └───────────────────────────────┬────────────────────────────────┘   │
└───────────────────────────────────┼────────────────────────────────────┘
                                    │ HTTP / REST / Realtime
┌───────────────────────────────────▼────────────────────────────────────┐
│                    BACKEND & DATA INTEGRATION TIER                     │
│                                                                        │
│   ┌─────────────────────┐ ┌────────────────────┐ ┌─────────────────┐   │
│   │   Next.js API &     │ │ Supabase Postgres  │ │ Private Object  │   │
│   │   Report Engine     │ │ & Row Level Auth   │ │ Storage (Plans) │   │
│   └─────────────────────┘ └────────────────────┘ └─────────────────┘   │
└────────────────────────────────────────────────────────────────────────┘
```

### Technology Matrix:
- **Frontend Framework:** Next.js 14/15, React 18/19, TypeScript (Strict Mode).
- **Styling & UI Kit:** Tailwind CSS, shadcn/ui component primitives, Lucide Icons.
- **Brand Tokens:** CEI Orange (`#DD8427`, `#C7731E`), Dark Technical Workspace (`#0A1128`, `#111827`, `#212529`), High-contrast technical typography (`Rajdhani`, `Roboto`).
- **CAD & Canvas Engine:** Dual-layer rendering architecture:
  - *Layer 1 (Background):* High-resolution PDF.js vector blueprint rasterization / DXF vector paths.
  - *Layer 2 (Interactive Geometry):* High-DPI HTML5 Canvas with hardware-accelerated pan, zoom, vertex snapping, polygon triangulation, and edge drawing.
- **State Management:** Reactive Store with full Undo/Redo stack (Command pattern matching Caliburn.Micro).
- **Mathematical Calculation Engine:** Deterministic TypeScript geometry library implementing Shoelace formula, Cohen-Sutherland line clipping, point-in-polygon ray casting, and 3D slope multiplier transformations.
- **Reporting & Export Engine:** Client-side vector PDF generation (`jspdf`, `jspdf-autotable`, HTML-to-Canvas high-res rendering) + CSV export for Xactimate/Symbility.
- **Database & Storage:** PostgreSQL / Supabase with Row Level Security (RLS) and encrypted cloud storage for plan PDFs and DWG/DXF drawings.

---

## 2. Canvas Geometry & Coordinate System Engine

### 2.1. Coordinate Transformations
The workspace maintains two coordinate systems:
1. **Screen Coordinates ($x_s, y_s$):** Mouse / pointer coordinates in viewport pixels.
2. **World Coordinates ($x_w, y_w$):** Plan coordinates in calibrated architectural feet or inches.

The transformation is parameterized by zoom scale $S$ and pan offset $(T_x, T_y)$:
$$\begin{pmatrix} x_s \\ y_s \\ 1 \end{pmatrix} = \begin{pmatrix} S & 0 & T_x \\ 0 & S & T_y \\ 0 & 0 & 1 \end{pmatrix} \begin{pmatrix} x_w \cdot \text{scaleFactor} \\ y_w \cdot \text{scaleFactor} \\ 1 \end{pmatrix}$$

Inverse transform for snapping and user clicks:
$$x_w = \frac{x_s - T_x}{S \cdot \text{scaleFactor}}, \quad y_w = \frac{y_s - T_y}{S \cdot \text{scaleFactor}}$$

### 2.2. Scale Calibration Engine
When the user clicks two points $P_1(x_1, y_1)$ and $P_2(x_2, y_2)$ on a known dimension $D_{\text{feet}}$:
$$\text{Pixel Distance } L_{\text{px}} = \sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}$$
$$\text{Pixels-per-Foot (PPF)} = \frac{L_{\text{px}}}{D_{\text{feet}}}$$

Every measured pixel on canvas is converted to real-world feet:
$$\text{Length}_{\text{ft}} = \frac{\text{Distance}_{\text{px}}}{\text{PPF}}$$

---

## 3. Polygon & Area Computation Engine

### 3.1. Projected 2D Area (Shoelace Formula)
For an $n$-vertex closed polygon with coordinates $(x_0, y_0), \dots, (x_{n-1}, y_{n-1})$ in real-world feet:
$$A_{2D} = \frac{1}{2} \left| \sum_{i=0}^{n-1} (x_i y_{i+1} - x_{i+1} y_i) \right| \quad (\text{with } x_n = x_0, y_n = y_0)$$

### 3.2. Pitch Slope Adjustment
For roof pitch $P$ (e.g. 6 in 6/12):
$$\text{Slope Factor } F = \sqrt{1 + \left(\frac{P}{12}\right)^2}$$
$$\text{True Surface Area } A_{\text{true}} = A_{2D} \times F$$
$$\text{Roofing Squares } = \frac{A_{\text{true}}}{100}$$

### 3.3. Hip and Valley Length Multiplier
For rafter slope pitch $P$:
$$\text{Hip/Valley Factor } F_{HV} = \sqrt{2 + \left(\frac{P}{12}\right)^2}$$

---

## 4. Database Schema & Data Models

### 4.1. Projects Table (`cei_projects`)
```sql
CREATE TABLE cei_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    claim_number VARCHAR(100),
    job_number VARCHAR(100),
    site_address TEXT,
    date_of_loss DATE,
    due_date DATE,
    product_type VARCHAR(50) NOT NULL, -- 'Roofing', 'RoofScopeX', 'Siding', 'Gutter', 'Concrete', 'Insulation', 'Paint'
    status VARCHAR(50) DEFAULT 'New', -- 'New', 'In_Progress', 'Inspected', 'Completed'
    primary_pitch VARCHAR(20) DEFAULT '6/12',
    notes TEXT,
    scale_calibration JSONB, -- { ppf: number, knownLengthFt: number, p1: [x,y], p2: [x,y] }
    plan_file_url TEXT,
    plan_file_name TEXT,
    total_area_sqft NUMERIC(12, 2) DEFAULT 0,
    total_squares NUMERIC(10, 2) DEFAULT 0,
    qc_time_seconds INTEGER DEFAULT 0,
    tech_time_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.2. Takeoff Structures & Facets Table (`cei_takeoff_facets`)
```sql
CREATE TABLE cei_takeoff_facets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES cei_projects(id) ON DELETE CASCADE,
    structure_name VARCHAR(100) DEFAULT 'Main Building', -- 'Main Building', 'Garage', etc.
    plane_name VARCHAR(100) NOT NULL,
    pitch VARCHAR(20) DEFAULT '6/12',
    footprint_area_sqft NUMERIC(12, 2) NOT NULL,
    true_area_sqft NUMERIC(12, 2) NOT NULL,
    squares NUMERIC(10, 2) NOT NULL,
    vertices JSONB NOT NULL, -- [[x1, y1], [x2, y2], ...]
    is_high_roof BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.3. Takeoff Classified Edges Table (`cei_takeoff_edges`)
```sql
CREATE TABLE cei_takeoff_edges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES cei_projects(id) ON DELETE CASCADE,
    edge_type VARCHAR(50) NOT NULL, -- 'Eave', 'Ridge', 'Hip', 'Valley', 'Rake', 'StepFlashing', 'HeadwallFlashing', 'Parapet', 'Coping'
    length_ft NUMERIC(10, 2) NOT NULL,
    start_point JSONB NOT NULL, -- [x, y]
    end_point JSONB NOT NULL,   -- [x, y]
    slope VARCHAR(20),
    structure_name VARCHAR(100) DEFAULT 'Main Building',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4.4. Punch Items / Accessories Table (`cei_punch_items`)
```sql
CREATE TABLE cei_punch_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES cei_projects(id) ON DELETE CASCADE,
    item_type VARCHAR(50) NOT NULL, -- 'PipeBoot', 'BoxVent', 'RidgeVentLF', 'ChimneyFlash', 'DownspoutDrop', 'Endcap', 'InsideCorner', 'OutsideCorner'
    position JSONB NOT NULL, -- [x, y]
    quantity INTEGER DEFAULT 1,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 5. Security & Multi-Tenant Isolation
- **Row-Level Security (RLS):** All project records are tenant-isolated and strictly scoped to authenticated user IDs or authorized team accounts.
- **Asset Privacy:** Uploaded blueprints, PDFs, and CAD drawings reside in encrypted private storage buckets accessible via signed temporary URLs.
- **Zero Client-Side Secret Leakage:** Authentication and API keys are stored in server-side environment variables with validation.

