import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  FileText,
  User,
  Package,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminSafetyReports: React.FC = () => {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<any | null>(null);
  const [statusAction, setStatusAction] = useState<string>('investigating');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadReports = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getSafetyReports();
      setReports(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;

    setSubmitting(true);
    try {
      await api.admin.reviewSafetyReport(selectedReport.id, statusAction, adminNotes.trim() || undefined);
      setNotification({
        type: 'success',
        message: `Safety report #${selectedReport.id} updated to status "${statusAction.toUpperCase()}".`,
      });
      setSelectedReport(null);
      setAdminNotes('');
      await loadReports();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to update safety report',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityBadge = (sev: string) => {
    switch (sev?.toLowerCase()) {
      case 'critical':
        return <span className="text-xs font-black uppercase tracking-wider bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full border border-rose-300">CRITICAL</span>;
      case 'high':
        return <span className="text-xs font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2.5 py-0.5 rounded-full border border-orange-300">HIGH</span>;
      case 'medium':
        return <span className="text-xs font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full border border-amber-300">MEDIUM</span>;
      default:
        return <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full border border-slate-300">LOW</span>;
    }
  };

  const getStatusBadge = (st: string) => {
    switch (st?.toLowerCase()) {
      case 'resolved':
        return <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Resolved</span>;
      case 'investigating':
        return <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">Investigating</span>;
      case 'dismissed':
        return <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">Dismissed</span>;
      default:
        return <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">Open</span>;
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <Link
                to="/admin"
                className="text-xs font-bold text-slate-500 hover:text-slate-800 flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Admin Dashboard</span>
              </Link>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                Food Safety Reports
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Safety & Spoilage Incidents</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Immediate investigation queue for reported spoilage, packaging violations, or allergen discrepancies.
            </p>
          </div>

          <button
            onClick={loadReports}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Notifications */}
        {notification && (
          <div
            className={`p-4 rounded-xl border text-xs font-semibold flex items-center justify-between ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <span>{notification.message}</span>
            <button onClick={() => setNotification(null)} className="underline cursor-pointer">
              Dismiss
            </button>
          </div>
        )}

        {/* Reports List */}
        {reports.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">Zero Active Safety Incidents</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All surplus food transfers are compliant with FSSAI regulations. No food quality complaints are open.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">Incident #{report.id}</span>
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(report.severity)}
                      {getStatusBadge(report.status)}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-slate-500" />
                      <span>{report.listing_title || `Listing #${report.listing_id}`}</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Reported by {report.reporter_name || 'Anonymous User'} •{' '}
                      {new Date(report.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </p>
                  </div>

                  <div className="p-3 bg-rose-50/50 rounded-xl border border-rose-100 text-xs space-y-1">
                    <strong className="text-rose-900 block font-semibold">Incident Details:</strong>
                    <p className="text-slate-700 font-mono text-[11px] leading-relaxed">{report.details}</p>
                  </div>

                  {report.admin_notes && (
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <strong className="text-slate-700 block font-semibold">Admin Resolution Notes:</strong>
                      <p className="text-slate-600 text-[11px] italic mt-0.5">{report.admin_notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Status: {report.status.toUpperCase()}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedReport(report);
                      setStatusAction(report.status === 'open' ? 'investigating' : 'resolved');
                      setAdminNotes(report.admin_notes || '');
                    }}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Investigate & Update
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  Update Safety Report #{selectedReport.id}
                </h3>
                <button
                  onClick={() => setSelectedReport(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Investigation Status</label>
                  <select
                    value={statusAction}
                    onChange={(e) => setStatusAction(e.target.value)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  >
                    <option value="investigating">Investigating (Contacting Donor / Recipient)</option>
                    <option value="resolved">Resolved (Confirmed Action / Flagged Listing)</option>
                    <option value="dismissed">Dismissed (False Report / Resolved on Site)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Administrative Notes & Action Taken
                  </label>
                  <textarea
                    required
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g., Contacted recipient kitchen supervisor; confirmed food was picked up 15 minutes past window; food discarded safely as precautionary measure."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    {submitting ? 'Saving...' : 'Save Resolution'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
