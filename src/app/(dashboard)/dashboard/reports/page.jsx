// src/app/(dashboard)/dashboard/reports/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function ReportsAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/reports")
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-44 rounded-2xl anim-shimmer" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-64 rounded-2xl anim-shimmer" />
          <div className="h-64 rounded-2xl anim-shimmer" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="anim-slide-up">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Analytics & Case Distribution</h1>
        <p className="text-xs sm:text-sm text-slate-400">Operational throughput and hospital referral breakdowns</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Patients</span>
          <p className="text-2xl sm:text-3xl font-black text-slate-800 mt-1">{data?.stats?.totalPatients || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Referrals</span>
          <p className="text-2xl sm:text-3xl font-black text-teal-700 mt-1">{data?.stats?.activeReferrals || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Appointments</span>
          <p className="text-2xl sm:text-3xl font-black text-amber-600 mt-1">{data?.stats?.scheduledAppointments || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Investigations</span>
          <p className="text-2xl sm:text-3xl font-black text-rose-600 mt-1">{data?.stats?.pendingInvestigations || 0}</p>
        </div>
      </div>

      {/* Hospital Breakdown */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <h2 className="text-sm font-bold text-slate-800">Hospital Referral Distribution</h2>
        <div className="space-y-3">
          {(data?.hospitalBreakdown || []).map((h, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-700">{h.name}</span>
              <span className="px-2.5 py-1 bg-teal-50 text-teal-700 font-bold rounded-lg">{h.count} Cases</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}