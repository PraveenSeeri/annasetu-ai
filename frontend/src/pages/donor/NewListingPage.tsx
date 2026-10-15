import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Utensils, Sparkles, ShieldCheck, AlertCircle, CheckCircle2,
  Clock, Thermometer, ShieldAlert
} from 'lucide-react';
import { api } from '../../services/api';
import { AICategorizeResult, AIImproveResult } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const NewListingPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('prepared_meals');
  const [quantity, setQuantity] = useState<number>(30);
  const [unit, setUnit] = useState('servings');
  const [servings, setServings] = useState<number>(30);
  const [prepTime, setPrepTime] = useState(new Date().toISOString().slice(0, 16));
  
  // Default deadline 4 hours from now
  const defaultDeadline = new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString().slice(0, 16);
  const [pickupDeadline, setPickupDeadline] = useState(defaultDeadline);
  const [pickupStartTime, setPickupStartTime] = useState(new Date().toISOString().slice(0, 16));
  
  const [storageConditions, setStorageConditions] = useState('hot_holding');
  const [allergens, setAllergens] = useState('');
  const [dietaryAttributes, setDietaryAttributes] = useState('vegetarian');
  const [pickupAddress, setPickupAddress] = useState(user?.organization?.address || '12 MG Road, Bengaluru');
  const [contactName, setContactName] = useState(user?.full_name || 'Chef');
  const [contactPhone, setContactPhone] = useState(user?.phone || '+91 98450 11223');
  const [safetyDeclaration, setSafetyDeclaration] = useState(false);

  // AI Assistance State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiCategorizeData, setAiCategorizeData] = useState<AICategorizeResult | null>(null);
  const [aiImproveData, setAiImproveData] = useState<AIImproveResult | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Trigger AI Categorization
  const handleAICategorize = async () => {
    if (!title.trim() && !description.trim()) {
      setError('Please provide at least a title or description before asking AI to categorize.');
      return;
    }
    setError(null);
    setAiLoading(true);
    try {
      const res = await api.ai.categorize(title, description);
      setAiCategorizeData(res);
      if (res.suggested_category) setCategory(res.suggested_category);
      if (res.dietary_tags && res.dietary_tags.length > 0) {
        setDietaryAttributes(res.dietary_tags[0]);
      }
      if (res.estimated_servings_hint) {
        setServings(res.estimated_servings_hint);
        setQuantity(res.estimated_servings_hint);
      }
      if (res.allergens_detected && res.allergens_detected.length > 0) {
        setAllergens(res.allergens_detected.join(', '));
      }
    } catch (err: any) {
      setError('AI categorization was unable to complete. You can still fill fields manually.');
    } finally {
      setAiLoading(false);
    }
  };

  // Trigger AI Completeness Check
  const handleAIImprove = async () => {
    setError(null);
    setAiLoading(true);
    try {
      const res = await api.ai.improve({
        title,
        description,
        category,
        storage_conditions: storageConditions,
        allergens,
        pickup_deadline: pickupDeadline,
      });
      setAiImproveData(res);
    } catch {
      setError('AI review service unavailable.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!safetyDeclaration) {
      setError('You must check and confirm the Food Safety Declaration to proceed.');
      return;
    }

    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }

    if (new Date(pickupDeadline) <= new Date()) {
      setError('Pickup deadline must be set to a future time.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        category,
        quantity: Number(quantity),
        unit,
        estimated_servings: Number(servings),
        preparation_datetime: new Date(prepTime).toISOString(),
        expiry_datetime: new Date(pickupDeadline).toISOString(),
        storage_conditions: storageConditions,
        allergens: allergens || 'None known',
        dietary_attributes: dietaryAttributes,
        pickup_address: pickupAddress,
        pickup_start_time: new Date(pickupStartTime).toISOString(),
        pickup_deadline: new Date(pickupDeadline).toISOString(),
        contact_name: contactName,
        contact_phone: contactPhone,
        food_safety_declaration: true,
      };

      const res = await api.listings.create(payload);
      navigate(`/donor/listings/${res.id}`);
    } catch (err: any) {
      setError(err.message || 'Failed to create food listing.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            List Surplus Food for Redistribution
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Provide accurate staging, packaging, and food-safety details to enable rapid matching with nearby shelters.
          </p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <div className="lg:col-span-2 bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Food Info */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">1. Surplus Details</h3>
                  <button
                    type="button"
                    onClick={handleAICategorize}
                    disabled={aiLoading}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{aiLoading ? 'Analyzing...' : 'AI Auto-Detect & Fill'}</span>
                  </button>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Food Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="e.g. Royal Vegetable Biryani & Raita (50 Servings)"
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detailed Description & Ingredients *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Describe dish components, packaging containers, cooking time, and allergen notes..."
                    className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    >
                      <option value="prepared_meals">Prepared Meals (Cooked)</option>
                      <option value="bakery">Bakery & Breads</option>
                      <option value="packaged_food">Packaged / Dry Groceries</option>
                      <option value="produce">Fresh Produce (Raw)</option>
                      <option value="dairy">Dairy Products</option>
                      <option value="other">Other Edibles</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Dietary Type *</label>
                    <select
                      value={dietaryAttributes}
                      onChange={e => setDietaryAttributes(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    >
                      <option value="vegetarian">Vegetarian</option>
                      <option value="vegan">Vegan</option>
                      <option value="jain">Jain Vegetarian</option>
                      <option value="halal">Halal</option>
                      <option value="gluten_free">Gluten Free</option>
                      <option value="non_vegetarian">Non-Vegetarian</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Known Allergens</label>
                    <input
                      type="text"
                      value={allergens}
                      onChange={e => setAllergens(e.target.value)}
                      placeholder="e.g. Dairy, Nuts, Gluten"
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Quantity *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={quantity}
                      onChange={e => setQuantity(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Unit *</label>
                    <select
                      value={unit}
                      onChange={e => setUnit(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    >
                      <option value="servings">Servings / Meals</option>
                      <option value="kg">Kilograms (kg)</option>
                      <option value="boxes">Boxes / Cartons</option>
                      <option value="trays">Trays / Pans</option>
                      <option value="liters">Liters (L)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Est. Servings *</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={servings}
                      onChange={e => setServings(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Thermal Storage & Timings */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 flex items-center gap-2">
                  <Thermometer className="w-4 h-4 text-amber-500" />
                  <span>2. Thermal Storage & Time Windows</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Condition *</label>
                    <select
                      value={storageConditions}
                      onChange={e => setStorageConditions(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    >
                      <option value="hot_holding">Hot Holding (&gt; 60°C)</option>
                      <option value="refrigerated">Refrigerated (&lt; 4°C)</option>
                      <option value="ambient">Ambient (Room Temp)</option>
                      <option value="frozen">Deep Frozen (&lt; -18°C)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Cooked / Prepared At *</label>
                    <input
                      type="datetime-local"
                      required
                      value={prepTime}
                      onChange={e => setPrepTime(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Deadline *</label>
                    <input
                      type="datetime-local"
                      required
                      value={pickupDeadline}
                      onChange={e => setPickupDeadline(e.target.value)}
                      className="w-full px-3 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Location & Handoff */}
              <div className="space-y-4 pt-4 border-t border-slate-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800">3. Pickup Location & Contact</h3>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Pickup Address (Bay / Gate) *</label>
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={e => setPickupAddress(e.target.value)}
                    placeholder="e.g. 12 MG Road, Ashok Nagar, Bengaluru (Kitchen Gate 2)"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">On-Site Contact Name *</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone *</label>
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>

              {/* Mandatory Food Safety Declaration */}
              <div className="pt-4 border-t border-slate-100">
                <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="safetyDec"
                      required
                      checked={safetyDeclaration}
                      onChange={e => setSafetyDeclaration(e.target.checked)}
                      className="mt-1 w-4 h-4 text-emerald-600 rounded-sm focus:ring-emerald-500 cursor-pointer"
                    />
                    <label htmlFor="safetyDec" className="text-xs text-amber-950 font-medium cursor-pointer leading-relaxed">
                      <strong>Mandatory Food Safety Declaration:</strong> I confirm that this surplus food has been prepared in compliant hygienic conditions, maintained at safe temperatures, and is wholesome for consumption. I understand AnnaSetu coordinates transport logistics but does not independently certify food safety.
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/donor/dashboard')}
                  className="px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-md transition-colors"
                >
                  {submitting ? 'Creating Listing...' : 'Publish Surplus Food Listing'}
                </button>
              </div>
            </form>
          </div>

          {/* AI Advisor Side Panel */}
          <div className="space-y-6">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  <span>AI Listing Co-Pilot</span>
                </div>
                <button
                  type="button"
                  onClick={handleAIImprove}
                  disabled={aiLoading}
                  className="text-xs text-emerald-700 hover:text-emerald-900 font-semibold"
                >
                  Audit Completeness
                </button>
              </div>

              {aiImproveData && (
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Quality Score:</span>
                    <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                      {aiImproveData.completeness_score}% Complete
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    <p className="font-semibold text-slate-700 text-[11px] uppercase">Recommended Additions:</p>
                    {aiImproveData.suggestions.map((s, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{s}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {aiCategorizeData && (
                <div className="space-y-2 text-xs pt-3 border-t border-slate-100">
                  <span className="text-slate-500 font-semibold block text-[11px] uppercase">AI Extracted Summary:</span>
                  <p className="text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-xs italic">
                    "{aiCategorizeData.short_summary}"
                  </p>
                  {aiCategorizeData.missing_fields && aiCategorizeData.missing_fields.length > 0 && (
                    <div className="text-amber-800 bg-amber-50 p-2 rounded-lg text-[11px]">
                      <strong>Missing items noticed:</strong> {aiCategorizeData.missing_fields.join(', ')}
                    </div>
                  )}
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-50 text-[11px] text-slate-500 leading-relaxed border border-slate-200">
                💡 <em>Tip:</em> Listings with explicit storage conditions and accurate deadline windows match with community kitchens 40% faster.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
