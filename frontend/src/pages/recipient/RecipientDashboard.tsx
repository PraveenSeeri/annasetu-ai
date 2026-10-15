import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, Search, Clock, Truck, ShieldCheck, AlertCircle,
  Sparkles, ArrowRight, CheckCircle2, ChevronRight, Inbox
} from 'lucide-react';
import { api } from '../../services/api';
import { FoodListing, MatchRecommendation, DonationRequest } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';
import { useAuth } from '../../context/AuthContext';

export const RecipientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [recommended, setRecommended] = useState<MatchRecommendation[]>([]);
  const [myRequests, setMyRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const org = user?.organization;
  const isVerified = org?.verification_status === 'verified';

  useEffect(() => {
    Promise.all([
      api.matching.getRecommendedForRecipient().catch(() => []),
      api.donations.getMy().catch(() => []),
    ])
      .then(([recData, reqData]) => {
        setRecommended(recData);
        setMyRequests(reqData);
      })
      .finally(() => setLoading(false));
  }, []);

  const pendingRequests = myRequests.filter(r => r.status === 'pending').length;
  const acceptedRequests = myRequests.filter(r => r.status === 'accepted').length;
  const completedRequests = myRequests.filter(r => r.status === 'completed').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Verification Status Banner */}
        {!isVerified ? (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-sm">Organization Verification Pending</h4>
                <p className="text-xs text-amber-800 leading-relaxed mt-0.5">
                  Your organization '{org?.name}' is pending administrative approval. You can browse available surplus meals, but requesting allocations requires official NGO DARPAN or registration verification.
                </p>
              </div>
            </div>
            <Link
              to="/recipient/profile"
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs whitespace-nowrap self-start sm:self-center transition-colors"
            >
              Upload Verification Docs
            </Link>
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
              <span>Verified Recipient Partner: {org?.name} (Eligible for all surplus food requests)</span>
            </div>
            <span className="hidden sm:inline-block text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
              CERTIFIED NGO
            </span>
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md">
              Community Recipient Portal
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Find fresh surplus food batches, review delivery coordination, and track meal intakes.
            </p>
          </div>

          <Link
            to="/recipient/donations"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 text-sm shrink-0"
          >
            <Search className="w-4 h-4" />
            <span>Discover Available Food</span>
          </Link>
        </div>

        {/* Metrics Overview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-slate-500 font-semibold uppercase">Pending Requests</span>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">{pendingRequests}</p>
            <span className="text-[11px] text-slate-400">Awaiting donor review</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-blue-700 font-semibold uppercase">Accepted & Staged</span>
            <p className="text-2xl font-black text-blue-700 font-mono mt-1">{acceptedRequests}</p>
            <span className="text-[11px] text-blue-600">In pickup queue</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-teal-700 font-semibold uppercase">Meals Completed</span>
            <p className="text-2xl font-black text-teal-700 font-mono mt-1">{completedRequests}</p>
            <span className="text-[11px] text-teal-600">Safely received</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200">
            <span className="text-xs text-emerald-700 font-semibold uppercase">Smart Matches</span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{recommended.length}</p>
            <span className="text-[11px] text-emerald-600">Within service area</span>
          </div>
        </div>

        {/* Recommended Surplus Food Matches */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recommended for Your Organization</h2>
                <p className="text-xs text-slate-500">Filtered by proximity, daily capacity, and urgent pickup cutoffs</p>
              </div>
            </div>

            <Link to="/recipient/donations" className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1">
              <span>Browse All Food</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-slate-400">Calculating recommendations...</div>
          ) : recommended.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              No recommended food listings available in your service area right now. Check back soon!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recommended.slice(0, 4).map((rec, idx) => (
                <div key={idx} className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between space-y-3">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm sm:text-base text-slate-900">{rec.title}</h4>
                      <MatchScoreBadge score={rec.match_score} reasons={rec.reasons} distanceKm={rec.distance_km} />
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{rec.description}</p>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 pt-1">
                      <span><strong>{rec.quantity} {rec.unit}</strong> ({rec.estimated_servings} servings)</span>
                      <span>• Donor: {rec.donor_name}</span>
                      <span>• Deadline: {rec.pickup_deadline ? new Date(rec.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-[11px] text-slate-400 capitalize">{rec.category?.replace('_', ' ')}</span>
                    <Link
                      to="/recipient/donations"
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1"
                    >
                      <span>Request Food</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
