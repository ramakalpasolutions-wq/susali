// src/app/(dashboard)/dashboard/hospitals/page.jsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";

export default function HospitalsPage() {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    code: "",
    address: "",
    city: "",
    state: "Telangana",
    pinCode: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    fetchHospitals();
  }, []);

  async function fetchHospitals() {
    setLoading(true);
    try {
      const res = await fetch("/api/hospitals");
      if (res.ok) {
        const d = await res.json();
        // Defensive unwrapping for { hospitals: [...] }, { data: [...] }, or raw array [...]
        if (Array.isArray(d)) {
          setHospitals(d);
        } else if (Array.isArray(d.hospitals)) {
          setHospitals(d.hospitals);
        } else if (Array.isArray(d.data)) {
          setHospitals(d.data);
        } else {
          setHospitals([]);
        }
      } else {
        setHospitals([]);
      }
    } catch (err) {
      console.error("Failed to fetch hospitals", err);
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/hospitals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setShowModal(false);
        setForm({
          name: "",
          code: "",
          address: "",
          city: "",
          state: "Telangana",
          pinCode: "",
          phone: "",
          email: "",
        });
        fetchHospitals();
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create hospital");
      }
    } catch (err) {
      console.error("Error creating hospital", err);
    } finally {
      setSubmitting(false);
    }
  }

  const hospitalList = Array.isArray(hospitals) ? hospitals : [];

  const filtered = hospitalList.filter((h) => {
    const term = search.toLowerCase();
    return (
      (h.name && h.name.toLowerCase().includes(term)) ||
      (h.code && h.code.toLowerCase().includes(term)) ||
      (h.city && h.city.toLowerCase().includes(term)) ||
      (h.phone && h.phone.includes(term))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 anim-slide-up">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-800">Empanelled Hospitals</h1>
          <p className="text-xs sm:text-sm text-slate-400">
            {hospitalList.length} tertiary care centers & specialty network hospitals
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold rounded-xl shadow-xs hover:shadow-teal-500/20 transition-all duration-200 active:scale-95"
        >
          + Add Hospital
        </button>
      </div>

      {/* Search Input */}
      <div className="anim-slide-up d1">
        <div className="relative">
          <span className="absolute left-4 top-3.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hospitals by name, code, city, or phone..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all shadow-xs"
          />
        </div>
      </div>

      {/* Hospital List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl anim-shimmer" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 anim-scale">
          <span className="text-4xl">🏥</span>
          <h3 className="text-base font-bold text-slate-700 mt-2">No Hospitals Found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {search ? "No empanelled hospital matches your query." : "No hospitals have been registered yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((h, idx) => (
            <div
              key={h.id}
              className={`anim-slide-up d${Math.min(idx + 1, 8)} bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-teal-300 transition-all duration-300 flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-bold text-slate-800 text-base">{h.name}</h3>
                  <span className="text-xs font-mono font-bold text-teal-700 bg-teal-50 border border-teal-200 px-2 py-0.5 rounded-md">
                    {h.code}
                  </span>
                  {h.isActive !== false ? (
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-md">
                      Active
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-[10px] font-bold rounded-md">
                      Inactive
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500">
                  {h.city && <span>📍 {h.city}, {h.state}</span>}
                  {h.phone && <span>📞 {h.phone}</span>}
                  {h.email && <span>✉️ {h.email}</span>}
                </div>

                {h.departments && h.departments.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {h.departments.map((dept) => (
                      <span
                        key={dept.id}
                        className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[11px] font-medium"
                      >
                        {dept.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Hospital Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Empanel New Hospital" size="lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Hospital Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="e.g. Apollo Multi-Specialty Hospital"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Unique Hospital Code *</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
                placeholder="e.g. HOSP-APOLLO"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-600 mb-1">Full Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="e.g. Road No. 72, Jubilee Hills"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Hyderabad"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">State</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="e.g. Telangana"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Phone Number</label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="e.g. +91 98490 11223"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">Official Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="e.g. referrals@hospital.com"
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-xs transition-all duration-200 active:scale-[0.98] disabled:opacity-50 mt-2"
          >
            {submitting ? "Saving..." : "Empanel Hospital"}
          </button>
        </form>
      </Modal>
    </div>
  );
}