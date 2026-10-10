// src/app/(patient)/patient/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PatientDashboard() {
  const [data, setData] = useState({ referrals: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="text-teal-600 text-sm font-medium">Loading your health profile...</p>
      </div>
    );
  }

  const activeReferral = data.referrals?.[0];

  return (
    <div className="space-y-6 -mt-4">
      {/* Primary Action Card - Floating */}
      <div className="bg-white rounded-2xl shadow-lg p-5 border border-teal-100 flex items-center gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
          <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Have a referral slip?</p>
          <p className="text-base font-bold text-gray-900 mt-0.5">Submit it now</p>
        </div>
        <Link
          href="/patient/use-referral"
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition"
        >
          Submit
        </Link>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">Health Summary</h2>
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            icon="🩺"
            label="Consultations"
            value={data.stats.totalConsultations || 0}
            color="from-teal-500 to-teal-600"
          />
          <StatCard
            icon="💊"
            label="Prescriptions"
            value={data.stats.totalPrescriptions || 0}
            color="from-emerald-500 to-emerald-600"
          />
          <StatCard
            icon="📋"
            label="Referrals"
            value={data.stats.totalReferrals || 0}
            color="from-cyan-500 to-cyan-600"
          />
          <StatCard
            icon="📄"
            label="Reports"
            value={data.stats.totalReports || 0}
            color="from-amber-500 to-orange-500"
          />
        </div>
      </div>

      {/* Active Referral Journey */}
      {activeReferral && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">Current Journey</h2>
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-teal-500 to-emerald-500 px-5 py-3 flex items-center justify-between">
              <div>
                <p className="text-xs text-teal-100 font-medium">Active Referral</p>
                <p className="text-white font-bold text-sm">{activeReferral.referralId}</p>
              </div>
              <span className="bg-white/20 backdrop-blur text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-full">
                {activeReferral.status?.replace(/_/g, " ")}
              </span>
            </div>

            <div className="p-5 space-y-3">
              <InfoRow
                icon="🏥"
                label="Hospital"
                value={activeReferral.hospital?.name || "Pending selection"}
              />
              <InfoRow
                icon="🚪"
                label="Department"
                value={activeReferral.department?.name || "Not specified"}
              />
              <InfoRow
                icon="📅"
                label="Referred On"
                value={new Date(activeReferral.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              />
            </div>
          </div>
        </div>
      )}

      {/* All Referrals List */}
      {data.referrals.length > 1 && (
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3 px-1">All Referrals</h2>
          <div className="space-y-2">
            {data.referrals.slice(1).map((r) => (
              <div
                key={r.id}
                className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm flex items-center justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-teal-700 text-sm">{r.referralId}</p>
                  <p className="text-xs text-gray-500 truncate">{r.hospital?.name || "Hospital pending"}</p>
                </div>
                <span className="text-[10px] px-2 py-1 rounded-full bg-gray-100 text-gray-600 font-semibold uppercase">
                  {r.status?.replace(/_/g, " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {data.referrals.length === 0 && (
        <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-teal-200">
          <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl">📭</span>
          </div>
          <p className="text-gray-800 font-semibold">No referrals yet</p>
          <p className="text-gray-500 text-sm mt-1 mb-4">Submit your offline referral slip to get started.</p>
          <Link
            href="/patient/use-referral"
            className="inline-block bg-teal-600 hover:bg-teal-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-sm"
          >
            Submit Referral
          </Link>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <div className={`w-10 h-10 bg-gradient-to-br ${color} rounded-xl flex items-center justify-center text-lg shadow-sm`}>
        {icon}
      </div>
      <p className="text-2xl font-bold text-gray-900 mt-3">{value}</p>
      <p className="text-xs text-gray-500 font-medium mt-0.5">{label}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-sm flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 font-medium truncate">{value}</p>
      </div>
    </div>
  );
}