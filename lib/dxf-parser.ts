// CEI Estimation LLC - High Performance Client-Side DXF File Parser
// Parses AutoCAD DXF (Drawing Exchange Format) ASCII files into lines, polylines, and circles

export interface DxfLine {
  type: 'LINE';
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  layer?: string;
  color?: number;
}

export interface DxfPolyline {
  type: 'POLYLINE';
  vertices: [number, number][];
  isClosed: boolean;
  layer?: string;
}

export interface DxfCircle {
  type: 'CIRCLE';
  cx: number;
  cy: number;
  r: number;
  layer?: string;
}

export interface ParsedDxf {
  lines: DxfLine[];
  polylines: DxfPolyline[];
  circles: DxfCircle[];
  bounds: {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
  };
}

export function parseDxfContent(dxfText: string): ParsedDxf {
  const lines = dxfText.split(/\r?\n/);
  const result: ParsedDxf = {
    lines: [],
    polylines: [],
    circles: [],
    bounds: {
      minX: Infinity,
      minY: Infinity,
      maxX: -Infinity,
      maxY: -Infinity,
    },
  };

  function updateBounds(x: number, y: number) {
    if (x < result.bounds.minX) result.bounds.minX = x;
    if (x > result.bounds.maxX) result.bounds.maxX = x;
    if (y < result.bounds.minY) result.bounds.minY = y;
    if (y > result.bounds.maxY) result.bounds.maxY = y;
  }

  let inEntities = false;
  let i = 0;

  while (i < lines.length) {
    const code = lines[i]?.trim();
    const val = lines[i + 1]?.trim();
    i += 2;

    if (!code || val === undefined) continue;

    // Check SECTION entities
    if (code === '0' && val === 'SECTION') {
      const nextCode = lines[i]?.trim();
      const nextVal = lines[i + 1]?.trim();
      if (nextCode === '2' && nextVal === 'ENTITIES') {
        inEntities = true;
        i += 2;
      }
      continue;
    }

    if (code === '0' && val === 'ENDSEC') {
      if (inEntities) {
        break; // Finished reading entities
      }
      continue;
    }

    if (!inEntities) continue;

    // Parse LINE entity
    if (code === '0' && val === 'LINE') {
      let x1 = 0, y1 = 0, x2 = 0, y2 = 0;
      let layer = '0';

      while (i < lines.length) {
        const c = lines[i]?.trim();
        const v = lines[i + 1]?.trim();
        if (c === '0') break; // Next entity starts
        i += 2;

        if (c === '8') layer = v;
        if (c === '10') x1 = parseFloat(v);
        if (c === '20') y1 = parseFloat(v);
        if (c === '11') x2 = parseFloat(v);
        if (c === '21') y2 = parseFloat(v);
      }

      if (!isNaN(x1) && !isNaN(y1) && !isNaN(x2) && !isNaN(y2)) {
        result.lines.push({ type: 'LINE', x1, y1, x2, y2, layer });
        updateBounds(x1, y1);
        updateBounds(x2, y2);
      }
      continue;
    }

    // Parse LWPOLYLINE entity (Lightweight 2D Polyline)
    if (code === '0' && val === 'LWPOLYLINE') {
      let layer = '0';
      let isClosed = false;
      const vertices: [number, number][] = [];
      let currentX: number | null = null;

      while (i < lines.length) {
        const c = lines[i]?.trim();
        const v = lines[i + 1]?.trim();
        if (c === '0') break; // Next entity
        i += 2;

        if (c === '8') layer = v;
        if (c === '70') isClosed = (parseInt(v, 10) & 1) === 1;
        if (c === '10') {
          currentX = parseFloat(v);
        }
        if (c === '20' && currentX !== null) {
          const currentY = parseFloat(v);
          vertices.push([currentX, currentY]);
          updateBounds(currentX, currentY);
          currentX = null;
        }
      }

      if (vertices.length > 1) {
        result.polylines.push({ type: 'POLYLINE', vertices, isClosed, layer });
      }
      continue;
    }

    // Parse CIRCLE entity
    if (code === '0' && val === 'CIRCLE') {
      let cx = 0, cy = 0, r = 0;
      let layer = '0';

      while (i < lines.length) {
        const c = lines[i]?.trim();
        const v = lines[i + 1]?.trim();
        if (c === '0') break;
        i += 2;

        if (c === '8') layer = v;
        if (c === '10') cx = parseFloat(v);
        if (c === '20') cy = parseFloat(v);
        if (c === '40') r = parseFloat(v);
      }

      if (!isNaN(cx) && !isNaN(cy) && !isNaN(r) && r > 0) {
        result.circles.push({ type: 'CIRCLE', cx, cy, r, layer });
        updateBounds(cx - r, cy - r);
        updateBounds(cx + r, cy + r);
      }
      continue;
    }
  }

  // Handle default bounds if no entities
  if (result.bounds.minX === Infinity) {
    result.bounds = { minX: 0, minY: 0, maxX: 100, maxY: 100 };
  }

  return result;
}

