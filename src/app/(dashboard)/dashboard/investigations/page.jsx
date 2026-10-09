// src/app/(dashboard)/dashboard/investigations/page.jsx
"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function InvestigationsPage() {
  const [investigations, setInvestigations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/investigations")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setInvestigations(d.data || d))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="anim-slide-up">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Lab & Diagnostic Scans</h1>
        <p className="text-xs sm:text-sm text-slate-400">Order, upload, and review radiology and pathology reports</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : investigations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-400">No diagnostic orders recorded.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {investigations.map((inv, idx) => (
            <div
              key={inv.id}
              className={`anim-slide-up d${Math.min(idx + 1, 8)} bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                    {inv.investigationId}
                  </span>
                  <StatusBadge status={inv.status} />
                  <span className="px-2 py-0.5 bg-slate-100 text-slate-700 text-[10px] font-bold rounded">
                    {inv.type}
                  </span>
                </div>
                <h3 className="font-bold text-slate-800 text-sm mt-1.5">{inv.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Ordered on {formatDate(inv.requestedAt || inv.createdAt)}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {inv.reports?.[0]?.fileUrl && (
                  <a
                    href={inv.reports[0].fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3.5 py-1.5 bg-teal-50 text-teal-700 font-bold text-xs rounded-xl hover:bg-teal-100 transition-colors"
                  >
                    📄 View Report
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}