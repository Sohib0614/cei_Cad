// CEI Estimation LLC - Enterprise Multi-Page Takeoff PDF Report Generator

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProjectData, EDGE_CONFIGS, EdgeType } from '../types/takeoff';
import { generateWasteTable, parsePitch } from './cad-math';

export async function generateCeiPdfReport(
  project: ProjectData,
  canvasElement?: HTMLCanvasElement | null
): Promise<jsPDF> {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: 'letter', // 612 x 792 pt
  });

  const primaryOrange = [221, 132, 39]; // #DD8427
  const darkSlate = [10, 17, 40];      // #0A1128
  const lightGray = [248, 250, 252];   // #F8FAFC
  const borderGray = [226, 232, 240];  // #E2E8F0

  const totalFootprint = project.facets.reduce((acc, f) => acc + f.footprintAreaSqFt, 0);
  const totalTrueArea = project.facets.reduce((acc, f) => acc + f.trueAreaSqFt, 0);
  const totalSquares = project.facets.reduce((acc, f) => acc + f.squares, 0);
  const wasteTable = generateWasteTable(totalSquares, totalTrueArea);

  // ==========================================
  // PAGE 1: COVER & EXECUTIVE TAKEOFF SUMMARY
  // ==========================================

  // Header Banner with CEI Orange & Dark Slate
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(0, 0, 612, 100, 'F');

  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, 96, 612, 6, 'F');

  // Company Brand Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('CEI ESTIMATION LLC', 40, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text('PRECISION CAD TAKEOFF & ARCHITECTURAL ESTIMATION REPORT', 40, 68);

  doc.setTextColor(148, 163, 184);
  doc.setFontSize(8);
  doc.text('www.ceiestimation.com | Commercial & Residential Building Measurement', 40, 82);

  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text(`DATE: ${new Date().toLocaleDateString()}`, 470, 48);
  doc.text(`REPORT ID: CEI-${project.claimNumber || project.id.slice(0, 8)}`, 470, 64);
  doc.text(`TRADE: ${project.productType.toUpperCase()}`, 470, 80);

  // Project Details Card
  let curY = 125;
  doc.setFillColor(lightGray[0], lightGray[1], lightGray[2]);
  doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
  doc.roundedRect(40, curY, 532, 115, 6, 6, 'FD');

  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text(project.name, 55, curY + 24);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);

  const leftX = 55;
  const rightX = 320;
  let infoY = curY + 45;

  doc.text(`Site Address: ${project.siteAddress || 'N/A'}`, leftX, infoY);
  doc.text(`Claim Number: ${project.claimNumber || 'N/A'}`, rightX, infoY);

  infoY += 16;
  doc.text(`Job Number: ${project.jobNumber || 'N/A'}`, leftX, infoY);
  doc.text(`Date of Loss: ${project.dateOfLoss || 'N/A'}`, rightX, infoY);

  infoY += 16;
  doc.text(`Primary Pitch: ${project.primaryPitch || '6/12'}`, leftX, infoY);
  doc.text(`Due Date: ${project.dueDate || 'N/A'}`, rightX, infoY);

  infoY += 16;
  doc.text(`Scale: ${project.scale?.scaleLabel || '1" = 10\''}`, leftX, infoY);
  doc.text(`Technician / QC Time: ${Math.round(project.techTimeSeconds / 60)}m / ${Math.round(project.qcTimeSeconds / 60)}m`, rightX, infoY);

  // Executive Metric Cards (4 boxes)
  curY += 135;
  const boxWidth = 125;
  const boxHeight = 65;
  const gap = (532 - boxWidth * 4) / 3;

  const metrics = [
    { label: 'TOTAL SQUARES', val: `${totalSquares.toFixed(2)} SQ`, sub: '1 SQ = 100 SF' },
    { label: 'TRUE SURFACE AREA', val: `${Math.round(totalTrueArea).toLocaleString()} SF`, sub: 'Pitch Adjusted' },
    { label: '2D FOOTPRINT', val: `${Math.round(totalFootprint).toLocaleString()} SF`, sub: 'Plan View' },
    { label: 'TOTAL FACETS', val: `${project.facets.length}`, sub: `${new Set(project.facets.map(f => f.structure)).size} Structure(s)` },
  ];

  metrics.forEach((m, idx) => {
    const x = 40 + idx * (boxWidth + gap);
    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.setLineWidth(1);
    doc.roundedRect(x, curY, boxWidth, boxHeight, 4, 4, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
    doc.text(m.label, x + 10, curY + 18);

    doc.setFontSize(14);
    doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
    doc.text(m.val, x + 10, curY + 40);

    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.setFont('helvetica', 'normal');
    doc.text(m.sub, x + 10, curY + 54);
  });

  // Section Header: Waste Factor Table
  curY += 85;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('CEI ESTIMATION STANDARD WASTE FACTOR MATRIX', 40, curY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('Gross material square requirements across standard waste allowances (4% through 15%). Recommended benchmark: 10%.', 40, curY + 12);

  // Waste Matrix Table
  curY += 20;
  const wasteHeaders = wasteTable.map((w) => `${w.wastePercent}%`);
  const wasteRowSquares = wasteTable.map((w) => `${w.grossSquares.toFixed(2)}`);
  const wasteRowSqFt = wasteTable.map((w) => `${w.grossSqFt.toLocaleString()}`);

  autoTable(doc, {
    startY: curY,
    margin: { left: 40, right: 40 },
    head: [['Allowance', ...wasteHeaders]],
    body: [
      ['Gross Squares (SQ)', ...wasteRowSquares],
      ['Gross Area (Sq Ft)', ...wasteRowSqFt],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: [10, 17, 40],
      textColor: [255, 255, 255],
      fontSize: 8,
      halign: 'center',
    },
    styles: {
      fontSize: 8,
      halign: 'center',
      cellPadding: 6,
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold', fillColor: [248, 250, 252] },
      7: { fontStyle: 'bold', textColor: [221, 132, 39], fillColor: [255, 247, 237] }, // 10% Recommended
    },
  });

  // Footer Page 1
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('CEI Estimation LLC — Confidential Client Deliverable — Page 1 of 3', 40, 770);

  // ==========================================
  // PAGE 2: DETAILED QUANTITIES & EDGE BREAKDOWN
  // ==========================================
  doc.addPage();

  // Header Banner Page 2
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(0, 0, 612, 50, 'F');
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, 48, 612, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CEI ESTIMATION LLC — TAKEOFF QUANTITY SCHEDULE', 40, 32);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text(`PROJECT: ${project.name}`, 360, 32);

  // Edge Quantities Aggregation
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

  const activeEdgeRows = (Object.keys(edgeTotals) as EdgeType[])
    .filter((k) => edgeTotals[k] > 0)
    .map((k) => [
      EDGE_CONFIGS[k]?.label || k,
      `${edgeTotals[k].toFixed(2)} LF`,
      `${(edgeTotals[k] * 12).toFixed(0)} IN`,
      EDGE_CONFIGS[k]?.color || '#000000',
    ]);

  // Table 1: Edge Classification Summary
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('1. LINEAR EDGE & PERIMETER BREAKDOWN', 40, 75);

  autoTable(doc, {
    startY: 85,
    margin: { left: 40, right: 40 },
    head: [['Edge Classification', 'Linear Feet (LF)', 'Inches (IN)', 'Drawing Color Tag']],
    body: activeEdgeRows.length > 0 ? activeEdgeRows : [['No edges classified', '0 LF', '0 IN', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: [10, 17, 40],
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 5 },
  });

  // Table 2: Plane / Facet Detail
  const lastTable = (doc as any).lastAutoTable;
  let nextY = (lastTable ? lastTable.finalY : 200) + 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('2. INDIVIDUAL FACETS & ROOF PLANES SCHEDULE', 40, nextY);

  const facetRows = project.facets.map((f, i) => [
    `#${i + 1} - ${f.name}`,
    f.structure,
    f.pitch,
    `${f.footprintAreaSqFt.toFixed(1)} SF`,
    `${f.trueAreaSqFt.toFixed(1)} SF`,
    `${f.squares.toFixed(2)} SQ`,
  ]);

  autoTable(doc, {
    startY: nextY + 10,
    margin: { left: 40, right: 40 },
    head: [['Facet Identifier', 'Structure', 'Pitch', 'Footprint Area', 'True Area', 'Squares']],
    body: facetRows,
    theme: 'striped',
    headStyles: {
      fillColor: [221, 132, 39], // CEI Orange
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 5 },
  });

  // Table 3: Punch Items / Accessories
  const lastFacetTable = (doc as any).lastAutoTable;
  const punchY = (lastFacetTable ? lastFacetTable.finalY : 400) + 25;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('3. ACCESSORIES, PENETRATIONS & PUNCH ITEMS', 40, punchY);

  const punchCounts: Record<string, number> = {};
  project.punchItems.forEach((p) => {
    punchCounts[p.label] = (punchCounts[p.label] || 0) + 1;
  });

  const punchRows = Object.entries(punchCounts).map(([label, count]) => [label, `${count} EA`]);

  autoTable(doc, {
    startY: punchY + 10,
    margin: { left: 40, right: 40 },
    head: [['Item Description', 'Count (Quantity)']],
    body: punchRows.length > 0 ? punchRows : [['No accessories marked', '0 EA']],
    theme: 'plain',
    headStyles: {
      fillColor: [10, 17, 40],
      textColor: [255, 255, 255],
      fontSize: 8,
    },
    styles: { fontSize: 8, cellPadding: 5 },
  });

  // Footer Page 2
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('CEI Estimation LLC — Confidential Client Deliverable — Page 2 of 3', 40, 770);

  // ==========================================
  // PAGE 3: ANNOTATED BLUEPRINT TAKEOFF SHEET
  // ==========================================
  doc.addPage();

  // Header Banner Page 3
  doc.setFillColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.rect(0, 0, 612, 50, 'F');
  doc.setFillColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.rect(0, 48, 612, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('CEI ESTIMATION LLC — ANNOTATED TAKEOFF DRAWING SHEET', 40, 32);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text(`SCALE: ${project.scale?.scaleLabel || 'Calibrated Vector Scale'}`, 430, 32);

  // Render Canvas Blueprint Snapshot if provided
  if (canvasElement) {
    try {
      const dataUrl = canvasElement.toDataURL('image/png', 1.0);
      doc.addImage(dataUrl, 'PNG', 40, 70, 532, 500);
      doc.setDrawColor(borderGray[0], borderGray[1], borderGray[2]);
      doc.rect(40, 70, 532, 500);
    } catch (err) {
      console.warn('Canvas snapshot capture error:', err);
    }
  } else {
    doc.setFillColor(248, 250, 252);
    doc.rect(40, 70, 532, 500, 'FD');
    doc.setFontSize(12);
    doc.setTextColor(100, 116, 139);
    doc.text('Annotated Drawing Vector Space', 210, 320);
  }

  // Edge Legend Key below drawing sheet
  let legendY = 590;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(darkSlate[0], darkSlate[1], darkSlate[2]);
  doc.text('DRAWING EDGE CLASSIFICATION LEGEND:', 40, legendY);

  const legendItems: EdgeType[] = ['Eave', 'Ridge', 'Hip', 'Valley', 'Rake', 'StepFlashing', 'HeadwallFlashing', 'Gutter'];
  legendItems.forEach((k, idx) => {
    const col = idx % 4;
    const row = Math.floor(idx / 4);
    const lx = 40 + col * 135;
    const ly = legendY + 15 + row * 20;

    const hex = EDGE_CONFIGS[k].color;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    doc.setFillColor(r, g, b);
    doc.rect(lx, ly - 7, 16, 4, 'F');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`${EDGE_CONFIGS[k].label} (${edgeTotals[k]?.toFixed(0) || 0} LF)`, lx + 22, ly - 3);
  });

  // Compass Rose / North Indicator
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(primaryOrange[0], primaryOrange[1], primaryOrange[2]);
  doc.text(`TRUE NORTH: ${project.whichNorthAngleDeg}°`, 470, 730);

  // Footer Page 3
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.setFont('helvetica', 'normal');
  doc.text('CEI Estimation LLC — Confidential Client Deliverable — Page 3 of 3', 40, 770);

  return doc;
}

export function downloadCeiPdf(doc: jsPDF, filename: string): void {
  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}

