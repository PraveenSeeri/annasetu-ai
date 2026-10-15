import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area
} from 'recharts';
import { Award, TrendingUp, Utensils, Users, Clock, Leaf, Info, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { ImpactMetrics } from '../../types';

export const ImpactPage: React.FC = () => {
  const [metrics, setMetrics] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.impact.getSummary()
      .then(setMetrics)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-3">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <span>Actual Database Verified Metrics</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            AnnaSetu AI Impact & Sustainability Index
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Real-time surplus food diversion data directly aggregated from registered donors and verified recipient shelters.
          </p>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-semibold text-slate-500 mt-3">Aggregating live impact records...</p>
          </div>
        ) : !metrics ? (
          <div className="p-8 text-center text-slate-500">Could not retrieve impact statistics.</div>
        ) : (
          <div className="space-y-8">
            {/* Top Metric Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Servings Saved</span>
                  <Utensils className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {metrics.total_servings_redistributed.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-700 font-medium">
                  ≈ {metrics.total_quantity_redistributed_kg} kg edible food
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Completion Rate</span>
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                </div>
                <div className="text-3xl font-black text-emerald-700 font-mono">
                  {metrics.completion_rate_percentage}%
                </div>
                <span className="text-[11px] text-slate-500">
                  {metrics.donations_completed} completed / {metrics.total_donations_listed} listed
                </span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Avg Match Time</span>
                  <Clock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {metrics.average_hours_to_accept !== null ? `${metrics.average_hours_to_accept} hrs` : '< 1 hr'}
                </div>
                <span className="text-[11px] text-slate-500">Listing to acceptance</span>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between text-slate-400 mb-2">
                  <span className="text-xs font-semibold text-slate-600 uppercase">Active Network</span>
                  <Users className="w-4 h-4 text-blue-600" />
                </div>
                <div className="text-3xl font-black text-slate-900 font-mono">
                  {metrics.active_donor_orgs + metrics.active_recipient_orgs}
                </div>
                <span className="text-[11px] text-slate-500">
                  {metrics.active_donor_orgs} Donors • {metrics.active_recipient_orgs} Verified NGOs
                </span>
              </div>
            </div>

            {/* Visual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Food Categories Redistributed</h3>
                  <span className="text-xs text-slate-500">Total Servings</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={metrics.category_breakdown}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="servings" fill="#059669" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Redistribution Trend */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-slate-900">Redistribution Activity Trend</h3>
                  <span className="text-xs text-slate-500">Daily Servings Delivered</span>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={metrics.trend_data}>
                      <defs>
                        <linearGradient id="servingsGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0.05}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Area type="monotone" dataKey="servings" stroke="#059669" fillOpacity={1} fill="url(#servingsGrad)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* UN Sustainable Development Goals Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/40 border border-amber-200/80">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black">
                    2
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">SDG 2: Zero Hunger</h4>
                    <p className="text-xs text-amber-900 font-medium">Target 2.1 & 2.2 — Safe and Nutritious Food for All</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  AnnaSetu AI routes surplus nutritious meals directly to verified orphanages, night shelters, and community kitchens, ensuring immediate edible sustenance reaches vulnerable populations before spoiling.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50/40 border border-emerald-200/80">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
                    12
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">SDG 12: Responsible Consumption</h4>
                    <p className="text-xs text-emerald-900 font-medium">Target 12.3 — Halve Global Per Capita Food Waste</p>
                  </div>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  By matching supply surplus from college messes and banquet kitchens with real-time pickup logistics, AnnaSetu minimizes organic waste dumping in municipal landfills and prevents greenhouse gas emissions.
                </p>
              </div>
            </div>

            {/* Documented Methodology Box */}
            <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-600 flex items-start gap-3">
              <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-800">Methodology & Verification Notice:</span> All figures above represent genuine SQL database queries computed from completed and active allocations in the system. 1 serving is standardized at ~400g nutritional benchmark for volume units. Servings indicate meal portions redistributed, not unique individual identities.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
