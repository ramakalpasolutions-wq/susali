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
        setConsultations(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading Consultations...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">My Consultation History</h3>
      {consultations.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
          No consultations found.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {consultations.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-bold text-gray-800">{c.doctor?.name || "Consulting Doctor"}</h4>
                  <p className="text-sm text-gray-400">{c.doctor?.specialization || "General Medicine"}</p>
                </div>
                <span className="text-xs text-gray-500 font-medium bg-gray-50 px-2.5 py-1 rounded-md">
                  {new Date(c.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="font-semibold text-gray-500">Symptoms:</p>
                  <p className="text-gray-800 mt-1">{c.symptoms || "Not documented"}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500">Diagnosis:</p>
                  <p className="text-gray-800 mt-1 font-medium">{c.diagnosis || "No diagnosis assigned yet"}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="font-semibold text-gray-500">Clinical Advice:</p>
                  <p className="text-gray-700 mt-1 italic">{c.doctorAdvice || "No specific advice noted"}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}