"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  SUDO_ADMIN: "Sudo Admin",
  SUPPORT: "Support Intake",
  AREA_MANAGER: "Area Manager",
  HOSPITAL: "Hospital Operations Desk",
};

export default function DashboardPage() {
  const { data: session } = useSession();
  const user = session?.user;
  const role = user?.role;
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ stats: {}, recentReferrals: [] });

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
      <div className="space-y-6">
        <div className="h-32 rounded-2xl anim-shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 rounded-2xl anim-shimmer" />
          ))}
        </div>
      </div>
    );
  }

  const stats = [
    { label: "Total Patients", value: data.stats?.totalPatients || 0, icon: "🧑‍🤝‍🧑", color: "from-teal-500 to-emerald-500", bg: "bg-teal-50" },
    { label: "Active Referrals", value: data.stats?.activeReferrals || 0, icon: "📋", color: "from-violet-500 to-purple-500", bg: "bg-violet-50" },
    { label: "Appointments", value: data.stats?.scheduledAppointments || 0, icon: "📅", color: "from-amber-500 to-orange-500", bg: "bg-amber-50" },
    { label: "Pending Reports", value: data.stats?.pendingInvestigations || 0, icon: "🔬", color: "from-rose-500 to-pink-500", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-6">
      {/* Dynamic Banner */}
      <div className="anim-slide-up bg-gradient-to-r from-teal-700 via-emerald-700 to-teal-800 rounded-2xl p-6 sm:p-8 text-white shadow-xl shadow-teal-900/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        <div className="relative">
          <span className="px-2.5 py-1 bg-white/15 rounded-lg text-[10px] font-bold tracking-wider uppercase">
            {ROLE_LABELS[role] || role}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold mt-3">Welcome back, {user?.name?.split(" ")[0]}</h1>
          <p className="text-teal-100 text-sm mt-2 max-w-xl">
            {role === "SUPER_ADMIN" && "Complete administrative access over systems, empanelled partners, and zone networks."}
            {role === "SUDO_ADMIN" && "System operational administration, area manager dispatch, and workflow coordination."}
            {role === "SUPPORT" && "Patient registration panel: search duplicates, manage patient intake, and coordinate hospital assignments."}
            {role === "AREA_MANAGER" && "Active tracking for assigned patients, appointments, and care pathways."}
            {role === "HOSPITAL" && "Hospital Operations Desk: Incoming referrals, check-ins, and diagnostic reporting."}
          </p>
          <div className="flex flex-wrap gap-2 mt-4">
            {["SUPER_ADMIN", "SUDO_ADMIN", "SUPPORT"].includes(role) && (
              <Link href="/dashboard/referrals/new" className="px-4 py-2 bg-white text-teal-800 font-bold text-sm rounded-xl hover:bg-teal-50 transition-all duration-200 hover:shadow-lg active:scale-95">
                + New Referral
              </Link>
            )}
            {["SUPER_ADMIN", "SUDO_ADMIN", "SUPPORT"].includes(role) && (
              <Link href="/dashboard/patients/new" className="px-4 py-2 bg-teal-600 border border-teal-400 text-white font-bold text-sm rounded-xl hover:bg-teal-500 transition-all duration-200 active:scale-95">
                + Add Patient
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Analytics Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={i} className={`anim-slide-up bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300`}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
              <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-lg`}>{s.icon}</div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-800">{s.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Referrals Table Card */}
      <div className="anim-slide-up bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-800">Recent Referrals</h2>
          <Link href="/dashboard/referrals" className="text-xs font-bold text-teal-600 hover:text-teal-800 transition-colors">
            View All →
          </Link>
        </div>
        <div className="divide-y divide-slate-50">
          {!data.recentReferrals?.length ? (
            <div className="p-12 text-center text-slate-400 text-sm">No referrals yet</div>
          ) : (
            data.recentReferrals.slice(0, 5).map((ref, i) => (
              <Link key={ref.id} href={`/dashboard/referrals/${ref.id}`} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-teal-50/50 transition-all duration-200 gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-teal-700 text-sm">{ref.referralId}</span>
                    <StatusBadge status={ref.priority} />
                    <StatusBadge status={ref.status} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">{ref.patient?.fullName || ref.patient?.name || "Patient"} • {ref.hospital?.name}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{new Date(ref.createdAt || ref.referredAt).toLocaleDateString("en-IN")}</span>
              </Link>
            ))
          )}
        </div>
      </div>

      {/* Operational Quicklinks */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { href: "/dashboard/patients", icon: "📇", label: "Patients" },
          { href: "/dashboard/appointments", icon: "🗓️", label: "Appointments" },
          { href: "/dashboard/investigations", icon: "🧪", label: "Lab & Scans" },
          { href: "/dashboard/followups", icon: "🩺", label: "Follow-ups" },
        ].map((q, i) => (
          <Link key={q.href} href={q.href} className="p-4 bg-white rounded-2xl border border-slate-200/80 text-center hover:shadow-md hover:-translate-y-1 hover:border-teal-300 transition-all duration-300 group">
            <div className="text-2xl group-hover:scale-110 transition-transform duration-200">{q.icon}</div>
            <div className="text-xs font-bold text-slate-600 group-hover:text-teal-700 mt-2 transition-colors">{q.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}