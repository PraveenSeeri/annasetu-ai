import React, { useState, useEffect } from 'react';
import { Truck, CheckCircle2, Phone, MapPin, AlertCircle, Clock } from 'lucide-react';
import { api } from '../../services/api';
import { PickupTask } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LifecycleTracker } from '../../components/LifecycleTracker';

export const RecipientPickups: React.FC = () => {
  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPickups = async () => {
    try {
      setLoading(true);
      // Fetch user's incoming requests and matching pickup tasks
      const allPickups = await api.pickups.getUnassigned();
      // Also fetch my active requests to see related pickups
      const myReqs = await api.donations.getMy();
      const activeListingIds = myReqs.filter(r => ['accepted', 'completed'].includes(r.status)).map(r => r.listing_id);
      
      // We can also query all relevant pickups
      const relevant = allPickups.filter(p => activeListingIds.includes(p.listing_id));
      setTasks(relevant);
    } catch (err: any) {
      setError(err.message || 'Error loading pickup activities');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPickups();
  }, []);

  const handleConfirmReceived = async (taskId: number) => {
    setActionLoading(true);
    try {
      await api.pickups.updateStatus(taskId, 'COMPLETED', 'Received in sound condition by shelter coordinator');
      await fetchPickups();
    } catch (err: any) {
      alert(err.message || 'Could not confirm delivery');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Active Deliveries & Pickups</h1>
          <p className="text-xs sm:text-sm text-slate-500">Track volunteers in transit delivering accepted food batches to your facility.</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Checking delivery routes...</div>
        ) : tasks.length === 0 ? (
          <div className="bg-white py-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            No active pickups currently dispatched for your requests.
          </div>
        ) : (
          <div className="space-y-4">
            {tasks.map(t => (
              <div key={t.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-xs font-mono text-slate-400">Pickup Task #{t.id}</span>
                    <h3 className="font-bold text-base text-slate-900">{t.listing?.title || 'Surplus Meal Batch'}</h3>
                  </div>
                  <StatusBadge status={t.status} size="sm" />
                </div>

                {t.listing && <LifecycleTracker currentStatus={t.listing.status} />}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Volunteer Coordinator</span>
                    <span className="font-semibold text-slate-800">{t.volunteer_name || 'Volunteer being assigned'}</span>
                    {t.volunteer_phone && <p className="text-slate-500 mt-0.5">{t.volunteer_phone}</p>}
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Window</span>
                    <span className="font-semibold text-rose-700">
                      Cutoff: {new Date(t.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>

                {t.status === 'PICKED_UP' && (
                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => handleConfirmReceived(t.id)}
                      disabled={actionLoading}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Confirm Food Received Safely</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
