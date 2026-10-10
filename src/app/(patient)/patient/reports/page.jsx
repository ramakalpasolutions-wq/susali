// src/app/(patient)/patient/reports/page.jsx
"use client";

import { useEffect, useState } from "react";

export default function PatientReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/reports")
      .then((res) => res.json())
      .then((data) => {
        setReports(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading Reports...</div>;

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-gray-800">My Lab & Scan Reports</h3>
      {reports.length === 0 ? (
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center text-gray-500">
          No medical reports found.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reports.map((r) => (
            <div key={r.id} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                    {r.reportType || "Lab/Scan Report"}
                  </span>
                  <span className="text-xs text-gray-400">
                    {r.reportDate ? new Date(r.reportDate).toLocaleDateString() : ""}
                  </span>
                </div>
                <h4 className="font-bold text-gray-800 mt-2">{r.investigation?.name || "Diagnostic Investigation"}</h4>
                <p className="text-xs text-gray-500 italic">Remarks: {r.remarks || "No findings recorded"}</p>
              </div>

              {r.fileUrl && (
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition inline-block"
                >
                  View Original Document
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}