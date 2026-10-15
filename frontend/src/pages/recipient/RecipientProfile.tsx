import React, { useState, useEffect } from 'react';
import { Building, ShieldCheck, AlertCircle, Save, CheckCircle2, FileText } from 'lucide-react';
import { api } from '../../services/api';
import { Organization } from '../../types';
import { useAuth } from '../../context/AuthContext';

export const RecipientProfile: React.FC = () => {
  const { user, refreshUser } = useAuth();
  const [org, setOrg] = useState<Organization | null>(null);
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Bengaluru');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [regNo, setRegNo] = useState('');
  const [capacity, setCapacity] = useState(150);
  const [serviceRadius, setServiceRadius] = useState(15.0);

  // Verification modal state
  const [showVerifModal, setShowVerifModal] = useState(false);
  const [docsDesc, setDocsDesc] = useState('');
  const [certId, setCertId] = useState('');
  const [submittingVerif, setSubmittingVerif] = useState(false);
  const [verifSubmitted, setVerifSubmitted] = useState(false);

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.org.getMy()
      .then(o => {
        setOrg(o);
        setName(o.name);
        setAddress(o.address);
        setCity(o.city);
        setContactEmail(o.contact_email);
        setContactPhone(o.contact_phone);
        setRegNo(o.registration_number || '');
        setCapacity(o.capacity_servings_per_day);
        setServiceRadius(o.service_radius_km);
      })
      .catch(console.error);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await api.org.updateMy({
        name,
        address,
        city,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        registration_number: regNo,
        capacity_servings_per_day: Number(capacity),
        service_radius_km: Number(serviceRadius),
      });
      await refreshUser();
      setSaved(true);
    } catch (err: any) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingVerif(true);
    setError(null);
    try {
      await api.org.submitVerification({
        documents_description: docsDesc,
        certificate_id: certId,
      });
      setVerifSubmitted(true);
      setTimeout(() => {
        setShowVerifModal(false);
        setVerifSubmitted(false);
      }, 1500);
      await refreshUser();
    } catch (err: any) {
      setError(err.message || 'Failed to submit verification');
    } finally {
      setSubmittingVerif(false);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Shelter / Organization Profile</h1>
          <p className="text-xs sm:text-sm text-slate-500">Maintain distribution capacity, service radius, and official NGO credentials.</p>
        </div>

        {/* Verification Status Card */}
        <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
          org?.verification_status === 'verified'
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-amber-50 border-amber-200 text-amber-900'
        }`}>
          <div className="flex items-center gap-3">
            {org?.verification_status === 'verified' ? (
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                Status: <span className="uppercase">{org?.verification_status || 'PENDING'}</span>
              </h4>
              <p className="text-xs opacity-80">
                {org?.verification_status === 'verified'
                  ? 'Your organization is verified to request and accept surplus food allocations.'
                  : 'Submit official documents for administrator review to unlock food requests.'}
              </p>
            </div>
          </div>

          {org?.verification_status !== 'verified' && (
            <button
              onClick={() => setShowVerifModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl text-xs whitespace-nowrap transition-colors shrink-0"
            >
              Upload Docs
            </button>
          )}
        </div>

        {saved && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Organization profile saved successfully!</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs">
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Organization Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">NGO DARPAN / Registration ID</label>
              <input
                type="text"
                value={regNo}
                onChange={e => setRegNo(e.target.value)}
                placeholder="DARPAN-KA-XXXX"
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Facility Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={e => setAddress(e.target.value)}
                className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Email</label>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={e => setContactEmail(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
                <input
                  type="tel"
                  required
                  value={contactPhone}
                  onChange={e => setContactPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Daily Capacity (Servings)</label>
                <input
                  type="number"
                  min={10}
                  value={capacity}
                  onChange={e => setCapacity(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Service Area Radius (km)</label>
                <input
                  type="number"
                  min={1}
                  step={0.5}
                  value={serviceRadius}
                  onChange={e => setServiceRadius(Number(e.target.value))}
                  className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full mt-4 py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-colors flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? 'Saving...' : 'Update Organization Details'}</span>
            </button>
          </form>
        </div>

        {/* Verification Modal */}
        {showVerifModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-6 space-y-4">
              <h3 className="font-bold text-base text-slate-900">Submit Verification Details</h3>
              <p className="text-xs text-slate-500">Provide official registration identifiers or credentials for administrator approval.</p>

              {verifSubmitted ? (
                <div className="py-6 text-center space-y-2 text-emerald-800">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-600" />
                  <p className="text-xs font-bold">Documents submitted for review!</p>
                </div>
              ) : (
                <form onSubmit={handleSubmitVerification} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Certificate / DARPAN ID</label>
                    <input
                      type="text"
                      required
                      value={certId}
                      onChange={e => setCertId(e.target.value)}
                      placeholder="e.g. DARPAN-KA-2023-XXXX"
                      className="w-full px-3.5 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Supporting Credentials & Summary</label>
                    <textarea
                      required
                      rows={3}
                      value={docsDesc}
                      onChange={e => setDocsDesc(e.target.value)}
                      placeholder="Mention 12A/80G status, shelter beneficiary count, and local municipal registration..."
                      className="w-full px-3.5 py-2 text-xs sm:text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setShowVerifModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingVerif}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white font-bold rounded-xl text-xs"
                    >
                      {submittingVerif ? 'Submitting...' : 'Submit for Review'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
