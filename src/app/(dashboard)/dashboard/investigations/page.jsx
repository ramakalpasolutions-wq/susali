"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import Modal from "@/components/ui/Modal";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInv, setSelectedInv] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    remarks: "",
    file: null,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const res = await fetch("/api/investigations");
      if (res.ok) {
        const d = await res.json();
        setInvestigations(Array.isArray(d) ? d : d.investigations || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleUploadSubmit(e) {
    e.preventDefault();
    if (!form.file || !selectedInv) {
      alert("Please choose a report file (PDF / JPG / PNG)");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload to storage endpoint
      const formData = new FormData();
      formData.append("file", form.file);
      formData.append("folder", "investigations");

      const upRes = await fetch("/api/documents/upload-url", {
        method: "POST",
        body: formData,
      });

      if (!upRes.ok) throw new Error("File upload failed");
      const upData = await upRes.json();

      // 2. Link report to investigation
      const res = await fetch(`/api/investigations/${selectedInv.id}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: upData.fileUrl,
          fileName: upData.fileName,
          fileSize: upData.fileSize,
          mimeType: upData.mimeType,
          remarks: form.remarks,
        }),
      });

      if (res.ok) {
        setUploadModalOpen(false);
        setForm({ remarks: "", file: null });
        setSelectedInv(null);
        loadData();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to link report");
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Lab & Scan Diagnostic Center</h1>
          <p className="text-xs sm:text-sm text-slate-400">Manage ordered investigations and upload patient test reports</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-extrabold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Test ID / Type</th>
                <th className="py-3 px-4">Investigation Name</th>
                <th className="py-3 px-4">Patient</th>
                <th className="py-3 px-4">Hospital</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    Loading diagnostics queue...
                  </td>
                </tr>
              ) : investigations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No investigations found.
                  </td>
                </tr>
              ) : (
                investigations.map((inv) => {
                  const patient = inv.consultation?.visit?.referral?.patient;
                  const hospital = inv.consultation?.visit?.hospital;
                  const hasReports = inv.reports && inv.reports.length > 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3.5 px-4">
                        <div>
                          <p className="font-bold text-teal-700 text-xs">{inv.investigationId}</p>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {inv.type}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-slate-800">{inv.name}</td>
                      <td className="py-3.5 px-4">
                        {patient ? (
                          <div>
                            <p className="font-semibold text-slate-700 text-xs">{patient.fullName}</p>
                            <p className="text-[10px] text-slate-400">{patient.patientId}</p>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">
                        {hospital?.name || "Empanelled Lab"}
                      </td>
                      <td className="py-3.5 px-4">
                        <StatusBadge status={inv.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {hasReports ? (
                          <a
                            href={inv.reports[0].fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl hover:bg-emerald-100 transition-all"
                          >
                            👁 View Report
                          </a>
                        ) : (
                          <button
                            onClick={() => {
                              setSelectedInv(inv);
                              setUploadModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all"
                          >
                            📤 Upload File
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <Modal isOpen={uploadModalOpen} onClose={() => setUploadModalOpen(false)} title="Upload Lab / Scan Report File">
        <form onSubmit={handleUploadSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Investigation</label>
            <p className="text-sm font-black text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
              {selectedInv?.name} ({selectedInv?.type})
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Select Report File (PDF / JPG / PNG) *</label>
            <input
              type="file"
              required
              accept="application/pdf,image/png,image/jpeg,image/jpg"
              onChange={(e) => setForm({ ...form, file: e.target.files[0] })}
              className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-teal-50 file:text-teal-700 hover:file:bg-teal-100"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Remarks & Observations</label>
            <textarea
              rows={3}
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="e.g. Findings within normal limits, shadow observed on lower lobe"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-xs outline-none focus:border-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setUploadModalOpen(false)}
              className="px-4 py-2 border border-slate-200 rounded-xl text-xs font-bold text-slate-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold disabled:opacity-50"
            >
              {submitting ? "Uploading..." : "Confirm & Upload"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}