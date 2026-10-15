import React from 'react';
import { ShieldCheck, Lock, EyeOff, Bot } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-2xs space-y-8 text-sm text-slate-700 leading-relaxed">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="text-xs text-slate-500 mt-1">AnnaSetu AI Data Protection & AI Privacy Standards</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-emerald-600" />
            1. Role-Scoped Data Access
          </h2>
          <p>
            AnnaSetu AI enforces strict backend role-based access control. Private donor records, contact numbers, and specific internal inventory notes are never exposed publicly. Only verified recipient organizations and assigned volunteers can see necessary pickup addresses.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Bot className="w-4 h-4 text-emerald-600" />
            2. Responsible AI Processing & Gemini API
          </h2>
          <p>
            When utilizing Google Gemini models, AnnaSetu AI sends only sanitized food item descriptions and general logistics queries to the AI endpoint. No personal credentials, beneficiary names, or full database dumps are ever transmitted to third-party language models.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <EyeOff className="w-4 h-4 text-emerald-600" />
            3. Beneficiary Dignity
          </h2>
          <p>
            Individual beneficiary identities are never tracked, aggregated, or displayed in impact metrics. Impact reporting measures solely meal servings redistributed and food waste prevented.
          </p>
        </section>
      </div>
    </div>
  );
};
