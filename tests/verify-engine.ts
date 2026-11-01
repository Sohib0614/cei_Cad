import { 
  distance, 
  parsePitch, 
  getSlopeFactor, 
  getHipValleyFactor, 
  calculatePolygonArea, 
  computeFacetMetrics, 
  generateWasteTable, 
  calculateConcreteVolume, 
  snapToOrtho, 
  runFailSafeAudit 
} from '../lib/cad-math';
import { parseDxfContent } from '../lib/dxf-parser';
import { Point, TakeoffFacet, ClassifiedEdge } from '../types/takeoff';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAIL: ${msg}`);
    process.exit(1);
  }
  console.log(`✅ PASS: ${msg}`);
}

console.log('--- STARTING CEI CAD VERIFICATION SUITE ---');

// 1. Distance
const d = distance([0, 0], [30, 40]);
assert(d === 50, `Euclidean distance is 50 (got ${d})`);

// 2. Pitch parsing
assert(parsePitch('6/12') === 6, 'Parse 6/12 pitch');
assert(parsePitch('Flat') === 0, 'Parse Flat pitch as 0');
assert(parsePitch('12/12') === 12, 'Parse 12/12 pitch');

// 3. Slope multipliers
const sfFlat = getSlopeFactor('Flat');
assert(sfFlat === 1.0, `Flat slope factor is 1.0 (got ${sfFlat})`);
const sf12 = getSlopeFactor('12/12');
assert(Math.abs(sf12 - Math.SQRT2) < 0.001, `12/12 slope factor sqrt(2) (got ${sf12})`);

// 4. Hip/Valley factors
const hv6 = getHipValleyFactor('6/12');
assert(hv6 === 1.5, `6/12 Hip/Valley factor is 1.5 (got ${hv6})`);

// 5. Shoelace Polygon Area
const rect: Point[] = [[0, 0], [40, 0], [40, 50], [0, 50]];
const area = calculatePolygonArea(rect);
assert(area === 2000, `40x50 rectangle area is 2000 SF (got ${area})`);

// 6. Facet Metrics & Squares
const metrics = computeFacetMetrics(rect, '6/12');
assert(metrics.footprintAreaSqFt === 2000, 'Footprint area 2000');
assert(Math.abs(metrics.trueAreaSqFt - 2236.07) < 0.1, `True surface area with slope is 2236.07 (got ${metrics.trueAreaSqFt})`);
assert(Math.abs(metrics.squares - 22.36) < 0.01, `Roof squares is 22.36 (got ${metrics.squares})`);

// 7. Concrete Volume
const cy = calculateConcreteVolume(1000, 4);
assert(cy === 12.35, `1000 SF at 4" is 12.35 Cubic Yards (got ${cy})`);

// 8. Waste Matrix
const waste = generateWasteTable(20, 2000);
assert(waste.length === 12, `Waste table has 12 intervals (got ${waste.length})`);
assert(waste[0].wastePercent === 4 && waste[0].grossSquares === 20.8, '4% waste calculation');
const rec = waste.find(w => w.isRecommended);
assert(rec?.wastePercent === 10 && rec?.grossSquares === 22, '10% recommended waste calculation');

// 9. Orthogonal Snapping
const snapped = snapToOrtho([0, 0], [0.1, 10], 5);
assert(Math.abs(snapped[0]) < 0.0001 && Math.abs(snapped[1] - 10) < 0.01, 'Ortho snaps near 90 to exact vertical');

// 10. Fail-Safe Integrity Audit
const badFacet: TakeoffFacet = {
  id: 'f-bad',
  name: 'Bad Loop',
  structure: 'Main Building',
  vertices: [[0, 0], [10, 10]],
  pitch: '6/12',
  footprintAreaSqFt: 0,
  trueAreaSqFt: 0,
  squares: 0,
};
const errors = runFailSafeAudit([badFacet], []);
assert(errors.some(e => e.type === 'UNCLOSED_LOOP'), 'Fail-Safe flags unclosed polygon');

// 11. DXF Parser Verification
const sampleDxf = `0
SECTION
2
ENTITIES
0
LINE
8
WALLS
10
0.0
20
0.0
11
50.0
21
0.0
0
LWPOLYLINE
8
ROOF
70
1
10
0.0
20
0.0
10
30.0
20
0.0
10
30.0
20
20.0
10
0.0
20
20.0
0
ENDSEC
0
EOF`;

const parsedDxf = parseDxfContent(sampleDxf);
assert(parsedDxf.lines.length === 1, `DXF parses LINE entity (got ${parsedDxf.lines.length})`);
assert(parsedDxf.polylines.length === 1, `DXF parses LWPOLYLINE entity (got ${parsedDxf.polylines.length})`);
assert(parsedDxf.polylines[0].isClosed === true, 'DXF polyline is flagged as closed');
assert(parsedDxf.polylines[0].vertices.length === 4, 'DXF polyline has 4 vertices');

console.log('--- ALL MATHEMATICAL AND GEOMETRIC TESTS PASSED SUCCESSFULLY! ---');
