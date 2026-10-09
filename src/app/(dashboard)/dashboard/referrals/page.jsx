// src/app/(dashboard)/dashboard/referrals/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

const FILTER_TABS = [
  { id: "ALL", label: "All Referrals" },
  { id: "ACTIVE", label: "In Journey" },
  { id: "APPOINTMENT_SCHEDULED", label: "Scheduled" },
  { id: "DOCTOR_REVIEW_PENDING", label: "Doctor Review" },
  { id: "FOLLOWUP_SCHEDULED", label: "Follow-ups" },
  { id: "TREATMENT_COMPLETED", label: "Completed" },
];

export default function ReferralsListPage() {
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchReferrals();
  }, []);

  async function fetchReferrals() {
    setLoading(true);
    try {
      const res = await fetch("/api/referrals");
      if (res.ok) {
        const data = await res.json();
        setReferrals(data.data || data);
      }
    } catch (e) {
      console.error("Failed to load referrals", e);
    } finally {
      setLoading(false);
    }
  }

  const filtered = referrals.filter((ref) => {
    const matchesSearch =
      ref.referralId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.patient?.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ref.hospital?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    if (!matchesSearch) return false;

    if (activeTab === "ALL") return true;
    if (activeTab === "ACTIVE") {
      return !["TREATMENT_COMPLETED", "CASE_CLOSED"].includes(ref.status);
    }
    return ref.status === activeTab;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="anim-slide-up flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Referrals Management</h1>
          <p className="text-xs sm:text-sm text-slate-400">Track and manage patient pathways from mining sites to specialist care</p>
        </div>
        <Link
          href="/dashboard/referrals/new"
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs hover:shadow-teal-500/20 transition-all duration-200 active:scale-95 text-center"
        >
          + Create Referral
        </Link>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="anim-slide-up d1 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-teal-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-3 text-slate-400">🔍</span>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Referral ID, Patient Name, or Hospital..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Referrals List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 anim-scale">
          <span className="text-4xl">📂</span>
          <h3 className="text-base font-bold text-slate-700 mt-2">No Referrals Found</h3>
          <p className="text-xs text-slate-400 mt-1">Try switching filters or adjust your search keywords.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ref, idx) => (
            <div
              key={ref.id}
              className={`anim-slide-up d${Math.min(idx + 1, 8)} bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4`}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Link
                    href={`/dashboard/referrals/${ref.id}`}
                    className="font-bold text-teal-700 hover:underline text-sm font-mono"
                  >
                    {ref.referralId}
                  </Link>
                  <StatusBadge status={ref.priority} />
                  <StatusBadge status={ref.status} />
                </div>
                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-600">
                  <span className="font-bold text-slate-800">{ref.patient?.fullName || "Unnamed Patient"}</span>
                  <span>•</span>
                  <span>{ref.hospital?.name || "Unassigned Hospital"}</span>
                  {ref.department?.name && (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                      {ref.department.name}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 truncate max-w-2xl mt-1">
                  {ref.reason || "Specialist clinical review"}
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 justify-between md:justify-end border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                <div className="text-right">
                  <span className="text-xs text-slate-500 font-medium">{formatDate(ref.referredAt || ref.createdAt)}</span>
                  <p className="text-[10px] text-slate-400">Created Date</p>
                </div>
                <Link
                  href={`/dashboard/referrals/${ref.id}`}
                  className="px-3.5 py-2 bg-slate-100 hover:bg-teal-600 hover:text-white text-slate-700 font-bold text-xs rounded-xl transition-all"
                >
                  Manage Hub →
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}