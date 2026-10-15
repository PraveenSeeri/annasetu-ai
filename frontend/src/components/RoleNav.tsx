import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Utensils,
  PlusCircle,
  History,
  Building,
  Search,
  Inbox,
  Truck,
  ShieldCheck,
  FileCheck2,
  AlertTriangle,
  ScrollText,
  UserCheck
} from 'lucide-react';

export const RoleNav: React.FC = () => {
  const { role, user } = useAuth();
  if (!role) return null;

  let links: { to: string; label: string; icon: React.ReactNode }[] = [];

  if (role === 'donor') {
    links = [
      { to: '/donor/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/donor/listings', label: 'My Listings', icon: <Utensils className="w-4 h-4" /> },
      { to: '/donor/listings/new', label: 'Post Surplus Food', icon: <PlusCircle className="w-4 h-4" /> },
      { to: '/donor/history', label: 'History', icon: <History className="w-4 h-4" /> },
      { to: '/donor/profile', label: 'Kitchen Profile', icon: <Building className="w-4 h-4" /> },
    ];
  } else if (role === 'recipient') {
    links = [
      { to: '/recipient/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/recipient/donations', label: 'Find Food', icon: <Search className="w-4 h-4" /> },
      { to: '/recipient/requests', label: 'My Requests', icon: <Inbox className="w-4 h-4" /> },
      { to: '/recipient/pickups', label: 'Pickups', icon: <Truck className="w-4 h-4" /> },
      { to: '/recipient/history', label: 'Collection History', icon: <History className="w-4 h-4" /> },
      { to: '/recipient/profile', label: 'Shelter Profile', icon: <Building className="w-4 h-4" /> },
    ];
  } else if (role === 'volunteer') {
    links = [
      { to: '/volunteer/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/volunteer/tasks', label: 'Pickup Tasks', icon: <Truck className="w-4 h-4" /> },
      { to: '/volunteer/profile', label: 'Volunteer Profile', icon: <UserCheck className="w-4 h-4" /> },
    ];
  } else if (role === 'admin') {
    links = [
      { to: '/admin/dashboard', label: 'Platform Stats', icon: <LayoutDashboard className="w-4 h-4" /> },
      { to: '/admin/organizations', label: 'Organizations', icon: <Building className="w-4 h-4" /> },
      { to: '/admin/verifications', label: 'Verification Queue', icon: <FileCheck2 className="w-4 h-4" /> },
      { to: '/admin/listings', label: 'Listings', icon: <Utensils className="w-4 h-4" /> },
      { to: '/admin/pickups', label: 'Pickups', icon: <Truck className="w-4 h-4" /> },
      { to: '/admin/safety-reports', label: 'Safety Reports', icon: <AlertTriangle className="w-4 h-4" /> },
      { to: '/admin/audit-logs', label: 'Audit Logs', icon: <ScrollText className="w-4 h-4" /> },
    ];
  }

  return (
    <div className="bg-white border-b border-slate-200 sticky top-16 z-30 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto py-1">
        <div className="flex items-center space-x-1 sm:space-x-2 py-1 min-w-max">
          <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 mr-2 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            {role.toUpperCase()}
          </span>

          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </div>

        {user?.organization && (
          <div className="hidden lg:flex items-center text-xs text-slate-500 pl-4 border-l border-slate-200">
            <span className="font-semibold text-slate-700">{user.organization.name}</span>
            {user.organization.verification_status === 'verified' ? (
              <span className="ml-2 px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold text-[10px]">VERIFIED</span>
            ) : (
              <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold text-[10px]">PENDING</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
