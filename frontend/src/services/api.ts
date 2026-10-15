const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(status: number, message: string, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('annasetu_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorDetail = `Request failed with status ${response.status}`;
    let errorData = null;
    try {
      errorData = await response.json();
      if (errorData.detail) {
        if (typeof errorData.detail === 'string') {
          errorDetail = errorData.detail;
        } else if (Array.isArray(errorData.detail)) {
          errorDetail = errorData.detail.map((e: any) => e.msg || e.message).join(', ');
        }
      }
    } catch {
      // response wasn't JSON
    }
    throw new ApiError(response.status, errorDetail, errorData);
  }

  return response.json();
}

export const api = {
  // Auth
  auth: {
    login: (credentials: { email: string; password: string }) =>
      request<any>('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
    register: (userData: any) =>
      request<any>('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    getMe: () =>
      request<any>('/auth/me'),
  },

  // Listings
  listings: {
    getAll: (params?: { category?: string; dietary?: string; status?: string; search?: string }) => {
      const query = new URLSearchParams();
      if (params?.category) query.append('category', params.category);
      if (params?.dietary) query.append('dietary', params.dietary);
      if (params?.status) query.append('status', params.status);
      if (params?.search) query.append('search', params.search);
      const qs = query.toString() ? `?${query.toString()}` : '';
      return request<any[]>(`/listings/${qs}`);
    },
    getMy: () =>
      request<any[]>('/listings/my-listings'),
    getById: (id: number | string) =>
      request<any>(`/listings/${id}`),
    create: (data: any) =>
      request<any>('/listings/', { method: 'POST', body: JSON.stringify(data) }),
    update: (id: number | string, data: any) =>
      request<any>(`/listings/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    cancel: (id: number | string) =>
      request<any>(`/listings/${id}/cancel`, { method: 'POST' }),
  },

  // Donations & Allocations
  donations: {
    request: (payload: { listing_id: number; quantity_requested: number; notes?: string }) =>
      request<any>('/donations/request', { method: 'POST', body: JSON.stringify(payload) }),
    getIncoming: () =>
      request<any[]>('/donations/requests/incoming'),
    getMy: () =>
      request<any[]>('/donations/requests/my'),
    act: (requestId: number | string, action: 'accept' | 'decline' | 'cancel', notes?: string) =>
      request<any>(`/donations/requests/${requestId}/action`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
      }),
  },

  // Matching
  matching: {
    getRecipientsForListing: (listingId: number | string) =>
      request<any[]>(`/matching/recipients-for-listing/${listingId}`),
    getRecommendedForRecipient: () =>
      request<any[]>('/matching/recommended-listings'),
  },

  // Pickups
  pickups: {
    getUnassigned: () =>
      request<any[]>('/pickups/unassigned'),
    getMyTasks: () =>
      request<any[]>('/pickups/my-tasks'),
    getById: (id: number | string) =>
      request<any>(`/pickups/${id}`),
    claim: (id: number | string) =>
      request<any>(`/pickups/${id}/claim`, { method: 'POST' }),
    assign: (id: number | string, volunteerId: number, instructions?: string) =>
      request<any>(`/pickups/${id}/assign`, {
        method: 'POST',
        body: JSON.stringify({ volunteer_id: volunteerId, pickup_instructions: instructions }),
      }),
    updateStatus: (id: number | string, status: string, notes?: string) =>
      request<any>(`/pickups/${id}/status`, {
        method: 'POST',
        body: JSON.stringify({ status, notes }),
      }),
  },

  // Notifications
  notifications: {
    getAll: () =>
      request<any[]>('/notifications/'),
    markRead: (id: number) =>
      request<any>(`/notifications/${id}/read`, { method: 'POST' }),
    markAllRead: () =>
      request<any>('/notifications/read-all', { method: 'POST' }),
  },

  // AI Assistance
  ai: {
    categorize: (title: string, description: string) =>
      request<any>('/ai/categorize', {
        method: 'POST',
        body: JSON.stringify({ title, description }),
      }),
    improve: (data: { title: string; description: string; category?: string; storage_conditions?: string; allergens?: string; pickup_deadline?: string }) =>
      request<any>('/ai/improve', {
        method: 'POST',
        body: JSON.stringify(data),
      }),
    searchParse: (query: string) =>
      request<any>('/ai/search-parse', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),
    chat: (message: string) =>
      request<any>('/ai/chat', {
        method: 'POST',
        body: JSON.stringify({ message }),
      }),
  },

  // Impact
  impact: {
    getSummary: () =>
      request<any>('/impact/summary'),
  },

  // Organization
  org: {
    getMy: () =>
      request<any>('/organizations/my-org'),
    updateMy: (data: any) =>
      request<any>('/organizations/my-org', { method: 'PUT', body: JSON.stringify(data) }),
    submitVerification: (docs: { documents_description: string; certificate_id?: string }) =>
      request<any>('/verifications/submit', { method: 'POST', body: JSON.stringify(docs) }),
  },

  // Admin
  admin: {
    getStats: () =>
      request<any>('/admin/stats'),
    getUsers: () =>
      request<any[]>('/admin/users'),
    toggleUserStatus: (userId: number) =>
      request<any>(`/admin/users/${userId}/toggle-status`, { method: 'POST' }),
    getPendingVerifications: () =>
      request<any[]>('/verifications/pending'),
    reviewVerification: (id: number, status: string, notes?: string) =>
      request<any>(`/verifications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, review_notes: notes }),
      }),
    getSafetyReports: () =>
      request<any[]>('/admin/safety-reports'),
    reviewSafetyReport: (id: number, status: string, notes?: string) =>
      request<any>(`/admin/safety-reports/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ status, admin_notes: notes }),
      }),
    getAuditLogs: (limit = 100) =>
      request<any[]>(`/admin/audit-logs?limit=${limit}`),
  },
};
