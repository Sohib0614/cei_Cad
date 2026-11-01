'use client';

import React, { useState } from 'react';
import { 
  ProjectData, 
  TakeoffFacet, 
  ClassifiedEdge, 
  EDGE_CONFIGS, 
  EdgeType 
} from '../types/takeoff';
import { generateWasteTable, computeFacetMetrics } from '../lib/cad-math';
import { 
  Layers, 
  Sliders, 
  Trash2, 
  FileSpreadsheet, 
  MapPin, 
  Info, 
  Maximize2,
  Tag,
  CheckCircle2,
  TrendingUp
} from 'lucide-react';

interface TakeoffSidebarProps {
  project: ProjectData;
  onUpdateFacetPitch: (facetId: string, newPitch: string) => void;
  onDeleteFacet: (facetId: string) => void;
  onDeleteEdge: (edgeId: string) => void;
  onDeletePunchItem: (punchId: string) => void;
}

type SidebarTab = 'FACETS' | 'EDGES' | 'WASTE' | 'ACCESSORIES' | 'INFO';

export default function TakeoffSidebar({
  project,
  onUpdateFacetPitch,
  onDeleteFacet,
  onDeleteEdge,
  onDeletePunchItem,
}: TakeoffSidebarProps) {
  const [activeTab, setActiveTab] = useState<SidebarTab>('FACETS');

  const totalFootprint = project.facets.reduce((acc, f) => acc + f.footprintAreaSqFt, 0);
  const totalTrueArea = project.facets.reduce((acc, f) => acc + f.trueAreaSqFt, 0);
  const totalSquares = project.facets.reduce((acc, f) => acc + f.squares, 0);

  const wasteTable = generateWasteTable(totalSquares, totalTrueArea);

  // Edge linear totals
  const edgeTotals: Record<EdgeType, number> = {
    Eave: 0,
    Ridge: 0,
    Hip: 0,
    Valley: 0,
    Rake: 0,
    StepFlashing: 0,
    HeadwallFlashing: 0,
    FlatDripEdge: 0,
    Clerestory: 0,
    Parapet: 0,
    Coping: 0,
    Gutter: 0,
    Downspout: 0,
    CornerTrim: 0,
    FasciaTrim: 0,
    StarterStrip: 0,
    Unassigned: 0,
  };

  project.edges.forEach((e) => {
    edgeTotals[e.type] = (edgeTotals[e.type] || 0) + e.lengthFt;
  });

  const totalEdgeLF = Object.values(edgeTotals).reduce((a, b) => a + b, 0);

  const pitches = ['Flat', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '12/12'];

  return (
    <aside className="w-80 md:w-96 bg-cei-slate-850 border-l border-slate-800 flex flex-col h-full select-none z-10 shadow-lg">
      {/* Top Takeoff Executive Summary Widget */}
      <div className="p-4 bg-cei-slate-900 border-b border-slate-800">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-tech font-bold uppercase tracking-wider text-cei-orange flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> Takeoff Real-Time Summary
          </span>
          <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded border border-slate-700">
            {project.productType}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium">TOTAL SQUARES</div>
            <div className="text-xl font-bold font-tech text-slate-100 leading-tight">
              {totalSquares.toFixed(2)} <span className="text-xs text-cei-orange font-sans">SQ</span>
            </div>
            <div className="text-[10px] text-slate-400">1 SQ = 100 SF</div>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded border border-slate-700/60">
            <div className="text-[10px] text-slate-400 font-medium">TRUE SURFACE AREA</div>
            <div className="text-xl font-bold font-tech text-slate-100 leading-tight">
              {Math.round(totalTrueArea).toLocaleString()} <span className="text-xs text-slate-400 font-sans">SF</span>
            </div>
            <div className="text-[10px] text-slate-400">Footprint: {Math.round(totalFootprint).toLocaleString()} SF</div>
          </div>
        </div>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-300 px-1">
          <span>Total Facets: <strong className="text-slate-100">{project.facets.length}</strong></span>
          <span>Perimeter / Edges: <strong className="text-slate-100">{totalEdgeLF.toFixed(1)} LF</strong></span>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex border-b border-slate-800 bg-cei-slate-900 text-xs overflow-x-auto">
        {(['FACETS', 'EDGES', 'WASTE', 'ACCESSORIES', 'INFO'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-2 text-center font-semibold text-[11px] tracking-wide uppercase transition-colors whitespace-nowrap ${
              activeTab === tab
                ? 'text-cei-orange border-b-2 border-cei-orange bg-slate-850'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {tab === 'FACETS' ? `Planes (${project.facets.length})` : tab}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
        {/* 1. FACETS LIST */}
        {activeTab === 'FACETS' && (
          <div className="space-y-2">
            {project.facets.length === 0 ? (
              <div className="text-center py-10 text-slate-500">
                <Layers className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No planes digitized yet.</p>
                <p className="text-[11px] text-slate-600 mt-1">Use Boundary Tool (B) to draw roof facets.</p>
              </div>
            ) : (
              project.facets.map((facet, idx) => (
                <div
                  key={facet.id}
                  className="bg-slate-800/80 border border-slate-700/80 rounded p-2.5 hover:border-slate-600 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-semibold text-slate-200 font-tech text-sm">
                      #{idx + 1} {facet.name}
                    </span>
                    <button
                      onClick={() => onDeleteFacet(facet.id)}
                      className="text-slate-500 hover:text-red-400 p-1"
                      title="Delete Facet"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-300">
                    <div>Footprint: {facet.footprintAreaSqFt.toFixed(1)} SF</div>
                    <div>True Area: <strong className="text-slate-100">{facet.trueAreaSqFt.toFixed(1)} SF</strong></div>
                    <div>Squares: <strong className="text-cei-orange">{facet.squares.toFixed(2)} SQ</strong></div>
                    <div>Structure: {facet.structure}</div>
                  </div>

                  {/* Pitch Selector */}
                  <div className="mt-2 pt-2 border-t border-slate-700/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400">Slope Pitch:</span>
                    <select
                      value={facet.pitch}
                      onChange={(e) => onUpdateFacetPitch(facet.id, e.target.value)}
                      className="bg-slate-900 border border-slate-700 rounded px-2 py-0.5 text-xs text-cei-orange font-mono font-medium focus:outline-none focus:border-cei-orange"
                    >
                      {pitches.map((p) => (
                        <option key={p} value={p}>
                          {p}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* 2. EDGES SCHEDULE */}
        {activeTab === 'EDGES' && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Classified Perimeter Schedule
            </div>
            {(Object.keys(edgeTotals) as EdgeType[])
              .filter((type) => edgeTotals[type] > 0 || type === 'Eave' || type === 'Ridge' || type === 'Valley')
              .map((type) => {
                const conf = EDGE_CONFIGS[type];
                const lf = edgeTotals[type] || 0;
                return (
                  <div
                    key={type}
                    className="flex items-center justify-between p-2 rounded bg-slate-800/60 border border-slate-700/60"
                  >
                    <div className="flex items-center space-x-2">
                      <span
                        className="w-3 h-3 rounded-full flex-shrink-0"
                        style={{ backgroundColor: conf?.color || '#94A3B8' }}
                      />
                      <span className="font-medium text-slate-200">{conf?.label || type}</span>
                    </div>
                    <div className="text-right font-mono">
                      <span className="font-bold text-slate-100">{lf.toFixed(1)}</span>
                      <span className="text-[10px] text-slate-400 ml-1">LF</span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}

        {/* 3. WASTE MATRIX */}
        {activeTab === 'WASTE' && (
          <div className="space-y-2">
            <div className="text-[11px] text-slate-400 mb-1">
              Sliding gross material requirements calculated across standard waste allowances.
            </div>
            <div className="border border-slate-750 rounded overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900 text-slate-400 border-b border-slate-750">
                  <tr>
                    <th className="py-1.5 px-2.5">Waste %</th>
                    <th className="py-1.5 px-2.5 text-right">Gross SQ</th>
                    <th className="py-1.5 px-2.5 text-right">Gross SF</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {wasteTable.map((w) => (
                    <tr
                      key={w.wastePercent}
                      className={w.isRecommended ? 'bg-cei-orange/15 font-semibold text-cei-orange' : 'text-slate-300'}
                    >
                      <td className="py-1.5 px-2.5 flex items-center gap-1">
                        {w.wastePercent}%
                        {w.isRecommended && <span className="text-[9px] bg-cei-orange text-white px-1 rounded">REC</span>}
                      </td>
                      <td className="py-1.5 px-2.5 text-right font-mono">{w.grossSquares.toFixed(2)}</td>
                      <td className="py-1.5 px-2.5 text-right font-mono">{w.grossSqFt.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* 4. ACCESSORIES */}
        {activeTab === 'ACCESSORIES' && (
          <div className="space-y-1.5">
            <div className="text-[11px] font-semibold text-slate-400 mb-2 uppercase tracking-wider">
              Marked Penetrations & Accessories
            </div>
            {project.punchItems.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <p>No accessories marked.</p>
                <p className="text-[11px] text-slate-600 mt-1">Use the Punch Tab in Ribbon to place items.</p>
              </div>
            ) : (
              project.punchItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 rounded bg-slate-800/80 border border-slate-700/80"
                >
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-3.5 h-3.5 text-cei-orange flex-shrink-0" />
                    <span className="text-slate-200">{item.label}</span>
                  </div>
                  <button
                    onClick={() => onDeletePunchItem(item.id)}
                    className="text-slate-500 hover:text-red-400 p-0.5"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}

        {/* 5. PROJECT INFO */}
        {activeTab === 'INFO' && (
          <div className="space-y-2.5 text-[11px] text-slate-300">
            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60 space-y-1">
              <div className="text-slate-400">Project Name:</div>
              <div className="font-semibold text-slate-100">{project.name}</div>
            </div>

            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60 space-y-1">
              <div className="text-slate-400">Site Address:</div>
              <div className="text-slate-100">{project.siteAddress || 'N/A'}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                <div className="text-slate-400">Claim #:</div>
                <div className="font-mono text-slate-100">{project.claimNumber || 'N/A'}</div>
              </div>
              <div className="p-2 bg-slate-800/60 rounded border border-slate-700/60">
                <div className="text-slate-400">Job #:</div>
                <div className="font-mono text-slate-100">{project.jobNumber || 'N/A'}</div>
              </div>
            </div>

            <div className="p-2.5 bg-slate-800/60 rounded border border-slate-700/60 space-y-1">
              <div className="text-slate-400">Adjuster / Client Scope Notes:</div>
              <div className="text-slate-200 text-xs italic">{project.notes || 'No notes provided.'}</div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

