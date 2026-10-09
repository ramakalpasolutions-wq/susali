"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";

export default function ReferralDetailPage({ params }) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [referral, setReferral] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("clinical");

  // Modals
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [prescriptionModalOpen, setPrescriptionModalOpen] = useState(false);
  const [consultModalOpen, setConsultModalOpen] = useState(false);
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false);

  const [selectedInv, setSelectedInv] = useState(null);
  const [uploading, setUploading] = useState(false);

  // Forms
  const [consultForm, setConsultForm] = useState({
    diagnosis: "",
    symptoms: "",
    clinicalNotes: "",
    doctorAdvice: "",
    investigationRequired: false,
    investigations: [{ name: "", type: "LAB" }],
    prescriptionProvided: false,
    prescriptionText: "",
  });

  const [prescriptionForm, setPrescriptionForm] = useState({
    type: "FINAL",
    diagnosis: "",
    notes: "",
    file: null,
    finalizeTreatment: false,
  });

  const [reportForm, setReportForm] = useState({
    remarks: "",
    file: null,
  });

  const [followUpForm, setFollowUpForm] = useState({
    followUpDate: "",
    followUpTime: "10:30 AM",
    reason: "",
    instructions: "",
  });

  useEffect(() => {
    loadReferral();
  }, [id]);

  async function loadReferral() {
    try {
      const res = await fetch(`/api/referrals/${id}`);
      if (res.ok) {
        const data = await res.json();
        setReferral(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  // Helper for Uploading Files
  async function uploadFileToR2(file, folder = "medical") {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const res = await fetch("/api/documents/upload-url", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "File upload failed");
    }

    return await res.json();
  }

  // 1. Hospital Check-In
  async function handleCheckIn() {
    if (!confirm("Confirm patient arrival and check-in at hospital reception?")) return;
    try {
      const res = await fetch(`/api/referrals/${id}/check-in`, { method: "POST" });
      if (res.ok) {
        alert("Patient Checked-in Successfully!");
        loadReferral();
      } else {
        const err = await res.json();
        alert(err.error || "Check-in failed");
      }
    } catch (e) {
      alert(e.message);
    }
  }

  // 2. Submit Consultation
  async function handleConsultSubmit(e) {
    e.preventDefault();
    setUploading(true);
    try {
      const filteredInvs = consultForm.investigations.filter((i) => i.name.trim() !== "");
      const res = await fetch(`/api/referrals/${id}/consultations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...consultForm,
          investigationRequired: filteredInvs.length > 0,
          investigations: filteredInvs,
        }),
      });
      if (res.ok) {
        setConsultModalOpen(false);
        loadReferral();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to record consultation");
      }
    } finally {
      setUploading(false);
    }
  }

  // 3. Upload Lab / Scan Report
  async function handleReportSubmit(e) {
    e.preventDefault();
    if (!reportForm.file || !selectedInv) {
      alert("Please select a report file (PDF or Image)");
      return;
    }
    setUploading(true);
    try {
      // Step A: Upload file to storage
      const uploadRes = await uploadFileToR2(reportForm.file, "investigations");

      // Step B: Link report to investigation
      const res = await fetch(`/api/investigations/${selectedInv.id}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: uploadRes.fileUrl,
          fileName: uploadRes.fileName,
          fileSize: uploadRes.fileSize,
          mimeType: uploadRes.mimeType,
          remarks: reportForm.remarks,
        }),
      });

      if (res.ok) {
        setReportModalOpen(false);
        setReportForm({ remarks: "", file: null });
        setSelectedInv(null);
        loadReferral();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to link report");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  // 4. Upload Prescription (Image or PDF)
  async function handlePrescriptionSubmit(e) {
    e.preventDefault();
    setUploading(true);
    try {
      let fileUrl = null;
      let fileName = null;

      if (prescriptionForm.file) {
        const uploadRes = await uploadFileToR2(prescriptionForm.file, "prescriptions");
        fileUrl = uploadRes.fileUrl;
        fileName = uploadRes.fileName;
      }

      const res = await fetch(`/api/referrals/${id}/prescriptions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: prescriptionForm.type,
          diagnosis: prescriptionForm.diagnosis,
          notes: prescriptionForm.notes,
          fileUrl,
          fileName,
          finalizeTreatment: prescriptionForm.finalizeTreatment,
        }),
      });

      if (res.ok) {
        setPrescriptionModalOpen(false);
        setPrescriptionForm({ type: "FINAL", diagnosis: "", notes: "", file: null, finalizeTreatment: false });
        loadReferral();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save prescription");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setUploading(false);
    }
  }

  // 5. Follow-up Submit
  async function handleFollowUpSubmit(e) {
    e.preventDefault();
    setUploading(true);
    try {
      const res = await fetch(`/api/referrals/${id}/follow-ups`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(followUpForm),
      });
      if (res.ok) {
        setFollowUpModalOpen(false);
        loadReferral();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to schedule follow up");
      }
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <div className="h-96 rounded-2xl anim-shimmer" />;
  }

  if (!referral) {
    return <div className="p-8 bg-white rounded-2xl">Referral not found.</div>;
  }

  const allInvestigations =
    referral.visits?.flatMap((v) => v.consultations?.flatMap((c) => c.investigations || []) || []) || [];
  const allPrescriptions =
    referral.visits?.flatMap((v) => v.consultations?.flatMap((c) => c.prescriptions || []) || []) || [];

  return (
    <div className="space-y-6">
      {/* Top Referral Header */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-slate-800">{referral.referralId}</h1>
            <StatusBadge status={referral.priority} />
            <StatusBadge status={referral.status} />
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Patient:{" "}
            <Link href={`/dashboard/patients/${referral.patient?.id}`} className="font-bold text-teal-700 hover:underline">
              {referral.patient?.fullName} ({referral.patient?.patientId})
            </Link>{" "}
            • Hospital: <span className="font-semibold text-slate-700">{referral.hospital?.name}</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {referral.status === "HOSPITAL_ASSIGNED" || referral.status === "APPOINTMENT_SCHEDULED" ? (
            <button
              onClick={handleCheckIn}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
            >
              ✓ Patient Check-In
            </button>
          ) : null}

          <button
            onClick={() => setConsultModalOpen(true)}
            className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            + Doctor Consultation
          </button>

          <button
            onClick={() => setPrescriptionModalOpen(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            📤 Upload Prescription
          </button>

          <button
            onClick={() => setFollowUpModalOpen(true)}
            className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
          >
            + Schedule Follow-up
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {[
          { id: "clinical", label: `Tests & Scans (${allInvestigations.length})` },
          { id: "prescriptions", label: `Prescriptions (${allPrescriptions.length})` },
          { id: "followups", label: `Follow-ups (${referral.followUps?.length || 0})` },
          { id: "timeline", label: `Timeline (${referral.activityLogs?.length || 0})` },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all whitespace-nowrap ${
              activeTab === tab.id ? "bg-teal-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Lab & Scan Investigations */}
      {activeTab === "clinical" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Ordered Diagnostic Tests & Scans</h2>
          </div>

          {allInvestigations.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No laboratory or scan investigations recommended yet. Click &quot;+ Doctor Consultation&quot; to order tests.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allInvestigations.map((inv) => (
                <div key={inv.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 mr-2">
                        {inv.type}
                      </span>
                      <span className="text-xs font-bold text-teal-700">{inv.investigationId}</span>
                    </div>
                    <StatusBadge status={inv.status} />
                  </div>

                  <h3 className="text-sm font-black text-slate-800">{inv.name}</h3>

                  {/* Reports list */}
                  {inv.reports && inv.reports.length > 0 ? (
                    <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl space-y-2">
                      <p className="text-xs font-bold text-emerald-800">✓ Uploaded Reports ({inv.reports.length}):</p>
                      {inv.reports.map((rep) => (
                        <div key={rep.id} className="flex items-center justify-between text-xs">
                          <span className="text-emerald-700 truncate max-w-[200px]">{rep.fileName || "Report Document"}</span>
                          <a
                            href={rep.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2.5 py-1 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 text-[11px]"
                          >
                            👁 View Report
                          </a>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-amber-600 font-semibold">Report Pending</span>
                      <button
                        onClick={() => {
                          setSelectedInv(inv);
                          setReportModalOpen(true);
                        }}
                        className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm"
                      >
                        📤 Upload Report
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Prescriptions */}
      {activeTab === "prescriptions" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Clinical Prescriptions</h2>
            <button
              onClick={() => setPrescriptionModalOpen(true)}
              className="px-3 py-1.5 bg-teal-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              + Upload Prescription
            </button>
          </div>

          {allPrescriptions.length === 0 ? (
            <div className="p-10 text-center bg-white rounded-2xl border border-slate-200 text-slate-400 text-xs">
              No prescriptions uploaded yet.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {allPrescriptions.map((p) => (
                <div key={p.id} className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-bold text-[10px]">
                      {p.type} PRESCRIPTION
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(p.uploadedAt || p.createdAt).toLocaleDateString("en-IN")}
                    </span>
                  </div>

                  {p.diagnosis && (
                    <p className="text-xs text-slate-700">
                      <strong className="text-slate-500">Diagnosis:</strong> {p.diagnosis}
                    </p>
                  )}

                  {p.notes && (
                    <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 whitespace-pre-line">
                      {p.notes}
                    </div>
                  )}

                  {p.fileUrl && (
                    <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs text-slate-500 truncate max-w-[200px]">{p.fileName || "Prescription File"}</span>
                      <a
                        href={p.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-lg shadow-sm"
                      >
                        👁 View / Download
                      </a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Follow-ups */}
      {activeTab === "followups" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Scheduled Follow-up Visits</h2>
            <button
              onClick={() => setFollowUpModalOpen(true)}
              className="px-3 py-1.5 bg-purple-600 text-white font-bold text-xs rounded-xl shadow-sm"
            >
              + Schedule Follow-up
            </button>
          </div>

          {!referral.followUps || referral.followUps.length === 0 ? (
            <p className="text-slate-400 text-xs text-center py-6">No follow-ups scheduled.</p>
          ) : (
            <div className="space-y-3">
              {referral.followUps.map((f) => (
                <div key={f.id} className="p-4 bg-purple-50/50 border border-purple-100 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-bold text-purple-900 text-sm">
                      {new Date(f.followUpDate).toLocaleDateString("en-IN")} at {f.followUpTime || "10:00 AM"}
                    </span>
                    <p className="text-xs text-slate-600 mt-1">{f.reason || "Routine review"}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-200 text-purple-800 text-[10px] font-black rounded-lg">
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Activity Logs */}
      {activeTab === "timeline" && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Chronological Case Timeline</h2>
          <div className="space-y-4">
            {referral.activityLogs?.map((log) => (
              <div key={log.id} className="flex items-start gap-3 text-xs">
                <div className="w-2 h-2 rounded-full bg-teal-500 mt-1.5 ring-4 ring-teal-50" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                  </div>
                  <p className="text-slate-600 mt-0.5">{log.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: Upload Lab / Scan Report */}
      <Modal isOpen={reportModalOpen} onClose={() => setReportModalOpen(false)} title={`Upload ${selectedInv?.type} Report`}>
        <form onSubmit={handleReportSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Investigation Name</label>
            <input
              type="text"
              readOnly
              value={selectedInv?.name || ""}
              className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Select Report File (PDF / Image) *</label>
            <input
              type="file"
              required
              accept="application/pdf,image/png,image/jpeg,image/jpg"
              onChange={(e) => setReportForm({ ...reportForm, file: e.target.files[0] })}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Radiology / Lab Remarks</label>
            <textarea
              rows={3}
              value={reportForm.remarks}
              onChange={(e) => setReportForm({ ...reportForm, remarks: e.target.value })}
              placeholder="e.g. Bilateral infiltrates, normal CBC parameters"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setReportModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {uploading ? "Uploading..." : "Upload & Link Report"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 2: Upload Prescription (Image or PDF) */}
      <Modal isOpen={prescriptionModalOpen} onClose={() => setPrescriptionModalOpen(false)} title="Upload Doctor Prescription">
        <form onSubmit={handlePrescriptionSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Prescription Stage</label>
            <select
              value={prescriptionForm.type}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, type: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500 bg-white"
            >
              <option value="INITIAL">Initial OPD Prescription</option>
              <option value="INTERIM">Interim (Under Investigation)</option>
              <option value="FINAL">Final Doctor Prescription</option>
              <option value="FOLLOWUP">Follow-up Prescription</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Upload Prescription Image / PDF</label>
            <input
              type="file"
              accept="application/pdf,image/png,image/jpeg,image/jpg"
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, file: e.target.files[0] })}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Final Diagnosis</label>
            <input
              type="text"
              value={prescriptionForm.diagnosis}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, diagnosis: e.target.value })}
              placeholder="e.g. Pneumoconiosis Stage II"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Dosage & Instructions</label>
            <textarea
              rows={3}
              value={prescriptionForm.notes}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, notes: e.target.value })}
              placeholder="Medication names, dosage intervals, diet restrictions..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="finalize"
              checked={prescriptionForm.finalizeTreatment}
              onChange={(e) => setPrescriptionForm({ ...prescriptionForm, finalizeTreatment: e.target.checked })}
              className="rounded text-teal-600 focus:ring-teal-500"
            />
            <label htmlFor="finalize" className="text-xs font-bold text-slate-700">
              Mark treatment as completed (No active follow-up required)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setPrescriptionModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Save Prescription"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 3: Doctor Consultation & Test Ordering */}
      <Modal isOpen={consultModalOpen} onClose={() => setConsultModalOpen(false)} title="Record Doctor Consultation">
        <form onSubmit={handleConsultSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Provisional / Confirmed Diagnosis</label>
            <input
              type="text"
              value={consultForm.diagnosis}
              onChange={(e) => setConsultForm({ ...consultForm, diagnosis: e.target.value })}
              placeholder="e.g. Bronchiectasis with secondary infection"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Clinical Examination Findings</label>
            <textarea
              rows={2}
              value={consultForm.clinicalNotes}
              onChange={(e) => setConsultForm({ ...consultForm, clinicalNotes: e.target.value })}
              placeholder="Symptoms, auscultation, vitals..."
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
            />
          </div>

          {/* Test Ordering */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700">Recommend Diagnostic Tests / Scans</label>
              <button
                type="button"
                onClick={() =>
                  setConsultForm({
                    ...consultForm,
                    investigations: [...consultForm.investigations, { name: "", type: "LAB" }],
                  })
                }
                className="text-[11px] font-bold text-teal-600 hover:underline"
              >
                + Add Another Test
              </button>
            </div>

            {consultForm.investigations.map((inv, idx) => (
              <div key={idx} className="flex gap-2">
                <select
                  value={inv.type}
                  onChange={(e) => {
                    const next = [...consultForm.investigations];
                    next[idx].type = e.target.value;
                    setConsultForm({ ...consultForm, investigations: next });
                  }}
                  className="px-2 py-1.5 border border-slate-200 rounded-lg text-xs bg-white"
                >
                  <option value="LAB">Lab Test</option>
                  <option value="SCAN">Scan / CT / MRI</option>
                  <option value="IMAGING">X-Ray / USG</option>
                  <option value="OTHER">Other</option>
                </select>
                <input
                  type="text"
                  placeholder="Test Name (e.g. HRCT Thorax, CBC, Spirometry)"
                  value={inv.name}
                  onChange={(e) => {
                    const next = [...consultForm.investigations];
                    next[idx].name = e.target.value;
                    setConsultForm({ ...consultForm, investigations: next });
                  }}
                  className="flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs outline-none focus:border-teal-500"
                />
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setConsultModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {uploading ? "Saving..." : "Save Consultation"}
            </button>
          </div>
        </form>
      </Modal>

      {/* MODAL 4: Follow-up Scheduling */}
      <Modal isOpen={followUpModalOpen} onClose={() => setFollowUpModalOpen(false)} title="Schedule Follow-Up Visit">
        <form onSubmit={handleFollowUpSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Follow-up Date *</label>
              <input
                type="date"
                required
                value={followUpForm.followUpDate}
                onChange={(e) => setFollowUpForm({ ...followUpForm, followUpDate: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Time Slot</label>
              <input
                type="text"
                value={followUpForm.followUpTime}
                onChange={(e) => setFollowUpForm({ ...followUpForm, followUpTime: e.target.value })}
                placeholder="10:30 AM"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Reason for Follow-up</label>
            <input
              type="text"
              value={followUpForm.reason}
              onChange={(e) => setFollowUpForm({ ...followUpForm, reason: e.target.value })}
              placeholder="e.g. Post-medication review, surgical check"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setFollowUpModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {uploading ? "Scheduling..." : "Confirm Follow-up"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}