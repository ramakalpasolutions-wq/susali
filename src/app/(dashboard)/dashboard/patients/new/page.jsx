"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientPage() {
  const router = useRouter();
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [duplicates, setDuplicates] = useState([]);
  const [checkingDuplicates, setCheckingDuplicates] = useState(false);

  const [form, setForm] = useState({
    fullName: "",
    mobile: "",
    alternateMobile: "",
    beneficiaryId: "",
    gender: "MALE",
    age: "",
    dateOfBirth: "",
    areaId: "",
    address: "",
    village: "",
    mandal: "",
    district: "",
    state: "Telangana",
    pinCode: "",
    emergencyContact: "",
    emergencyRelation: "",
    emergencyMobile: "",
  });

  useEffect(() => {
    fetch("/api/areas")
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        setAreas(d);
        if (d.length > 0) setForm((prev) => ({ ...prev, areaId: d[0].id }));
      })
      .catch(console.error);
  }, []);

  async function checkDuplicates() {
    if (!form.mobile && !form.beneficiaryId && !form.fullName) return;
    setCheckingDuplicates(true);
    try {
      const res = await fetch("/api/patients/search-duplicates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mobile: form.mobile,
          beneficiaryId: form.beneficiaryId,
          fullName: form.fullName,
          dateOfBirth: form.dateOfBirth,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setDuplicates(data.duplicates || []);
      }
    } finally {
      setCheckingDuplicates(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.fullName) {
      alert("Please enter patient full name");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/patients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const patient = await res.json();
        router.push(`/dashboard/patients/${patient.id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to register patient");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Register New Patient</h1>
        <p className="text-xs sm:text-sm text-slate-400">Create permanent master patient record</p>
      </div>

      {duplicates.length > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚠️</span>
            <h3 className="text-sm font-bold text-amber-800">Possible Duplicate Records Found</h3>
          </div>
          <div className="space-y-2">
            {duplicates.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-2 bg-white rounded-xl border border-amber-100 text-xs">
                <div>
                  <span className="font-bold text-slate-800">{d.fullName}</span> ({d.patientId}) • Mobile: {d.mobile || "—"} • ID: {d.beneficiaryId || "—"}
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/dashboard/patients/${d.id}`)}
                  className="px-3 py-1 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700"
                >
                  View Existing
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-6">
        <h2 className="text-sm font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-2">1. Personal Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-600 mb-1">Full Name *</label>
            <input
              type="text"
              required
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
              onBlur={checkDuplicates}
              placeholder="e.g., Rajesh Kumar Mandal"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Gender *</label>
            <select
              value={form.gender}
              onChange={(e) => setForm({ ...form, gender: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 bg-white"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Date of Birth</label>
            <input
              type="date"
              value={form.dateOfBirth}
              onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Age (Years)</label>
            <input
              type="number"
              value={form.age}
              onChange={(e) => setForm({ ...form, age: e.target.value })}
              placeholder="e.g. 45"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Beneficiary ID / Emp No</label>
            <input
              type="text"
              value={form.beneficiaryId}
              onChange={(e) => setForm({ ...form, beneficiaryId: e.target.value })}
              onBlur={checkDuplicates}
              placeholder="e.g., EMP-SCCL-84729"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={form.mobile}
              onChange={(e) => setForm({ ...form, mobile: e.target.value })}
              onBlur={checkDuplicates}
              placeholder="10-digit mobile"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Alternate Mobile</label>
            <input
              type="tel"
              value={form.alternateMobile}
              onChange={(e) => setForm({ ...form, alternateMobile: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <h2 className="text-sm font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-2 pt-2">2. Mining Zone Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Assigned Mining Zone *</label>
            <select
              value={form.areaId}
              onChange={(e) => setForm({ ...form, areaId: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500 bg-white"
            >
              <option value="">-- Select Area --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name} ({a.code})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Residential Address</label>
            <input
              type="text"
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
              placeholder="Quarter / Street details"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Village/Town</label>
            <input
              type="text"
              value={form.village}
              onChange={(e) => setForm({ ...form, village: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Mandal</label>
            <input
              type="text"
              value={form.mandal}
              onChange={(e) => setForm({ ...form, mandal: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">District</label>
            <input
              type="text"
              value={form.district}
              onChange={(e) => setForm({ ...form, district: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">PIN Code</label>
            <input
              type="text"
              value={form.pinCode}
              onChange={(e) => setForm({ ...form, pinCode: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <h2 className="text-sm font-bold text-teal-800 uppercase tracking-wider border-b border-slate-100 pb-2 pt-2">3. Emergency Contact</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Contact Name</label>
            <input
              type="text"
              value={form.emergencyContact}
              onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
              placeholder="e.g. Sunita Mandal"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Relationship</label>
            <input
              type="text"
              value={form.emergencyRelation}
              onChange={(e) => setForm({ ...form, emergencyRelation: e.target.value })}
              placeholder="e.g. SPOUSE / SON"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">Emergency Mobile</label>
            <input
              type="tel"
              value={form.emergencyMobile}
              onChange={(e) => setForm({ ...form, emergencyMobile: e.target.value })}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none focus:border-teal-500"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl transition-all shadow-sm disabled:opacity-50"
        >
          {loading ? "Creating Profile..." : "Create Patient Profile"}
        </button>
      </form>
    </div>
  );
}