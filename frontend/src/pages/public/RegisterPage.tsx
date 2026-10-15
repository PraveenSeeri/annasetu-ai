import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, Utensils, Users, Truck, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

export const RegisterPage: React.FC = () => {
  const { register, isLoading } = useAuth();
  const navigate = useNavigate();

  const [role, setRole] = useState<'donor' | 'recipient' | 'volunteer'>('donor');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');

  // Organization fields
  const [orgName, setOrgName] = useState('');
  const [orgType, setOrgType] = useState('restaurant');
  const [orgAddress, setOrgAddress] = useState('');
  const [orgCity, setOrgCity] = useState('Bengaluru');
  const [orgRegNo, setOrgRegNo] = useState('');
  const [orgCapacity, setOrgCapacity] = useState(150);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const payload: any = {
      email,
      password,
      full_name: fullName,
      role,
      phone,
    };

    if (role === 'donor' || role === 'recipient') {
      payload.org_name = orgName || `${fullName}'s Organization`;
      payload.org_type = orgType;
      payload.org_address = orgAddress || 'Bengaluru, Karnataka';
      payload.org_city = orgCity;
      payload.org_registration_number = orgRegNo;
      payload.org_capacity = Number(orgCapacity);
    }

    try {
      await register(payload);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Join the AnnaSetu AI Network
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-600">
            Select your role to connect with surplus food redistribution partners.
          </p>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-200">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-100 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => {
                setRole('donor');
                setOrgType('restaurant');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'donor'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Utensils className="w-4 h-4 text-emerald-600" />
              <span>Food Donor</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRole('recipient');
                setOrgType('ngo');
              }}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'recipient'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4 text-emerald-600" />
              <span>NGO / Shelter</span>
            </button>

            <button
              type="button"
              onClick={() => setRole('volunteer')}
              className={`py-2 px-3 rounded-lg text-xs font-bold transition-all flex flex-col sm:flex-row items-center justify-center gap-1.5 ${
                role === 'volunteer'
                  ? 'bg-white text-emerald-800 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Truck className="w-4 h-4 text-emerald-600" />
              <span>Volunteer</span>
            </button>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name / Contact Person
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  placeholder="e.g. Vikram Sengupta"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+91 98450 12345"
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="contact@organization.com"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password (min 6 characters)
              </label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            {/* Organization specifics for Donors & Recipients */}
            {role !== 'volunteer' && (
              <div className="pt-3 border-t border-slate-100 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                  {role === 'donor' ? 'Donor Organization Details' : 'Recipient Organization Details'}
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization Name
                    </label>
                    <input
                      type="text"
                      required
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      placeholder={role === 'donor' ? 'e.g. Taj Kitchens' : 'e.g. Hope Foundation'}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Organization Type
                    </label>
                    <select
                      value={orgType}
                      onChange={e => setOrgType(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    >
                      {role === 'donor' ? (
                        <>
                          <option value="restaurant">Restaurant / Hotel</option>
                          <option value="hostel">College Hostel Mess</option>
                          <option value="caterer">Event / Marriage Caterer</option>
                          <option value="corporate_dining">Corporate Cafeteria</option>
                          <option value="other">Other Commercial Kitchen</option>
                        </>
                      ) : (
                        <>
                          <option value="ngo">Registered NGO</option>
                          <option value="community_kitchen">Community Kitchen</option>
                          <option value="shelter">Shelter Home / Orphanage</option>
                          <option value="community_pantry">Food Pantry</option>
                        </>
                      )}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Street Address & Location
                  </label>
                  <input
                    type="text"
                    required
                    value={orgAddress}
                    onChange={e => setOrgAddress(e.target.value)}
                    placeholder="e.g. 12 MG Road, Ashok Nagar, Bengaluru"
                    className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Registration No. (FSSAI / NGO DARPAN)
                    </label>
                    <input
                      type="text"
                      value={orgRegNo}
                      onChange={e => setOrgRegNo(e.target.value)}
                      placeholder="e.g. DARPAN-KA-2022-XXXX"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Daily Capacity (Servings)
                    </label>
                    <input
                      type="number"
                      min={10}
                      value={orgCapacity}
                      onChange={e => setOrgCapacity(Number(e.target.value))}
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-4 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <UserPlus className="w-4 h-4" />
              <span>{isLoading ? 'Creating Account...' : 'Complete Registration'}</span>
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-emerald-700 hover:text-emerald-800">
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
