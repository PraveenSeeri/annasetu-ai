import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Package,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Clock,
  MapPin,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { api } from '../../services/api';
import { FoodListing } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const AdminListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadListings = async () => {
    setLoading(true);
    try {
      const data = await api.listings.getAll();
      setListings(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadListings();
  }, []);

  const handleCancelListing = async (listingId: number) => {
    if (!window.confirm(`Are you sure you want to cancel / flag listing #${listingId} as non-compliant?`)) {
      return;
    }

    setCancellingId(listingId);
    try {
      await api.listings.cancel(listingId);
      setNotification({
        type: 'success',
        message: `Listing #${listingId} has been cancelled and flagged.`,
      });
      await loadListings();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to cancel listing',
      });
    } finally {
      setCancellingId(null);
    }
  };

  const filteredListings = listings.filter((l) => {
    const matchesStatus = statusFilter === 'ALL' || l.status?.toLowerCase() === statusFilter.toLowerCase();
    const matchesSearch =
      search === '' ||
      l.title?.toLowerCase().includes(search.toLowerCase()) ||
      l.category?.toLowerCase().includes(search.toLowerCase()) ||
      l.pickup_address?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-0.5 rounded-md">
                Catalog Moderation
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Platform Food Listings</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Audit live surplus food donations, check storage parameters, and intervene on safety infractions.
            </p>
          </div>

          <button
            onClick={loadListings}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Alerts */}
        {notification && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by title, category, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-600"
            >
              <option value="ALL">All Statuses</option>
              <option value="available">Available</option>
              <option value="matched">Matched</option>
              <option value="pickup_assigned">Pickup Assigned</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>

        {/* Listings Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Food Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Quantity / Servings</th>
                  <th className="p-3.5">Pickup Deadline</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredListings.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No matching food listings found.
                    </td>
                  </tr>
                ) : (
                  filteredListings.map((listing) => (
                    <tr key={listing.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">#{listing.id}</td>
                      <td className="p-3.5">
                        <span className="font-bold text-slate-900 block">{listing.title}</span>
                        <span className="text-[11px] text-slate-500 truncate max-w-xs block">
                          {listing.pickup_address}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                          {listing.category?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-700 font-mono text-[11px]">
                        {listing.quantity} {listing.unit} (~{listing.estimated_servings} meals)
                      </td>
                      <td className="p-3.5 text-slate-600 text-[11px]">
                        {new Date(listing.pickup_deadline).toLocaleString([], {
                          dateStyle: 'short',
                          timeStyle: 'short',
                        })}
                      </td>
                      <td className="p-3.5">
                        <StatusBadge status={listing.status} size="sm" />
                      </td>
                      <td className="p-3.5 text-right">
                        {['AVAILABLE', 'REQUESTED', 'MATCHED'].includes(listing.status) ? (
                          <button
                            onClick={() => handleCancelListing(listing.id)}
                            disabled={cancellingId === listing.id}
                            className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            {cancellingId === listing.id ? 'Cancelling...' : 'Cancel / Flag'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Locked</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total listings indexed: {listings.length}</span>
            <span>Food safety guardrails enforced</span>
          </div>
        </div>
      </div>
    </div>
  );
};
