import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, MapPin, CheckCircle2, ChevronRight, Package, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../../services/api';
import { PickupTask } from '../../types';
import { StatusBadge } from '../../components/StatusBadge';
import { useAuth } from '../../context/AuthContext';

export const VolunteerTasks: React.FC = () => {
  const { user } = useAuth();
  const [myTasks, setMyTasks] = useState<PickupTask[]>([]);
  const [unassignedTasks, setUnassignedTasks] = useState<PickupTask[]>([]);
  const [activeTab, setActiveTab] = useState<'assigned' | 'available' | 'completed'>('assigned');
  const [loading, setLoading] = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [mine, unassigned] = await Promise.all([
        api.pickups.getMyTasks(),
        api.pickups.getUnassigned(),
      ]);
      setMyTasks(mine);
      setUnassignedTasks(unassigned);
    } catch (err: any) {
      console.error('Failed to load tasks', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleClaim = async (taskId: number) => {
    setClaimingId(taskId);
    try {
      await api.pickups.claim(taskId);
      setNotification({
        type: 'success',
        message: 'Successfully claimed pickup task! Please review the pickup window and address.',
      });
      await loadData();
      setActiveTab('assigned');
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to claim task. It may have already been assigned.',
      });
    } finally {
      setClaimingId(null);
    }
  };

  const activeAssigned = myTasks.filter((t) => ['ASSIGNED', 'ACCEPTED', 'PICKED_UP'].includes(t.status));
  const completedTasks = myTasks.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-md">
                Volunteer Transport
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Safe Food Relays</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Pickup & Delivery Assignments</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Claim available runs or manage active food transport missions across Bengaluru.
            </p>
          </div>

          <button
            onClick={loadData}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Refresh tasks"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Alerts */}
        {notification && (
          <div
            className={`p-4 rounded-xl border text-sm flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{notification.message}</span>
            <button
              onClick={() => setNotification(null)}
              className="text-xs underline font-bold ml-4 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Controls */}
        <div className="flex gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('assigned')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'assigned'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>My Active Assignments</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'assigned' ? 'bg-purple-900 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {activeAssigned.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('available')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'available'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Available to Claim</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'available' ? 'bg-purple-900 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {unassignedTasks.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 cursor-pointer ${
              activeTab === 'completed'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>Completed Missions</span>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'completed' ? 'bg-purple-900 text-white' : 'bg-slate-200 text-slate-700'
              }`}
            >
              {completedTasks.length}
            </span>
          </button>
        </div>

        {/* Tab 1: Active Assigned */}
        {activeTab === 'assigned' && (
          <div className="space-y-4">
            {activeAssigned.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <Truck className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No active assignments</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  You do not currently have any active pickups assigned. Check the "Available to Claim" tab to help
                  transport surplus meals!
                </p>
                <button
                  onClick={() => setActiveTab('available')}
                  className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors mt-2 cursor-pointer"
                >
                  Browse Available Pickups ({unassignedTasks.length})
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeAssigned.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-500">Task #{task.id}</span>
                        <StatusBadge status={task.status} size="sm" />
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {task.listing?.title || 'Surplus Meal Package'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {task.listing?.quantity} {task.listing?.unit} • ~{task.listing?.estimated_servings} servings
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-700">Pickup:</strong>{' '}
                            {task.listing?.pickup_address || 'Donor address'}
                          </div>
                        </div>

                        {task.recipient_org_name && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-700">Deliver to:</strong> {task.recipient_org_name}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <div>
                            <strong className="text-slate-700">Deadline:</strong>{' '}
                            <span className="text-rose-700 font-semibold">
                              {new Date(task.pickup_deadline).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        Assigned: {new Date(task.created_at).toLocaleDateString()}
                      </span>
                      <Link
                        to={`/volunteer/tasks/${task.id}`}
                        className="px-4 py-2 bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5"
                      >
                        <span>Manage & Progress</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Available to Claim */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {unassignedTasks.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">All pickups currently assigned!</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  Every confirmed donation currently has a courier assigned or is pending reservation. Check back
                  shortly as new surplus donations are matched.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {unassignedTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono font-bold text-slate-500">Run #{task.id}</span>
                        <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">
                          Awaiting Volunteer Courier
                        </span>
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {task.listing?.title || 'Surplus Meal Batch'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {task.listing?.quantity} {task.listing?.unit} • ~{task.listing?.estimated_servings} servings
                        </p>
                      </div>

                      <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-600">
                        <div className="flex items-start gap-2">
                          <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                          <div>
                            <strong className="text-slate-700">Pickup:</strong>{' '}
                            {task.listing?.pickup_address || 'Donor address'}
                          </div>
                        </div>

                        {task.recipient_org_name && (
                          <div className="flex items-start gap-2">
                            <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                            <div>
                              <strong className="text-slate-700">Deliver to:</strong> {task.recipient_org_name}
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Clock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <div>
                            <strong className="text-slate-700">Must pickup before:</strong>{' '}
                            <span className="text-rose-700 font-semibold">
                              {new Date(task.pickup_deadline).toLocaleString([], {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">Status: Open</span>
                      <button
                        onClick={() => handleClaim(task.id)}
                        disabled={claimingId === task.id}
                        className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>{claimingId === task.id ? 'Claiming...' : 'Claim This Run'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Completed History */}
        {activeTab === 'completed' && (
          <div className="space-y-4">
            {completedTasks.length === 0 ? (
              <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <h3 className="text-base font-bold text-slate-700">No completed tasks yet</h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto">
                  When you deliver food safely to recipient organizations and complete the mission, records appear here.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
                <div className="divide-y divide-slate-100">
                  {completedTasks.map((task) => (
                    <div key={task.id} className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-slate-500">Run #{task.id}</span>
                          <StatusBadge status="COMPLETED" size="sm" />
                        </div>
                        <h4 className="text-sm font-bold text-slate-900">{task.listing?.title || 'Surplus Meals'}</h4>
                        <p className="text-xs text-slate-500">
                          Delivered to: <strong>{task.recipient_org_name || 'Recipient Org'}</strong> • ~
                          {task.listing?.estimated_servings || 0} servings transported
                        </p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs text-slate-400 block">
                          Completed:{' '}
                          {task.completed_at ? new Date(task.completed_at).toLocaleDateString() : 'N/A'}
                        </span>
                        <Link
                          to={`/volunteer/tasks/${task.id}`}
                          className="text-xs font-bold text-purple-700 hover:text-purple-800 underline mt-1 inline-block"
                        >
                          View Mission Summary
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
