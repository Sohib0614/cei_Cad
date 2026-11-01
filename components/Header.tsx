'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { ProjectData } from '../types/takeoff';
import { 
  FolderOpen, 
  PlusCircle, 
  Save, 
  ShieldCheck, 
  FileText, 
  Clock, 
  Play, 
  Pause, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown
} from 'lucide-react';

interface HeaderProps {
  currentProject: ProjectData;
  allProjects: ProjectData[];
  onSelectProject: (proj: ProjectData) => void;
  onNewProject: () => void;
  onOpenProjectDialog: () => void;
  onSave: () => void;
  onExportProjectFile: () => void;
  onOpenLocalFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onImportDxfFile?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onVerifyFailSafe: () => void;
  onExportReport: () => void;
  isUnsaved: boolean;
  activeModeLabel: string;
  storagePath?: string;
}

export default function Header({
  currentProject,
  allProjects,
  onSelectProject,
  onNewProject,
  onOpenProjectDialog,
  onSave,
  onExportProjectFile,
  onOpenLocalFile,
  onImportDxfFile,
  onVerifyFailSafe,
  onExportReport,
  isUnsaved,
  activeModeLabel,
  storagePath,
}: HeaderProps) {
  const [techTimer, setTechTimer] = useState(currentProject.techTimeSeconds || 0);
  const [timerRunning, setTimerRunning] = useState(true);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const handleOpenFileClick = () => {
    if (typeof window === 'undefined') return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.cei';
    input.onchange = (e) => onOpenLocalFile(e as any);
    input.click();
  };

  const handleOpenDxfClick = () => {
    if (typeof window === 'undefined' || !onImportDxfFile) return;
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.dxf';
    input.onchange = (e) => onImportDxfFile(e as any);
    input.click();
  };

  useEffect(() => {
    setTechTimer(currentProject.techTimeSeconds || 0);
  }, [currentProject.id]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning) {
      interval = setInterval(() => {
        setTechTimer((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    const remMins = mins % 60;
    if (hrs > 0) {
      return `${hrs}h ${remMins.toString().padStart(2, '0')}m`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <header className="h-14 bg-cei-slate-900 border-b border-slate-800 flex items-center justify-between px-4 z-30 select-none shadow-md">
      {/* Left: Brand Logo & Title */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2.5">
          <div className="relative w-9 h-9 rounded bg-white/5 p-1 border border-slate-700/50 flex items-center justify-center">
            <Image
              src="/branding/logo.png"
              alt="CEI Logo"
              width={32}
              height={32}
              className="object-contain"
              priority
            />
          </div>
          <div>
            <div className="font-tech text-lg font-bold tracking-wider text-slate-100 flex items-center gap-1.5 leading-none">
              CEI ESTIMATION <span className="text-cei-orange font-semibold text-xs px-1.5 py-0.5 rounded bg-cei-orange/15 border border-cei-orange/30">CAD TAKEOFF</span>
            </div>
            <div className="text-[10px] text-slate-400 font-mono tracking-tight leading-none mt-1">
              PRO ESTIMATING SUITE v3.0
            </div>
          </div>
        </div>

        {/* Vertical Divider */}
        <div className="h-7 w-px bg-slate-800" />

        {/* Project Selector */}
        <div className="relative">
          <button
            onClick={() => setShowProjectDropdown(!showProjectDropdown)}
            className="flex items-center space-x-2 bg-slate-800/80 hover:bg-slate-750 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 transition-colors"
          >
            <span className="font-medium max-w-[200px] truncate text-slate-100">
              {currentProject.name}
            </span>
            <span className="text-[10px] text-cei-orange font-mono bg-cei-orange/10 px-1 rounded">
              {currentProject.productType}
            </span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </button>

          {showProjectDropdown && (
            <div className="absolute top-full left-0 mt-1 w-72 bg-cei-slate-850 border border-slate-700 rounded-lg shadow-2xl py-1 z-50">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-700/60 flex items-center justify-between">
                <span>Computer Projects</span>
                <span className="text-[9px] text-emerald-400 font-mono lowercase">no database required</span>
              </div>
              {storagePath && (
                <div className="px-3 py-1 bg-slate-900 text-[10px] text-slate-400 font-mono truncate border-b border-slate-800">
                  📁 {storagePath}
                </div>
              )}
              <div className="max-h-60 overflow-y-auto">
                {allProjects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj);
                      setShowProjectDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-slate-700/60 transition-colors flex items-center justify-between ${
                      proj.id === currentProject.id ? 'bg-cei-orange/10 text-cei-orange font-medium' : 'text-slate-200'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="truncate">{proj.name}</div>
                      <div className="text-[10px] text-slate-400">{proj.siteAddress || 'No address'}</div>
                    </div>
                    <span className="text-[10px] font-mono px-1 py-0.5 rounded bg-slate-800 text-slate-300">
                      {proj.productType}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Mode Pill */}
        <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/50 border border-slate-700/60 rounded text-[11px]">
          <span className="w-2 h-2 rounded-full bg-cei-orange animate-pulse" />
          <span className="text-slate-400">Mode:</span>
          <span className="font-semibold text-slate-200">{activeModeLabel}</span>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-2.5">
        {/* Active Timer */}
        <div className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 bg-slate-800/80 border border-slate-700 rounded text-xs">
          <Clock className="w-3.5 h-3.5 text-cei-orange" />
          <span className="text-slate-400 font-mono text-[11px]">Tech:</span>
          <span className="font-mono font-medium text-slate-100">{formatTimer(techTimer)}</span>
          <button 
            onClick={() => setTimerRunning(!timerRunning)} 
            className="text-slate-400 hover:text-slate-200 ml-1 p-0.5"
            title={timerRunning ? 'Pause drafting timer' : 'Resume drafting timer'}
          >
            {timerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 text-emerald-400" />}
          </button>
        </div>

        {/* Save Status */}
        <button
          onClick={onSave}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs border transition-colors ${
            isUnsaved
              ? 'bg-amber-500/15 border-amber-500/40 text-amber-300 hover:bg-amber-500/25'
              : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-750'
          }`}
          title="Save project changes (Ctrl+S)"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{isUnsaved ? 'Save*' : 'Saved'}</span>
        </button>

        {/* New & Open */}
        <button
          onClick={onNewProject}
          className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors"
        >
          <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">New</span>
        </button>

        <button
          onClick={handleOpenFileClick}
          className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors"
          title="Open .cei / .json takeoff project file from your computer"
        >
          <FolderOpen className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Open File</span>
        </button>

        {/* Import DXF CAD Blueprint */}
        <button
          onClick={handleOpenDxfClick}
          className="flex items-center space-x-1 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 transition-colors"
          title="Import AutoCAD .dxf blueprint and extract vectors directly into project"
        >
          <span className="font-mono text-amber-400 font-bold text-[10px]">DXF</span>
          <span className="hidden sm:inline">Import CAD</span>
        </button>

        {/* Export Standalone .cei File */}
        <button
          onClick={onExportProjectFile}
          className="hidden xl:flex items-center space-x-1 px-2 py-1 rounded text-[11px] bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 transition-colors"
          title="Export project file to computer disk (.cei.json)"
        >
          <span>Export .cei</span>
        </button>

        {/* Verify Fail-Safe */}
        <button
          onClick={onVerifyFailSafe}
          className="flex items-center space-x-1.5 px-2.5 py-1 rounded text-xs bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors"
          title="Audit takeoff geometry for open loops, zero slopes, or negative values"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span className="hidden sm:inline">Fail-Safe Audit</span>
        </button>

        {/* Export Report (CEI Orange primary button) */}
        <button
          onClick={onExportReport}
          className="flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-semibold bg-cei-orange hover:bg-cei-orange-hover text-white transition-all shadow-cei-glow"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Export Report</span>
        </button>
      </div>
    </header>
  );
}

