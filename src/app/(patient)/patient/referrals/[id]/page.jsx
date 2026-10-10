// src/app/(patient)/patient/referrals/[id]/page.jsx
"use client";

import { useState, useEffect, use } from "react";

export default function PatientReferralDetailPage({ params }) {
  const { id } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/patient/referrals/${id}`)
      .then((r) => r.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!data || data.error) {
    return <div className="text-center text-red-500 py-12">{data?.error || "Referral not found"}</div>;
  }

  const ref = data.referral;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-mono font-bold text-xl text-indigo-600">{ref.referralId}</p>
            {ref.referralCode && (
              <p className="text-sm text-gray-400">Code: <span className="font-mono font-medium">{ref.referralCode}</span></p>
            )}
          </div>
          <span className={`px-3 py-1 text-sm font-medium rounded-full ${
            ref.status === "TREATMENT_COMPLETED" ? "bg-green-100 text-green-700" :
            ref.status === "CASE_CLOSED" ? "bg-gray-100 text-gray-600" :
            "bg-blue-100 text-blue-700"
          }`}>
            {ref.status.replace(/_/g, " ")}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-4 mt-4 text-sm">
          <div><span className="text-gray-500">Hospital:</span> <span className="font-medium">{ref.hospital?.name || "—"}</span></div>
          <div><span className="text-gray-500">Department:</span> <span className="font-medium">{ref.department?.name || "—"}</span></div>
          <div><span className="text-gray-500">Priority:</span> <span className="font-medium">{ref.priority}</span></div>
          <div><span className="text-gray-500">Referred On:</span> <span className="font-medium">{new Date(ref.createdAt).toLocaleDateString("en-IN")}</span></div>
        </div>
        {ref.reason && (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-sm text-gray-600">{ref.reason}</div>
        )}
      </div>

      {/* Consultations */}
      {data.consultations?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">🩺 Consultations</h3>
          <div className="space-y-4">
            {data.consultations.map((c) => (
              <div key={c.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-800">{c.doctor?.name || "Doctor"}</p>
                  <p className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleString("en-IN")}</p>
                </div>
                {c.diagnosis && <p className="text-sm"><span className="text-gray-500">Diagnosis:</span> {c.diagnosis}</p>}
                {c.symptoms && <p className="text-sm mt-1"><span className="text-gray-500">Symptoms:</span> {c.symptoms}</p>}
                {c.doctorAdvice && <p className="text-sm mt-1"><span className="text-gray-500">Advice:</span> {c.doctorAdvice}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Prescriptions */}
      {data.prescriptions?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💊 Prescriptions</h3>
          <div className="space-y-3">
            {data.prescriptions.map((p) => (
              <div key={p.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">{p.type}</span>
                  <p className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString("en-IN")}</p>
                </div>
                {p.diagnosis && <p className="text-sm"><span className="text-gray-500">Diagnosis:</span> {p.diagnosis}</p>}
                {p.notes && <p className="text-sm mt-1 text-gray-600">{p.notes}</p>}
                {p.fileUrl && (
                  <a href={p.fileUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-700">
                    📎 {p.fileName || "View Prescription"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Investigation Reports */}
      {data.reports?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📄 Lab & Scan Reports</h3>
          <div className="space-y-3">
            {data.reports.map((r) => (
              <div key={r.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-800">{r.investigation?.name || r.reportType}</p>
                  <p className="text-xs text-gray-400">{r.reportDate ? new Date(r.reportDate).toLocaleDateString("en-IN") : ""}</p>
                </div>
                {r.remarks && <p className="text-sm text-gray-600">{r.remarks}</p>}
                {r.fileUrl && (
                  <a href={r.fileUrl} target="_blank" rel="noreferrer"
                    className="inline-flex items-center gap-1 mt-2 text-sm text-indigo-600 hover:text-indigo-700">
                    📎 {r.fileName || "View Report"}
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Timeline */}
      {data.activityLogs?.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">📜 Timeline</h3>
          <div className="space-y-3">
            {data.activityLogs.map((log) => (
              <div key={log.id} className="flex gap-3 text-sm">
                <div className="w-2 h-2 bg-indigo-400 rounded-full mt-1.5 flex-shrink-0"></div>
                <div>
                  <p className="text-gray-700">{log.description}</p>
                  <p className="text-xs text-gray-400">{new Date(log.createdAt).toLocaleString("en-IN")}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}