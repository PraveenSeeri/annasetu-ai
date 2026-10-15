import React from 'react';
import { ShieldAlert, FileText, CheckCircle2 } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white p-8 sm:p-12 rounded-2xl border border-slate-200 shadow-2xs space-y-8 text-sm text-slate-700 leading-relaxed">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Terms of Service & Food Safety Protocols</h1>
          <p className="text-xs text-slate-500 mt-1">Platform Rules & Mutual Safety Obligations</p>
        </div>

        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
          <ShieldAlert className="w-5 h-5 text-amber-600 mb-1" />
          <h3 className="font-bold text-sm">Mandatory Food Safety Notice</h3>
          <p className="mt-1">
            AnnaSetu AI serves as a digital coordination and matching platform. AnnaSetu AI does not physically inspect, laboratory-test, or independently certify the safety or microbiological quality of donated food items.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">1. Donor Obligations</h2>
          <p>
            Food donors must strictly declare that all surplus food was prepared in compliant sanitary conditions, stored within safe thermal boundaries (hot holding &gt; 60°C or refrigeration &lt; 4°C), and marked with realistic pickup deadlines prior to quality deterioration.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">2. Recipient Inspection Rights</h2>
          <p>
            Recipient organizations maintain the right and duty to inspect all food upon arrival. If any temperature abuse, contamination, or packaging compromise is observed, the recipient is instructed to reject the batch and log a Safety Report for immediate administrative audit.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-base font-bold text-slate-900">3. Demonstration & Operational Disclaimer</h2>
          <p>
            AnnaSetu AI operates as a surplus food logistics and coordination framework. Registered donor institutions and recipient organizations operate under mutual food safety and Good Samaritan protocols.
          </p>
        </section>
      </div>
    </div>
  );
};
