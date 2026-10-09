// src/app/(dashboard)/dashboard/followups/page.jsx
"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/ui/StatusBadge";
import { formatDate } from "@/lib/utils";

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/referrals")
      .then((r) => (r.ok ? r.json() : []))
      .then((refs) => {
        const list = (refs.data || refs).flatMap((r) =>
          (r.followUps || []).map((f) => ({ ...f, referralIdStr: r.referralId, patientName: r.patient?.fullName }))
        );
        setFollowUps(list);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <div className="anim-slide-up">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Follow-up Tracking</h1>
        <p className="text-xs sm:text-sm text-slate-400">Monitor post-consultation reviews and overdue follow-up dates</p>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : followUps.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <p className="text-slate-400">No follow-ups recorded yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followUps.map((f, idx) => (
            <div
              key={f.id}
              className={`anim-slide-up d${Math.min(idx + 1, 8)} bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 text-sm">{f.patientName || "Patient"}</span>
                  <StatusBadge status={f.status} />
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  📅 Due: {formatDate(f.followUpDate)} • Case: {f.referralIdStr}
                </p>
                {f.reason && <p className="text-xs text-slate-400 mt-0.5">Reason: {f.reason}</p>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}