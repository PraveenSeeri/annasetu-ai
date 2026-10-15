import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Building,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  ArrowLeft,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { api } from '../../services/api';

export const AdminOrganizations: React.FC = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getUsers();
      setUsers(data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const orgUsers = users.filter((u) => u.organization_id !== null && ['donor', 'recipient'].includes(u.role?.toLowerCase()));

  const filtered = orgUsers.filter((u) => {
    const matchesType = filterType === 'ALL' || u.role?.toLowerCase() === filterType.toLowerCase();
    const matchesSearch =
      search === '' ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
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
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                Entities Directory
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Donors & Recipient Organizations</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Institutional entities participating in structured surplus food redistribution.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              to="/admin/verifications"
              className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <FileCheck className="w-4 h-4" />
              <span>Review Verification Queue</span>
            </Link>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by contact or organization..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full sm:w-auto text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
            >
              <option value="ALL">All Entities</option>
              <option value="donor">Food Donors</option>
              <option value="recipient">Recipient NGOs</option>
            </select>
          </div>
        </div>

        {/* Grid of Organizations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((u) => (
            <div
              key={u.id}
              className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-slate-400">Org #{u.organization_id}</span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      u.role === 'donor'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-sky-50 text-sky-800 border border-sky-200'
                    }`}
                  >
                    {u.role === 'donor' ? 'Food Donor' : 'Recipient NGO'}
                  </span>
                </div>

                <div>
                  <h3 className="text-base font-bold text-slate-900">{u.full_name}</h3>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>{u.email}</span>
                  </p>
                  {u.phone && (
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{u.phone}</span>
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 text-[11px]">
                  Registered {new Date(u.created_at).toLocaleDateString()}
                </span>
                <span
                  className={`font-semibold text-[11px] ${
                    u.is_active ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {u.is_active ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
