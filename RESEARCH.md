# ScopeCAD Comprehensive Reverse-Engineering Research & Architectural Discovery
**Target:** ScopeCAD v2.5.7.2 (Scope Technologies / RoofScope / CADScope)  
**Replication Target:** CEI Estimation LLC — Next-Gen Web/Desktop CAD Takeoff & Estimating Suite  
**Date:** November 2026  
**Document Author:** Lead Software Architect & Reverse-Engineering Team  

---

## 1. Executive Summary & Provenance

During Phase 1 discovery, reverse-engineering was performed directly on the binary package `ScopeCADUpdater-06-10-2026.msi` provided in the workspace. The installer unpacks `ScopeCAD.exe` (v2.5.7.2), an enterprise Windows desktop application authored by Scope Technologies (operating endpoints at `tracescope.roofscope.com`).

Our binary reflection, assembly metadata inspection, and embedded BAML/resource deconstruction revealed that ScopeCAD is a specialized CAD blueprint digitizer and construction takeoff platform. It provides precision vector drafting, scale calibration, polygon segmentation, slope/pitch area adjustments, edge classification (eaves, ridges, hips, valleys, rakes, flashings), and multi-trade material & waste takeoff calculations.

### Core Architecture of the Reference Application:
- **Framework & UI Engine:** .NET Framework 4.5.2, WPF (Windows Presentation Foundation) with DevExpress v21.2 Ribbon Controls, Grid, LayoutControls, and Docking.
- **MVVM Pattern:** Caliburn.Micro v1.5.2.0 event aggregation and screen lifecycle management.
- **CAD & Vector Subsystem:** Wout Ware `WW.Cad.dll` (DWG/DXF parsing and entity rendering) combined with native WPF Canvas/Geometry drawing (`CADScope.GeometryView`).
- **Data & Serialization:** Newtonsoft.Json, CsvHelper, XML user settings, and TraceScope REST API integration (`CADScope.Database.TraceScopeReportAPIHelper`).
- **Reporting:** DevExpress XtraReports & PdfCore with multi-page export (Cover page, Line Item Breakdown, Waste Tables, Drawing Sheet with compass and legend).

---

## 2. Product Trades & Domain Classification

ScopeCAD is partitioned into 8 primary construction trade takeoff product modules:

| Product Type Enum | Domain Name | Core Focus & Specific Metrics |
|---|---|---|
| `Roofing` | Roofing Takeoff | Pitch/slope multipliers, Squares (SQ), Eaves, Ridges, Hips, Valleys, Rakes, Step/Headwall Flashing, Parapets, Coping, Drip Edges. |
| `RoofScopeX` | Accelerated Aerial/CAD Roof Takeoff | Rapid polygon split/slope assignment, percentage breakdowns per pitch, simplified high-velocity estimation. |
| `Gutter` | Gutter & Downspout Takeoff | Gutter linear feet (LF), Downspout LF, Endcaps, Inside/Outside Corners, Elbows, Soffit depths. |
| `RoofingGutter` | Combined Roof & Gutter Takeoff | Integrated dual-trade takeoff with unified waste tables and structural summaries. |
| `Siding` | Exterior Cladding & Siding | Elevation views (North, South, East, West), Wall SF, Deductions (doors/windows), Materials (Lap, Shake, Brick, Stucco, Stone), Trim/Starter strips. |
| `Paint` / `PaintPro` | Exterior & Interior Paint Takeoff | Surface SF, Trim LF (fascia, window/door wraps, corner trim), Exterior elevation side editor, Deductions, Primer/Coat calculations. |
| `Concrete` | Flatwork & Foundation Takeoff | Slab area (SF), Perimeter formwork (LF), Cubic Yards (CY) calculated automatically at 2", 4", and 6" slab thickness. |
| `Insulation` | Thermal Insulation Takeoff | Area (SF), R-Value tiering (R-19, R-25, R-30, R-38, R-44, R-49, R-60) for attics, crawlspaces, and exterior assemblies. |

---

## 3. Reference Workflow Pipeline

The reference application enforces a strict, validated takeoff workflow:

```
[1. Project Creation / Ingestion]
   ├── Claim #, Job #, Address, Date of Loss, Due Date, Product Trade
   └── Import CAD (DWG/DXF) or Raster/PDF (Blueprints, Aerials, Architectural Sheets)
         │
[2. Calibration & Alignment]
   ├── Scale Calibration (2-Point Ground Distance, Dimension Verification)
   ├── Compass Orientation (North / WhichNorth alignment)
   └── Multi-Structure Assignment (Main Building, Garage, Shed, Detached)
         │
[3. Vector Digitization & Edge Classification]
   ├── Draw/Snap Boundary Polygons & Split Lines
   ├── Classify Edges (Ridge, Hip, Valley, Eave, Rake, Flashing, Step, Parapet, Coping, Trim)
   └── Assign Pitch / Slope (e.g., 4/12, 6/12, 8/12, Flat 0-2/12)
         │
[4. Fail-Safe Verification Engine]
   ├── MissingPolygonsFailSafe (unclosed boundary rings)
   ├── NegativeValueFailSafe (inverted or overlapping geometry)
   ├── LineTypeWithZeroSlope (invalid slope combinations on drainage edges)
   └── PlanHeight / Elevation Height Verification
         │
[5. Mathematical Takeoff & Quantity Aggregation]
   ├── True Surface Area = 2D Area × √(1 + (Pitch/12)²)
   ├── Roofing Squares = True Area / 100
   ├── Waste Factors Calculated (4% through 15% sliding matrix)
   └── Concrete CY = (SF × Thickness_ft) / 27
         │
[6. Export & Integration]
   ├── Multi-Page Branded PDF Takeoff Report
   ├── Xactimate / Symbility / ESX Compatible CSV Output
   └── High-Resolution Annotated Blueprint Export with Edge Key & North Indicator
```

---

## 4. Key Mathematical Algorithms & Takeoff Formulas

### 4.1. Roof Pitch Multiplier (True Area Calculation)
For a 2D projected polygon area $A_{2D}$ with pitch $P$ (rise over 12 inches run):
$$\text{Slope Multiplier } M = \sqrt{1 + \left(\frac{P}{12}\right)^2}$$
$$\text{True Surface Area } A_{\text{true}} = A_{2D} \times M$$
$$\text{Roofing Squares } (\text{SQ}) = \frac{A_{\text{true}}}{100 \text{ sq ft}}$$

### 4.2. Hip and Valley Factor
For rafter/ridge slopes with hip/valleys:
$$\text{Hip/Valley Factor } H = \sqrt{1 + 1 + \left(\frac{P}{12}\right)^2} = \sqrt{2 + \left(\frac{P}{12}\right)^2}$$

### 4.3. Waste Table Matrix
Calculates gross material requirements across waste percentages:
$$\text{Gross SQ}_{\text{waste}} = A_{\text{true}} \times (1 + W) \quad \text{for } W \in [0.04, 0.05, 0.06, \dots, 0.15]$$

### 4.4. Concrete Volume Formula
$$\text{Volume (Cubic Yards)} = \frac{A_{\text{SF}} \times \left(\frac{\text{Thickness (inches)}}{12}\right)}{27}$$
- 2-inch slab: $\text{CY} = \frac{A \times 0.1667}{27} \approx \frac{A}{162}$
- 4-inch slab: $\text{CY} = \frac{A \times 0.3333}{27} \approx \frac{A}{81}$
- 6-inch slab: $\text{CY} = \frac{A \times 0.5}{27} \approx \frac{A}{54}$

---

## 5. Security, Storage & Integration Discovery
- **Local Cache:** Previously stored in `%APPDATA%\ScopeTechnologies3` with local project files in `%USERPROFILE%\Documents\ScopeTechnologies3`.
- **Cloud Synchronization:** Communicated via JSON payload to `https://tracescope.roofscope.com/api/v1/projects` using HTTP Authorization headers.
- **File Ingestion:** Supported multi-page vector PDF, raster imagery (TIFF, PNG, JPEG), and DWG/DXF vector files.

---

## 6. Clean-Room CEI Transformation Strategy

To strictly adhere to clean-room engineering:
1. **Zero Proprietary Code Reuse:** Re-architect the application from scratch using modern web & desktop technologies (Next.js 14/15, TypeScript, Tailwind CSS, HTML5 Canvas / WebGL).
2. **CEI Brand Identity:** 
   - Logo: Official CEI Estimation LLC branding (`public/branding/cei-logo.png`).
   - Color Palette: CEI Orange (`#DD8427`, `#C7731E`), Dark Technical Workspace (`#0A1128`, `#111827`, `#212529`), Accent Emerald (`#10B981`).
   - Typography: `Rajdhani` for technical numeric & CAD headings, `Roboto`/`Inter` for controls.
3. **Enhanced Architecture:** Replace obsolete desktop-only WPF/.NET 4.5.2 dependencies with a high-performance, cross-platform, responsive web & desktop suite accessible in modern browsers and packaged with desktop capabilities.

