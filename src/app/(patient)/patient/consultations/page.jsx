// src/app/(patient)/patient/consultations/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function PatientConsultations() {
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/consultations")
      .then((res) => res.json())
      .then((data) => {
        setConsultations(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="text-teal-600 text-sm font-medium">Loading consultations...</p>
      </div>
    );
  }

  return (
    <div className="space-y-5 -mt-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">My Consultations</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your medical visit history</p>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-teal-200">
          <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl">🩺</span>
          </div>
          <p className="text-gray-800 font-semibold">No consultations yet</p>
          <p className="text-gray-500 text-sm mt-1">Your doctor visits will appear here.</p>
        </div>
      ) : (
        <div className="relative pl-6 space-y-5">
          {/* Vertical Timeline Line */}
          <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-gradient-to-b from-teal-400 to-emerald-200"></div>

          {consultations.map((c, idx) => (
            <div key={c.id} className="relative">
              {/* Timeline Dot */}
              <div className="absolute -left-6 top-2 w-4 h-4 rounded-full bg-white border-4 border-teal-500 shadow"></div>

              {/* Card */}
              <div className="bg-white rounded-2xl shadow-sm border border-teal-50 p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="font-bold text-gray-900 truncate">{c.doctor?.name || "Consulting Doctor"}</h3>
                    <p className="text-xs text-teal-600 font-medium">{c.doctor?.specialization || "General Medicine"}</p>
                  </div>
                  <span className="text-[10px] text-gray-500 font-semibold bg-gray-50 px-2.5 py-1 rounded-full flex-shrink-0">
                    {new Date(c.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </div>

                {c.diagnosis && (
                  <div className="bg-emerald-50 rounded-xl p-3 border-l-4 border-emerald-500">
                    <p className="text-[10px] font-bold uppercase text-emerald-700 mb-0.5">Diagnosis</p>
                    <p className="text-sm text-gray-800 font-medium">{c.diagnosis}</p>
                  </div>
                )}

                {c.symptoms && (
                  <div>
                    <p className="text-[10px] font-bold uppercase text-gray-400 mb-0.5">Symptoms</p>
                    <p className="text-sm text-gray-700">{c.symptoms}</p>
                  </div>
                )}

                {c.doctorAdvice && (
                  <div className="bg-teal-50 rounded-xl p-3">
                    <p className="text-[10px] font-bold uppercase text-teal-700 mb-0.5">💡 Doctor's Advice</p>
                    <p className="text-sm text-gray-800 italic">{c.doctorAdvice}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}