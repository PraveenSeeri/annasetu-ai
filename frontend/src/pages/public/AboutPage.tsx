import React from 'react';
import { Sprout, Award, ShieldCheck, Heart, Sparkles, Target, Compass } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
            <Award className="w-4 h-4 text-amber-500" />
            <span>Smart Surplus Food Redistribution Platform</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            About AnnaSetu AI
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto italic">
            “Share More. Waste Less. Feed Hope.”
          </p>
        </div>

        {/* Narrative & Context */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs space-y-6 text-sm text-slate-700 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-600" />
            Origin & Engineering Vision
          </h2>
          <p>
            AnnaSetu AI was developed as an advanced surplus food redistribution engineering platform. The platform directly tackles United Nations Sustainable Development Goals: <strong>SDG 2 (Zero Hunger)</strong> and <strong>SDG 12 (Responsible Consumption and Production)</strong>.
          </p>
          <p>
            In Indian metropolitan areas, restaurants, wedding banquet caterers, corporate dining cafeterias, and university hostel messes generate substantial edible surplus food daily. Concurrently, dozens of nearby shelter homes and community kitchens struggle to fulfill basic daily meal requirements.
          </p>
          <p>
            AnnaSetu AI solves this gap by transforming an uncoordinated, manual process into an automated, transparent, and legally responsible surplus food distribution network.
          </p>
        </div>

        {/* Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <Target className="w-8 h-8 text-emerald-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 mb-2">Safe Redistribution</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prioritizing food safety compliance over raw speed. Enforcing temperature staging and expiry cutoffs before matching.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <Sparkles className="w-8 h-8 text-amber-500 mb-3" />
            <h3 className="font-bold text-base text-slate-900 mb-2">Hybrid Intelligence</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Google Gemini SDK integration paired with transparent deterministic fallback algorithms to ensure 100% operational reliability.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200">
            <ShieldCheck className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-bold text-base text-slate-900 mb-2">Role Isolation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Backend-enforced RBAC ensuring privacy for donors, strict verification for NGOs, and secure task dispatch for volunteers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
