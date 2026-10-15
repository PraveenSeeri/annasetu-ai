import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Sprout,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Users,
  UtensilsCrossed,
  HeartHandshake,
  Truck,
  CheckCircle2,
  TrendingUp,
  Award
} from 'lucide-react';
import { api } from '../../services/api';
import { ImpactMetrics } from '../../types';

export const LandingPage: React.FC = () => {
  const [impact, setImpact] = useState<ImpactMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.impact.getSummary()
      .then(setImpact)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-emerald-950 via-emerald-900 to-slate-900 text-white pt-16 pb-24 sm:pt-24 sm:pb-32">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px]"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-800/80 border border-emerald-600/50 text-emerald-200 text-xs sm:text-sm font-semibold mb-6 shadow-md">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered Surplus Food Redistribution • UN SDG 2 & SDG 12</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-tight sm:leading-none mb-6">
            Share More. Waste Less. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300">
              Feed Hope.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-emerald-100/90 max-w-2xl mx-auto mb-10 leading-relaxed font-normal">
            AnnaSetu AI instantly bridges restaurants, hostels, and caterers with verified community kitchens and shelters through smart matching, volunteer dispatch, and food safety safeguards.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-md mx-auto">
            <Link
              to="/register"
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 flex items-center justify-center gap-2"
            >
              <span>Join as Donor or NGO</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              to="/impact"
              className="w-full sm:w-auto px-7 py-3.5 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl backdrop-blur-md border border-white/20 transition-all flex items-center justify-center gap-2"
            >
              <span>View Live Impact</span>
              <TrendingUp className="w-5 h-5 text-emerald-300" />
            </Link>
          </div>

          {/* Real-time platform pulse */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-12 border-t border-emerald-800/60 text-left">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 block font-mono">
                {loading ? '...' : (impact ? impact.total_servings_redistributed.toLocaleString() : '0')}
              </span>
              <span className="text-xs text-emerald-200">Servings Redistributed</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-emerald-300 block font-mono">
                {loading ? '...' : (impact ? `${impact.completion_rate_percentage}%` : '0%')}
              </span>
              <span className="text-xs text-emerald-200">Collection Success Rate</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-teal-300 block font-mono">
                {loading ? '...' : (impact ? impact.active_recipient_orgs : '0')}
              </span>
              <span className="text-xs text-emerald-200">Verified Shelters</span>
            </div>
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
              <span className="text-2xl sm:text-3xl font-black text-amber-300 block font-mono">
                {loading ? '...' : (impact ? impact.total_donations_listed : '0')}
              </span>
              <span className="text-xs text-emerald-200">Surplus Batches Staged</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Problem & Mission */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              The Reality We Address
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Food is Wasted While Vulnerable Communities Go Hungry
            </h2>
            <p className="text-slate-600 mt-3 text-base leading-relaxed">
              Every evening, catering halls, college messes, and restaurants dispose of wholesome prepared meals simply because they lack an immediate, verified logistics channel to reach shelters before quality degrades.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                <UtensilsCrossed className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">67 Million Tonnes</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Estimated food wasted annually in India, with commercial and institutional hospitality contributing significant volumes of edible meals.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                <HeartHandshake className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Shelters Underfunded</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Community kitchens and orphanages struggle with soaring food procurement budgets, relying heavily on erratic ad-hoc local donations.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 shadow-2xs hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg text-slate-900 mb-2">Coordination Void</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Traditional donation is slowed by manual phone calls, uncertain volunteer timing, and lack of accountability regarding food hygiene.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. How It Works */}
      <section className="py-20 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
              Seamless Workflow
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-4 tracking-tight">
              Redistributing Food in 4 Structured Steps
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm mb-4">1</span>
              <h3 className="font-bold text-base text-slate-900 mb-2">Donors List Surplus</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Kitchens specify food category, servings, storage temperature, preparation timestamp, and confirm food safety declarations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm mb-4">2</span>
              <h3 className="font-bold text-base text-slate-900 mb-2">Smart Hybrid Matching</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Our engine screens verified recipients by distance, distribution capacity, and urgency, ranking top matches with transparent score explanations.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm mb-4">3</span>
              <h3 className="font-bold text-base text-slate-900 mb-2">Atomic Reservation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verified recipients request allocations. The backend atomically locks quantity to prevent double-booking or over-commitment.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs relative">
              <span className="w-8 h-8 rounded-full bg-emerald-700 text-white font-bold flex items-center justify-center text-sm mb-4">4</span>
              <h3 className="font-bold text-base text-slate-900 mb-2">Volunteer Dispatch</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Volunteers accept assigned pickup tasks, follow sanitary handling instructions, confirm pickup, and record verified delivery.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Role Features */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Designed for Every Stakeholder
            </h2>
            <p className="text-slate-600 mt-2 text-sm">
              Role-based dashboards, isolated permissions, and actionable tooling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Donors */}
            <div className="rounded-3xl border border-slate-200 p-7 bg-gradient-to-b from-white to-slate-50 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold mb-4">
                  <UtensilsCrossed className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Food Donors</h3>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Restaurants, university hostels, caterers, and corporate dining facilities.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI-assisted listing categorization</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Safe status-driven reservation control</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Track servings redirected from landfills</li>
                </ul>
              </div>
              <Link to="/register" className="mt-6 py-2.5 text-center bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-bold rounded-xl text-xs transition-colors">
                Register as Food Donor
              </Link>
            </div>

            {/* Recipients */}
            <div className="rounded-3xl border-2 border-emerald-600 p-7 bg-white flex flex-col justify-between shadow-md relative">
              <span className="absolute -top-3 right-6 bg-emerald-700 text-white text-[10px] font-extrabold uppercase px-3 py-1 rounded-full">
                Strict Verification
              </span>
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-bold mb-4">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Verified Recipients</h3>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Registered NGOs, community kitchens, shelter homes, and relief kitchens.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> NGO DARPAN verification queue</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> Smart recommendations by distance & capacity</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /> AI natural-language surplus food search</li>
                </ul>
              </div>
              <Link to="/register" className="mt-6 py-2.5 text-center bg-emerald-700 text-white hover:bg-emerald-800 font-bold rounded-xl text-xs transition-colors">
                Apply for NGO Verification
              </Link>
            </div>

            {/* Volunteers */}
            <div className="rounded-3xl border border-slate-200 p-7 bg-gradient-to-b from-white to-slate-50 flex flex-col justify-between shadow-2xs">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold mb-4">
                  <Truck className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">Volunteers</h3>
                <p className="text-xs text-slate-600 mb-5 leading-relaxed">
                  Community delivery partners providing timely vehicle transportation.
                </p>
                <ul className="space-y-2.5 text-xs text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Authorized pickup instructions & route</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Step-by-step handoff verification</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-amber-600" /> Private data protection guarantees</li>
                </ul>
              </div>
              <Link to="/register" className="mt-6 py-2.5 text-center bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors">
                Volunteer to Transport Food
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Food Safety and Trust */}
      <section className="py-16 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Food Safety Principles</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">
              Safety Always Overrides Algorithms
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              AnnaSetu AI does not claim that AI can inspect food or declare it safe. Donors must certify compliance with applicable local requirements. Expired or unsuitably staged food is permanently excluded from matching, and all users can flag safety issues for administrative investigation.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs border border-slate-700">✓ Mandatory Safety Declarations</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs border border-slate-700">✓ Strict Temperature Staging</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs border border-slate-700">✓ Automatic Deadline Expiration</span>
              <span className="px-3 py-1.5 rounded-lg bg-slate-800 text-xs border border-slate-700">✓ Audit Logged Actions</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
