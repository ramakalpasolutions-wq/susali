// src/app/(dashboard)/dashboard/patients/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPatients();
  }, []);

  async function fetchPatients() {
    setLoading(true);
    try {
      const res = await fetch("/api/patients");
      if (res.ok) {
        const d = await res.json();
        // Handle { patients: [...] }, { data: [...] }, or raw array [...]
        if (Array.isArray(d)) {
          setPatients(d);
        } else if (Array.isArray(d.patients)) {
          setPatients(d.patients);
        } else if (Array.isArray(d.data)) {
          setPatients(d.data);
        } else {
          setPatients([]);
        }
      } else {
        setPatients([]);
      }
    } catch (err) {
      console.error("Failed to load patients", err);
      setPatients([]);
    } finally {
      setLoading(false);
    }
  }

  const patientList = Array.isArray(patients) ? patients : [];

  const filtered = patientList.filter((p) => {
    const term = search.toLowerCase();
    return (
      (p.fullName && p.fullName.toLowerCase().includes(term)) ||
      (p.name && p.name.toLowerCase().includes(term)) ||
      (p.patientId && p.patientId.toLowerCase().includes(term)) ||
      (p.mobile && p.mobile.includes(term)) ||
      (p.beneficiaryId && p.beneficiaryId.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-slide-up">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Patients Directory</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {patientList.length} registered {patientList.length === 1 ? "patient" : "patients"} across mining areas
          </p>
        </div>
        <Link
          href="/dashboard/patients/new"
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-teal-500/20 transition-all duration-200 active:scale-95 text-center"
        >
          + New Patient
        </Link>
      </div>

      {/* Search Input */}
      <div className="anim-slide-up d1">
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients by name, Patient ID, phone, or Beneficiary ID..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Patient Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 anim-scale">
          <span className="text-4xl">🧑‍🤝‍🧑</span>
          <h3 className="text-base font-bold text-slate-700 mt-2">No Patients Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {search ? "No patient matches your search query." : "No patients have been registered yet."}
          </p>
          {!search && (
            <Link
              href="/dashboard/patients/new"
              className="mt-4 inline-block px-4 py-2 bg-teal-600 text-white text-xs font-bold rounded-xl hover:bg-teal-700 transition-all"
            >
              + Register First Patient
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2.5">
          {filtered.map((p, idx) => {
            const displayName = p.fullName || p.name || "Unnamed Patient";
            return (
              <Link
                key={p.id}
                href={`/dashboard/patients/${p.id}`}
                className={`anim-slide-up d${Math.min(idx + 1, 8)} block bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-200 group`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-black text-sm shrink-0 shadow-xs">
                    {displayName.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-slate-800 text-sm group-hover:text-teal-700 transition-colors">
                        {displayName}
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                        {p.patientId}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                      {p.age && <span>{p.age} yrs • {p.gender}</span>}
                      {p.mobile && <span>📞 +91 {p.mobile}</span>}
                      {p.beneficiaryId && (
                        <span className="bg-slate-100 px-2 py-0.5 rounded font-mono text-[11px] text-slate-600">
                          ID: {p.beneficiaryId}
                        </span>
                      )}
                      {p.area?.name && <span className="text-slate-400">📍 {p.area.name}</span>}
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all text-base shrink-0 hidden sm:block">
                    →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}