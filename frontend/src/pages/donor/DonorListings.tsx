import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Utensils, PlusCircle, Search, Filter, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { FoodListing } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';

export const DonorListings: React.FC = () => {
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listings.getMy()
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = listings.filter(l => {
    if (statusFilter !== 'ALL' && l.status !== statusFilter) return false;
    if (search.trim() && !l.title.toLowerCase().includes(search.toLowerCase()) && !l.description.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Your Food Listings</h1>
            <p className="text-xs sm:text-sm text-slate-500">Monitor and manage all surplus food items registered by your kitchen.</p>
          </div>
          <Link
            to="/donor/listings/new"
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center gap-2 self-start"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Listing</span>
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by title or contents..."
              className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {['ALL', 'AVAILABLE', 'REQUESTED', 'ACCEPTED', 'PICKUP_ASSIGNED', 'PICKED_UP', 'COMPLETED'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                  statusFilter === st
                    ? 'bg-emerald-700 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Cards/Table */}
        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading listings...</div>
        ) : filtered.length === 0 ? (
          <div className="bg-white py-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            No food listings match your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map(l => (
              <div key={l.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-sm sm:text-base text-slate-900 leading-snug">{l.title}</h3>
                    <StatusBadge status={l.status} size="sm" />
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{l.description}</p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
                      <span className="font-semibold">{l.remaining_quantity} / {l.quantity} {l.unit}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px] uppercase font-bold">Pickup Deadline</span>
                      <span className="font-semibold text-rose-700">
                        {new Date(l.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 capitalize">{l.category.replace('_', ' ')} • {l.dietary_attributes}</span>
                  <Link
                    to={`/donor/listings/${l.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800"
                  >
                    <span>View & Manage</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
