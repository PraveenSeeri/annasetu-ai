import React, { useState, useEffect } from 'react';
import { User, Truck, Phone, Mail, ShieldCheck, Award, Heart, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { PickupTask } from '../../types';

export const VolunteerProfile: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [vehicle, setVehicle] = useState('Motorcycle / Scooter (with delivery box)');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.pickups.getMyTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const completed = tasks.filter((t) => t.status === 'COMPLETED');
  const estimatedMeals = completed.reduce((acc, t) => acc + (t.listing?.estimated_servings || 0), 0);
  const reliabilityRate = tasks.length > 0 ? `${Math.round((completed.length / tasks.length) * 100)}%` : 'Active';

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700">
              <User className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                  Active Volunteer Courier
                </span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md">
                  Verified Good Samaritan
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 mt-1">{user?.full_name}</h1>
              <p className="text-xs text-slate-500">Member since {new Date(user?.created_at || '').toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        {/* Impact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-purple-700 mb-2">
              <Truck className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-purple-50 px-2 py-0.5 rounded">Missions</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{completed.length}</p>
            <span className="text-xs text-slate-500">Completed deliveries</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-emerald-700 mb-2">
              <Heart className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 px-2 py-0.5 rounded">Impact</span>
            </div>
            <p className="text-2xl font-black text-emerald-700">~{estimatedMeals}</p>
            <span className="text-xs text-slate-500">Meals redistributed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center justify-between text-amber-600 mb-2">
              <Award className="w-5 h-5" />
              <span className="text-[10px] font-bold uppercase tracking-wider bg-amber-50 px-2 py-0.5 rounded">Rating</span>
            </div>
            <p className="text-2xl font-black text-slate-900">{reliabilityRate}</p>
            <span className="text-xs text-slate-500">On-time pickup reliability</span>
          </div>
        </div>

        {/* Courier Preferences & Transport Info */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
          <h2 className="text-base font-bold text-slate-900">Courier Profile Details & Equipment</h2>

          {savedSuccess && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4" />
              <span>Courier equipment profile saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSave} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  disabled
                  value={user?.full_name || ''}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  disabled
                  value={user?.email || ''}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Phone Number</label>
                <input
                  type="text"
                  disabled
                  value={user?.phone || 'Not provided'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 font-medium cursor-not-allowed"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Primary Transport Vehicle</label>
                <select
                  value={vehicle}
                  onChange={(e) => setVehicle(e.target.value)}
                  className="w-full p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-purple-600 focus:outline-none"
                >
                  <option value="Motorcycle / Scooter (with delivery box)">Motorcycle / Scooter (with delivery box)</option>
                  <option value="Four-Wheeler / Car (climate controlled)">Four-Wheeler / Car (climate controlled)</option>
                  <option value="Mini-Van / Cargo Auto">Mini-Van / Cargo Auto</option>
                  <option value="Bicycle (short distance)">Bicycle (short distance)</option>
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Safe Transport Charter & FSSAI Guidelines */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center gap-2 text-emerald-800">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-bold text-slate-900">Volunteer Food Safety & Hygiene Charter</h3>
          </div>
          <p className="text-xs text-slate-600">
            As a registered AnnaSetu volunteer courier, you uphold the Food Safety and Standards (Recovery of Surplus Food) Regulations:
          </p>

          <div className="space-y-2 text-xs text-slate-700">
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Thermal Chain Integrity:</strong> Hot food must be collected and delivered hot (&gt;60°C); chilled food must stay below 5°C during transit using insulated thermal pouches or ice packs.
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Hygiene & Clean Carriers:</strong> Transport containers, crates, or bags must be sanitized and protected from dust, rain, exhaust fumes, and chemical contamination.
              </span>
            </div>

            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                <strong>Strict Timeliness:</strong> Deliveries must be completed directly without unnecessary stops to preserve freshness within the designated 2-hour window.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
