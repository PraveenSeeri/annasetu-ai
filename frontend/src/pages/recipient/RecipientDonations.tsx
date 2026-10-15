import React, { useState, useEffect } from 'react';
import {
  Search, Sparkles, Filter, MapPin, Clock, Utensils, AlertCircle,
  CheckCircle2, X, ShieldAlert, ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';
import { FoodListing } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const RecipientDonations: React.FC = () => {
  const { user } = useAuth();
  const [listings, setListings] = useState<FoodListing[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [aiParsing, setAiParsing] = useState(false);
  const [activeAIFilter, setActiveAIFilter] = useState<string | null>(null);

  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [dietaryFilter, setDietaryFilter] = useState('ALL');

  // Request Modal State
  const [selectedListing, setSelectedListing] = useState<FoodListing | null>(null);
  const [requestQty, setRequestQty] = useState<number>(10);
  const [requestNotes, setRequestNotes] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestSuccess, setRequestSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isVerified = user?.organization?.verification_status === 'verified';

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await api.listings.getAll();
      setListings(data.filter(l => l.status === 'AVAILABLE' && l.remaining_quantity > 0));
    } catch (err: any) {
      setError(err.message || 'Error fetching available donations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  // AI Natural Language Search Parser
  const handleAISearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setAiParsing(true);
    setError(null);
    try {
      const res = await api.ai.searchParse(searchQuery);
      setActiveAIFilter(res.explanation);

      if (res.category) {
        setCategoryFilter(res.category);
      }
      if (res.dietary) {
        setDietaryFilter(res.dietary);
      }
    } catch {
      setActiveAIFilter(`Filtered by: "${searchQuery}"`);
    } finally {
      setAiParsing(false);
    }
  };

  const handleClearAIFilter = () => {
    setActiveAIFilter(null);
    setSearchQuery('');
    setCategoryFilter('ALL');
    setDietaryFilter('ALL');
    fetchListings();
  };

  const handleOpenRequest = (item: FoodListing) => {
    setSelectedListing(item);
    setRequestQty(item.remaining_quantity);
    setRequestNotes('');
    setRequestSuccess(false);
    setError(null);
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;

    if (!isVerified) {
      setError('Your organization must be verified by an administrator before requesting food allocations.');
      return;
    }

    if (requestQty <= 0 || requestQty > selectedListing.remaining_quantity) {
      setError(`Requested quantity must be between 1 and ${selectedListing.remaining_quantity} ${selectedListing.unit}.`);
      return;
    }

    setRequesting(true);
    setError(null);
    try {
      await api.donations.request({
        listing_id: selectedListing.id,
        quantity_requested: Number(requestQty),
        notes: requestNotes,
      });
      setRequestSuccess(true);
      await fetchListings();
      setTimeout(() => {
        setSelectedListing(null);
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to submit donation request.');
    } finally {
      setRequesting(false);
    }
  };

  const filteredListings = listings.filter(l => {
    if (categoryFilter !== 'ALL' && l.category !== categoryFilter) return false;
    if (dietaryFilter !== 'ALL' && !l.dietary_attributes.toLowerCase().includes(dietaryFilter.toLowerCase())) return false;
    if (searchQuery.trim() && !activeAIFilter) {
      const q = searchQuery.toLowerCase();
      return l.title.toLowerCase().includes(q) || l.description.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Discover Available Surplus Food
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Browse wholesome staged surplus batches and reserve quantities for your beneficiaries.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* AI Natural Language Search Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
          <form onSubmit={handleAISearch} className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Sparkles className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Ask in natural language e.g. 'Show vegetarian meals within 10 km urgent'..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>
            <button
              type="submit"
              disabled={aiParsing || !searchQuery.trim()}
              className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 shrink-0"
            >
              <Search className="w-4 h-4" />
              <span>{aiParsing ? 'Interpreting...' : 'AI Smart Filter'}</span>
            </button>
          </form>

          {activeAIFilter && (
            <div className="flex items-center justify-between p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{activeAIFilter}</span>
              </div>
              <button
                onClick={handleClearAIFilter}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-bold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                Clear
              </button>
            </div>
          )}

          {/* Quick Category & Dietary Filters */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-xs font-semibold text-slate-500 mr-1 flex items-center gap-1">
              <Filter className="w-3.5 h-3.5" /> Categories:
            </span>
            {['ALL', 'prepared_meals', 'bakery', 'produce', 'packaged_food', 'dairy'].map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  categoryFilter === cat
                    ? 'bg-emerald-700 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}

            <div className="ml-auto flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Dietary:</span>
              {['ALL', 'vegetarian', 'vegan'].map(d => (
                <button
                  key={d}
                  onClick={() => setDietaryFilter(d)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                    dietaryFilter === d
                      ? 'bg-slate-800 text-white font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div className="py-16 text-center text-xs text-slate-400">Discovering food batches...</div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white py-16 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            No surplus food donations currently match your criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredListings.map(item => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded-md">
                      {item.category.replace('_', ' ')}
                    </span>
                    <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                      Until {new Date(item.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <h3 className="font-bold text-base text-slate-900 leading-snug">{item.title}</h3>
                  <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">{item.description}</p>

                  <div className="space-y-1 pt-2 text-xs text-slate-600 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available:</span>
                      <span className="font-bold text-slate-900">{item.remaining_quantity} {item.unit} ({item.estimated_servings} meals)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Storage:</span>
                      <span className="capitalize font-medium">{item.storage_conditions.replace('_', ' ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Donor:</span>
                      <span className="font-medium text-slate-800 truncate max-w-[180px]">{item.donor_org_name || 'Verified Kitchen'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100">
                  {isVerified ? (
                    <button
                      onClick={() => handleOpenRequest(item)}
                      className="w-full py-2 px-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>Request Food Allocation</span>
                    </button>
                  ) : (
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 text-center font-medium">
                      Verification required to claim food
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Request Modal */}
        {selectedListing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Request Surplus Food</h3>
                  <p className="text-xs text-slate-500">{selectedListing.title}</p>
                </div>
                <button onClick={() => setSelectedListing(null)} className="p-1 text-slate-400 hover:text-slate-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {requestSuccess ? (
                <div className="py-8 text-center space-y-2 text-emerald-800">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-600" />
                  <h4 className="font-bold text-sm">Donation Request Submitted!</h4>
                  <p className="text-xs text-slate-500">The donor has been notified to confirm pickup scheduling.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitRequest} className="space-y-4">
                  <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Maximum Available:</span>
                      <span className="font-bold">{selectedListing.remaining_quantity} {selectedListing.unit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Pickup Deadline:</span>
                      <span className="font-bold text-rose-700">
                        {new Date(selectedListing.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Quantity to Claim ({selectedListing.unit}) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={selectedListing.remaining_quantity}
                      value={requestQty}
                      onChange={e => setRequestQty(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                    <span className="text-[11px] text-slate-400 mt-1 block">
                      ≈ {Math.round((requestQty / selectedListing.quantity) * selectedListing.estimated_servings)} estimated servings
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Distribution Notes / Intended Use (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={requestNotes}
                      onChange={e => setRequestNotes(e.target.value)}
                      placeholder="e.g. For our evening shelter dinner line at Indiranagar..."
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setSelectedListing(null)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={requesting}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs transition-colors"
                    >
                      {requesting ? 'Confirming...' : 'Confirm Request'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
