import React, { useState, useEffect } from 'react';
import { Inbox, AlertCircle, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { api } from '../../services/api';
import { DonationRequest } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const RecipientRequests: React.FC = () => {
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await api.donations.getMy();
      setRequests(data);
    } catch (err: any) {
      setError(err.message || 'Error loading donation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleCancel = async (id: number) => {
    if (!window.confirm('Cancel this pending request?')) return;
    try {
      await api.donations.act(id, 'cancel');
      await fetchRequests();
    } catch (err: any) {
      alert(err.message || 'Could not cancel request');
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Outgoing Donation Requests</h1>
          <p className="text-xs sm:text-sm text-slate-500">Track allocations requested by your organization across donor kitchens.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading requests...</div>
        ) : requests.length === 0 ? (
          <div className="bg-white py-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            You haven't requested any food donations yet.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {requests.map(req => (
              <div key={req.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50 transition-colors">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm sm:text-base text-slate-900">
                      {req.listing?.title || `Donation #${req.listing_id}`}
                    </h4>
                    <StatusBadge status={req.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600">
                    Requested: <strong>{req.quantity_requested} {req.listing?.unit || 'units'}</strong> ({req.servings_requested} servings)
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Submitted on {new Date(req.created_at).toLocaleString()}
                  </p>
                  {req.notes && (
                    <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg mt-1">
                      "{req.notes}"
                    </p>
                  )}
                </div>

                {req.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(req.id)}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold rounded-lg transition-colors self-start sm:self-center"
                  >
                    Cancel Request
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
