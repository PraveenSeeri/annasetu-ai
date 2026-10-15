import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FileCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Building,
  Calendar,
  FileText,
  Clock,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminVerifications: React.FC = () => {
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerif, setSelectedVerif] = useState<any | null>(null);
  const [reviewAction, setReviewAction] = useState<'verified' | 'rejected'>('verified');
  const [reviewNotes, setReviewNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadPending = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getPendingVerifications();
      setVerifications(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPending();
  }, []);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVerif) return;

    setSubmitting(true);
    try {
      await api.admin.reviewVerification(selectedVerif.id, reviewAction, reviewNotes.trim() || undefined);
      setNotification({
        type: 'success',
        message: `Organization successfully marked as ${reviewAction === 'verified' ? 'VERIFIED' : 'REJECTED'}. Notification dispatched.`,
      });
      setSelectedVerif(null);
      setReviewNotes('');
      await loadPending();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to submit review',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Navigation & Header */}
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
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Verification Queue
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Nonprofit Accreditation & Review</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Only verified recipient organizations are eligible to claim live surplus food donations.
            </p>
          </div>

          <button
            onClick={loadPending}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Feedback Alert */}
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

        {/* Verification Submissions List */}
        {verifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No Pending Verifications</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              All submitted recipient organizations have been reviewed. As new NGOs submit registration documents,
              they will appear here for audit.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {verifications.map((item) => (
              <div
                key={item.id}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-slate-500">Submission #{item.id}</span>
                    <span className="text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 rounded-full">
                      Awaiting Audit
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5 text-slate-900 font-bold text-base">
                      <Building className="w-4 h-4 text-emerald-700" />
                      <span>Organization ID #{item.organization_id}</span>
                    </div>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Submitted on {new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex items-center gap-1.5 text-slate-700 font-semibold">
                      <FileText className="w-3.5 h-3.5 text-blue-600" />
                      <span>Documentation Declared:</span>
                    </div>
                    <p className="text-slate-600 font-mono text-[11px] break-words whitespace-pre-wrap">
                      {item.submitted_documents}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    onClick={() => {
                      setSelectedVerif(item);
                      setReviewAction('rejected');
                      setReviewNotes('');
                    }}
                    className="px-3.5 py-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setSelectedVerif(item);
                      setReviewAction('verified');
                      setReviewNotes('Credentials verified against NGO Darpan portal. Approved.');
                    }}
                    className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Approve & Verify</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Action Modal */}
        {selectedVerif && (
          <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900">
                  {reviewAction === 'verified' ? 'Approve NGO Accreditation' : 'Reject Verification Request'}
                </h3>
                <button
                  onClick={() => setSelectedVerif(null)}
                  className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-600">
                You are reviewing verification submission #{selectedVerif.id} for Organization #{selectedVerif.organization_id}.
              </p>

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Decision</label>
                  <select
                    value={reviewAction}
                    onChange={(e) => setReviewAction(e.target.value as any)}
                    className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  >
                    <option value="verified">Approve (Grant Verified Status)</option>
                    <option value="rejected">Reject (Require Additional Proof)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">
                    Auditor Notes & Justification
                  </label>
                  <textarea
                    required
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    rows={3}
                    placeholder="e.g., Validated 12A registration certificate with the Ministry of Corporate Affairs / Darpan."
                    className="w-full text-xs p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedVerif(null)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`px-4 py-2 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer ${
                      reviewAction === 'verified'
                        ? 'bg-emerald-700 hover:bg-emerald-800'
                        : 'bg-rose-700 hover:bg-rose-800'
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Confirm Decision'}
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
