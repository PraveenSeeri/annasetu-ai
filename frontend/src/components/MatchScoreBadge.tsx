import React, { useState } from 'react';
import { Sparkles, Info, Check } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  reasons?: string[];
  distanceKm?: number;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ score, reasons = [], distanceKm }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  let colorClasses = 'bg-emerald-50 text-emerald-800 border-emerald-300';
  let badgeLabel = 'Excellent Match';

  if (score < 50) {
    colorClasses = 'bg-slate-100 text-slate-700 border-slate-300';
    badgeLabel = 'Standard Match';
  } else if (score < 75) {
    colorClasses = 'bg-blue-50 text-blue-800 border-blue-300';
    badgeLabel = 'High Suitability';
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setShowTooltip(!showTooltip)}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-semibold shadow-2xs transition-all ${colorClasses}`}
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Match: {score}/100</span>
        {distanceKm !== undefined && (
          <span className="text-[11px] opacity-80">({distanceKm.toFixed(1)} km)</span>
        )}
        <Info className="w-3 h-3 opacity-60 ml-0.5" />
      </button>

      {showTooltip && (
        <div className="absolute left-0 mt-2 w-72 p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs z-50 animate-in fade-in duration-100">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-800 mb-2">
            <span className="font-bold text-amber-300">Transparent Match Breakdown</span>
            <span className="font-mono text-[11px]">{score}% Fit</span>
          </div>

          <div className="space-y-1.5">
            {reasons.length > 0 ? (
              reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5 text-slate-200 text-[11px]">
                  <Check className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{r}</span>
                </div>
              ))
            ) : (
              <p className="text-slate-400 text-[11px]">Calculated based on verified status, service proximity, and vehicle capacity.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
