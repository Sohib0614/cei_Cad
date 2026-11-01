'use client';

import React from 'react';
import { FailSafeError } from '../types/takeoff';
import { ShieldCheck, AlertTriangle, AlertCircle, CheckCircle2, X } from 'lucide-react';

interface FailSafeModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: FailSafeError[];
  onZoomToError?: (error: FailSafeError) => void;
}

export default function FailSafeModal({
  isOpen,
  onClose,
  errors,
  onZoomToError,
}: FailSafeModalProps) {
  if (!isOpen) return null;

  const criticalErrors = errors.filter((e) => e.severity === 'ERROR');
  const warnings = errors.filter((e) => e.severity === 'WARNING');
  const hasCritical = criticalErrors.length > 0;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-cei-slate-850 border border-slate-700 rounded-lg max-w-lg w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-750 flex items-center justify-between bg-cei-slate-900">
          <div className="flex items-center space-x-2.5">
            <div
              className={`p-1.5 rounded ${
                hasCritical
                  ? 'bg-red-500/15 text-red-400'
                  : warnings.length > 0
                  ? 'bg-amber-500/15 text-amber-400'
                  : 'bg-emerald-500/15 text-emerald-400'
              }`}
            >
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-tech text-base font-bold text-slate-100 uppercase tracking-wide">
                CAD Takeoff Fail-Safe Audit
              </h3>
              <p className="text-[11px] text-slate-400">
                Automated geometric verification & quality assurance check
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3.5 text-xs">
          {errors.length === 0 ? (
            <div className="text-center py-6 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h4 className="font-tech text-lg font-bold text-slate-100">
                All Fail-Safe Validations Passed!
              </h4>
              <p className="text-slate-300 text-xs max-w-xs mx-auto">
                No unclosed loops, negative area intersections, or invalid zero-slope drainage edges were detected.
              </p>
              <div className="pt-2 text-[11px] text-emerald-400 font-medium">
                Takeoff is mathematically sound and certified for official report generation.
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] text-slate-400 pb-1 border-b border-slate-750">
                <span>Critical Errors: <strong className="text-red-400">{criticalErrors.length}</strong></span>
                <span>Warnings: <strong className="text-amber-400">{warnings.length}</strong></span>
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {errors.map((err) => (
                  <div
                    key={err.id}
                    className={`p-3 rounded border text-xs flex items-start space-x-2.5 ${
                      err.severity === 'ERROR'
                        ? 'bg-red-950/30 border-red-800/60 text-red-200'
                        : 'bg-amber-950/30 border-amber-800/60 text-amber-200'
                    }`}
                  >
                    {err.severity === 'ERROR' ? (
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-slate-100 mb-0.5">
                        {err.type.replace(/_/g, ' ')}
                      </div>
                      <div className="text-[11px] opacity-90 leading-relaxed">
                        {err.message}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-750 bg-cei-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded text-xs font-semibold bg-cei-orange hover:bg-cei-orange-hover text-white transition-all shadow-cei-glow"
          >
            {errors.length === 0 ? 'Done' : 'Acknowledge & Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

