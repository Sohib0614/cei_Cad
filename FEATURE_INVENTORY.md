# Complete Feature Inventory & Functional Specifications
**Application:** CEI Estimation LLC — CAD & Blueprint Takeoff Platform  
**Target Reference:** ScopeCAD (CADScope) Enterprise Suite  
**Clean-Room Status:** 100% Original Implementation  

---

## 1. Project Management & Dashboard Features

| Feature ID | Feature Name | Description | Status / Target |
|---|---|---|---|
| `PM-01` | **Project Dashboard** | Real-time overview of active, completed, queued, and inspected takeoff projects. Status pills (`New`, `Ordered`, `Inspected`, `Completed`, `Failed`). | Core |
| `PM-02` | **New Project Wizard** | Modal/dialog collecting Project Name, Claim Number, Job Number, Site Address, Date of Loss, Due Date, Primary Pitch, Trade/Product Type, and Notes. | Core |
| `PM-03` | **Multi-Structure Support** | Allows segmenting projects into Main Building, Garage, Shed, Detached Structures, and Sub-Buildings with individual summaries. | Core |
| `PM-04` | **Local & Cloud Persistence** | Dual-tier storage supporting indexed local caching (IndexedDB/LocalStorage) and PostgreSQL/Supabase private cloud synchronization. | Core |
| `PM-05` | **Auto-Save & Versioning** | Configurable auto-save interval with rollback history and revision tracking (`Revision`, `MasterRevisionRef`). | Core |
| `PM-06` | **Audit Time Tracker** | Embedded QC (Quality Control) and Technician active drafting timers (`qc_time`, `tech_time`). | Core |

---

## 2. Drawing Ingestion & Visual Workspace

| Feature ID | Feature Name | Description | Status / Target |
|---|---|---|---|
| `DW-01` | **PDF Vector Blueprint Ingestion** | High-fidelity rendering of multi-page architectural plan sets, blueprints, and aerial surveys via PDF.js. | Core |
| `DW-02` | **CAD File Support (DXF/DWG)** | Parsing and rendering of standard CAD exchange formats (DXF/DWG vector layers) directly onto the canvas. | Core |
| `DW-03` | **Raster Image Acquisition** | Upload and scaling for high-res PNG, JPG, WebP, and aerial satellite orthophotos. | Core |
| `DW-04` | **Multi-View Acquisition** | Support for Elevation views: North, South, East, West alongside Overhead/Site view. | Core |
| `DW-05` | **High-Performance Canvas** | 60fps pan, smooth zoom (mouse wheel / touchpad / buttons), zoom-to-extents, zoom-to-rectangle, and layer toggling. | Core |
| `DW-06` | **Scale Calibration Engine** | 2-point ground distance calibration with dimension input (e.g. `24 ft 6 in` or `1:100`), visual dimension line, and calibration verification window. | Core |
| `DW-07` | **Orientation & North Arrow** | Interactive compass rose allowing rotation of the canvas and setting true site north (`WhichNorth`). | Core |

---

## 3. Vector Digitization & CAD Takeoff Tools

| Feature ID | Feature Name | Description | Status / Target |
|---|---|---|---|
| `TK-01` | **Polygon Boundary Tool** | Precision point-and-click polygon drawing with snap-to-vertex, snap-to-angle (orthogonal 90°/45°), and automatic closing. | Core |
| `TK-02` | **Polygon Split & Cut Tool** | Split existing areas across ridges, hips, or material transitions into distinct sub-planes. | Core |
| `TK-03` | **Linear Edge Classifier** | Interactive edge attribution with color-coded classification: Eave, Ridge, Hip, Valley, Rake, Flashing, Step Flashing, Parapet, Coping, Gutter, Downspout. | Core |
| `TK-04` | **Pitch / Slope Assignment** | Interactive pitch assigner (Flat `0/12` to `2/12`, Low `3/12` to `5/12`, Standard `6/12` to `8/12`, Steep `9/12` to `11/12`, High `12/12+`). Dynamic slope factor calculations. | Core |
| `TK-05` | **Linear Distance Tool** | Direct point-to-point measurement of linear items with real-time dimension annotations. | Core |
| `TK-06` | **Area Measurement Tool** | Instant polygon square footage calculation displaying 2D footprint vs True Pitch Surface Area. | Core |
| `TK-07` | **Count / Item Punch Tool** | Single-click marker placement for counting items: Vents, Pipe Boots, Downspout Drops, Endcaps, Corners, Outlets, Light fixtures. | Core |
| `TK-08` | **Text & Callout Annotation** | Multi-line text boxes, leader arrows, and markup tags for drafting notes. | Core |
| `TK-09` | **Layer Visibility & Soloing** | Toggle visibility and locking of Background Plan, Dimensions, Pitch Badges, Edge Colors, and Punch Counts. | Core |

---

## 4. Trade-Specific Engines

### 4.1. Roofing Module
- Calculates 2D Footprint SF, Pitch Multiplier, True Surface SF, Roofing Squares ($1 \text{ SQ} = 100 \text{ SF}$).
- Classifies: Eave LF, Ridge LF, Hip LF, Valley LF, Rake LF, Step Flashing LF, Headwall Flashing LF, Parapet LF, Coping LF, Flat Drip Edge LF.
- Generates 4% to 15% sliding Waste Factor Table.

### 4.2. Siding & Exterior Wall Module
- 4-Side Elevation Management (North, South, East, West).
- Wall gross surface area calculation.
- Window, Door, and Garage Door cutout subtractions.
- Material assignment: Horizontal Lap, Vertical Lap, Cedar Shake, Brick, Stucco, Stone.
- Trim takeoff: Corner Posts (Inside/Outside), Starter Strip, Fascia/Soffit, Frieze Board, Window & Door Wraps.

### 4.3. Gutter & Downspout Module
- Eave Gutter LF aggregation.
- Downspout drop points, vertical height calculation.
- Automated accessories count: A/B Elbows, Miters/Corners (Inside & Outside), Left/Right Endcaps, Downspout Straps.

### 4.4. Concrete Module
- Slab & Footing surface area (SF) and perimeter formwork (LF).
- Automated Cubic Yard (CY) calculations at 2", 4", and 6" nominal thickness.

### 4.5. Insulation Module
- Area coverage (SF) partitioned by thermal performance requirements.
- R-Value breakdowns: R-19, R-25, R-30, R-38, R-44, R-49, R-60.

### 4.6. Paint & PaintPro Module
- Siding paintable area SF.
- Trim LF and door/window counts.
- Coat multipliers (1-coat, 2-coat, primer + finish) and gallon estimates ($350-400 \text{ SF/gal}$).

---

## 5. Fail-Safe Validation Engine

| Validator ID | Validator Name | Purpose & Enforcement |
|---|---|---|
| `FS-01` | **Missing Polygons Fail-Safe** | Detects open unclosed boundary loops or unassigned roof planes. Blocks invalid report generation with warning modal. |
| `FS-02` | **Negative Value Fail-Safe** | Detects self-intersecting polygons or negative area subtraction anomalies. |
| `FS-03` | **Zero-Slope Warning** | Detects drainage edges (valleys, eaves, rakes) marked with impossible $0/12$ slopes. |
| `FS-04` | **Plan Height Fail-Safe** | Validates elevation wall heights against building story heights. |
| `FS-05` | **Unread Notes Alert** | Requires estimator to acknowledge job-specific adjuster notes prior to final inspection approval. |

---

## 6. Reporting, Exporting & Deliverables

| Report ID | Report Name | Description |
|---|---|---|
| `RP-01` | **Official CEI Multi-Page PDF Report** | Executive Cover Sheet with CEI Orange branding, Summary of Areas/Squares, Waste Factor Table, Detailed Line Item Breakdown, Sub-Structure Breakdown, and Full High-Res Blueprint Markup Page. |
| `RP-02` | **Xactimate / Symbility CSV Export** | Standardized line item codes (RFG, SID, GTR, CONC, INS) for direct import into insurance estimation software. |
| `RP-03` | **High-Res Blueprint Image Export** | Annotated PDF or PNG blueprint sheet with color-coded edge legend, scale indicator, and compass rose. |
| `RP-04` | **Raw JSON Project Export/Import** | Full project exchange format enabling seamless backup, transfer, and offline loading. |

