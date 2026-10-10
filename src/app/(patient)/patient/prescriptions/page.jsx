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
        setPrescriptions(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading Prescriptions...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">My Medical Prescriptions</h3>
      {prescriptions.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
          No prescriptions found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((p) => (
            <div key={p.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {p.type} Prescription
                  </span>
                  <span className="text-xs text-gray-400">{new Date(p.createdAt).toLocaleDateString()}</span>
                </div>
                <h4 className="font-bold text-gray-800 mt-2">{p.doctor?.name || "Consulting Doctor"}</h4>
                <p className="text-xs text-gray-400">{p.doctor?.hospital?.name}</p>
              </div>

              <div className="bg-gray-50 p-3 rounded-lg text-sm text-gray-700 min-h-24">
                <p className="text-xs text-gray-400 font-medium mb-1">Medication Notes</p>
                {p.notes || "Standard prescription issue"}
              </div>

              {p.fileUrl && (
                <a
                  href={p.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition inline-block"
                >
                  View Prescription Attachment
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}