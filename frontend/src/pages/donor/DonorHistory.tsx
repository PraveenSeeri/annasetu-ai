import React, { useState, useEffect } from 'react';
import { History, CheckCircle2, Award, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { FoodListing } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const DonorHistory: React.FC = () => {
  const [completed, setCompleted] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listings.getMy()
      .then(items => {
        setCompleted(items.filter(i => i.status === 'COMPLETED'));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalServings = completed.reduce((acc, c) => acc + c.estimated_servings, 0);

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Donation History & Impact Log</h1>
          <p className="text-xs sm:text-sm text-slate-500">Record of all completed food surplus handovers that safely reached shelters.</p>
        </div>

        {/* Impact summary card */}
        <div className="bg-gradient-to-r from-emerald-800 to-teal-900 text-white p-6 rounded-2xl shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-emerald-200 font-semibold uppercase tracking-wider">Historical Redistribution</span>
            <div className="text-3xl font-black font-mono mt-1">{totalServings} Servings</div>
            <p className="text-xs text-emerald-100/80 mt-1">Directly diverted from waste into community nourishment</p>
          </div>
          <Award className="w-12 h-12 text-amber-400 opacity-80" />
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading history...</div>
        ) : completed.length === 0 ? (
          <div className="bg-white py-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            No completed donations yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {completed.map(item => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm text-slate-900">{item.title}</h4>
                    <StatusBadge status={item.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-500">
                    {item.estimated_servings} servings • {item.quantity} {item.unit} • Recipient: <strong>{item.matched_recipient_org_name || 'Verified Shelter'}</strong>
                  </p>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Completed on {new Date(item.updated_at).toLocaleDateString()}</span>
                  </p>
                </div>

                <Link
                  to={`/donor/listings/${item.id}`}
                  className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 self-start sm:self-center"
                >
                  <span>Review Details</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
