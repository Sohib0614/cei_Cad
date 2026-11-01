// CEI Estimation LLC - Precision Mathematical Engine for CAD Takeoff

import { Point, TakeoffFacet, ClassifiedEdge, WasteMatrixItem, FailSafeError } from '../types/takeoff';

/**
 * Calculates Euclidean distance between two points in feet
 */
export function distance(p1: Point, p2: Point): number {
  const dx = p2[0] - p1[0];
  const dy = p2[1] - p1[1];
  return Math.sqrt(dx * dx + dy * dy);
}

/**
 * Parses pitch string like "6/12", "6", "Flat" into numeric rise over 12 run
 */
export function parsePitch(pitchStr: string): number {
  if (!pitchStr) return 6;
  const clean = pitchStr.toLowerCase().trim();
  if (clean.includes('flat') || clean === '0' || clean === '0/12') return 0;
  const match = clean.match(/^(\d+(?:\.\d+)?)(?:\/12)?/);
  if (match) {
    return parseFloat(match[1]);
  }
  return 6;
}

/**
 * Calculates slope factor multiplier: sqrt(1 + (pitch / 12)^2)
 */
export function getSlopeFactor(pitchStr: string): number {
  const rise = parsePitch(pitchStr);
  return Math.sqrt(1 + Math.pow(rise / 12, 2));
}

/**
 * Calculates hip and valley multiplier: sqrt(2 + (pitch / 12)^2)
 */
export function getHipValleyFactor(pitchStr: string): number {
  const rise = parsePitch(pitchStr);
  return Math.sqrt(2 + Math.pow(rise / 12, 2));
}

/**
 * Calculates 2D Footprint polygon area using Shoelace formula
 */
export function calculatePolygonArea(vertices: Point[]): number {
  if (!vertices || vertices.length < 3) return 0;
  let area = 0;
  const n = vertices.length;
  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += vertices[i][0] * vertices[j][1];
    area -= vertices[j][0] * vertices[i][1];
  }
  return Math.abs(area) / 2.0;
}

/**
 * Computes facet metrics (footprint, true surface area, squares)
 */
export function computeFacetMetrics(vertices: Point[], pitchStr: string, cutouts: Point[][] = []) {
  const grossFootprint = calculatePolygonArea(vertices);
  let deductions = 0;
  if (cutouts && cutouts.length > 0) {
    for (const cutout of cutouts) {
      deductions += calculatePolygonArea(cutout);
    }
  }
  const netFootprint = Math.max(0, grossFootprint - deductions);
  const factor = getSlopeFactor(pitchStr);
  const trueArea = netFootprint * factor;
  const squares = trueArea / 100.0;

  return {
    footprintAreaSqFt: Math.round(netFootprint * 100) / 100,
    trueAreaSqFt: Math.round(trueArea * 100) / 100,
    squares: Math.round(squares * 100) / 100,
  };
}

/**
 * Generates sliding waste factor table from 4% to 15%
 */
export function generateWasteTable(totalSquares: number, totalSqFt: number): WasteMatrixItem[] {
  const percentages = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
  return percentages.map((pct) => {
    const multiplier = 1 + pct / 100.0;
    return {
      wastePercent: pct,
      grossSquares: Math.round(totalSquares * multiplier * 100) / 100,
      grossSqFt: Math.round(totalSqFt * multiplier),
      isRecommended: pct === 10,
    };
  });
}

/**
 * Concrete Volume in Cubic Yards: (Area_SF * (Thickness_inches / 12)) / 27
 */
export function calculateConcreteVolume(areaSqFt: number, thicknessInches: number): number {
  const depthFt = thicknessInches / 12.0;
  const cubicFeet = areaSqFt * depthFt;
  return Math.round((cubicFeet / 27.0) * 100) / 100;
}

/**
 * Magnetic Orthogonal Snap (Snaps vector to 0°, 45°, 90°, 135°, 180° within snap threshold)
 */
export function snapToOrtho(anchor: Point, current: Point, thresholdDeg = 5): Point {
  const dx = current[0] - anchor[0];
  const dy = current[1] - anchor[1];
  const dist = Math.sqrt(dx * dx + dy * dy);
  if (dist < 0.1) return current;

  let angleRad = Math.atan2(dy, dx);
  let angleDeg = (angleRad * 180) / Math.PI;
  if (angleDeg < 0) angleDeg += 360;

  const snapAngles = [0, 45, 90, 135, 180, 225, 270, 315, 360];
  for (const snap of snapAngles) {
    if (Math.abs(angleDeg - snap) <= thresholdDeg || Math.abs(angleDeg - snap - 360) <= thresholdDeg) {
      const snappedRad = (snap * Math.PI) / 180;
      let nx = anchor[0] + dist * Math.cos(snappedRad);
      let ny = anchor[1] + dist * Math.sin(snappedRad);
      // Clean up floating point representation near integers
      if (Math.abs(nx - Math.round(nx)) < 1e-10) nx = Math.round(nx);
      if (Math.abs(ny - Math.round(ny)) < 1e-10) ny = Math.round(ny);
      return [nx, ny];
    }
  }

  return current;
}

/**
 * Snap to existing vertices if within distance threshold (in feet)
 */
export function snapToVertex(current: Point, candidates: Point[], snapRadiusFt = 0.8): { point: Point; snapped: boolean } {
  let closestDist = Infinity;
  let bestPoint = current;

  for (const c of candidates) {
    const d = distance(current, c);
    if (d < snapRadiusFt && d < closestDist) {
      closestDist = d;
      bestPoint = c;
    }
  }

  return {
    point: bestPoint,
    snapped: closestDist !== Infinity,
  };
}

/**
 * Point in Polygon Ray Casting Test
 */
export function isPointInPolygon(point: Point, polygon: Point[]): boolean {
  let inside = false;
  const x = point[0];
  const y = point[1];
  const n = polygon.length;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = polygon[i][0], yi = polygon[i][1];
    const xj = polygon[j][0], yj = polygon[j][1];
    const intersect = ((yi > y) !== (yj > y)) && (x < ((xj - xi) * (y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

/**
 * Runs Fail-Safe Validation against project geometry
 */
export function runFailSafeAudit(facets: TakeoffFacet[], edges: ClassifiedEdge[]): FailSafeError[] {
  const errors: FailSafeError[] = [];

  // Check 1: Open Loops or less than 3 vertices
  facets.forEach((f, idx) => {
    if (!f.vertices || f.vertices.length < 3) {
      errors.push({
        id: `unclosed_${f.id}`,
        type: 'UNCLOSED_LOOP',
        severity: 'ERROR',
        message: `${f.name}: Area does not form a closed polygon (requires at least 3 points).`,
        facetId: f.id,
      });
    }

    // Check 2: Negative or Zero Area
    if (f.footprintAreaSqFt <= 0) {
      errors.push({
        id: `neg_area_${f.id}`,
        type: 'NEGATIVE_AREA',
        severity: 'ERROR',
        message: `${f.name}: Calculated footprint area is 0 or negative. Verify vertex ordering.`,
        facetId: f.id,
      });
    }

    // Check 3: Drainage Zero Slope Check
    const pitch = parsePitch(f.pitch);
    if (pitch === 0 && !f.name.toLowerCase().includes('flat')) {
      errors.push({
        id: `zero_slope_${f.id}`,
        type: 'ZERO_SLOPE',
        severity: 'WARNING',
        message: `${f.name}: Has 0/12 slope without being explicitly designated as a flat roof.`,
        facetId: f.id,
      });
    }
  });

  // Check 4: Missing edges / unassigned edges
  const unassigned = edges.filter((e) => e.type === 'Unassigned');
  if (unassigned.length > 0) {
    errors.push({
      id: 'unassigned_edges',
      type: 'MISSING_POLYGON',
      severity: 'WARNING',
      message: `${unassigned.length} perimeter lines have not been classified (marked as Standard/Unassigned).`,
    });
  }

  return errors;
}

