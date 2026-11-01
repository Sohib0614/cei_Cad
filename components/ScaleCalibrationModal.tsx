'use client';

import React, { useState } from 'react';
import { Ruler, Check, X, AlertCircle } from 'lucide-react';
import { ScaleCalibration } from '../types/takeoff';

interface ScaleCalibrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentScale: ScaleCalibration;
  onApplyScale: (pixelsPerFoot: number, knownLengthFt: number, label: string) => void;
  onStartTwoPointClick: () => void;
}

export default function ScaleCalibrationModal({
  isOpen,
  onClose,
  currentScale,
  onApplyScale,
  onStartTwoPointClick,
}: ScaleCalibrationModalProps) {
  const [knownFt, setKnownFt] = useState<string>('40');
  const [scalePreset, setScalePreset] = useState<string>('custom');

  if (!isOpen) return null;

  const presets = [
    { label: '1/8" = 1\' (9.6 px/ft)', ppf: 9.6, length: 40 },
    { label: '1/4" = 1\' (19.2 px/ft)', ppf: 19.2, length: 20 },
    { label: '1" = 10\' (12.0 px/ft)', ppf: 12.0, length: 50 },
    { label: '1" = 20\' (6.0 px/ft)', ppf: 6.0, length: 100 },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    onApplyScale(preset.ppf, preset.length, preset.label);
    onClose();
  };

  const handleApplyCustom = () => {
    const val = parseFloat(knownFt);
    if (isNaN(val) || val <= 0) return;
    // Keep current ppf or default 12
    const ppf = currentScale.pixelsPerFoot || 12.0;
    onApplyScale(ppf, val, `Custom (${val} ft)`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-cei-slate-850 border border-slate-700 rounded-lg max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-750 flex items-center justify-between bg-cei-slate-900">
          <div className="flex items-center space-x-2.5">
            <div className="p-1.5 rounded bg-cei-orange/15 text-cei-orange">
              <Ruler className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                Scale Calibration & Verification
              </h3>
              <p className="text-[11px] text-slate-400">
                Calibrate drawing dimensions for true real-world accuracy
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Method 1: Interactive 2-Point Ground Distance */}
          <div className="p-3.5 bg-cei-orange/10 border border-cei-orange/30 rounded-lg space-y-2">
            <div className="font-semibold text-cei-orange flex items-center gap-1.5 text-xs">
              <Ruler className="w-4 h-4" /> Recommended: Interactive 2-Point Calibration
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Click two points along a known dimension on your blueprint (e.g. an exterior wall line or scale bar), then enter the known distance.
            </p>
            <button
              onClick={() => {
                onStartTwoPointClick();
                onClose();
              }}
              className="w-full mt-1 py-2 bg-cei-orange hover:bg-cei-orange-hover text-white rounded font-semibold transition-all shadow-cei-glow text-xs"
            >
              Start 2-Point Calibration on Canvas
            </button>
          </div>

          {/* Method 2: Standard Architectural Presets */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Or Select Architectural Ratio Preset:
            </label>
            <div className="grid grid-cols-2 gap-2">
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => handleApplyPreset(p)}
                  className="p-2.5 text-left rounded bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-200 hover:border-cei-orange/50 transition-colors"
                >
                  <div className="font-medium text-slate-100">{p.label.split('(')[0]}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{p.label.split('(')[1]?.replace(')', '')}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Current Calibrated Status */}
          <div className="p-3 bg-slate-850 rounded border border-slate-750 flex items-center justify-between text-[11px]">
            <span className="text-slate-400">Current Calibrated Scale:</span>
            <span className="font-mono font-bold text-emerald-400">
              {currentScale.scaleLabel || '1" = 10\' (12 px/ft)'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-750 bg-cei-slate-900 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs text-slate-300 hover:bg-slate-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

