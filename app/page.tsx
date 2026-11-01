'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Header from '../components/Header';
import RibbonToolbar, { ActiveTool } from '../components/RibbonToolbar';
import CadCanvas from '../components/CadCanvas';
import TakeoffSidebar from '../components/TakeoffSidebar';
import ScaleCalibrationModal from '../components/ScaleCalibrationModal';
import NewProjectModal from '../components/NewProjectModal';
import FailSafeModal from '../components/FailSafeModal';
import ReportPreviewModal from '../components/ReportPreviewModal';
import { 
  ProjectData, 
  TakeoffFacet, 
  ClassifiedEdge, 
  EdgeType, 
  PunchItem, 
  PunchItemType, 
  Point, 
  FailSafeError 
} from '../types/takeoff';
import { 
  loadStoredProjects, 
  saveProject, 
  loadProjectsFromComputer, 
  saveProjectToComputer, 
  exportCeiProjectFile, 
  openLocalProjectFile 
} from '../lib/storage';
import { runFailSafeAudit, distance, computeFacetMetrics } from '../lib/cad-math';
import { parseDxfContent } from '../lib/dxf-parser';

export default function CadTakeoffWorkspace() {
  const [projects, setProjects] = useState<ProjectData[]>([]);
  const [currentProject, setCurrentProject] = useState<ProjectData | null>(null);
  const [storagePath, setStoragePath] = useState<string>('');
  const [isUnsaved, setIsUnsaved] = useState(false);

  // Undo / Redo History Stack
  const [undoStack, setUndoStack] = useState<ProjectData[]>([]);
  const [redoStack, setRedoStack] = useState<ProjectData[]>([]);

  // Active Tooling State
  const [activeTool, setActiveTool] = useState<ActiveTool>('SELECT');
  const [activeEdgeType, setActiveEdgeType] = useState<EdgeType>('Eave');
  const [activePitch, setActivePitch] = useState<string>('6/12');
  const [activePunchType, setActivePunchType] = useState<PunchItemType>('PipeBoot');
  const [activeElevation, setActiveElevation] = useState<'North' | 'South' | 'East' | 'West' | 'Overhead'>('Overhead');

  // Canvas View Transform
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 250, y: 120 });
  const [showGrid, setShowGrid] = useState<boolean>(true);
  const [showDimensions, setShowDimensions] = useState<boolean>(true);
  const [orthoSnap, setOrthoSnap] = useState<boolean>(true);

  // Modals
  const [scaleModalOpen, setScaleModalOpen] = useState(false);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [failSafeModalOpen, setFailSafeModalOpen] = useState(false);
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [failSafeErrors, setFailSafeErrors] = useState<FailSafeError[]>([]);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Load initial projects directly from the computer disk
  useEffect(() => {
    async function init() {
      const { projects: loaded, storagePath: dir } = await loadProjectsFromComputer();
      setProjects(loaded);
      if (dir) setStoragePath(dir);
      if (loaded.length > 0) {
        setCurrentProject(loaded[0]);
      }
    }
    init();
  }, []);

  // Push state to undo stack
  const pushState = useCallback((prevProject: ProjectData) => {
    setUndoStack((prev) => [...prev.slice(-25), JSON.parse(JSON.stringify(prevProject))]);
    setRedoStack([]);
    setIsUnsaved(true);
  }, []);

  // Update Facets & Edges
  const handleUpdateFacets = (facets: TakeoffFacet[], edges: ClassifiedEdge[]) => {
    if (!currentProject) return;
    pushState(currentProject);
    setCurrentProject({
      ...currentProject,
      facets,
      edges,
    });
  };

  // Update Punch Items
  const handleUpdatePunchItems = (items: PunchItem[]) => {
    if (!currentProject) return;
    pushState(currentProject);
    setCurrentProject({
      ...currentProject,
      punchItems: items,
    });
  };

  // Update Facet Pitch
  const handleUpdateFacetPitch = (facetId: string, newPitch: string) => {
    if (!currentProject) return;
    pushState(currentProject);
    const updated = currentProject.facets.map((f) => {
      if (f.id === facetId) {
        const metrics = computeFacetMetrics(f.vertices, newPitch);
        return {
          ...f,
          pitch: newPitch,
          ...metrics,
        };
      }
      return f;
    });
    setCurrentProject({
      ...currentProject,
      facets: updated,
    });
  };

  // Delete Facet
  const handleDeleteFacet = (facetId: string) => {
    if (!currentProject) return;
    pushState(currentProject);
    setCurrentProject({
      ...currentProject,
      facets: currentProject.facets.filter((f) => f.id !== facetId),
    });
  };

  // Delete Edge
  const handleDeleteEdge = (edgeId: string) => {
    if (!currentProject) return;
    pushState(currentProject);
    setCurrentProject({
      ...currentProject,
      edges: currentProject.edges.filter((e) => e.id !== edgeId),
    });
  };

  // Delete Punch Item
  const handleDeletePunchItem = (punchId: string) => {
    if (!currentProject) return;
    pushState(currentProject);
    setCurrentProject({
      ...currentProject,
      punchItems: currentProject.punchItems.filter((p) => p.id !== punchId),
    });
  };

  // Scale calibration callback from 2-point canvas click
  const handleTwoPointCalibration = (p1: Point, p2: Point) => {
    if (!currentProject) return;
    const pixelDistance = distance(p1, p2) * (currentProject.scale?.pixelsPerFoot || 12.0);
    const knownFt = 40; // Default known dimension 40 ft
    const calculatedPpf = pixelDistance / knownFt;

    pushState(currentProject);
    setCurrentProject({
      ...currentProject,
      scale: {
        isCalibrated: true,
        pixelsPerFoot: calculatedPpf,
        knownLengthFt: knownFt,
        p1,
        p2,
        scaleLabel: `Calibrated (${calculatedPpf.toFixed(1)} px/ft)`,
      },
    });
    setActiveTool('SELECT');
  };

  // Apply Scale Preset
  const handleApplyScale = (pixelsPerFoot: number, knownLengthFt: number, label: string) => {
    if (!currentProject) return;
    pushState(currentProject);
    setCurrentProject({
      ...currentProject,
      scale: {
        isCalibrated: true,
        pixelsPerFoot,
        knownLengthFt,
        p1: null,
        p2: null,
        scaleLabel: label,
      },
    });
  };

  // Undo Handler
  const handleUndo = () => {
    if (undoStack.length === 0 || !currentProject) return;
    const previous = undoStack[undoStack.length - 1];
    setRedoStack((prev) => [...prev, currentProject]);
    setUndoStack((prev) => prev.slice(0, -1));
    setCurrentProject(previous);
  };

  // Redo Handler
  const handleRedo = () => {
    if (redoStack.length === 0 || !currentProject) return;
    const next = redoStack[redoStack.length - 1];
    setUndoStack((prev) => [...prev, currentProject]);
    setRedoStack((prev) => prev.slice(0, -1));
    setCurrentProject(next);
  };

  // Save Project directly to computer disk
  const handleSave = async () => {
    if (!currentProject) return;
    await saveProjectToComputer(currentProject);
    setIsUnsaved(false);
  };

  // Export standalone project file (.cei.json) to computer
  const handleExportProjectFile = () => {
    if (!currentProject) return;
    exportCeiProjectFile(currentProject);
  };

  // Open local file from computer
  const handleOpenLocalFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const file = e.target.files[0];
        const loaded = await openLocalProjectFile(file);
        await saveProjectToComputer(loaded);
        setProjects((prev) => [loaded, ...prev.filter((p) => p.id !== loaded.id)]);
        setCurrentProject(loaded);
        setUndoStack([]);
        setRedoStack([]);
        setIsUnsaved(false);
      } catch (err) {
        alert('Could not open file. Make sure it is a valid .cei or .json project file.');
      }
    }
  };

  // Import AutoCAD DXF drawing from computer
  const handleImportDxfFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!currentProject || !e.target.files || !e.target.files[0]) return;
    try {
      const file = e.target.files[0];
      const text = await file.text();
      const parsed = parseDxfContent(text);

      if (parsed.lines.length === 0 && parsed.polylines.length === 0) {
        alert('No vector lines or polylines detected in this DXF file.');
        return;
      }

      pushState(currentProject);

      // Convert DXF lines into ClassifiedEdge objects
      const newEdges: ClassifiedEdge[] = [];
      parsed.lines.forEach((l, idx) => {
        const len = distance([l.x1, l.y1], [l.x2, l.y2]);
        newEdges.push({
          id: `dxf-line-${Date.now()}-${idx}`,
          p1: [l.x1, l.y1],
          p2: [l.x2, l.y2],
          type: 'Unassigned',
          lengthFt: Math.round(len * 100) / 100,
        });
      });

      // Convert closed polylines into TakeoffFacet polygons
      const newFacets: TakeoffFacet[] = [...currentProject.facets];
      parsed.polylines.forEach((pl, pIdx) => {
        if (pl.isClosed && pl.vertices.length >= 3) {
          const metrics = computeFacetMetrics(pl.vertices, activePitch);
          newFacets.push({
            id: `dxf-facet-${Date.now()}-${pIdx}`,
            name: `CAD Plane ${newFacets.length + 1}`,
            structure: 'Main Building',
            pitch: activePitch,
            vertices: pl.vertices,
            ...metrics,
          });
        }
        // Also extract edges from polyline
        for (let i = 0; i < pl.vertices.length; i++) {
          if (!pl.isClosed && i === pl.vertices.length - 1) break;
          const p1 = pl.vertices[i];
          const p2 = pl.vertices[(i + 1) % pl.vertices.length];
          newEdges.push({
            id: `dxf-ple-${Date.now()}-${pIdx}-${i}`,
            p1,
            p2,
            type: 'Unassigned',
            lengthFt: Math.round(distance(p1, p2) * 100) / 100,
          });
        }
      });

      const updatedProject: ProjectData = {
        ...currentProject,
        facets: newFacets,
        edges: [...currentProject.edges, ...newEdges],
      };

      setCurrentProject(updatedProject);
      await saveProjectToComputer(updatedProject);
      alert(`Imported ${newEdges.length} edges and ${newFacets.length - currentProject.facets.length} closed planes from ${file.name}!`);
    } catch (err) {
      console.error('DXF import error:', err);
      alert('Failed to parse DXF file.');
    }
  };

  // Run Fail-Safe Audit
  const handleRunFailSafe = () => {
    if (!currentProject) return;
    const errors = runFailSafeAudit(currentProject.facets, currentProject.edges);
    setFailSafeErrors(errors);
    setFailSafeModalOpen(true);
  };

  // Create New Project
  const handleCreateProject = (newProj: ProjectData) => {
    saveProject(newProj);
    setProjects((prev) => [newProj, ...prev]);
    setCurrentProject(newProj);
    setUndoStack([]);
    setRedoStack([]);
    setIsUnsaved(false);
  };

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if typing inside inputs
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleSave();
      } else if (e.key.toLowerCase() === 'b') {
        setActiveTool('DRAW_POLYGON');
      } else if (e.key.toLowerCase() === 's' && !e.ctrlKey) {
        setActiveTool('SPLIT_PLANE');
      } else if (e.key.toLowerCase() === 'r') {
        setActiveEdgeType('Ridge');
        setActiveTool('CLASSIFY_EDGE');
      } else if (e.key.toLowerCase() === 'v') {
        setActiveEdgeType('Valley');
        setActiveTool('CLASSIFY_EDGE');
      } else if (e.key.toLowerCase() === 'e') {
        setActiveEdgeType('Eave');
        setActiveTool('CLASSIFY_EDGE');
      } else if (e.key.toLowerCase() === 'h') {
        setActiveEdgeType('Hip');
        setActiveTool('CLASSIFY_EDGE');
      } else if (e.key.toLowerCase() === 'c') {
        setActiveTool('PUNCH_ITEM');
      } else if (e.key === 'Escape') {
        setActiveTool('SELECT');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });

  if (!currentProject) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-cei-slate-900 text-slate-200">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-2 border-cei-orange border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-tech text-base">Initializing CEI Estimation CAD Workspace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen bg-cei-slate-950 overflow-hidden select-none">
      {/* 1. Executive Top Header */}
      <Header
        currentProject={currentProject}
        allProjects={projects}
        onSelectProject={(p) => {
          setCurrentProject(p);
          setUndoStack([]);
          setRedoStack([]);
          setIsUnsaved(false);
        }}
        onNewProject={() => setNewProjectModalOpen(true)}
        onOpenProjectDialog={() => {
          setNewProjectModalOpen(true);
        }}
        onSave={handleSave}
        onExportProjectFile={handleExportProjectFile}
        onOpenLocalFile={handleOpenLocalFile}
        onImportDxfFile={handleImportDxfFile}
        onVerifyFailSafe={handleRunFailSafe}
        onExportReport={() => setReportModalOpen(true)}
        isUnsaved={isUnsaved}
        activeModeLabel={activeTool.replace(/_/g, ' ')}
        storagePath={storagePath}
      />

      {/* 2. Ribbon Toolbar */}
      <RibbonToolbar
        activeTool={activeTool}
        setActiveTool={setActiveTool}
        activeEdgeType={activeEdgeType}
        setActiveEdgeType={setActiveEdgeType}
        activePitch={activePitch}
        setActivePitch={setActivePitch}
        activePunchType={activePunchType}
        setActivePunchType={setActivePunchType}
        productType={currentProject.productType}
        activeElevation={activeElevation}
        setActiveElevation={setActiveElevation}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={undoStack.length > 0}
        canRedo={redoStack.length > 0}
        onZoomIn={() => setZoomLevel((z) => Math.min(z * 1.25, 8.0))}
        onZoomOut={() => setZoomLevel((z) => Math.max(z * 0.8, 0.2))}
        onZoomExtents={() => {
          setZoomLevel(1.0);
          setPanOffset({ x: 250, y: 120 });
        }}
        showGrid={showGrid}
        setShowGrid={setShowGrid}
        showDimensions={showDimensions}
        setShowDimensions={setShowDimensions}
        orthoSnap={orthoSnap}
        setOrthoSnap={setOrthoSnap}
        onOpenScaleModal={() => setScaleModalOpen(true)}
        onOpenFailSafe={handleRunFailSafe}
        onOpenReport={() => setReportModalOpen(true)}
      />

      {/* 3. Center Workspace: Interactive Canvas + Takeoff Sidebar */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* CAD Canvas Area */}
        <main className="flex-1 h-full relative">
          <CadCanvas
            project={currentProject}
            activeTool={activeTool}
            activeEdgeType={activeEdgeType}
            activePitch={activePitch}
            activePunchType={activePunchType}
            orthoSnap={orthoSnap}
            showGrid={showGrid}
            showDimensions={showDimensions}
            onUpdateFacets={handleUpdateFacets}
            onUpdatePunchItems={handleUpdatePunchItems}
            onUpdateCalibrationPoints={handleTwoPointCalibration}
            zoomLevel={zoomLevel}
            setZoomLevel={setZoomLevel}
            panOffset={panOffset}
            setPanOffset={setPanOffset}
            canvasRef={canvasRef}
          />
        </main>

        {/* Right Takeoff Real-Time Sidebar */}
        <TakeoffSidebar
          project={currentProject}
          onUpdateFacetPitch={handleUpdateFacetPitch}
          onDeleteFacet={handleDeleteFacet}
          onDeleteEdge={handleDeleteEdge}
          onDeletePunchItem={handleDeletePunchItem}
        />
      </div>

      {/* MODALS */}
      <ScaleCalibrationModal
        isOpen={scaleModalOpen}
        onClose={() => setScaleModalOpen(false)}
        currentScale={currentProject.scale}
        onApplyScale={handleApplyScale}
        onStartTwoPointClick={() => setActiveTool('CALIBRATE_SCALE')}
      />

      <NewProjectModal
        isOpen={newProjectModalOpen}
        onClose={() => setNewProjectModalOpen(false)}
        onCreateProject={handleCreateProject}
      />

      <FailSafeModal
        isOpen={failSafeModalOpen}
        onClose={() => setFailSafeModalOpen(false)}
        errors={failSafeErrors}
      />

      <ReportPreviewModal
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
        project={currentProject}
        canvasRef={canvasRef}
      />
    </div>
  );
}

