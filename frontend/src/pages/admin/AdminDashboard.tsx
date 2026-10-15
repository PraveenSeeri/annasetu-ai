import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Building,
  CheckCircle2,
  AlertTriangle,
  Clock,
  TrendingUp,
  FileCheck,
  Package,
  Truck,
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
} from 'recharts';
import { api } from '../../services/api';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.admin.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const roleData = stats
    ? [
        { name: 'Donors', count: stats.donor_count, color: '#059669' },
        { name: 'Recipients', count: stats.recipient_count, color: '#0284c7' },
        { name: 'Volunteers', count: stats.volunteer_count, color: '#9333ea' },
      ]
    : [];

  const listingSummaryData = stats
    ? [
        { name: 'Active', count: stats.active_listings, color: '#10b981' },
        { name: 'Completed', count: stats.completed_donations, color: '#0d9488' },
        { name: 'Total', count: stats.total_listings, color: '#64748b' },
      ]
    : [];

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md">
                Admin Command Center
              </span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Compliance & Verification</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Platform Operations Oversight</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Review NGO credentials, monitor safety reports, track real-time food redistribution, and maintain audit integrity.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/verifications"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>Review NGOs ({stats?.pending_verifications ?? 0})</span>
            </Link>
            <Link
              to="/admin/safety-reports"
              className="px-4 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <ShieldAlert className="w-4 h-4" />
              <span>Safety Reports ({stats?.open_safety_reports ?? 0})</span>
            </Link>
          </div>
        </div>

        {/* Priority Action Alerts if pending items */}
        {stats && (stats.pending_verifications > 0 || stats.open_safety_reports > 0) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {stats.pending_verifications > 0 && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                    <FileCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">
                      {stats.pending_verifications} NGO Verification{stats.pending_verifications > 1 ? 's' : ''} Pending
                    </h4>
                    <p className="text-xs text-amber-700">
                      Nonprofits awaiting document approval before they can claim surplus meals.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/verifications"
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  Review Now
                </Link>
              </div>
            )}

            {stats.open_safety_reports > 0 && (
              <div className="bg-rose-50 border border-rose-200 p-4 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-rose-100 text-rose-800 rounded-xl">
                    <ShieldAlert className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-rose-900">
                      {stats.open_safety_reports} Food Safety Report{stats.open_safety_reports > 1 ? 's' : ''} Open
                    </h4>
                    <p className="text-xs text-rose-700">
                      Investigate food quality or temperature compliance alerts immediately.
                    </p>
                  </div>
                </div>
                <Link
                  to="/admin/safety-reports"
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  Investigate
                </Link>
              </div>
            )}
          </div>
        )}

        {/* KPI Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-slate-500 font-bold uppercase">Total Users</span>
            <p className="text-2xl font-black text-slate-900 font-mono mt-1">{stats?.total_users ?? 0}</p>
            <span className="text-[10px] text-slate-400">Platform-wide</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-emerald-700 font-bold uppercase">Verified NGOs</span>
            <p className="text-2xl font-black text-emerald-700 font-mono mt-1">{stats?.verified_recipients ?? 0}</p>
            <span className="text-[10px] text-emerald-600">Eligible to match</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-amber-600 font-bold uppercase">Pending Verif.</span>
            <p className="text-2xl font-black text-amber-600 font-mono mt-1">{stats?.pending_verifications ?? 0}</p>
            <span className="text-[10px] text-amber-500">Action needed</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-blue-700 font-bold uppercase">Active Listings</span>
            <p className="text-2xl font-black text-blue-700 font-mono mt-1">{stats?.active_listings ?? 0}</p>
            <span className="text-[10px] text-blue-600">Live in circulation</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-teal-700 font-bold uppercase">Completed</span>
            <p className="text-2xl font-black text-teal-700 font-mono mt-1">{stats?.completed_donations ?? 0}</p>
            <span className="text-[10px] text-teal-600">Delivered to shelters</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
            <span className="text-[11px] text-purple-700 font-bold uppercase">Pickup Rate</span>
            <p className="text-2xl font-black text-purple-700 font-mono mt-1">
              {stats?.pickup_completion_rate ?? 0}%
            </p>
            <span className="text-[10px] text-purple-600">Volunteer fulfillment</span>
          </div>
        </div>

        {/* Charts & Analytical Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">User Stakeholder Distribution</h3>
                <p className="text-xs text-slate-500">Breakdown of registered roles across ecosystem</p>
              </div>
              <Users className="w-5 h-5 text-slate-400" />
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {roleData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="flex justify-around text-xs pt-2 border-t border-slate-100">
              <span className="text-emerald-700 font-semibold">● Donors: {stats?.donor_count ?? 0}</span>
              <span className="text-sky-700 font-semibold">● Recipients: {stats?.recipient_count ?? 0}</span>
              <span className="text-purple-700 font-semibold">● Volunteers: {stats?.volunteer_count ?? 0}</span>
            </div>
          </div>

          {/* Redistribution Flow */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Surplus Listings Lifecycle</h3>
                <p className="text-xs text-slate-500">Active vs completed vs total catalog volume</p>
              </div>
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>

            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={listingSummaryData} layout="vertical" margin={{ top: 15, right: 20, left: 30, bottom: 5 }}>
                  <XAxis type="number" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[0, 8, 8, 0]}>
                    {listingSummaryData.map((entry, index) => (
                      <Cell key={`cell-horiz-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 text-center">
              Target zero-waste index: 100% of eligible surplus matched to verified hunger relief centers.
            </div>
          </div>
        </div>

        {/* Administration Navigation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/users"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-blue-50 text-blue-700 rounded-xl w-fit mb-3 group-hover:bg-blue-100 transition-colors">
                <Users className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">User Management</h4>
              <p className="text-xs text-slate-500 mt-1">
                View all registered accounts, roles, and toggle active status.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-blue-700 mt-4">
              <span>Manage Accounts</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/verifications"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-emerald-50 text-emerald-700 rounded-xl w-fit mb-3 group-hover:bg-emerald-100 transition-colors">
                <FileCheck className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">NGO Verifications</h4>
              <p className="text-xs text-slate-500 mt-1">
                Inspect 12A/80G tax exemptions, Darpan IDs, and authorize organizations.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 mt-4">
              <span>Review Submissions ({stats?.pending_verifications ?? 0})</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/listings"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-teal-50 text-teal-700 rounded-xl w-fit mb-3 group-hover:bg-teal-100 transition-colors">
                <Package className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Listing Moderation</h4>
              <p className="text-xs text-slate-500 mt-1">
                Audit donor food listings, expiration limits, and safety declarations.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-teal-700 mt-4">
              <span>Moderate Catalog</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/admin/audit-logs"
            className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow group flex flex-col justify-between"
          >
            <div>
              <div className="p-3 bg-purple-50 text-purple-700 rounded-xl w-fit mb-3 group-hover:bg-purple-100 transition-colors">
                <FileText className="w-5 h-5" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Audit Trail</h4>
              <p className="text-xs text-slate-500 mt-1">
                Immutable security logs of matches, approvals, logins, and status updates.
              </p>
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-purple-700 mt-4">
              <span>Inspect Logs</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};
