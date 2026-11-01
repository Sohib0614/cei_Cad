'use client';

import React, { useState } from 'react';
import { ProjectData, EDGE_CONFIGS, EdgeType } from '../types/takeoff';
import { generateWasteTable } from '../lib/cad-math';
import { generateCeiPdfReport, downloadCeiPdf } from '../lib/pdf-report-generator';
import { X, Download, Printer, FileSpreadsheet, Check, Share2, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ReportPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: ProjectData;
  canvasRef: React.RefObject<HTMLCanvasElement>;
}

export default function ReportPreviewModal({
  isOpen,
  onClose,
  project,
  canvasRef,
}: ReportPreviewModalProps) {
  const [activePage, setActivePage] = useState<1 | 2 | 3>(1);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const totalFootprint = project.facets.reduce((acc, f) => acc + f.footprintAreaSqFt, 0);
  const totalTrueArea = project.facets.reduce((acc, f) => acc + f.trueAreaSqFt, 0);
  const totalSquares = project.facets.reduce((acc, f) => acc + f.squares, 0);
  const wasteTable = generateWasteTable(totalSquares, totalTrueArea);

  // Edge totals
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

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      const doc = await generateCeiPdfReport(project, canvasRef.current);
      downloadCeiPdf(doc, `CEI_Takeoff_Report_${project.claimNumber || project.id}`);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.8 },
      });
    } catch (err) {
      console.error('PDF Generation failed:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportCsv = () => {
    const headers = ['Category', 'Code', 'Item Description', 'Quantity', 'Unit'];
    const rows: string[][] = [];

    // Squares
    rows.push(['Roofing', 'RFG-SQ', 'True Surface Shingle Area', totalSquares.toFixed(2), 'SQ']);
    rows.push(['Roofing', 'RFG-SF', 'Total Net Area', Math.round(totalTrueArea).toString(), 'SF']);

    // Edges
    (Object.keys(edgeTotals) as EdgeType[]).forEach((type) => {
      if (edgeTotals[type] > 0) {
        rows.push(['Perimeter', `EDGE-${type.toUpperCase()}`, EDGE_CONFIGS[type]?.label || type, edgeTotals[type].toFixed(2), 'LF']);
      }
    });

    // Accessories
    const punchCounts: Record<string, number> = {};
    project.punchItems.forEach((p) => {
      punchCounts[p.label] = (punchCounts[p.label] || 0) + 1;
    });
    Object.entries(punchCounts).forEach(([label, count]) => {
      rows.push(['Accessories', 'PUNCH-ITEM', label, count.toString(), 'EA']);
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.map((val) => `"${val}"`).join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CEI_Takeoff_Xactimate_${project.claimNumber || project.id}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-cei-slate-850 border border-slate-700 rounded-lg max-w-4xl w-full h-[90vh] shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-3.5 border-b border-slate-750 flex items-center justify-between bg-cei-slate-900">
          <div>
            <h3 className="font-tech text-lg font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
              Official CEI Estimation LLC Report Deliverable
            </h3>
            <p className="text-[11px] text-slate-400">
              Multi-page client takeoff documentation, schedules & certified drawings
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleExportCsv}
              className="flex items-center space-x-1 px-3 py-1.5 rounded text-xs bg-slate-850 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export CSV (Xactimate)</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating}
              className="flex items-center space-x-1.5 px-4 py-1.5 rounded text-xs font-semibold bg-cei-orange hover:bg-cei-orange-hover text-white transition-all shadow-cei-glow"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGenerating ? 'Generating...' : 'Download PDF Report'}</span>
            </button>

            <button onClick={onClose} className="text-slate-400 hover:text-slate-200 ml-2">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Page Switcher */}
        <div className="flex items-center justify-center space-x-2 py-2 bg-slate-900 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActivePage(1)}
            className={`px-3 py-1 rounded transition-colors ${
              activePage === 1 ? 'bg-cei-orange text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Page 1: Executive Summary & Waste Matrix
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setActivePage(2)}
            className={`px-3 py-1 rounded transition-colors ${
              activePage === 2 ? 'bg-cei-orange text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Page 2: Line Items & Facets Schedule
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => setActivePage(3)}
            className={`px-3 py-1 rounded transition-colors ${
              activePage === 3 ? 'bg-cei-orange text-white font-semibold' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Page 3: Annotated Blueprint Sheet
          </button>
        </div>

        {/* Preview Scrollable Canvas / Sheet Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-950 flex justify-center">
          <div className="w-[612px] min-h-[792px] bg-white text-slate-900 p-8 shadow-2xl rounded flex flex-col justify-between text-xs font-sans">
            {/* PAGE 1 PREVIEW */}
            {activePage === 1 && (
              <div className="space-y-6">
                {/* Header */}
                <div className="border-b-4 border-cei-orange pb-4 flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold font-tech text-slate-900 tracking-wider">
                      CEI ESTIMATION LLC
                    </h1>
                    <div className="text-xs text-cei-orange font-semibold tracking-wide">
                      PRECISION CAD TAKEOFF & ARCHITECTURAL ESTIMATION REPORT
                    </div>
                    <div className="text-[10px] text-slate-500 mt-1">
                      www.ceiestimation.com | Commercial & Residential Building Takeoff
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600 space-y-0.5">
                    <div>Date: <strong>{new Date().toLocaleDateString()}</strong></div>
                    <div>Report ID: <strong>CEI-{project.claimNumber || '101'}</strong></div>
                    <div>Trade: <strong className="text-cei-orange">{project.productType}</strong></div>
                  </div>
                </div>

                {/* Project Details Box */}
                <div className="bg-slate-50 border border-slate-200 rounded p-4 text-[11px] space-y-2">
                  <div className="font-bold text-sm text-slate-800">{project.name}</div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-600">
                    <div>Address: <strong>{project.siteAddress || 'N/A'}</strong></div>
                    <div>Claim Number: <strong>{project.claimNumber || 'N/A'}</strong></div>
                    <div>Job Number: <strong>{project.jobNumber || 'N/A'}</strong></div>
                    <div>Date of Loss: <strong>{project.dateOfLoss || 'N/A'}</strong></div>
                    <div>Primary Pitch: <strong>{project.primaryPitch}</strong></div>
                    <div>Due Date: <strong>{project.dueDate || 'N/A'}</strong></div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-4 gap-2">
                  <div className="p-3 border border-slate-200 rounded bg-slate-50 text-center">
                    <div className="text-[10px] text-slate-500 font-semibold">TOTAL SQUARES</div>
                    <div className="text-lg font-bold text-cei-orange font-tech">{totalSquares.toFixed(2)} SQ</div>
                    <div className="text-[9px] text-slate-400">1 SQ = 100 SF</div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded bg-slate-50 text-center">
                    <div className="text-[10px] text-slate-500 font-semibold">TRUE SURFACE</div>
                    <div className="text-lg font-bold text-slate-800 font-tech">{Math.round(totalTrueArea).toLocaleString()} SF</div>
                    <div className="text-[9px] text-slate-400">Slope Adjusted</div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded bg-slate-50 text-center">
                    <div className="text-[10px] text-slate-500 font-semibold">2D FOOTPRINT</div>
                    <div className="text-lg font-bold text-slate-800 font-tech">{Math.round(totalFootprint).toLocaleString()} SF</div>
                    <div className="text-[9px] text-slate-400">Plan Projection</div>
                  </div>
                  <div className="p-3 border border-slate-200 rounded bg-slate-50 text-center">
                    <div className="text-[10px] text-slate-500 font-semibold">TOTAL FACETS</div>
                    <div className="text-lg font-bold text-slate-800 font-tech">{project.facets.length}</div>
                    <div className="text-[9px] text-slate-400">Digitized Planes</div>
                  </div>
                </div>

                {/* Waste Table */}
                <div>
                  <div className="font-bold text-xs uppercase tracking-wide text-slate-800 mb-1">
                    CEI Estimation Standard Waste Factor Matrix
                  </div>
                  <div className="text-[10px] text-slate-500 mb-2">
                    Gross square requirements across standard waste allowances. 10% recommended.
                  </div>

                  <div className="border border-slate-300 rounded overflow-hidden text-[10px]">
                    <table className="w-full text-center">
                      <thead className="bg-slate-800 text-white font-medium">
                        <tr>
                          <th className="py-1 px-2 text-left">Factor</th>
                          {wasteTable.map((w) => (
                            <th key={w.wastePercent} className="py-1 px-1">
                              {w.wastePercent}%
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        <tr>
                          <td className="py-1.5 px-2 text-left font-bold bg-slate-50">Gross SQ</td>
                          {wasteTable.map((w) => (
                            <td key={w.wastePercent} className={`py-1.5 px-1 font-mono ${w.isRecommended ? 'bg-orange-50 font-bold text-cei-orange' : ''}`}>
                              {w.grossSquares.toFixed(1)}
                            </td>
                          ))}
                        </tr>
                        <tr>
                          <td className="py-1.5 px-2 text-left font-bold bg-slate-50">Gross SF</td>
                          {wasteTable.map((w) => (
                            <td key={w.wastePercent} className={`py-1.5 px-1 font-mono ${w.isRecommended ? 'bg-orange-50 font-bold text-cei-orange' : ''}`}>
                              {w.grossSqFt.toLocaleString()}
                            </td>
                          ))}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-10 border-t border-slate-200 flex justify-between">
                  <span>CEI Estimation LLC — Confidential Client Deliverable</span>
                  <span>Page 1 of 3</span>
                </div>
              </div>
            )}

            {/* PAGE 2 PREVIEW */}
            {activePage === 2 && (
              <div className="space-y-6">
                <div className="border-b-2 border-cei-orange pb-2 flex justify-between items-center">
                  <div className="font-tech text-base font-bold text-slate-900">
                    CEI ESTIMATION LLC — TAKEOFF QUANTITY SCHEDULE
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Page 2 of 3</div>
                </div>

                {/* Edges Table */}
                <div>
                  <div className="font-bold text-xs uppercase text-slate-800 mb-1.5">
                    1. Linear Edge & Perimeter Breakdown
                  </div>
                  <table className="w-full text-[11px] border border-slate-200">
                    <thead className="bg-slate-800 text-white">
                      <tr>
                        <th className="p-1.5 text-left">Classification</th>
                        <th className="p-1.5 text-right">Linear Feet (LF)</th>
                        <th className="p-1.5 text-right">Inches (IN)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {(Object.keys(edgeTotals) as EdgeType[])
                        .filter((t) => edgeTotals[t] > 0)
                        .map((t) => (
                          <tr key={t}>
                            <td className="p-1.5 flex items-center gap-1.5">
                              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: EDGE_CONFIGS[t]?.color }} />
                              {EDGE_CONFIGS[t]?.label || t}
                            </td>
                            <td className="p-1.5 text-right font-mono font-semibold">{edgeTotals[t].toFixed(1)} LF</td>
                            <td className="p-1.5 text-right font-mono text-slate-500">{(edgeTotals[t] * 12).toFixed(0)} IN</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>

                {/* Facets Table */}
                <div>
                  <div className="font-bold text-xs uppercase text-slate-800 mb-1.5">
                    2. Roof Planes & Facets Schedule
                  </div>
                  <table className="w-full text-[10px] border border-slate-200">
                    <thead className="bg-cei-orange text-white">
                      <tr>
                        <th className="p-1 text-left">Plane Name</th>
                        <th className="p-1 text-center">Pitch</th>
                        <th className="p-1 text-right">Footprint</th>
                        <th className="p-1 text-right">True Area</th>
                        <th className="p-1 text-right">Squares</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {project.facets.map((f, i) => (
                        <tr key={f.id}>
                          <td className="p-1 font-medium">{f.name}</td>
                          <td className="p-1 text-center font-mono">{f.pitch}</td>
                          <td className="p-1 text-right font-mono">{f.footprintAreaSqFt.toFixed(1)} SF</td>
                          <td className="p-1 text-right font-mono font-semibold">{f.trueAreaSqFt.toFixed(1)} SF</td>
                          <td className="p-1 text-right font-mono font-bold text-cei-orange">{f.squares.toFixed(2)} SQ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="text-[10px] text-slate-400 pt-10 border-t border-slate-200 flex justify-between">
                  <span>CEI Estimation LLC — Confidential Client Deliverable</span>
                  <span>Page 2 of 3</span>
                </div>
              </div>
            )}

            {/* PAGE 3 PREVIEW */}
            {activePage === 3 && (
              <div className="space-y-4">
                <div className="border-b-2 border-cei-orange pb-2 flex justify-between items-center">
                  <div className="font-tech text-base font-bold text-slate-900">
                    CEI ESTIMATION LLC — ANNOTATED TAKEOFF DRAWING SHEET
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">Scale: {project.scale?.scaleLabel}</div>
                </div>

                <div className="border border-slate-300 rounded h-[500px] bg-slate-900 flex items-center justify-center relative overflow-hidden">
                  <div className="text-center text-slate-400 text-xs">
                    <div className="text-slate-300 font-semibold mb-1">Vector Blueprint Drawing Sheet Active</div>
                    <div>High-resolution vector takeoff diagram with scale bar and edge classification.</div>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 pt-4 border-t border-slate-200 flex justify-between">
                  <span>CEI Estimation LLC — Confidential Client Deliverable</span>
                  <span>Page 3 of 3</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

