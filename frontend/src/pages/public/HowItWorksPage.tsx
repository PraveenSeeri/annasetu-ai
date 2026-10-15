import React, { useState } from 'react';
import { Utensils, Users, Truck, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const HowItWorksPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'donor' | 'recipient' | 'volunteer'>('donor');

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-10">
        <div className="text-center space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
            Platform Walkthrough
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            How AnnaSetu AI Coordinates Redistribution
          </h1>
          <p className="text-sm text-slate-600 max-w-xl mx-auto">
            Choose your role below to explore the exact coordination steps and safeguards.
          </p>
        </div>

        {/* Role Tabs */}
        <div className="flex justify-center">
          <div className="inline-flex p-1.5 bg-slate-200/80 rounded-2xl gap-2">
            <button
              onClick={() => setActiveTab('donor')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'donor'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>For Food Donors</span>
            </button>

            <button
              onClick={() => setActiveTab('recipient')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'recipient'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>For NGOs & Shelters</span>
            </button>

            <button
              onClick={() => setActiveTab('volunteer')}
              className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                activeTab === 'volunteer'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>For Volunteers</span>
            </button>
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-2xs">
          {activeTab === 'donor' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Donor Journey: Commercial & Hostel Kitchens</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">1</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Create Listing with AI Assist</h4>
                  <p className="text-xs text-slate-600">
                    Input dish description. Click "AI Categorize" to auto-detect categories, dietary tags, and verify packaging temperature guidelines.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">2</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Review Verified Match Scores</h4>
                  <p className="text-xs text-slate-600">
                    View recommended local shelters filtered by service radius and capacity, with transparent match factor explanations.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">3</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Accept & Dispatch</h4>
                  <p className="text-xs text-slate-600">
                    Confirm recipient request. A volunteer pickup task is automatically scheduled and tracked to completion.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'recipient' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Recipient Journey: Shelters & Community Kitchens</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">1</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Organization Verification</h4>
                  <p className="text-xs text-slate-600">
                    Submit NGO registration or trust documents. Platform administrators review and certify organizations before food requests are unlocked.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">2</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">AI Natural Language Search</h4>
                  <p className="text-xs text-slate-600">
                    Query naturally: "Vegetarian meals within 10 km urgent" to instantly discover surplus food matching your kitchen's meal line.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">3</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Atomic Allocation</h4>
                  <p className="text-xs text-slate-600">
                    Request full or partial servings. Quantity is atomically locked to prevent double-booking or disappointment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'volunteer' && (
            <div className="space-y-6">
              <h3 className="text-xl font-bold text-slate-900">Volunteer Journey: Timely Urban Transportation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">1</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Accept Assigned Tasks</h4>
                  <p className="text-xs text-slate-600">
                    Receive in-app notification when matched with an accepted donation. Review pickup deadlines and handling instructions.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">2</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Collect & Confirm Hand-Off</h4>
                  <p className="text-xs text-slate-600">
                    Meet kitchen manager at designated loading bay, confirm thermal container seals, and click "Picked Up" in app.
                  </p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center mb-3">3</span>
                  <h4 className="font-bold text-sm text-slate-900 mb-1">Deliver & Complete</h4>
                  <p className="text-xs text-slate-600">
                    Hand food over to shelter staff. Both parties verify handover, completing the donation lifecycle.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="text-center pt-6">
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-md text-sm transition-colors"
          >
            <span>Get Started with AnnaSetu AI</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};
