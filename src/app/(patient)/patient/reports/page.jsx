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
        setReports(Array.isArray(data) ? data : []);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin"></div>
        <p className="text-teal-600 text-sm font-medium">Loading reports...</p>
      </div>
    );
  }

  const getFileIcon = (mimeType) => {
    if (!mimeType) return "📄";
    if (mimeType.includes("pdf")) return "📕";
    if (mimeType.includes("image")) return "🖼️";
    return "📄";
  };

  return (
    <div className="space-y-5 -mt-4">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Lab & Scan Reports</h1>
        <p className="text-sm text-gray-500 mt-0.5">Your diagnostic documents</p>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border-2 border-dashed border-teal-200">
          <div className="w-16 h-16 mx-auto bg-teal-50 rounded-full flex items-center justify-center mb-3">
            <span className="text-3xl">📄</span>
          </div>
          <p className="text-gray-800 font-semibold">No reports available</p>
          <p className="text-gray-500 text-sm mt-1">Lab tests & scan results will appear here.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {reports.map((r) => (
            <div
              key={r.id}
              className="bg-white rounded-2xl shadow-sm border border-teal-50 p-4 flex items-center gap-4"
            >
              <div className="w-14 h-14 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 shadow-sm">
                {getFileIcon(r.mimeType)}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm truncate">
                  {r.investigation?.name || "Diagnostic Report"}
                </h3>
                <p className="text-[11px] text-teal-600 font-semibold uppercase mt-0.5">
                  {r.reportType || "LAB / SCAN"}
                </p>
                <p className="text-[11px] text-gray-500 mt-1">
                  📅{" "}
                  {r.reportDate
                    ? new Date(r.reportDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
                    : "Date pending"}
                </p>
                {r.remarks && <p className="text-xs text-gray-600 italic mt-1 line-clamp-1">"{r.remarks}"</p>}
              </div>

              {r.fileUrl && (
                <a
                  href={r.fileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="w-10 h-10 bg-teal-600 hover:bg-teal-700 text-white rounded-xl flex items-center justify-center flex-shrink-0 transition shadow-sm"
                  title="View Report"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}