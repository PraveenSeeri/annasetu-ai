import React from 'react';
import { ShieldAlert } from 'lucide-react';

export const FoodSafetyBanner: React.FC = () => {
  return (
    <div className="bg-amber-50 border-b border-amber-200 text-amber-900 text-xs sm:text-sm px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>
            <strong>Food Safety Protocol:</strong> AnnaSetu coordinates surplus food logistics but does not independently inspect food. Donors and recipients must comply with local hygiene and safe handling standards.
          </span>
        </div>
        <span className="hidden md:inline-block font-semibold text-amber-800 shrink-0">
          SDG 2 • Zero Hunger
        </span>
      </div>
    </div>
  );
};
