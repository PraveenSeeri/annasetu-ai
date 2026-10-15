import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Utensils, Clock, MapPin, Phone, User as UserIcon, AlertCircle,
  CheckCircle2, XCircle, ArrowLeft, Building, Sparkles, ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { FoodListing, DonationRequest, MatchRecommendation } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { LifecycleTracker } from '../../components/LifecycleTracker';
import { MatchScoreBadge } from '../../components/MatchScoreBadge';

export const ListingDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [listing, setListing] = useState<FoodListing | null>(null);
  const [matches, setMatches] = useState<MatchRecommendation[]>([]);
  const [requests, setRequests] = useState<DonationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const l = await api.listings.getById(id);
      setListing(l);

      // Fetch match recommendations
      if (l.status === 'AVAILABLE') {
        const m = await api.matching.getRecipientsForListing(id);
        setMatches(m);
      }

      // Fetch requests
      const allReqs = await api.donations.getIncoming();
      const filtered = allReqs.filter((r: any) => r.listing_id === Number(id));
      setRequests(filtered);
    } catch (err: any) {
      setError(err.message || 'Error loading listing details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const handleRequestAction = async (requestId: number, action: 'accept' | 'decline') => {
    setActionLoading(true);
    setError(null);
    try {
      await api.donations.act(requestId, action);
      await fetchDetails();
    } catch (err: any) {
      setError(err.message || `Failed to ${action} request`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelListing = async () => {
    if (!window.confirm('Are you sure you want to cancel this food listing?')) return;
    if (!id) return;
    try {
      await api.listings.cancel(id);
      await fetchDetails();
    } catch (err: any) {
      setError(err.message || 'Failed to cancel listing');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-slate-50 p-8 text-center text-slate-500">
        Listing not found.
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Back and Action Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/donor/listings')}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Listings</span>
          </button>

          {listing.status !== 'COMPLETED' && listing.status !== 'CANCELLED' && (
            <button
              onClick={handleCancelListing}
              className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-xl transition-colors"
            >
              Cancel Listing
            </button>
          )}
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Main Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono text-slate-400">Listing #{listing.id}</span>
                <h1 className="text-2xl font-black text-slate-900 mt-0.5">{listing.title}</h1>
                <p className="text-xs text-slate-500 mt-1">
                  Staged at {new Date(listing.created_at).toLocaleString()} by {listing.donor_org_name || 'Kitchen'}
                </p>
              </div>
              <StatusBadge status={listing.status} size="md" />
            </div>

            {/* Lifecycle Tracker */}
            <div className="bg-slate-50/70 p-4 rounded-2xl border border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Live Progress Status</h3>
              <LifecycleTracker currentStatus={listing.status} />
            </div>

            {/* Detailed Parameters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs sm:text-sm">
              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Food Specifications</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Remaining Available:</span>
                    <span className="font-bold text-emerald-800">{listing.remaining_quantity} / {listing.quantity} {listing.unit}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Estimated Servings:</span>
                    <span className="font-bold text-slate-900">{listing.estimated_servings} meals</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Category:</span>
                    <span className="capitalize text-slate-900">{listing.category.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dietary Attributes:</span>
                    <span className="capitalize text-slate-900">{listing.dietary_attributes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Known Allergens:</span>
                    <span className="text-slate-900">{listing.allergens || 'None reported'}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Handoff & Schedule</h3>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Thermal Storage:</span>
                    <span className="font-bold capitalize text-slate-900">{listing.storage_conditions.replace('_', ' ')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pickup Deadline:</span>
                    <span className="font-bold text-rose-700">
                      {new Date(listing.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(listing.pickup_deadline).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pickup Location:</span>
                    <span className="text-right text-slate-900 font-medium max-w-[200px]">{listing.pickup_address}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Contact:</span>
                    <span className="text-slate-900">{listing.contact_name} ({listing.contact_phone})</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Text */}
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider">Description</h3>
              <p className="text-xs sm:text-sm text-slate-700 bg-slate-50 p-4 rounded-xl border border-slate-200 leading-relaxed whitespace-pre-wrap">
                {listing.description}
              </p>
            </div>
          </div>
        </div>

        {/* Incoming Requests Section */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Incoming Allocation Requests</h2>
              <p className="text-xs text-slate-500">Verified community organizations requesting this surplus batch</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 font-bold text-xs font-mono">
              {requests.length} Requests
            </span>
          </div>

          {requests.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recipient requests received for this listing yet.</p>
          ) : (
            <div className="divide-y divide-slate-100">
              {requests.map(req => (
                <div key={req.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900">
                        {req.recipient_org?.name || 'Verified Shelter'}
                      </span>
                      <StatusBadge status={req.status} size="sm" />
                    </div>
                    <p className="text-xs text-slate-600">
                      Requested: <strong>{req.quantity_requested} {listing.unit}</strong> ({req.servings_requested} servings)
                    </p>
                    {req.notes && (
                      <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                        "{req.notes}"
                      </p>
                    )}
                  </div>

                  {req.status === 'pending' && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleRequestAction(req.id, 'accept')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Accept Request</span>
                      </button>
                      <button
                        onClick={() => handleRequestAction(req.id, 'decline')}
                        disabled={actionLoading}
                        className="px-4 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Smart Matching Recommendations */}
        {listing.status === 'AVAILABLE' && (
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recommended Recipient Organizations</h2>
                <p className="text-xs text-slate-500">Ranked by distance, capacity suitability, and food category fit</p>
              </div>
            </div>

            {matches.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No verified shelters found within service zone.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {matches.map((m, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{m.recipient_name}</h4>
                        <span className="text-[11px] text-slate-500 capitalize">{m.org_type?.replace('_', ' ')}</span>
                      </div>
                      <MatchScoreBadge score={m.match_score} reasons={m.reasons} distanceKm={m.distance_km} />
                    </div>

                    <div className="text-xs text-slate-600 space-y-1">
                      <p className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-400" /> {m.address}</p>
                      <p className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-slate-400" /> {m.contact_phone || 'Verified on platform'}</p>
                    </div>

                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500">
                      Capacity: <strong>{m.capacity_servings_per_day} servings/day</strong> • Service Radius: {m.service_radius_km} km
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
