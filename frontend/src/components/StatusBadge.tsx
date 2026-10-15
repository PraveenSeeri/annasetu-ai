import React from 'react';
import { ListingStatus } from '../types';

interface StatusBadgeProps {
  status: ListingStatus | string;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const normalized = status.toUpperCase();
  
  let styles = 'bg-slate-100 text-slate-700 border-slate-200';
  let label = normalized.replace(/_/g, ' ');

  switch (normalized) {
    case 'AVAILABLE':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
      label = 'Available for Request';
      break;
    case 'REQUESTED':
      styles = 'bg-amber-50 text-amber-700 border-amber-300';
      label = 'Reservation Requested';
      break;
    case 'ACCEPTED':
      styles = 'bg-blue-50 text-blue-700 border-blue-300 font-semibold';
      label = 'Request Accepted';
      break;
    case 'PICKUP_ASSIGNED':
      styles = 'bg-indigo-50 text-indigo-700 border-indigo-300';
      label = 'Volunteer Assigned';
      break;
    case 'PICKED_UP':
      styles = 'bg-purple-50 text-purple-700 border-purple-300 font-semibold';
      label = 'In Transit';
      break;
    case 'COMPLETED':
      styles = 'bg-teal-50 text-teal-800 border-teal-300 font-semibold';
      label = 'Delivered & Completed';
      break;
    case 'CANCELLED':
      styles = 'bg-rose-50 text-rose-700 border-rose-300';
      label = 'Cancelled';
      break;
    case 'EXPIRED':
      styles = 'bg-gray-100 text-gray-500 border-gray-300';
      label = 'Deadline Expired';
      break;
    case 'FLAGGED_FOR_REVIEW':
      styles = 'bg-red-100 text-red-800 border-red-300 font-bold';
      label = 'Flagged for Safety Review';
      break;
    case 'PENDING':
      styles = 'bg-amber-50 text-amber-700 border-amber-300';
      label = 'Pending Review';
      break;
    case 'VERIFIED':
      styles = 'bg-emerald-50 text-emerald-700 border-emerald-300 font-semibold';
      label = 'Verified NGO/Kitchen';
      break;
    case 'REJECTED':
      styles = 'bg-rose-50 text-rose-700 border-rose-300';
      label = 'Rejected';
      break;
    case 'SUSPENDED':
      styles = 'bg-orange-50 text-orange-800 border-orange-300';
      label = 'Suspended';
      break;
  }

  const sizeCls = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-xs sm:text-sm';

  return (
    <span className={`inline-flex items-center rounded-full border ${styles} ${sizeCls}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-70"></span>
      {label}
    </span>
  );
};
