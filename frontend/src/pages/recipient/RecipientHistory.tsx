import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, Award, Calendar } from 'lucide-react';
import { api } from '../../services/api';
import { DonationRequest } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const RecipientHistory: React.FC = () => {
  const [completed, setCompleted] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.donations.getMy()
      .then(items => {
        setCompleted(items.filter(i => i.status === 'completed'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalServings = completed.reduce((acc, c) => acc + c.servings_requested, 0);

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Collection & Nutrition History</h1>
          <p className="text-xs sm:text-sm text-slate-500">Log of all completed surplus food distributions received by your shelter.</p>
        </div>

        <div className="bg-gradient-to-r from-teal-800 to-emerald-900 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-teal-200 font-semibold uppercase tracking-wider">Total Received</span>
            <div className="text-3xl font-black font-mono mt-1">{totalServings} Meals</div>
            <p className="text-xs text-teal-100/80 mt-1">Diverted directly to resident dinner lines and community tables</p>
          </div>
          <Award className="w-12 h-12 text-amber-400 opacity-80" />
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading collection log...</div>
        ) : completed.length === 0 ? (
          <div className="bg-white py-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            No completed collections recorded yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {completed.map(item => (
              <div key={item.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{item.listing?.title || `Batch #${item.listing_id}`}</h4>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600">
                    Received: <strong>{item.quantity_requested} {item.listing?.unit || 'units'}</strong> ({item.servings_requested} servings)
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Delivered on {new Date(item.updated_at).toLocaleDateString()}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
