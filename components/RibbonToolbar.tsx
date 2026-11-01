'use client';

import React, { useState } from 'react';
import { 
  Square, 
  PenTool, 
  Scissors, 
  Ruler, 
  Compass, 
  Undo2, 
  Redo2, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  Maximize, 
  FileText, 
  ShieldCheck, 
  CheckSquare, 
  Move, 
  Tag, 
  Sliders, 
  HelpCircle,
  Eye,
  Grid,
  MapPin,
  Flame,
  ArrowRight
} from 'lucide-react';
import { EdgeType, EDGE_CONFIGS, PunchItemType, ProductType } from '../types/takeoff';

export type RibbonTab = 'DRAW' | 'CLASSIFY' | 'PITCH' | 'MEASURE' | 'PUNCH' | 'ELEVATION' | 'VIEW';

export type ActiveTool = 
  | 'SELECT'
  | 'PAN'
  | 'DRAW_POLYGON'
  | 'SPLIT_PLANE'
  | 'MEASURE_DISTANCE'
  | 'CALIBRATE_SCALE'
  | 'PUNCH_ITEM'
  | 'CLASSIFY_EDGE';

interface RibbonToolbarProps {
  activeTool: ActiveTool;
  setActiveTool: (tool: ActiveTool) => void;
  activeEdgeType: EdgeType;
  setActiveEdgeType: (type: EdgeType) => void;
  activePitch: string;
  setActivePitch: (pitch: string) => void;
  activePunchType: PunchItemType;
  setActivePunchType: (type: PunchItemType) => void;
  productType: ProductType;
  activeElevation: 'North' | 'South' | 'East' | 'West' | 'Overhead';
  setActiveElevation: (elev: 'North' | 'South' | 'East' | 'West' | 'Overhead') => void;
  onUndo: () => void;
  onRedo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomExtents: () => void;
  showGrid: boolean;
  setShowGrid: (val: boolean) => void;
  showDimensions: boolean;
  setShowDimensions: (val: boolean) => void;
  orthoSnap: boolean;
  setOrthoSnap: (val: boolean) => void;
  onOpenScaleModal: () => void;
  onOpenFailSafe: () => void;
  onOpenReport: () => void;
}

export default function RibbonToolbar({
  activeTool,
  setActiveTool,
  activeEdgeType,
  setActiveEdgeType,
  activePitch,
  setActivePitch,
  activePunchType,
  setActivePunchType,
  productType,
  activeElevation,
  setActiveElevation,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
  onZoomIn,
  onZoomOut,
  onZoomExtents,
  showGrid,
  setShowGrid,
  showDimensions,
  setShowDimensions,
  orthoSnap,
  setOrthoSnap,
  onOpenScaleModal,
  onOpenFailSafe,
  onOpenReport,
}: RibbonToolbarProps) {
  const [activeTab, setActiveTab] = useState<RibbonTab>('DRAW');

  const standardPitches = ['Flat', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '12/12'];

  const primaryEdges: EdgeType[] = [
    'Eave',
    'Ridge',
    'Hip',
    'Valley',
    'Rake',
    'StepFlashing',
    'HeadwallFlashing',
    'Parapet',
    'Gutter',
    'Downspout',
    'CornerTrim',
    'FasciaTrim',
    'StarterStrip',
  ];

  const punchItemOptions: { type: PunchItemType; label: string }[] = [
    { type: 'PipeBoot', label: 'Pipe Boot (3")' },
    { type: 'BoxVent', label: 'Box Vent' },
    { type: 'HVAC_Curb', label: 'HVAC Curb' },
    { type: 'DownspoutDrop', label: 'Downspout Drop' },
    { type: 'Endcap', label: 'Gutter Endcap' },
    { type: 'InsideCorner', label: 'Inside Corner' },
    { type: 'OutsideCorner', label: 'Outside Corner' },
    { type: 'DownspoutElbow', label: 'Elbow (A/B)' },
  ];

  return (
    <div className="bg-cei-slate-850 border-b border-slate-800 flex flex-col z-20 select-none shadow-sm">
      {/* Ribbon Tabs Header */}
      <div className="flex items-center space-x-1 px-4 pt-1 border-b border-slate-800 bg-cei-slate-900">
        <button
          onClick={() => setActiveTab('DRAW')}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-colors ${
            activeTab === 'DRAW'
              ? 'bg-cei-slate-850 text-cei-orange border-t-2 border-cei-orange'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Draw & Digitize
        </button>

        <button
          onClick={() => setActiveTab('CLASSIFY')}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-colors ${
            activeTab === 'CLASSIFY'
              ? 'bg-cei-slate-850 text-cei-orange border-t-2 border-cei-orange'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Classify Edges
        </button>

        <button
          onClick={() => setActiveTab('PITCH')}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-colors ${
            activeTab === 'PITCH'
              ? 'bg-cei-slate-850 text-cei-orange border-t-2 border-cei-orange'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Pitch & Slope
        </button>

        <button
          onClick={() => setActiveTab('MEASURE')}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-colors ${
            activeTab === 'MEASURE'
              ? 'bg-cei-slate-850 text-cei-orange border-t-2 border-cei-orange'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Calibration & Scale
        </button>

        <button
          onClick={() => setActiveTab('PUNCH')}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-colors ${
            activeTab === 'PUNCH'
              ? 'bg-cei-slate-850 text-cei-orange border-t-2 border-cei-orange'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          Accessories & Punch
        </button>

        {(productType === 'Siding' || productType === 'Paint' || productType === 'PaintPro') && (
          <button
            onClick={() => setActiveTab('ELEVATION')}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-colors ${
              activeTab === 'ELEVATION'
                ? 'bg-cei-slate-850 text-cei-orange border-t-2 border-cei-orange'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            Elevations (4-Sides)
          </button>
        )}

        <button
          onClick={() => setActiveTab('VIEW')}
          className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wider rounded-t transition-colors ${
            activeTab === 'VIEW'
              ? 'bg-cei-slate-850 text-cei-orange border-t-2 border-cei-orange'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          View & Layers
        </button>
      </div>

      {/* Ribbon Tab Content Ribbon Panel */}
      <div className="h-16 px-4 flex items-center justify-between overflow-x-auto text-xs py-1">
        {/* Left Section: Active Tab Specific Tools */}
        <div className="flex items-center space-x-2">
          {/* TAB: DRAW */}
          {activeTab === 'DRAW' && (
            <>
              {/* Select & Pan */}
              <div className="flex items-center space-x-1 border-r border-slate-750 pr-2">
                <button
                  onClick={() => setActiveTool('SELECT')}
                  className={`flex flex-col items-center justify-center w-12 h-14 rounded transition-all ${
                    activeTool === 'SELECT'
                      ? 'bg-cei-orange text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-750'
                  }`}
                  title="Select & Inspect Facets / Edges"
                >
                  <PenTool className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px]">Select</span>
                </button>

                <button
                  onClick={() => setActiveTool('PAN')}
                  className={`flex flex-col items-center justify-center w-12 h-14 rounded transition-all ${
                    activeTool === 'PAN'
                      ? 'bg-cei-orange text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-750'
                  }`}
                  title="Pan Drawing Canvas (or hold Spacebar)"
                >
                  <Move className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px]">Pan</span>
                </button>
              </div>

              {/* Polygon Drawing Tools */}
              <div className="flex items-center space-x-1 border-r border-slate-750 pr-2">
                <button
                  onClick={() => setActiveTool('DRAW_POLYGON')}
                  className={`flex flex-col items-center justify-center px-3 h-14 rounded transition-all ${
                    activeTool === 'DRAW_POLYGON'
                      ? 'bg-cei-orange text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-750'
                  }`}
                  title="Draw Polygon Boundary (Hotkey B)"
                >
                  <Square className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px]">Boundary (B)</span>
                </button>

                <button
                  onClick={() => setActiveTool('SPLIT_PLANE')}
                  className={`flex flex-col items-center justify-center px-3 h-14 rounded transition-all ${
                    activeTool === 'SPLIT_PLANE'
                      ? 'bg-cei-orange text-white shadow-sm font-semibold'
                      : 'text-slate-300 hover:bg-slate-750'
                  }`}
                  title="Split Polygon across Ridge/Valley (Hotkey S)"
                >
                  <Scissors className="w-4 h-4 mb-0.5" />
                  <span className="text-[10px]">Split Plane</span>
                </button>
              </div>

              {/* Snapping Options */}
              <div className="flex flex-col justify-center space-y-1 pl-1">
                <label className="flex items-center space-x-1.5 cursor-pointer text-[11px] text-slate-300">
                  <input
                    type="checkbox"
                    checked={orthoSnap}
                    onChange={(e) => setOrthoSnap(e.target.checked)}
                    className="accent-cei-orange w-3.5 h-3.5 rounded"
                  />
                  <span>Ortho Snap (90°/45°)</span>
                </label>
                <div className="text-[10px] text-slate-400">
                  Magnetic Vertex Snapping Active
                </div>
              </div>
            </>
          )}

          {/* TAB: CLASSIFY EDGES */}
          {activeTab === 'CLASSIFY' && (
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1">
                Active Edge:
              </span>
              {primaryEdges.map((edge) => {
                const conf = EDGE_CONFIGS[edge];
                const isSelected = activeEdgeType === edge && activeTool === 'CLASSIFY_EDGE';
                return (
                  <button
                    key={edge}
                    onClick={() => {
                      setActiveEdgeType(edge);
                      setActiveTool('CLASSIFY_EDGE');
                    }}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs transition-all border ${
                      isSelected
                        ? 'border-white bg-slate-700 font-bold shadow-sm'
                        : 'border-slate-700 bg-slate-800 hover:bg-slate-750 text-slate-200'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: conf.color }}
                    />
                    <span>{conf.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB: PITCH & SLOPE */}
          {activeTab === 'PITCH' && (
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1">
                Assign Pitch:
              </span>
              {standardPitches.map((p) => {
                const isSelected = activePitch === p;
                return (
                  <button
                    key={p}
                    onClick={() => setActivePitch(p)}
                    className={`px-2.5 py-1.5 rounded text-xs font-mono font-medium transition-all ${
                      isSelected
                        ? 'bg-cei-orange text-white shadow-sm font-bold'
                        : 'bg-slate-800 text-slate-200 hover:bg-slate-750 border border-slate-700'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
              <div className="flex items-center space-x-1 pl-2">
                <input
                  type="text"
                  placeholder="Custom"
                  className="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-xs text-center font-mono text-slate-100 focus:outline-none focus:border-cei-orange"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setActivePitch((e.target as HTMLInputElement).value);
                    }
                  }}
                />
              </div>
            </div>
          )}

          {/* TAB: CALIBRATION & MEASURE */}
          {activeTab === 'MEASURE' && (
            <div className="flex items-center space-x-2">
              <button
                onClick={onOpenScaleModal}
                className="flex items-center space-x-1.5 px-3 py-2 bg-cei-orange/15 hover:bg-cei-orange/25 border border-cei-orange/40 text-cei-orange rounded text-xs font-semibold transition-all"
              >
                <Ruler className="w-4 h-4" />
                <span>Calibrate Scale (2-Points)</span>
              </button>

              <button
                onClick={() => setActiveTool('MEASURE_DISTANCE')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded text-xs border transition-all ${
                  activeTool === 'MEASURE_DISTANCE'
                    ? 'bg-cei-orange text-white border-transparent font-semibold'
                    : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-750'
                }`}
              >
                <Move className="w-4 h-4" />
                <span>Tape Measure Tool</span>
              </button>
            </div>
          )}

          {/* TAB: PUNCH & ACCESSORIES */}
          {activeTab === 'PUNCH' && (
            <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
              <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1">
                Punch Marker:
              </span>
              {punchItemOptions.map((item) => {
                const isSelected = activePunchType === item.type && activeTool === 'PUNCH_ITEM';
                return (
                  <button
                    key={item.type}
                    onClick={() => {
                      setActivePunchType(item.type);
                      setActiveTool('PUNCH_ITEM');
                    }}
                    className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded text-xs transition-all border ${
                      isSelected
                        ? 'bg-cei-orange text-white border-transparent font-semibold shadow-sm'
                        : 'bg-slate-800 text-slate-200 border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    <MapPin className="w-3.5 h-3.5 text-cei-orange" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB: ELEVATIONS */}
          {activeTab === 'ELEVATION' && (
            <div className="flex items-center space-x-2">
              <span className="text-[11px] text-slate-400 uppercase font-semibold mr-1">
                Active Elevation:
              </span>
              {(['North', 'South', 'East', 'West', 'Overhead'] as const).map((elev) => {
                const isSelected = activeElevation === elev;
                return (
                  <button
                    key={elev}
                    onClick={() => setActiveElevation(elev)}
                    className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-cei-orange text-white shadow-sm'
                        : 'bg-slate-800 text-slate-200 border border-slate-700 hover:bg-slate-750'
                    }`}
                  >
                    {elev} Elevation
                  </button>
                );
              })}
            </div>
          )}

          {/* TAB: VIEW & LAYERS */}
          {activeTab === 'VIEW' && (
            <div className="flex items-center space-x-3">
              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={showGrid}
                  onChange={(e) => setShowGrid(e.target.checked)}
                  className="accent-cei-orange w-3.5 h-3.5 rounded"
                />
                <span>CAD Grid</span>
              </label>

              <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={showDimensions}
                  onChange={(e) => setShowDimensions(e.target.checked)}
                  className="accent-cei-orange w-3.5 h-3.5 rounded"
                />
                <span>Dimension Text</span>
              </label>
            </div>
          )}
        </div>

        {/* Right Section: Universal Navigation & History Buttons */}
        <div className="flex items-center space-x-1.5 pl-3 border-l border-slate-750">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className={`p-1.5 rounded transition-colors ${
              canUndo ? 'text-slate-200 hover:bg-slate-750' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="w-4 h-4" />
          </button>

          <button
            onClick={onRedo}
            disabled={!canRedo}
            className={`p-1.5 rounded transition-colors ${
              canRedo ? 'text-slate-200 hover:bg-slate-750' : 'text-slate-600 cursor-not-allowed'
            }`}
            title="Redo (Ctrl+Y)"
          >
            <Redo2 className="w-4 h-4" />
          </button>

          <div className="h-5 w-px bg-slate-800 mx-0.5" />

          <button
            onClick={onZoomIn}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-750 rounded transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>

          <button
            onClick={onZoomOut}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-750 rounded transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>

          <button
            onClick={onZoomExtents}
            className="p-1.5 text-slate-300 hover:text-white hover:bg-slate-750 rounded transition-colors"
            title="Zoom to Extents (Reset View)"
          >
            <Maximize className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

