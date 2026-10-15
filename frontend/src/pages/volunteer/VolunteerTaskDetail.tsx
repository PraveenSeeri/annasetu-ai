import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Truck,
  MapPin,
  Clock,
  Phone,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  ShieldCheck,
  Thermometer,
  Calendar,
  Building,
  User,
  FileText
} from 'lucide-react';
import { api } from '../../services/api';
import { PickupTask } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const VolunteerTaskDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [task, setTask] = useState<PickupTask | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadTask = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await api.pickups.getById(id);
      setTask(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load task details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTask();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    if (!id) return;
    setSubmitting(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const updated = await api.pickups.updateStatus(id, newStatus, notes.trim() || undefined);
      setTask(updated);
      setNotes('');
      setSuccessMsg(`Task successfully updated to "${newStatus.replace('_', ' ')}"!`);
    } catch (err: any) {
      setError(err.message || `Failed to update status to ${newStatus}`);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 px-4 flex justify-center items-center">
        <div className="text-center space-y-3">
          <Truck className="w-10 h-10 text-purple-700 animate-bounce mx-auto" />
          <p className="text-sm font-bold text-slate-700">Loading delivery task details...</p>
        </div>
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="bg-slate-50 min-h-screen py-12 px-4">
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-800">Task Not Found or Inaccessible</h2>
          <p className="text-xs text-slate-600">{error}</p>
          <Link
            to="/volunteer/tasks"
            className="inline-flex items-center gap-2 px-4 py-2 bg-purple-700 text-white rounded-xl text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Tasks</span>
          </Link>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const steps = [
    { key: 'ASSIGNED', label: 'Assigned', time: task.assigned_at },
    { key: 'ACCEPTED', label: 'Accepted', time: task.accepted_at },
    { key: 'PICKED_UP', label: 'Food Picked Up', time: task.picked_up_at },
    { key: 'COMPLETED', label: 'Delivered', time: task.completed_at },
  ];

  const currentStepIdx = steps.findIndex((s) => s.key === task.status);

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between">
          <Link
            to="/volunteer/tasks"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 hover:text-purple-900 bg-purple-50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to All Tasks</span>
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-slate-500">Run #{task.id}</span>
            <StatusBadge status={task.status} size="sm" />
          </div>
        </div>

        {/* Notifications */}
        {successMsg && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{successMsg}</span>
            <button onClick={() => setSuccessMsg(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{error}</span>
            <button onClick={() => setError(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Lifecycle Tracker */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">Transport Timeline</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {steps.map((step, idx) => {
              const isPast = currentStepIdx >= idx && currentStepIdx !== -1;
              const isCurrent = step.key === task.status;

              return (
                <div
                  key={step.key}
                  className={`p-3.5 rounded-xl border text-center transition-all ${
                    isCurrent
                      ? 'bg-purple-50 border-purple-300 ring-2 ring-purple-500'
                      : isPast
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-slate-50 border-slate-200 opacity-60'
                  }`}
                >
                  <div className="flex justify-center mb-1.5">
                    {isPast ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-500">
                        {idx + 1}
                      </div>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900">{step.label}</h4>
                  <span className="text-[10px] text-slate-500 block mt-0.5">
                    {step.time ? new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Pending'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Interactive Action Control Panel */}
        {task.status !== 'COMPLETED' && (
          <div className="bg-white p-6 rounded-2xl border-2 border-purple-600 shadow-md space-y-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full">
                Action Required
              </span>
              <h3 className="text-lg font-black text-slate-900 mt-2">Update Transport Stage</h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Progress this mission as you arrive at the donor kitchen or complete handover at the shelter.
              </p>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block">
                Courier Transit Notes (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Food checked in thermal box at 65°C; packaged in 4 sealed insulated containers; handed over to shelter supervisor."
                className="w-full text-xs p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-purple-600 focus:outline-none"
                rows={2}
              />
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              {task.status === 'ASSIGNED' && (
                <>
                  <button
                    onClick={() => handleUpdateStatus('ACCEPTED')}
                    disabled={submitting}
                    className="px-5 py-2.5 bg-purple-700 hover:bg-purple-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Accept Assignment</span>
                  </button>
                  <button
                    onClick={() => handleUpdateStatus('DECLINED')}
                    disabled={submitting}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Decline & Release to Others</span>
                  </button>
                </>
              )}

              {task.status === 'ACCEPTED' && (
                <button
                  onClick={() => handleUpdateStatus('PICKED_UP')}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Truck className="w-4 h-4" />
                  <span>Confirm Food Collected from Donor</span>
                </button>
              )}

              {task.status === 'PICKED_UP' && (
                <button
                  onClick={() => handleUpdateStatus('COMPLETED')}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Safe Handover & Delivery Complete</span>
                </button>
              )}
            </div>
          </div>
        )}

        {task.status === 'COMPLETED' && (
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
            <h3 className="text-lg font-black text-emerald-900">Delivery Mission Successfully Completed!</h3>
            <p className="text-xs text-emerald-700 max-w-md mx-auto">
              Surplus wholesome food was safely transported and handed over to the recipient organization. Thank you
              for directly contributing to Zero Hunger (SDG 2).
            </p>
          </div>
        )}

        {/* Detailed Routing Cards: Pickup & Delivery */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Pickup (Donor) Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-amber-700">
              <Building className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Origin / Donor Kitchen</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {task.listing?.donor_org_name || 'Donor Organization'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                <span>{task.listing?.pickup_address || 'Address provided upon assignment'}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>
                  Pickup Deadline:{' '}
                  <strong className="text-rose-700">
                    {new Date(task.pickup_deadline).toLocaleString([], {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </strong>
                </span>
              </div>

              {task.pickup_instructions && (
                <div className="bg-amber-50 p-2.5 rounded-lg text-[11px] text-amber-800">
                  <strong>Pickup Instructions:</strong> {task.pickup_instructions}
                </div>
              )}
            </div>
          </div>

          {/* Delivery (Recipient) Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center gap-2 text-emerald-700">
              <Building className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Destination / Shelter</span>
            </div>

            <div>
              <h4 className="text-sm font-bold text-slate-900">
                {task.recipient_org_name || 'Recipient Community Organization'}
              </h4>
              <p className="text-xs text-slate-600 mt-1 flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>{task.recipient_address || 'Authorized beneficiary community kitchen'}</span>
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
              {task.delivery_instructions ? (
                <div className="bg-emerald-50 p-2.5 rounded-lg text-[11px] text-emerald-800">
                  <strong>Delivery Instructions:</strong> {task.delivery_instructions}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500 italic">
                  Deliver to main receiving bay. Staff on duty will inspect food temp and sign off.
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Food Batch Safety & Specifications */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <h3 className="text-sm font-bold text-slate-900">Surplus Food Specifications & Hygiene Directives</h3>
            </div>
            <span className="text-xs bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded-md">
              {task.listing?.category?.replace('_', ' ').toUpperCase()}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Quantity</span>
              <p className="font-bold text-slate-800 mt-0.5">
                {task.listing?.quantity} {task.listing?.unit}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Estimated Servings</span>
              <p className="font-bold text-emerald-700 mt-0.5">~{task.listing?.estimated_servings} meals</p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Storage Rule</span>
              <p className="font-bold text-blue-700 mt-0.5">
                {task.listing?.storage_conditions?.replace('_', ' ') || 'Standard room temp'}
              </p>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Allergens</span>
              <p className="font-bold text-amber-700 mt-0.5">{task.listing?.allergens || 'None declared'}</p>
            </div>
          </div>

          {task.notes && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
              <strong>Mission Audit Trail / Notes:</strong>
              <p className="mt-1 font-mono text-[11px] text-slate-600">{task.notes}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
