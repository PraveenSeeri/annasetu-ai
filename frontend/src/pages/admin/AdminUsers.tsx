import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  RefreshCw,
  Shield,
  UserCheck,
  UserX,
} from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export const AdminUsers: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [togglingId, setTogglingId] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const loadUsers = async () => {
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
    loadUsers();
  }, []);

  const handleToggle = async (userId: number) => {
    if (userId === currentAdmin?.id) {
      setNotification({
        type: 'error',
        message: 'Administrators cannot deactivate their own active session.',
      });
      return;
    }

    setTogglingId(userId);
    try {
      const res = await api.admin.toggleUserStatus(userId);
      setNotification({
        type: 'success',
        message: `User account #${userId} is now ${res.is_active ? 'ACTIVE' : 'DEACTIVATED'}.`,
      });
      await loadUsers();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.message || 'Failed to toggle user status',
      });
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'ALL' || u.role?.toLowerCase() === roleFilter.toLowerCase();
    const matchesSearch =
      search === '' ||
      u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getRoleBadge = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'donor':
        return <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">Food Donor</span>;
      case 'recipient':
        return <span className="text-xs font-bold bg-sky-100 text-sky-800 px-2.5 py-0.5 rounded-full">Recipient NGO</span>;
      case 'volunteer':
        return <span className="text-xs font-bold bg-purple-100 text-purple-800 px-2.5 py-0.5 rounded-full">Volunteer</span>;
      case 'admin':
        return <span className="text-xs font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">Admin</span>;
      default:
        return <span className="text-xs font-bold bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-full">{role}</span>;
    }
  };

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
              <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-md">
                Account Directory
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1">Platform User Accounts</h1>
            <p className="text-xs sm:text-sm text-slate-600">
              Manage donors, NGOs, volunteers, and admin privileges across the AnnaSetu ecosystem.
            </p>
          </div>

          <button
            onClick={loadUsers}
            className="p-2.5 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors flex items-center gap-2 text-xs font-semibold cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Alerts */}
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

        {/* Filter controls */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="w-full sm:w-auto text-xs py-2 px-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="ALL">All Roles</option>
              <option value="donor">Donors</option>
              <option value="recipient">Recipients (NGOs)</option>
              <option value="volunteer">Volunteers</option>
              <option value="admin">Administrators</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3.5">ID</th>
                  <th className="p-3.5">Full Name</th>
                  <th className="p-3.5">Email Address</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Org ID</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Registered</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No matching accounts found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">#{u.id}</td>
                      <td className="p-3.5 font-bold text-slate-900">{u.full_name}</td>
                      <td className="p-3.5 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3.5">{getRoleBadge(u.role)}</td>
                      <td className="p-3.5 text-slate-500 font-mono">
                        {u.organization_id ? `#${u.organization_id}` : '—'}
                      </td>
                      <td className="p-3.5">
                        {u.is_active ? (
                          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                            Active
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
                            Suspended
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-slate-400 text-[11px]">
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 text-right">
                        {u.id !== currentAdmin?.id ? (
                          <button
                            onClick={() => handleToggle(u.id)}
                            disabled={togglingId === u.id}
                            className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                              u.is_active
                                ? 'bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-700'
                                : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                            }`}
                          >
                            {togglingId === u.id ? 'Updating...' : u.is_active ? 'Deactivate' : 'Reactivate'}
                          </button>
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">Current Session</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Total registered users: {users.length}</span>
            <span>Admin privilege guard enabled</span>
          </div>
        </div>
      </div>
    </div>
  );
};
