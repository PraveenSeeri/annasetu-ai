import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { api } from '../services/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  quickDemoLogin: (roleKey: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const DEMO_ACCOUNTS = {
  admin: { email: 'admin@annasetu.ai', password: 'Admin@123456', label: 'Admin (System)', role: 'admin' },
  donor_taj: { email: 'donor.taj@annasetu.ai', password: 'Demo@123456', label: 'Donor: Grand Taj Kitchen', role: 'donor' },
  donor_hostel: { email: 'donor.hostel@annasetu.ai', password: 'Demo@123456', label: 'Donor: Apex University Hostel', role: 'donor' },
  recipient_hope: { email: 'ngo.hope@annasetu.ai', password: 'Demo@123456', label: 'Recipient: Hope Shelter (Verified)', role: 'recipient' },
  recipient_care: { email: 'ngo.care@annasetu.ai', password: 'Demo@123456', label: 'Recipient: Care Kitchen (Verified)', role: 'recipient' },
  recipient_pending: { email: 'ngo.pending@annasetu.ai', password: 'Demo@123456', label: 'Recipient: Annapoorna (Pending)', role: 'recipient' },
  volunteer: { email: 'volunteer.rahul@annasetu.ai', password: 'Demo@123456', label: 'Volunteer: Rahul Varma', role: 'volunteer' },
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('annasetu_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const currentUser = await api.auth.getMe();
      setUser(currentUser);
    } catch {
      localStorage.removeItem('annasetu_token');
      setToken(null);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      refreshUser();
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.auth.login({ email, password });
      localStorage.setItem('annasetu_token', res.access_token);
      setToken(res.access_token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await api.auth.register(data);
      localStorage.setItem('annasetu_token', res.access_token);
      setToken(res.access_token);
      await refreshUser();
    } finally {
      setIsLoading(false);
    }
  };

  const quickDemoLogin = async (roleKey: string) => {
    const creds = DEMO_ACCOUNTS[roleKey as keyof typeof DEMO_ACCOUNTS];
    if (creds) {
      await login(creds.email, creds.password);
    }
  };

  const logout = () => {
    localStorage.removeItem('annasetu_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        token,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
