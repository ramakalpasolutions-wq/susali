// src/app/(patient)/patient/prescriptions/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function PatientPrescriptions() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/prescriptions")
      .then((res) => res.json())
      .then((data) => {
        setPrescriptions(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="text-teal-600 text-sm font-medium">Loading prescriptions...</p>
      </div>
    );
  }

  const typeColors = {
    INITIAL: "bg-blue-100 text-blue-700",
    INTERIM: "bg-amber-100 text-amber-700",
    FINAL: "bg-emerald-100 text-emerald-700",
    FOLLOWUP: "bg-purple-100 text-purple-700",
  };

  return (
    <div className="space-y-5 -mt-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Prescriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Medications & doctor notes</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-teal-200">
          <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl">💊</span>
          </div>
          <p className="text-gray-800 font-semibold">No prescriptions yet</p>
          <p className="text-gray-500 text-sm mt-1">They will appear after your doctor visit.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((p) => (
            <div
              key={p.id}
              className="bg-white rounded-2xl shadow-sm border border-teal-50 overflow-hidden"
            >
              {/* Header strip */}
              <div className="bg-gradient-to-r from-teal-50 to-emerald-50 px-5 py-3 flex items-center justify-between border-b border-teal-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center text-xl shadow-sm">
                    💊
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-sm">{p.doctor?.name || "Consulting Doctor"}</p>
                    <p className="text-[11px] text-gray-500">{p.doctor?.hospital?.name || "SUSALI Hospital"}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase px-2.5 py-1 rounded-full ${typeColors[p.type] || "bg-gray-100 text-gray-700"}`}>
                  {p.type}
                </span>
              </div>

              <div className="p-5 space-y-3">
                {p.diagnosis && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Diagnosis</p>
                    <p className="text-sm text-gray-800 font-medium">{p.diagnosis}</p>
                  </div>
                )}

                {p.notes && (
                  <div className="bg-amber-50 rounded-xl p-3 border-l-4 border-amber-400">
                    <p className="text-[10px] font-bold uppercase text-amber-700 mb-1">📝 Medication Notes</p>
                    <p className="text-sm text-gray-800 whitespace-pre-wrap">{p.notes}</p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-gray-400 font-medium">
                    📅 {new Date(p.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  {p.fileUrl && (
                    <a
                      href={p.fileUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition shadow-sm"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                      View
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}