import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Utensils, PlusCircle, CheckCircle2, Clock, AlertTriangle,
  ArrowRight, Sparkles, Building, ChevronRight
} from 'lucide-react';
import { api } from '../../services/api';
import { FoodListing } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const DonorDashboard: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.listings.getMy()
      .then(setListings)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const totalListings = listings.length;
  const availableListings = listings.filter(l => l.status === 'AVAILABLE').length;
  const inProgressListings = listings.filter(l => ['REQUESTED', 'ACCEPTED', 'PICKUP_ASSIGNED', 'PICKED_UP'].includes(l.status)).length;
  const completedListings = listings.filter(l => l.status === 'COMPLETED').length;
  const totalServings = listings
    .filter(l => ['COMPLETED', 'PICKED_UP', 'ACCEPTED'].includes(l.status))
    .reduce((acc, curr) => acc + curr.estimated_servings, 0);

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                Food Donor Portal
              </span>
              <span className="text-xs text-slate-400">• {user?.organization?.name || 'Commercial Kitchen'}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Welcome back, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage your surplus meals, review NGO collection requests, and track your hunger relief impact.
            </p>
          </div>

          <Link
            to="/donor/listings/new"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 text-sm shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Surplus Food</span>
          </Link>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase">Total Listed</span>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">{totalListings}</p>
            <span className="text-[11px] text-slate-400">All-time batches</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-emerald-700 font-semibold uppercase">Available</span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{availableListings}</p>
            <span className="text-[11px] text-emerald-600">Open for matching</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-blue-700 font-semibold uppercase">In Coordination</span>
            <p className="text-2xl font-black text-blue-700 font-mono mt-1">{inProgressListings}</p>
            <span className="text-[11px] text-blue-600">Requested / Transit</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-teal-700 font-semibold uppercase">Completed</span>
            <p className="text-2xl font-black text-teal-700 font-mono mt-1">{completedListings}</p>
            <span className="text-[11px] text-teal-600">Delivered to shelters</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 col-span-2 lg:col-span-1">
            <span className="text-xs text-amber-700 font-semibold uppercase">Servings Shared</span>
            <p className="text-2xl font-black text-amber-700 font-mono mt-1">{totalServings}</p>
            <span className="text-[11px] text-amber-600">Nutritious meals</span>
          </div>
        </div>

        {/* Active Staged Food Listings */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Your Active Food Listings</h2>
              <p className="text-xs text-slate-500">Listings currently open or awaiting volunteer collection</p>
            </div>
            <Link to="/donor/listings" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>View all ({totalListings})</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Loading listings...</div>
          ) : listings.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Utensils className="w-8 h-8 mx-auto text-slate-300" />
              <p className="text-sm">You haven't listed any surplus food yet.</p>
              <Link
                to="/donor/listings/new"
                className="inline-block px-4 py-2 bg-emerald-700 text-white font-semibold rounded-xl text-xs"
              >
                Create Your First Listing
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {listings.slice(0, 4).map(listing => (
                <div key={listing.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 p-2 rounded-xl transition-colors">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{listing.title}</h4>
                      <StatusBadge status={listing.status} size="sm" />
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                      <span><strong>{listing.remaining_quantity} / {listing.quantity} {listing.unit}</strong> available</span>
                      <span>• {listing.estimated_servings} servings</span>
                      <span>• Storage: <strong className="capitalize">{listing.storage_conditions.replace('_', ' ')}</strong></span>
                      <span>• Deadline: {new Date(listing.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                  </div>

                  <Link
                    to={`/donor/listings/${listing.id}`}
                    className="px-3.5 py-1.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 font-semibold text-xs rounded-xl transition-colors text-center shrink-0 flex items-center justify-center gap-1"
                  >
                    <span>Manage / Matches</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
