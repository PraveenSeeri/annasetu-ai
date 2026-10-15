import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Sparkles, AlertCircle, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth, DEMO_ACCOUNTS } from '../../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, quickDemoLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(email, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    }
  };

  const handleQuickLogin = async (key: string) => {
    setError(null);
    try {
      await quickDemoLogin(key);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Sign In to AnnaSetu AI
        </h2>
        <p className="mt-2 text-xs sm:text-sm text-slate-600">
          Or{' '}
          <Link to="/register" className="font-semibold text-emerald-700 hover:text-emerald-800">
            register a new organization or volunteer account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-xl border border-slate-200 sm:rounded-2xl sm:px-10">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@organization.com"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <LogIn className="w-4 h-4" />
              <span>{isLoading ? 'Verifying...' : 'Sign In'}</span>
            </button>
          </form>

          {/* Quick Demo Accounts for Presentation */}
          <div className="mt-8 pt-6 border-t border-slate-200">
            <div className="flex items-center gap-1.5 mb-3 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>1-Click Quick Demo Accounts</span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3">
              Pre-seeded test profiles for role evaluation and live feature walkthroughs:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="p-2 text-left bg-slate-900 text-white hover:bg-slate-800 rounded-lg transition-colors font-semibold flex items-center justify-between"
              >
                <span>👑 System Admin</span>
                <span className="text-[10px] text-amber-400">Admin</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('donor_taj')}
                className="p-2 text-left bg-emerald-50 text-emerald-900 border border-emerald-200 hover:bg-emerald-100 rounded-lg transition-colors font-medium flex items-center justify-between"
              >
                <span>Grand Taj Kitchen</span>
                <span className="text-[10px] text-emerald-700 font-bold">Donor</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('recipient_hope')}
                className="p-2 text-left bg-blue-50 text-blue-900 border border-blue-200 hover:bg-blue-100 rounded-lg transition-colors font-medium flex items-center justify-between"
              >
                <span>Hope Shelter</span>
                <span className="text-[10px] text-blue-700 font-bold">Verified NGO</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('recipient_care')}
                className="p-2 text-left bg-teal-50 text-teal-900 border border-teal-200 hover:bg-teal-100 rounded-lg transition-colors font-medium flex items-center justify-between"
              >
                <span>Care Community Kitchen</span>
                <span className="text-[10px] text-teal-700 font-bold">Verified Kitchen</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('recipient_pending')}
                className="p-2 text-left bg-amber-50 text-amber-900 border border-amber-200 hover:bg-amber-100 rounded-lg transition-colors font-medium flex items-center justify-between"
              >
                <span>Annapoorna Trust</span>
                <span className="text-[10px] text-amber-700 font-bold">Pending NGO</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('volunteer')}
                className="p-2 text-left bg-purple-50 text-purple-900 border border-purple-200 hover:bg-purple-100 rounded-lg transition-colors font-medium flex items-center justify-between"
              >
                <span>Rahul Varma</span>
                <span className="text-[10px] text-purple-700 font-bold">Volunteer</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
