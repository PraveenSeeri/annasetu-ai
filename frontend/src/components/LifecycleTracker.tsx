import React from 'react';
import { CheckCircle2, Clock, Truck, ShieldCheck, AlertTriangle } from 'lucide-react';
import { ListingStatus } from '../types';

interface LifecycleTrackerProps {
  currentStatus: ListingStatus | string;
}

const STEPS = [
  { key: 'AVAILABLE', label: 'Staged / Available', desc: 'Food listed' },
  { key: 'REQUESTED', label: 'Requested', desc: 'NGO reservation' },
  { key: 'ACCEPTED', label: 'Accepted', desc: 'Donor confirmed' },
  { key: 'PICKUP_ASSIGNED', label: 'Volunteer Ready', desc: 'Transport assigned' },
  { key: 'PICKED_UP', label: 'In Transit', desc: 'Collected from donor' },
  { key: 'COMPLETED', label: 'Delivered', desc: 'Received at shelter' },
];

export const LifecycleTracker: React.FC<LifecycleTrackerProps> = ({ currentStatus }) => {
  const norm = currentStatus.toUpperCase();

  if (norm === 'CANCELLED' || norm === 'EXPIRED' || norm === 'FLAGGED_FOR_REVIEW') {
    return (
      <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Status: {norm.replace(/_/g, ' ')}</h4>
          <p className="text-xs text-rose-700">This donation workflow is halted and not currently active.</p>
        </div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(s => s.key === norm);
  const activeIdx = currentIndex >= 0 ? currentIndex : 0;

  return (
    <div className="w-full py-3 px-2">
      <div className="relative flex items-center justify-between">
        {/* Connection line */}
        <div className="absolute left-4 right-4 top-4 h-0.5 bg-slate-200 -z-0">
          <div
            className="h-full bg-emerald-600 transition-all duration-500"
            style={{ width: `${(activeIdx / (STEPS.length - 1)) * 100}%` }}
          />
        </div>

        {STEPS.map((step, idx) => {
          const isDone = idx < activeIdx;
          const isCurrent = idx === activeIdx;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10 text-center px-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                  isDone
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : isCurrent
                    ? 'bg-amber-500 text-white ring-4 ring-amber-100 shadow-md animate-pulse'
                    : 'bg-white border-2 border-slate-300 text-slate-400'
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : isCurrent ? (
                  <Clock className="w-4 h-4" />
                ) : (
                  <span>{idx + 1}</span>
                )}
              </div>
              <span
                className={`mt-2 text-xs font-medium max-w-[80px] leading-tight ${
                  isCurrent ? 'text-emerald-900 font-bold' : isDone ? 'text-slate-800' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
