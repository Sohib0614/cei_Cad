# Clean-Room Replication Roadmap & Multi-Agent Execution Plan
**Application:** CEI Estimation LLC — Precision CAD Takeoff & Estimating Suite  
**Methodology:** Clean-Room Engineering with Multi-Agent Specialized Roles  

---

## 1. Multi-Agent Roles & Specialization

Following `/multi-agent-orchestration`:

| Agent | Specialized Role | Primary Focus Area |
|---|---|---|
| **Agent 1** | **Reverse Engineering Lead** | ScopeCAD decompilation, workflow mapping, math formulas, data structures. |
| **Agent 2** | **UI/UX Design Architect** | CEI Estimation LLC brand identity, design system tokens, technical CAD styling, responsive ergonomics. |
| **Agent 3** | **Frontend Application Engineer** | Next.js architecture, state management, ribbon navigation, project modals, sidebars. |
| **Agent 4** | **Backend & Cloud Engineer** | PostgreSQL/Supabase database schema, Next.js API endpoints, file uploads, persistence. |
| **Agent 5** | **CAD & Takeoff Engineer** | Canvas 2D/WebGL rendering, scale calibration, polygon math, edge classification, pitch engine, fail-safe validators. |
| **Agent 6** | **Animation & Motion Engineer** | GSAP page transitions, Motion interactive states, smooth zooming, 60fps performance profiling. |
| **Agent 7** | **QA & Security Automation** | End-to-end tests, unit test suite, WCAG accessibility, security audit, report verification. |

---

## 2. Phased Execution Roadmap

### Phase 1: Reverse Engineering & Application Discovery (COMPLETED)
- [x] Unpack & deconstruct reference package `ScopeCADUpdater-06-10-2026.msi`
- [x] Disassemble `ScopeCAD.exe` v2.5.7.2 metadata, types, views, resources, and BAML
- [x] Extract all 8 trade modules, line types, math formulas, and fail-safe validators
- [x] Document discoveries in `RESEARCH.md`, `FEATURE_INVENTORY.md`, `USER_FLOWS.md`, `TECHNICAL_ARCHITECTURE.md`, and `REPLICATION_ROADMAP.md`
- [x] Integrate official CEI Estimation LLC brand assets and logos in `public/branding/`

### Phase 2: Application Scaffolding & Foundation Setup
- [ ] Initialize Next.js 14/15 application with TypeScript, Tailwind CSS, Lucide icons, and modern animation packages
- [ ] Configure CEI theme variables (CEI Orange `#DD8427`, Dark Slate `#0A1128`, Technical typography)
- [ ] Implement robust unified state store with undo/redo history

### Phase 3: Project Management & Executive Dashboard
- [ ] Real-time project overview dashboard with status filters (`New`, `In Progress`, `Inspected`, `Completed`)
- [ ] Interactive "New Project Wizard" with trade selection, claim number, address, date of loss, due date, and primary pitch
- [ ] Local storage caching & Cloud API synchronization

### Phase 4: Precision Drawing Workspace & Ingestion Engine
- [ ] Multi-format blueprint loader (PDF blueprint rendering via PDF.js, high-res raster, CAD vector DXF)
- [ ] Dual-layer interactive canvas with 60fps pan, smooth zoom, and zoom-to-extents
- [ ] 2-point scale calibration engine with real-world dimension verification and scale ruler
- [ ] Interactive compass rose with site north alignment

### Phase 5: Multi-Trade Vector Digitization & CAD Tools
- [ ] Polygon boundary tool with vertex snapping, 90°/45° orthogonal lock, and auto-close
- [ ] Area split & slice tool for dividing facets across ridges and hips
- [ ] Color-coded edge classification (Eave, Ridge, Hip, Valley, Rake, Step Flashing, Headwall Flashing, Parapet, Coping, Gutter, Downspout)
- [ ] Pitch & slope assigner with real-time true surface area and roofing square recalculation
- [ ] Punch/marker count tool (pipe boots, box vents, exhaust, corners, endcaps)
- [ ] Siding multi-side elevation editor (North, South, East, West) with window/door subtractions
- [ ] Concrete slab area and cubic yard calculations (2", 4", 6" thickness)
- [ ] Thermal insulation R-value breakdown tiering (R-19 through R-60)

### Phase 6: Fail-Safe Validation Engine
- [ ] Missing Polygons Fail-Safe (identifies open boundary loops)
- [ ] Negative Value Fail-Safe (flags self-intersections and oversized cutouts)
- [ ] Zero-Slope Warning (flags invalid flat drainage edges)
- [ ] Plan Height & Scale Drift Verifier
- [ ] Comprehensive diagnostic audit modal with "Zoom to Error" inspection

### Phase 7: Professional Reporting, Exports & Takeoff Sheets
- [ ] Multi-Page Official CEI PDF Report with CEI logo, summary cards, and sliding 4%–15% waste table
- [ ] Color-coded annotated blueprint markup sheet with edge legend and scale indicator
- [ ] Xactimate & Symbility CSV export
- [ ] Direct print and JSON exchange export

### Phase 8: Testing, Verification & Delivery
- [ ] Automated end-to-end testing with Playwright
- [ ] Unit tests for geometry math, scale conversion, and area calculation
- [ ] WCAG 2.1 AA accessibility and responsive verification
- [ ] Final compilation report `CEI_APPLICATION_COMPLETION_REPORT.md`

