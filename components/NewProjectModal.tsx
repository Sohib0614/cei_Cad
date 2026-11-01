'use client';

import React, { useState } from 'react';
import { ProjectData, ProductType } from '../types/takeoff';
import { X, Plus, Upload, Building2, Calendar, FileText } from 'lucide-react';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateProject: (proj: ProjectData) => void;
}

export default function NewProjectModal({
  isOpen,
  onClose,
  onCreateProject,
}: NewProjectModalProps) {
  const [name, setName] = useState('');
  const [claimNumber, setClaimNumber] = useState('');
  const [jobNumber, setJobNumber] = useState('');
  const [siteAddress, setSiteAddress] = useState('');
  const [dateOfLoss, setDateOfLoss] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [productType, setProductType] = useState<ProductType>('Roofing');
  const [primaryPitch, setPrimaryPitch] = useState('6/12');
  const [notes, setNotes] = useState('');
  const [planFileName, setPlanFileName] = useState('');

  if (!isOpen) return null;

  const productTypes: { type: ProductType; label: string; desc: string }[] = [
    { type: 'Roofing', label: 'Roofing', desc: 'Slopes, Squares, Eaves, Ridges, Hips, Valleys' },
    { type: 'RoofScopeX', label: 'RoofScopeX', desc: 'Fast Aerial / Blueprint Area & Pitch Takeoff' },
    { type: 'Siding', label: 'Siding & Cladding', desc: 'Elevation Walls, Lap, Shake, Openings & Trim' },
    { type: 'Gutter', label: 'Gutters & Downspouts', desc: 'Eave Gutters, Drops, Endcaps, Corners, Elbows' },
    { type: 'RoofingGutter', label: 'Roof + Gutter Combo', desc: 'Integrated Dual-Trade Takeoff & Schedule' },
    { type: 'Concrete', label: 'Concrete & Flatwork', desc: 'Slabs, Perimeter Forms, 2"/4"/6" Cubic Yards' },
    { type: 'Insulation', label: 'Insulation', desc: 'Thermal Envelopes & R-19 to R-60 R-Values' },
    { type: 'Paint', label: 'Paint & Coatings', desc: 'Exterior & Interior Surfaces, Trim & Openings' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProject: ProjectData = {
      id: `cei-proj-${Date.now()}`,
      name: name.trim(),
      claimNumber: claimNumber.trim() || `CLM-${Math.floor(100000 + Math.random() * 900000)}`,
      jobNumber: jobNumber.trim() || `JOB-CEI-${Math.floor(1000 + Math.random() * 9000)}`,
      siteAddress: siteAddress.trim(),
      dateOfLoss,
      dueDate: dueDate || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      productType,
      status: 'New',
      primaryPitch,
      notes: notes.trim(),
      hasReadNotes: true,
      whichNorthAngleDeg: 0,
      planName: planFileName || 'Architectural_Plan_Sheet.pdf',
      qcTimeSeconds: 0,
      techTimeSeconds: 0,
      scale: {
        isCalibrated: true,
        pixelsPerFoot: 12.0,
        knownLengthFt: 50,
        p1: [0, 0],
        p2: [50, 0],
        scaleLabel: '1" = 10\' (12 px/ft)',
      },
      facets: [],
      edges: [],
      punchItems: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onCreateProject(newProject);
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPlanFileName(e.target.files[0].name);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-cei-slate-850 border border-slate-700 rounded-lg max-w-2xl w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-750 flex items-center justify-between bg-cei-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-cei-orange/15 text-cei-orange">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-lg font-bold text-slate-100 uppercase tracking-wide">
                Create New Takeoff Project
              </h3>
              <p className="text-[11px] text-slate-400">
                Configure project parameters, trade classification, and plan sheets
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Row 1: Project Name & Trade */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Project Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Oakridge Medical Center Re-Roof"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cei-orange text-xs"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Product Trade
              </label>
              <select
                value={productType}
                onChange={(e) => setProductType(e.target.value as ProductType)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cei-orange text-xs"
              >
                {productTypes.map((pt) => (
                  <option key={pt.type} value={pt.type}>
                    {pt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Address */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Site Address
            </label>
            <input
              type="text"
              placeholder="e.g. 1040 Willow Creek Rd, Austin, TX"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cei-orange text-xs"
            />
          </div>

          {/* Row 3: Claim #, Job #, Primary Pitch */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Claim Number
              </label>
              <input
                type="text"
                placeholder="CLM-2026-XXXXX"
                value={claimNumber}
                onChange={(e) => setClaimNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cei-orange text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Job Number
              </label>
              <input
                type="text"
                placeholder="JOB-CEI-XXXX"
                value={jobNumber}
                onChange={(e) => setJobNumber(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cei-orange text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
                Primary Pitch
              </label>
              <select
                value={primaryPitch}
                onChange={(e) => setPrimaryPitch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cei-orange text-xs font-mono"
              >
                {['Flat', '2/12', '3/12', '4/12', '5/12', '6/12', '7/12', '8/12', '9/12', '10/12', '12/12'].map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 4: Plan Ingestion (PDF / CAD) */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Upload Blueprint, CAD Drawing, or Aerial (PDF, DWG, DXF, PNG, JPG)
            </label>
            <div 
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = '.pdf,.dwg,.dxf,.png,.jpg,.jpeg';
                input.onchange = (e) => handleFileUpload(e as any);
                input.click();
              }}
              className="border-2 border-dashed border-slate-750 hover:border-cei-orange/60 rounded-lg p-4 text-center cursor-pointer transition-colors bg-slate-900/50"
            >
              <Upload className="w-6 h-6 mx-auto mb-1.5 text-slate-400" />
              <div className="text-slate-300 font-medium">
                {planFileName ? (
                  <span className="text-emerald-400 font-mono">Selected: {planFileName}</span>
                ) : (
                  <span>Drag & drop architectural files, or <span className="text-cei-orange underline">browse</span></span>
                )}
              </div>
            </div>
          </div>

          {/* Row 5: Adjuster Notes */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 uppercase tracking-wider mb-1">
              Adjuster & Estimator Scope Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Include ice & water shield at eaves. Valley liners 36-inch width."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded text-slate-100 focus:outline-none focus:border-cei-orange text-xs resize-none"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-slate-750 flex items-center justify-end space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded text-xs text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded text-xs font-semibold bg-cei-orange hover:bg-cei-orange-hover text-white transition-all shadow-cei-glow flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Create Project</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

