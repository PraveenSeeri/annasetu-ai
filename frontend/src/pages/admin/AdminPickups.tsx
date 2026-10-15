import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Truck,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  ArrowLeft,
  RefreshCw,
  Package,
} from 'lucide-react';
import { api } from '../../services/api';
import { PickupTask } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminPickups: React.FC = () => {
  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.pickups.getUnassigned();
      setTasks(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredTasks = tasks.filter(
    (t) =>
      search === '' ||
      t.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.recipient_org_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                Logistics Dispatch
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Volunteer Couriers & Pickups</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Live monitoring of unassigned and active surplus food transport runs across city clusters.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Search */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by food title, recipient..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>
        </div>

        {/* Tasks Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">Run ID</th>
                  <th className="p-3.5">Listing Title</th>
                  <th className="p-3.5">Origin (Donor)</th>
                  <th className="p-3.5">Destination (Recipient)</th>
                  <th className="p-3.5">Deadline</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTasks.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400">
                      No unassigned or active dispatch tasks found.
                    </td>
                  </tr>
                ) : (
                  filteredTasks.map((t) => (
                    <tr key={t.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">#{t.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{t.listing?.title || 'Surplus Meals'}</td>
                      <td className="p-3.5 text-slate-600 truncate max-w-xs">
                        {t.listing?.pickup_address || 'Donor address'}
                      </td>
                      <td className="p-3.5 text-slate-700 font-semibold">{t.recipient_org_name || 'Designated Shelter'}</td>
                      <td className="p-3.5 text-rose-700 font-semibold text-[11px]">
                        {new Date(t.pickup_deadline).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={t.status} size="sm" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
