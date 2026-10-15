import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, CheckCircle2, Clock, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { PickupTask } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<PickupTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.pickups.getMyTasks()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const activeTask = tasks.find(t => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP'].includes(t.status));
  const completedTasks = tasks.filter(t => t.status === 'COMPLETED').length;

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-800 bg-purple-50 px-2.5 py-0.5 rounded-md">
              Volunteer Courier Portal
            </span>
            <h1 className="text-2xl font-black text-slate-900 mt-1">
              Welcome, {user?.full_name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Transport wholesome surplus meals from kitchens to shelters within safe pickup windows.
            </p>
          </div>

          <Link
            to="/volunteer/tasks"
            className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center gap-2 text-sm shrink-0"
          >
            <Truck className="w-4 h-4" />
            <span>View Tasks & Claims</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-slate-500 font-semibold uppercase">Active Assignment</span>
            <p className="text-2xl font-black text-purple-700 font-mono mt-1">{activeTask ? '1 Task' : 'None'}</p>
            <span className="text-[11px] text-slate-400">In coordination</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-xs text-teal-700 font-semibold uppercase">Completed Deliveries</span>
            <p className="text-2xl font-black text-teal-700 font-mono mt-1">{completedTasks}</p>
            <span className="text-[11px] text-teal-600">Safely transported</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs col-span-2 sm:col-span-1">
            <span className="text-xs text-emerald-700 font-semibold uppercase">Volunteer Standing</span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">Verified</p>
            <span className="text-[11px] text-emerald-600">Active courier</span>
          </div>
        </div>

        {/* Current Active Mission */}
        {activeTask && (
          <div className="bg-white p-6 rounded-2xl border-2 border-emerald-600 shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                Active Delivery in Progress
              </span>
              <StatusBadge status={activeTask.status} size="sm" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-slate-900">{activeTask.listing?.title || 'Surplus Meal Batch'}</h3>
              <p className="text-xs text-slate-600 mt-1">
                Pickup deadline: <strong className="text-rose-700">{new Date(activeTask.pickup_deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
              </p>
            </div>

            <div className="pt-2 flex justify-end">
              <Link
                to={`/volunteer/tasks/${activeTask.id}`}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition-colors flex items-center gap-1.5"
              >
                <span>Update Status / Instructions</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
