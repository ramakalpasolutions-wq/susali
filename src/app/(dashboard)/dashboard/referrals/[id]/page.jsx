// src/app/(dashboard)/dashboard/referrals/[id]/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";
import { formatDate, formatDateTime } from "@/lib/utils";

export default function ReferralJourneyHub() {
  const { id } = useParams();
  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("overview");

  // Modals
  const [checkInModal, setCheckInModal] = useState(false);
  const [consultModal, setConsultModal] = useState(false);
  const [prescriptionModal, setPrescriptionModal] = useState(false);
  const [followUpModal, setFollowUpModal] = useState(false);

  // Forms
  const [consultForm, setConsultForm] = useState({ symptoms: "", clinicalNotes: "", diagnosis: "", doctorAdvice: "" });
  const [prescForm, setPrescForm] = useState({ type: "FINAL", diagnosis: "", notes: "" });
  const [followForm, setFollowForm] = useState({ followUpDate: "", followUpTime: "10:00 AM", reason: "", instructions: "" });

  useEffect(() => {
    fetchReferralData();
  }, [id]);

  async function fetchReferralData() {
    setLoading(true);
    try {
      const res = await fetch(`/api/referrals/${id}`);
      if (res.ok) {
        const d = await res.json();
        setReferral(d.data || d);
      }
    } catch (e) {
      console.error("Failed to load referral", e);
    } finally {
      setLoading(false);
    }
  }

  // Action Handlers
  async function handleCheckIn() {
    await fetch(`/api/referrals/${id}/check-in`, { method: "POST" });
    setCheckInModal(false);
    fetchReferralData();
  }

  async function handleConsultSubmit(e) {
    e.preventDefault();
    await fetch(`/api/referrals/${id}/consultations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(consultForm),
    });
    setConsultModal(false);
    fetchReferralData();
  }

  async function handlePrescriptionSubmit(e) {
    e.preventDefault();
    await fetch(`/api/referrals/${id}/prescriptions`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prescForm),
    });
    setPrescriptionModal(false);
    fetchReferralData();
  }

  async function handleFollowUpSubmit(e) {
    e.preventDefault();
    await fetch(`/api/referrals/${id}/follow-ups`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(followForm),
    });
    setFollowUpModal(false);
    fetchReferralData();
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-40 rounded-2xl anim-shimmer" />
        <div className="h-96 rounded-2xl anim-shimmer" />
      </div>
    );
  }

  if (!referral) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
        <p className="text-slate-500">Referral not found</p>
      </div>
    );
  }

  const navTabs = [
    { id: "overview", label: "Case Overview", icon: "📋" },
    { id: "consultations", label: `Consultations (${referral.visits?.[0]?.consultations?.length || 0})`, icon: "👨‍⚕️" },
    { id: "prescriptions", label: "Prescriptions", icon: "💊" },
    { id: "followups", label: `Follow-ups (${referral.followUps?.length || 0})`, icon: "🩺" },
    { id: "timeline", label: "Patient Journey Timeline", icon: "⏱️" },
  ];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="anim-slide-up bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono font-black text-xl text-teal-700">{referral.referralId}</span>
              <StatusBadge status={referral.priority} />
              <StatusBadge status={referral.status} />
            </div>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
              <Link href={`/dashboard/patients/${referral.patient?.id}`} className="font-bold text-slate-800 hover:text-teal-700">
                👤 {referral.patient?.fullName}
              </Link>
              <span>•</span>
              <span>🏥 {referral.hospital?.name}</span>
              {referral.department && <span>({referral.department.name})</span>}
            </div>
          </div>

          {/* Quick Action Triggers */}
          <div className="flex flex-wrap gap-2 w-full lg:w-auto">
            {referral.status === "APPOINTMENT_SCHEDULED" && (
              <button
                onClick={() => setCheckInModal(true)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition-all"
              >
                ✓ Desk Check-In
              </button>
            )}
            <button
              onClick={() => setConsultModal(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              + Add Consultation
            </button>
            <button
              onClick={() => setPrescriptionModal(true)}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition-all"
            >
              + Prescription
            </button>
            <button
              onClick={() => setFollowUpModal(true)}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition-all"
            >
              + Follow-Up
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="flex gap-2 mt-6 border-b border-slate-100 overflow-x-auto pb-1">
          {navTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                tab === t.id
                  ? "bg-teal-50 text-teal-700 shadow-xs"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Panels */}
      {tab === "overview" && (
        <div className="anim-slide-up grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
              <h2 className="text-sm font-bold text-slate-800">Clinical Referral Details</h2>
              <div>
                <span className="text-xs text-slate-400 font-semibold uppercase">Chief Complaints & Provisional Diagnosis</span>
                <p className="text-sm text-slate-700 mt-1">{referral.reason || "No diagnosis provided"}</p>
              </div>
              {referral.notes && (
                <div>
                  <span className="text-xs text-slate-400 font-semibold uppercase">Special Instructions / Logistics</span>
                  <p className="text-sm text-slate-700 mt-1">{referral.notes}</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
              <h2 className="text-sm font-bold text-slate-800">Assigned Entities</h2>
              <div className="text-xs space-y-2">
                <div>
                  <span className="text-slate-400">Hospital:</span>
                  <p className="font-bold text-slate-800">{referral.hospital?.name}</p>
                </div>
                <div>
                  <span className="text-slate-400">Department:</span>
                  <p className="font-bold text-slate-800">{referral.department?.name || "General Specialty"}</p>
                </div>
                <div>
                  <span className="text-slate-400">Created By:</span>
                  <p className="font-bold text-slate-800">{referral.createdBy?.name || "Dispensary Staff"}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === "consultations" && (
        <div className="anim-slide-up space-y-4">
          {!referral.visits?.[0]?.consultations?.length ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
              <span className="text-3xl">👨‍⚕️</span>
              <p className="text-sm font-bold text-slate-700 mt-2">No Consultations Recorded</p>
              <button
                onClick={() => setConsultModal(true)}
                className="mt-3 px-4 py-2 bg-teal-600 text-white rounded-xl text-xs font-bold"
              >
                + Record Consultation
              </button>
            </div>
          ) : (
            referral.visits[0].consultations.map((c) => (
              <div key={c.id} className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-800">{c.doctor?.name || "Attending Specialist"}</h3>
                    <p className="text-xs text-slate-400">{c.department || "Clinical OPD"}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatDateTime(c.createdAt)}</span>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Symptoms & Examination</span>
                  <p className="text-sm text-slate-700 mt-0.5">{c.symptoms}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Clinical Diagnosis</span>
                  <p className="text-sm font-bold text-teal-800 mt-0.5">{c.diagnosis}</p>
                </div>
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Doctor's Advice & Plan</span>
                  <p className="text-sm text-slate-700 mt-0.5">{c.doctorAdvice}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {tab === "timeline" && (
        <div className="anim-slide-up bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <h2 className="text-sm font-bold text-slate-800 mb-6">Patient Journey Audit Timeline</h2>
          <div className="space-y-6 relative border-l-2 border-slate-100 ml-4 pl-6">
            {(referral.activityLogs || []).map((log, idx) => (
              <div key={log.id || idx} className="relative">
                <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-teal-500 ring-4 ring-white" />
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-800">{log.action?.replace(/_/g, " ")}</span>
                  <span className="text-[10px] text-slate-400">• {formatDateTime(log.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 mt-1">{log.description}</p>
                {log.userName && <p className="text-[10px] text-slate-400 mt-0.5">By {log.userName} ({log.userRole})</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Check In Modal */}
      <Modal isOpen={checkInModal} onClose={() => setCheckInModal(false)} title="Confirm Desk Check-In">
        <p className="text-sm text-slate-600 mb-4">
          Confirm that patient <strong>{referral.patient?.fullName}</strong> has arrived at the hospital referral desk.
        </p>
        <button
          onClick={handleCheckIn}
          className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl"
        >
          Confirm Check-In
        </button>
      </Modal>

      {/* Consultation Modal */}
      <Modal isOpen={consultModal} onClose={() => setConsultModal(false)} title="Record Doctor Consultation" size="lg">
        <form onSubmit={handleConsultSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Symptoms & Clinical Findings</label>
            <textarea
              rows={2}
              value={consultForm.symptoms}
              onChange={(e) => setConsultForm({ ...consultForm, symptoms: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Diagnosis</label>
            <input
              type="text"
              value={consultForm.diagnosis}
              onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Doctor Advice</label>
            <textarea
              rows={2}
              value={consultForm.doctorAdvice}
              onChange={(e) => setConsultForm({ ...consultForm, doctorAdvice: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-teal-600 text-white font-bold text-sm rounded-xl">
            Save Consultation Record
          </button>
        </form>
      </Modal>

      {/* Prescription Modal */}
      <Modal isOpen={prescriptionModal} onClose={() => setPrescriptionModal(false)} title="Write Prescription">
        <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Diagnosis</label>
            <input
              type="text"
              value={prescForm.diagnosis}
              onChange={(e) => setPrescForm({ ...prescForm, diagnosis: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Medicines & Instructions</label>
            <textarea
              rows={4}
              value={prescForm.notes}
              onChange={(e) => setPrescForm({ ...prescForm, notes: e.target.value })}
              placeholder="e.g. Tab Metformin 500mg (1-0-1) for 30 days"
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-slate-800 text-white font-bold text-sm rounded-xl">
            Upload Prescription
          </button>
        </form>
      </Modal>

      {/* Follow-up Modal */}
      <Modal isOpen={followUpModal} onClose={() => setFollowUpModal(false)} title="Schedule Follow-up">
        <form onSubmit={handleFollowUpSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Follow-up Date *</label>
            <input
              type="date"
              value={followForm.followUpDate}
              onChange={(e) => setFollowForm({ ...followForm, followUpDate: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Reason</label>
            <input
              type="text"
              value={followForm.reason}
              onChange={(e) => setFollowForm({ ...followForm, reason: e.target.value })}
              placeholder="Review lab tests / check BP"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm"
            />
          </div>
          <button type="submit" className="w-full py-2.5 bg-amber-600 text-white font-bold text-sm rounded-xl">
            Schedule Follow-up
          </button>
        </form>
      </Modal>
    </div>
  );
}