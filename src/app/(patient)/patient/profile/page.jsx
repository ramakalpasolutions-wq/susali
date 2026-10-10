'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'next-auth/react';
import Link from 'next/link';

export default function PatientProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Form states
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/patient/profile');
      if (res.ok) {
        const data = await res.json();
        setProfile(data.patient);
        setFormData((prev) => ({
          ...prev,
          fullName: data.patient.fullName || '',
          phone: data.patient.phone || '',
          email: data.patient.email || '',
        }));
      } else {
        setMessage({ type: 'error', text: 'Failed to load profile details' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Error connecting to server' });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setMessage({ type: '', text: '' });

    if (showPasswordSection && formData.newPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: 'error', text: 'New passwords do not match' });
        return;
      }
      if (formData.newPassword.length < 6) {
        setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
        return;
      }
      if (!formData.currentPassword) {
        setMessage({ type: 'error', text: 'Please enter your current password' });
        return;
      }
    }

    try {
      setSaving(true);
      const payload = {
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        ...(showPasswordSection && formData.newPassword
          ? {
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
            }
          : {}),
      };

      const res = await fetch('/api/patient/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to update profile');
      }

      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      setFormData((prev) => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setShowPasswordSection(false);
      fetchProfile();
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setSaving(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'P';
    return name
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm font-medium text-teal-700">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-8">
      {/* Top Breadcrumb / Back */}
      <div className="flex items-center justify-between">
        <Link
          href="/patient/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 px-3 py-1.5 rounded-full border border-teal-200/60"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Home
        </Link>

        <span className="text-xs font-medium text-slate-500 bg-white px-2.5 py-1 rounded-full border border-slate-200">
          SUSALI Patient ID: <strong className="text-teal-800 font-bold">{profile?.idCardNumber || 'N/A'}</strong>
        </span>
      </div>

      {/* Hero Avatar Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-teal-600 via-teal-700 to-emerald-700 text-white p-6 shadow-lg shadow-teal-700/15">
        <div className="absolute -right-10 -bottom-10 w-44 h-44 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-emerald-400/20 blur-xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
          <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 flex items-center justify-center text-2xl font-black text-white shadow-md">
            {getInitials(profile?.fullName)}
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-black tracking-tight drop-shadow-sm">
              {profile?.fullName || 'Patient Profile'}
            </h1>
            <p className="text-teal-100 text-sm mt-0.5 flex items-center justify-center sm:justify-start gap-2 flex-wrap">
              <span>📞 {profile?.phone || 'No phone'}</span>
              <span>•</span>
              <span>✉️ {profile?.email || 'No email'}</span>
            </p>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
              {profile?.area?.name && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 border border-white/30 backdrop-blur-sm text-white">
                  📍 Area: {profile.area.name}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-400/30 border border-emerald-200/40 text-emerald-100">
                ✓ Active Beneficiary
              </span>
            </div>
          </div>
        </div>

        {/* Quick Stats Strip */}
        <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-white/15 text-center">
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            <p className="text-lg font-black">{profile?.stats?.referrals ?? 0}</p>
            <p className="text-[10px] text-teal-100 font-medium">Referrals</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            <p className="text-lg font-black">{profile?.stats?.consultations ?? 0}</p>
            <p className="text-[10px] text-teal-100 font-medium">Visits</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            <p className="text-lg font-black">{profile?.stats?.prescriptions ?? 0}</p>
            <p className="text-[10px] text-teal-100 font-medium">Rx Meds</p>
          </div>
          <div className="bg-white/10 rounded-xl p-2 backdrop-blur-sm">
            <p className="text-lg font-black">{profile?.stats?.investigations ?? 0}</p>
            <p className="text-[10px] text-teal-100 font-medium">Reports</p>
          </div>
        </div>
      </div>

      {/* Alert Messages */}
      {message.text && (
        <div
          className={`p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 border ${
            message.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-rose-50 text-rose-800 border-rose-200'
          }`}
        >
          <span>{message.type === 'success' ? '✓' : '⚠️'}</span>
          <span>{message.text}</span>
        </div>
      )}

      {/* Edit Details Form Card */}
      <form onSubmit={handleSaveProfile} className="bg-white rounded-3xl p-5 sm:p-6 border border-teal-100 shadow-sm space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base font-bold text-slate-900">Personal Information</h2>
            <p className="text-xs text-slate-500">Update your contact details below</p>
          </div>
          <span className="text-xs px-2 py-1 rounded-md bg-teal-50 text-teal-700 font-medium">
            Editable
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Full Name *
            </label>
            <input
              type="text"
              name="fullName"
              required
              value={formData.fullName}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              required
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-slate-50/50"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. name@example.com"
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all bg-slate-50/50"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              ID Card Number (Permanent)
            </label>
            <input
              type="text"
              disabled
              value={profile?.idCardNumber || 'N/A'}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 mb-1.5">
              Registered Area
            </label>
            <input
              type="text"
              disabled
              value={profile?.area?.name ? `${profile.area.name} (${profile.area.code || ''})` : 'General Area'}
              className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Change Password Toggle */}
        <div className="pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowPasswordSection(!showPasswordSection)}
            className="flex items-center justify-between w-full py-2 text-xs font-bold text-teal-700 hover:text-teal-800"
          >
            <span className="flex items-center gap-2">
              🔒 {showPasswordSection ? 'Hide Change Password' : 'Change Login Password'}
            </span>
            <span>{showPasswordSection ? '▲' : '▼'}</span>
          </button>

          {showPasswordSection && (
            <div className="mt-3 p-4 bg-teal-50/50 rounded-2xl border border-teal-100 space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Current Password *
                </label>
                <input
                  type="password"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleChange}
                    placeholder="Min 6 characters"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-type new password"
                    className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 bg-white focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Submit button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-sm rounded-2xl shadow-md shadow-teal-600/20 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {saving ? 'Saving changes...' : 'Save Profile Changes'}
          </button>
        </div>
      </form>

      {/* App & Account Actions */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Account Actions
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <Link
            href="/patient/use-referral"
            className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50/70 hover:bg-teal-100/70 border border-teal-100 text-teal-900 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-black">
              +
            </div>
            <div>
              <p className="text-xs font-bold">Use Referral Slip</p>
              <p className="text-[10px] text-teal-700">Enter offline superintendent slip code</p>
            </div>
          </Link>

          <Link
            href="/patient/consultations"
            className="flex items-center gap-3 p-3 rounded-2xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 text-emerald-900 transition-colors"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black">
              🩺
            </div>
            <div>
              <p className="text-xs font-bold">Visit History</p>
              <p className="text-[10px] text-emerald-700">View past doctor consultations</p>
            </div>
          </Link>
        </div>

        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="w-full mt-2 py-2.5 px-4 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Sign Out of Account
        </button>
      </div>
    </div>
  );
}