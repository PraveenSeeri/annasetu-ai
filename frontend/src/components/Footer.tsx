import React from 'react';
import { Link } from 'react-router-dom';
import { Sprout, ShieldAlert, Award, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand & Mission */}
          <div className="space-y-3 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Sprout className="w-5 h-5 text-emerald-100" />
              </div>
              <span className="font-bold text-lg text-white">AnnaSetu AI</span>
            </div>
            <p className="text-xs text-slate-400 italic">“Share More. Waste Less. Feed Hope.”</p>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart surplus food redistribution bridging food businesses with verified community kitchens and shelters.
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-950 border border-emerald-800 text-emerald-300 text-xs font-semibold">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                Zero Hunger • UN SDG 2 & SDG 12
              </span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/" className="hover:text-emerald-400 transition-colors">Home</Link></li>
              <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</Link></li>
              <li><Link to="/impact" className="hover:text-emerald-400 transition-colors">Live Impact Dashboard</Link></li>
              <li><Link to="/about" className="hover:text-emerald-400 transition-colors">About AnnaSetu AI</Link></li>
              <li><Link to="/login" className="hover:text-emerald-400 transition-colors">Platform Sign In</Link></li>
            </ul>
          </div>

          {/* Sustainable Development Goals */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">UN SDG Alignment</h4>
            <div className="space-y-2 text-xs">
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-amber-400 block mb-0.5">SDG 2 • Zero Hunger</span>
                <span className="text-[11px] text-slate-400">Directly diverting wholesome meals to verified hunger-relief centers.</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700/60">
                <span className="font-bold text-emerald-400 block mb-0.5">SDG 12 • Responsible Consumption</span>
                <span className="text-[11px] text-slate-400">Eliminating preventable food waste in commercial and institutional kitchens.</span>
              </div>
            </div>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Trust & Security</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/privacy" className="hover:text-emerald-400 transition-colors">Privacy & Data Handling</Link></li>
              <li><Link to="/terms" className="hover:text-emerald-400 transition-colors">Terms & Food Safety Declaration</Link></li>
              <li className="pt-2 text-[11px] text-slate-400 leading-relaxed">
                <ShieldAlert className="w-3.5 h-3.5 text-amber-400 inline mr-1" />
                AnnaSetu coordinates distribution logistics. Donors and recipients are legally responsible for food handling and safety.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Banner */}
        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 AnnaSetu AI Platform. All rights reserved. Supporting UN SDG 2 & SDG 12.</p>
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <span>Built with purpose to nourish communities</span>
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
