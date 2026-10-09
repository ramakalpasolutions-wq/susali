"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";

export default function PatientProfilePage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [patient, setPatient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("referrals");

  useEffect(() => {
    async function loadPatient() {
      try {
        const res = await fetch(`/api/patients/${id}`);
        if (res.ok) {
          const data = await res.json();
          setPatient(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadPatient();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-40 rounded-2xl anim-shimmer" />
        <div className="h-96 rounded-2xl anim-shimmer" />
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="p-12 text-center bg-white rounded-2xl border border-slate-200">
        <p className="text-slate-500 font-medium">Patient record not found.</p>
        <Link href="/dashboard/patients" className="mt-4 inline-block text-teal-600 font-bold text-sm">
          ← Back to Patients
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Info Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-white font-black text-2xl flex items-center justify-center shrink-0 shadow-md shadow-teal-500/20">
            {patient.fullName?.charAt(0) || "P"}
          </div>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-800">{patient.fullName}</h1>
              <span className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-700 font-bold text-xs border border-teal-200">
                {patient.patientId}
              </span>
              {patient.beneficiaryId && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-semibold text-xs">
                  ID: {patient.beneficiaryId}
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {patient.gender} • {patient.age ? `${patient.age} yrs` : "Age N/A"} • Mobile: {patient.mobile || "—"}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              Mining Zone: <span className="font-bold text-slate-600">{patient.area?.name || "Unassigned"}</span>
              {patient.village && ` • ${patient.village}, ${patient.district || ""}`}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/dashboard/referrals/new?patientId=${patient.id}`}
            className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-sm"
          >
            + Create Referral
          </Link>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "referrals", label: `Referrals (${patient.referrals?.length || 0})` },
          { id: "timeline", label: `Timeline (${patient.activityLogs?.length || 0})` },
          { id: "details", label: "Personal Details" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "bg-teal-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Referrals & Clinical History */}
      {activeTab === "referrals" && (
        <div className="space-y-4">
          {!patient.referrals || patient.referrals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-sm">
              No referral cases created for this patient yet.
            </div>
          ) : (
            patient.referrals.map((ref) => (
              <div key={ref.id} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-teal-700 text-sm">{ref.referralId}</span>
                    <StatusBadge status={ref.priority} />
                    <StatusBadge status={ref.status} />
                  </div>
                  <Link
                    href={`/dashboard/referrals/${ref.id}`}
                    className="text-xs font-bold text-teal-600 hover:text-teal-800"
                  >
                    Open Referral File →
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold block">HOSPITAL</span>
                    <span className="font-semibold text-slate-700">{ref.hospital?.name}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">DEPARTMENT</span>
                    <span className="font-semibold text-slate-700">{ref.department?.name || "General"}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 font-bold block">REFERRED DATE</span>
                    <span className="font-semibold text-slate-700">
                      {new Date(ref.referredAt || ref.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>
                </div>

                {ref.reason && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-slate-500 block mb-1">PROVISIONAL DIAGNOSIS / REASON:</span>
                    {ref.reason}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: Activity Timeline */}
      {activeTab === "timeline" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm">
          <div className="space-y-6">
            {!patient.activityLogs || patient.activityLogs.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-6">No timeline events recorded.</p>
            ) : (
              patient.activityLogs.map((log, index) => (
                <div key={log.id || index} className="flex items-start gap-4">
                  <div className="w-2.5 h-2.5 rounded-full bg-teal-500 mt-1.5 shrink-0 ring-4 ring-teal-100" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-bold text-slate-800">{log.action}</p>
                      <span className="text-[10px] text-slate-400">
                        {new Date(log.createdAt).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">{log.description}</p>
                    <span className="text-[10px] text-slate-400">
                      By: {log.userName || "System"} ({log.userRole || "User"})
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 3: Detailed Profile */}
      {activeTab === "details" && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-slate-400 font-bold block">FULL NAME</span>
              <span className="text-sm font-semibold text-slate-800">{patient.fullName}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">BENEFICIARY ID</span>
              <span className="text-sm font-semibold text-slate-800">{patient.beneficiaryId || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">MINING ZONE</span>
              <span className="text-sm font-semibold text-slate-800">{patient.area?.name || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">MOBILE</span>
              <span className="text-sm font-semibold text-slate-800">{patient.mobile || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">ALTERNATE MOBILE</span>
              <span className="text-sm font-semibold text-slate-800">{patient.alternateMobile || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">ADDRESS</span>
              <span className="text-sm font-semibold text-slate-800">
                {[patient.address, patient.village, patient.mandal, patient.district, patient.state, patient.pinCode]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">EMERGENCY CONTACT</span>
              <span className="text-sm font-semibold text-slate-800">{patient.emergencyContact || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">RELATIONSHIP</span>
              <span className="text-sm font-semibold text-slate-800">{patient.emergencyRelation || "—"}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold block">EMERGENCY MOBILE</span>
              <span className="text-sm font-semibold text-slate-800">{patient.emergencyMobile || "—"}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}