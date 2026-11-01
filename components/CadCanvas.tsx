'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { 
  ProjectData, 
  Point, 
  TakeoffFacet, 
  ClassifiedEdge, 
  EdgeType, 
  EDGE_CONFIGS, 
  PunchItem, 
  PunchItemType 
} from '../types/takeoff';
import { ActiveTool } from './RibbonToolbar';
import { 
  distance, 
  calculatePolygonArea, 
  computeFacetMetrics, 
  snapToOrtho, 
  snapToVertex, 
  isPointInPolygon 
} from '../lib/cad-math';

interface CadCanvasProps {
  project: ProjectData;
  activeTool: ActiveTool;
  activeEdgeType: EdgeType;
  activePitch: string;
  activePunchType: PunchItemType;
  orthoSnap: boolean;
  showGrid: boolean;
  showDimensions: boolean;
  onUpdateFacets: (facets: TakeoffFacet[], edges: ClassifiedEdge[]) => void;
  onUpdatePunchItems: (items: PunchItem[]) => void;
  onUpdateCalibrationPoints: (p1: Point, p2: Point) => void;
  zoomLevel: number;
  setZoomLevel: (z: number) => void;
  panOffset: { x: number; y: number };
  setPanOffset: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function CadCanvas({
  project,
  activeTool,
  activeEdgeType,
  activePitch,
  activePunchType,
  orthoSnap,
  showGrid,
  showDimensions,
  onUpdateFacets,
  onUpdatePunchItems,
  onUpdateCalibrationPoints,
  zoomLevel,
  setZoomLevel,
  panOffset,
  setPanOffset,
  canvasRef,
}: CadCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drawingPoints, setDrawingPoints] = useState<Point[]>([]);
  const [mouseWorldPos, setMouseWorldPos] = useState<Point>([0, 0]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [hoveredFacetId, setHoveredFacetId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);

  // Calibration tool temporary points
  const [calibPoint1, setCalibPoint1] = useState<Point | null>(null);

  const ppf = project.scale?.pixelsPerFoot || 12.0;

  // Convert Screen (px) to World (ft)
  const screenToWorld = useCallback(
    (screenX: number, screenY: number): Point => {
      const worldX = (screenX - panOffset.x) / (zoomLevel * ppf);
      const worldY = (screenY - panOffset.y) / (zoomLevel * ppf);
      return [worldX, worldY];
    },
    [panOffset, zoomLevel, ppf]
  );

  // Convert World (ft) to Screen (px)
  const worldToScreen = useCallback(
    (worldX: number, worldY: number): { x: number; y: number } => {
      const screenX = worldX * (zoomLevel * ppf) + panOffset.x;
      const screenY = worldY * (zoomLevel * ppf) + panOffset.y;
      return { x: screenX, y: screenY };
    },
    [panOffset, zoomLevel, ppf]
  );

  // Resize canvas to fill container
  useEffect(() => {
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvasRef.current.width = rect.width * window.devicePixelRatio;
      canvasRef.current.height = rect.height * window.devicePixelRatio;
      canvasRef.current.style.width = `${rect.width}px`;
      canvasRef.current.style.height = `${rect.height}px`;
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [canvasRef]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const dpr = window.devicePixelRatio || 1;

    ctx.save();
    ctx.scale(dpr, dpr);

    const cssWidth = width / dpr;
    const cssHeight = height / dpr;

    // 1. Draw Architectural CAD Dark Blueprint Background
    ctx.fillStyle = '#080D1D';
    ctx.fillRect(0, 0, cssWidth, cssHeight);

    // 2. Draw CAD Grid
    if (showGrid) {
      const gridSizeFt = 10; // Grid line every 10 ft
      const gridPx = gridSizeFt * ppf * zoomLevel;

      if (gridPx > 10) {
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = '#141E38'; // Minor grid

        const startX = panOffset.x % gridPx;
        for (let x = startX; x < cssWidth; x += gridPx) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, cssHeight);
          ctx.stroke();
        }

        const startY = panOffset.y % gridPx;
        for (let y = startY; y < cssHeight; y += gridPx) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(cssWidth, y);
          ctx.stroke();
        }

        // Major Grid (every 50 ft)
        const majorPx = gridPx * 5;
        ctx.strokeStyle = '#1F2E52';
        ctx.lineWidth = 1;

        const majorStartX = panOffset.x % majorPx;
        for (let x = majorStartX; x < cssWidth; x += majorPx) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, cssHeight);
          ctx.stroke();
        }

        const majorStartY = panOffset.y % majorPx;
        for (let y = majorStartY; y < cssHeight; y += majorPx) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(cssWidth, y);
          ctx.stroke();
        }
      }
    }

    // 3. Draw Polygons / Facets
    project.facets.forEach((facet) => {
      if (!facet.vertices || facet.vertices.length < 3) return;

      const isHovered = facet.id === hoveredFacetId;

      ctx.beginPath();
      const first = worldToScreen(facet.vertices[0][0], facet.vertices[0][1]);
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < facet.vertices.length; i++) {
        const pt = worldToScreen(facet.vertices[i][0], facet.vertices[i][1]);
        ctx.lineTo(pt.x, pt.y);
      }
      ctx.closePath();

      // Semi-transparent fill with pitch indicator
      ctx.fillStyle = isHovered ? 'rgba(221, 132, 39, 0.28)' : 'rgba(30, 58, 138, 0.22)';
      ctx.fill();

      ctx.strokeStyle = isHovered ? '#DD8427' : 'rgba(96, 165, 250, 0.5)';
      ctx.lineWidth = isHovered ? 2 : 1;
      ctx.stroke();

      // Calculate Centroid for Plane Label & Pitch Badge
      let cx = 0;
      let cy = 0;
      facet.vertices.forEach((v) => {
        cx += v[0];
        cy += v[1];
      });
      cx /= facet.vertices.length;
      cy /= facet.vertices.length;

      const centerScreen = worldToScreen(cx, cy);

      // Draw Facet Badge
      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = isHovered ? '#DD8427' : '#334155';
      ctx.lineWidth = 1;
      const badgeW = 90;
      const badgeH = 34;
      ctx.beginPath();
      ctx.roundRect(centerScreen.x - badgeW / 2, centerScreen.y - badgeH / 2, badgeW, badgeH, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 10px Rajdhani, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(facet.name, centerScreen.x, centerScreen.y - 4);

      ctx.fillStyle = '#DD8427';
      ctx.font = 'bold 10px Roboto, sans-serif';
      ctx.fillText(`${facet.squares.toFixed(1)} SQ (${facet.pitch})`, centerScreen.x, centerScreen.y + 10);
    });

    // 4. Draw Classified Edges
    project.edges.forEach((edge) => {
      const p1 = worldToScreen(edge.p1[0], edge.p1[1]);
      const p2 = worldToScreen(edge.p2[0], edge.p2[1]);
      const conf = EDGE_CONFIGS[edge.type] || EDGE_CONFIGS.Unassigned;
      const isHovered = edge.id === hoveredEdgeId;

      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);

      ctx.strokeStyle = isHovered ? '#FFFFFF' : conf.color;
      ctx.lineWidth = isHovered ? 4 : 2.5;
      if (conf.dash) {
        ctx.setLineDash(conf.dash);
      } else {
        ctx.setLineDash([]);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw edge length annotation
      if (showDimensions && edge.lengthFt > 1) {
        const midX = (p1.x + p2.x) / 2;
        const midY = (p1.y + p2.y) / 2;

        ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
        ctx.strokeStyle = conf.color;
        ctx.lineWidth = 0.5;
        const text = `${edge.lengthFt.toFixed(1)}'`;
        ctx.font = '9px JetBrains Mono, monospace';
        const tw = ctx.measureText(text).width + 8;
        ctx.beginPath();
        ctx.roundRect(midX - tw / 2, midY - 7, tw, 14, 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, midX, midY);
      }
    });

    // 5. Draw Punch Items (Marker Pins)
    project.punchItems.forEach((punch) => {
      const pos = worldToScreen(punch.position[0], punch.position[1]);

      ctx.beginPath();
      ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#DD8427';
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      ctx.fillStyle = '#F8FAFC';
      ctx.font = '8px Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(punch.label, pos.x + 9, pos.y);
    });

    // 6. Draw In-Progress Polygon Drawing
    if (drawingPoints.length > 0) {
      ctx.beginPath();
      const first = worldToScreen(drawingPoints[0][0], drawingPoints[0][1]);
      ctx.moveTo(first.x, first.y);

      for (let i = 1; i < drawingPoints.length; i++) {
        const pt = worldToScreen(drawingPoints[i][0], drawingPoints[i][1]);
        ctx.lineTo(pt.x, pt.y);
      }

      // Rubber-band line to mouse
      const last = worldToScreen(mouseWorldPos[0], mouseWorldPos[1]);
      ctx.lineTo(last.x, last.y);

      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 4]);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw vertices
      drawingPoints.forEach((p, idx) => {
        const sp = worldToScreen(p[0], p[1]);
        ctx.beginPath();
        ctx.arc(sp.x, sp.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = idx === 0 ? '#10B981' : '#F59E0B'; // First vertex is green (snap to close)
        ctx.fill();
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 1;
        ctx.stroke();
      });

      // Show live dimension of current rubber-band line
      const lastPoint = drawingPoints[drawingPoints.length - 1];
      const liveDist = distance(lastPoint, mouseWorldPos);
      const midLiveX = (worldToScreen(lastPoint[0], lastPoint[1]).x + last.x) / 2;
      const midLiveY = (worldToScreen(lastPoint[0], lastPoint[1]).y + last.y) / 2;

      ctx.fillStyle = '#0F172A';
      ctx.strokeStyle = '#F59E0B';
      ctx.lineWidth = 0.5;
      const distStr = `${liveDist.toFixed(1)}'`;
      ctx.font = 'bold 9px JetBrains Mono, monospace';
      const mtw = ctx.measureText(distStr).width + 8;
      ctx.beginPath();
      ctx.roundRect(midLiveX - mtw / 2, midLiveY - 7, mtw, 14, 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#F59E0B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(distStr, midLiveX, midLiveY);
    }

    // 7. Draw Calibration Points Line if active
    if (calibPoint1) {
      const cp1 = worldToScreen(calibPoint1[0], calibPoint1[1]);
      const cp2 = worldToScreen(mouseWorldPos[0], mouseWorldPos[1]);

      ctx.beginPath();
      ctx.moveTo(cp1.x, cp1.y);
      ctx.lineTo(cp2.x, cp2.y);
      ctx.strokeStyle = '#10B981';
      ctx.lineWidth = 2;
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.beginPath();
      ctx.arc(cp1.x, cp1.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = '#10B981';
      ctx.fill();
    }

    // 8. Scale Bar (Bottom Left)
    const scaleBarFt = 20; // 20 ft scale bar
    const barPx = scaleBarFt * ppf * zoomLevel;
    const barX = 20;
    const barY = cssHeight - 25;

    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(barX - 8, barY - 18, barPx + 16, 28, 4);
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(barX, barY);
    ctx.lineTo(barX + barPx, barY);
    ctx.moveTo(barX, barY - 4);
    ctx.lineTo(barX, barY + 4);
    ctx.moveTo(barX + barPx, barY - 4);
    ctx.lineTo(barX + barPx, barY + 4);
    ctx.strokeStyle = '#DD8427';
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = '9px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(`${scaleBarFt} FT`, barX + barPx / 2, barY - 6);

    // 9. North Compass Rose (Top Right)
    const compassX = cssWidth - 45;
    const compassY = 45;
    const compassR = 24;

    ctx.save();
    ctx.translate(compassX, compassY);
    ctx.rotate((project.whichNorthAngleDeg * Math.PI) / 180);

    ctx.beginPath();
    ctx.arc(0, 0, compassR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    ctx.fill();
    ctx.stroke();

    // North Needle
    ctx.beginPath();
    ctx.moveTo(0, -compassR + 4);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fillStyle = '#EF4444'; // Red north
    ctx.fill();

    // South Needle
    ctx.beginPath();
    ctx.moveTo(0, compassR - 4);
    ctx.lineTo(5, 0);
    ctx.lineTo(-5, 0);
    ctx.closePath();
    ctx.fillStyle = '#64748B';
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 9px Rajdhani, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText('N', 0, -compassR + 14);

    ctx.restore();

    ctx.restore();
  }, [
    project,
    drawingPoints,
    mouseWorldPos,
    panOffset,
    zoomLevel,
    ppf,
    showGrid,
    showDimensions,
    hoveredFacetId,
    hoveredEdgeId,
    calibPoint1,
    worldToScreen,
    canvasRef,
  ]);

  // Handle Mouse Move & Snapping
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const screenX = e.clientX - rect.left;
    const screenY = e.clientY - rect.top;

    if (isPanning) {
      setPanOffset({
        x: screenX - panStart.x,
        y: screenY - panStart.y,
      });
      return;
    }

    let world = screenToWorld(screenX, screenY);

    // Snapping logic if drawing polygon
    if (activeTool === 'DRAW_POLYGON' && drawingPoints.length > 0) {
      const lastPoint = drawingPoints[drawingPoints.length - 1];

      // 1. Orthogonal Snap
      if (orthoSnap) {
        world = snapToOrtho(lastPoint, world);
      }

      // 2. Vertex Snap (snap to first vertex to close loop)
      const first = drawingPoints[0];
      const snap = snapToVertex(world, [first], 1.5);
      if (snap.snapped) {
        world = snap.point;
      }
    }

    setMouseWorldPos(world);

    // Hover detection for facets & edges
    if (activeTool === 'SELECT' || activeTool === 'CLASSIFY_EDGE') {
      let foundFacet: string | null = null;
      for (const facet of project.facets) {
        if (isPointInPolygon(world, facet.vertices)) {
          foundFacet = facet.id;
          break;
        }
      }
      setHoveredFacetId(foundFacet);

      let foundEdge: string | null = null;
      for (const edge of project.edges) {
        const d = distance(world, edge.p1) + distance(world, edge.p2);
        const edgeLen = distance(edge.p1, edge.p2);
        if (Math.abs(d - edgeLen) < 0.6) {
          foundEdge = edge.id;
          break;
        }
      }
      setHoveredEdgeId(foundEdge);
    }
  };

  // Handle Mouse Down & Tool Execution
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    // Pan trigger via middle click or pan tool
    if (e.button === 1 || activeTool === 'PAN') {
      setIsPanning(true);
      const rect = canvasRef.current?.getBoundingClientRect();
      if (rect) {
        setPanStart({
          x: e.clientX - rect.left - panOffset.x,
          y: e.clientY - rect.top - panOffset.y,
        });
      }
      return;
    }

    if (e.button !== 0) return; // Left click only for actions

    // 1. TOOL: DRAW_POLYGON
    if (activeTool === 'DRAW_POLYGON') {
      // Check if clicking near the initial vertex to close the polygon
      if (drawingPoints.length >= 3) {
        const first = drawingPoints[0];
        if (distance(mouseWorldPos, first) < 1.5) {
          // Close polygon
          completePolygon(drawingPoints);
          setDrawingPoints([]);
          return;
        }
      }

      setDrawingPoints((prev) => [...prev, mouseWorldPos]);
      return;
    }

    // 2. TOOL: CLASSIFY_EDGE
    if (activeTool === 'CLASSIFY_EDGE' && hoveredEdgeId) {
      const updated = project.edges.map((edge) => {
        if (edge.id === hoveredEdgeId) {
          return { ...edge, type: activeEdgeType };
        }
        return edge;
      });
      onUpdateFacets(project.facets, updated);
      return;
    }

    // 3. TOOL: PUNCH_ITEM
    if (activeTool === 'PUNCH_ITEM') {
      const newPunch: PunchItem = {
        id: `punch-${Date.now()}`,
        type: activePunchType,
        position: mouseWorldPos,
        label: activePunchType.replace(/([A-Z])/g, ' $1').trim(),
      };
      onUpdatePunchItems([...project.punchItems, newPunch]);
      return;
    }

    // 4. TOOL: CALIBRATE_SCALE
    if (activeTool === 'CALIBRATE_SCALE') {
      if (!calibPoint1) {
        setCalibPoint1(mouseWorldPos);
      } else {
        onUpdateCalibrationPoints(calibPoint1, mouseWorldPos);
        setCalibPoint1(null);
      }
      return;
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // Complete Polygon and generate classified edges
  const completePolygon = (vertices: Point[]) => {
    const metrics = computeFacetMetrics(vertices, activePitch);
    const newFacetId = `f-${Date.now()}`;
    const newFacet: TakeoffFacet = {
      id: newFacetId,
      name: `Roof Plane ${project.facets.length + 1}`,
      structure: 'Main Building',
      pitch: activePitch,
      vertices,
      ...metrics,
    };

    // Auto-generate edges for new polygon
    const newEdges: ClassifiedEdge[] = [];
    for (let i = 0; i < vertices.length; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % vertices.length];
      newEdges.push({
        id: `e-${Date.now()}-${i}`,
        p1,
        p2,
        type: 'Unassigned',
        lengthFt: Math.round(distance(p1, p2) * 100) / 100,
      });
    }

    onUpdateFacets([...project.facets, newFacet], [...project.edges, ...newEdges]);
  };

  // Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.85;
    const newZoom = Math.min(Math.max(zoomLevel * zoomFactor, 0.2), 10.0);

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Zoom centered around cursor
    setPanOffset((prev) => ({
      x: mouseX - (mouseX - prev.x) * (newZoom / zoomLevel),
      y: mouseY - (mouseY - prev.y) * (newZoom / zoomLevel),
    }));

    setZoomLevel(newZoom);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden bg-cei-slate-950 select-none"
    >
      <canvas
        ref={canvasRef}
        onMouseMove={handleMouseMove}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`w-full h-full block ${
          isPanning
            ? 'cad-grabbing'
            : activeTool === 'PAN'
            ? 'cad-grab'
            : 'cad-crosshair'
        }`}
      />

      {/* Coordinate & Status Overlay (Bottom Right) */}
      <div className="absolute bottom-3 right-4 flex items-center space-x-2 bg-slate-900/90 border border-slate-700/80 rounded px-2.5 py-1 text-[11px] font-mono text-slate-300 pointer-events-none shadow-md">
        <span>X: {mouseWorldPos[0].toFixed(1)}'</span>
        <span className="text-slate-600">|</span>
        <span>Y: {mouseWorldPos[1].toFixed(1)}'</span>
        <span className="text-slate-600">|</span>
        <span className="text-cei-orange font-semibold">Zoom: {(zoomLevel * 100).toFixed(0)}%</span>
      </div>
    </div>
  );
}
