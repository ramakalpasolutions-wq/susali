"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function NewReferralForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedPatientId = searchParams.get("patientId") || "";

  const [patients, setPatients] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [areaManagers, setAreaManagers] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    patientId: preselectedPatientId,
    hospitalId: "",
    departmentId: "",
    assignedToId: "",
    priority: "NORMAL",
    appointmentDate: "",
    appointmentTime: "",
    reason: "",
    notes: "",
  });

  useEffect(() => {
    async function loadDropdowns() {
      try {
        const [resP, resH, resU] = await Promise.all([
          fetch("/api/patients"),
          fetch("/api/hospitals"),
          fetch("/api/users"),
        ]);

        // 1. Parse Patients defensively
        if (resP.ok) {
          const dP = await resP.json();
          const patientList = Array.isArray(dP)
            ? dP
            : dP.patients || dP.data || [];
          setPatients(patientList);
          if (preselectedPatientId) {
            setForm((prev) => ({ ...prev, patientId: preselectedPatientId }));
          }
        }

        // 2. Parse Hospitals defensively
        if (resH.ok) {
          const dH = await resH.json();
          const hospitalList = Array.isArray(dH)
            ? dH
            : dH.hospitals || dH.data || [];
          setHospitals(hospitalList);
          if (hospitalList.length > 0) {
            const firstHospId = hospitalList[0].id;
            setForm((prev) => ({ ...prev, hospitalId: firstHospId }));
            loadDepartments(firstHospId);
          }
        }

        // 3. Parse Area Managers
        if (resU.ok) {
          const dU = await resU.json();
          const userList = Array.isArray(dU) ? dU : dU.users || dU.data || [];
          const ams = userList.filter((u) => u.role === "AREA_MANAGER");
          setAreaManagers(ams);
        }
      } catch (e) {
        console.error("Dropdown loading failed", e);
      }
    }
    loadDropdowns();
  }, [preselectedPatientId]);

  async function loadDepartments(hospitalId) {
    if (!hospitalId) {
      setDepartments([]);
      return;
    }
    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/departments`);
      if (res.ok) {
        const d = await res.json();
        const deptList = Array.isArray(d) ? d : d.departments || d.data || [];
        setDepartments(deptList);
        if (deptList.length > 0) {
          setForm((prev) => ({ ...prev, departmentId: deptList[0].id }));
        } else {
          setForm((prev) => ({ ...prev, departmentId: "" }));
        }
      }
    } catch {
      setDepartments([]);
    }
  }

  function handleHospitalChange(e) {
    const hid = e.target.value;
    setForm((prev) => ({ ...prev, hospitalId: hid, departmentId: "" }));
    loadDepartments(hid);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.patientId || !form.hospitalId) {
      alert("Please select both a patient and an empanelled hospital.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const result = await res.json();
        const refId = result.id || result.data?.id;
        router.push(`/dashboard/referrals/${refId}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to create referral");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="anim-slide-up">
        <h1 className="text-xl sm:text-2xl font-black text-slate-800">Create Referral Case</h1>
        <p className="text-xs sm:text-sm text-slate-400">Initiate tertiary care referral journey with clinical diagnosis</p>
      </div>

      <form onSubmit={handleSubmit} className="anim-slide-up bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-sm space-y-5">
        {/* Patient Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Select Patient *</label>
          <select
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            required
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all bg-white"
          >
            <option value="">-- Choose Patient --</option>
            {Array.isArray(patients) &&
              patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.fullName} ({p.patientId}) {p.beneficiaryId ? `- ${p.beneficiaryId}` : ""}
                </option>
              ))}
          </select>
        </div>

        {/* Hospital & Department */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Empanelled Hospital *</label>
            <select
              value={form.hospitalId}
              onChange={handleHospitalChange}
              required
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all bg-white"
            >
              <option value="">-- Choose Hospital --</option>
              {Array.isArray(hospitals) &&
                hospitals.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name} ({h.city || "Main"})
                  </option>
                ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Clinical Department</label>
            <select
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all bg-white"
            >
              <option value="">-- General / Department Optional --</option>
              {Array.isArray(departments) &&
                departments.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
            </select>
          </div>
        </div>

        {/* Assign Area Manager */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Assign Area Manager (Optional)</label>
          <select
            value={form.assignedToId}
            onChange={(e) => setForm({ ...form, assignedToId: e.target.value })}
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all bg-white"
          >
            <option value="">-- Auto-assign or Choose Area Manager --</option>
            {Array.isArray(areaManagers) &&
              areaManagers.map((am) => (
                <option key={am.id} value={am.id}>
                  {am.name} {am.area?.name ? `(${am.area.name})` : ""}
                </option>
              ))}
          </select>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Referral Priority</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {["LOW", "NORMAL", "HIGH", "URGENT"].map((p) => (
              <button
                type="button"
                key={p}
                onClick={() => setForm({ ...form, priority: p })}
                className={`py-2 rounded-xl text-xs font-bold transition-all ${
                  form.priority === p
                    ? p === "URGENT" || p === "HIGH"
                      ? "bg-rose-600 text-white shadow-sm"
                      : "bg-teal-600 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Appointment Date & Time */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Appointment Date (Optional)</label>
            <input
              type="date"
              value={form.appointmentDate}
              onChange={(e) => setForm({ ...form, appointmentDate: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Appointment Time</label>
            <input
              type="text"
              placeholder="e.g. 10:30 AM"
              value={form.appointmentTime}
              onChange={(e) => setForm({ ...form, appointmentTime: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
            />
          </div>
        </div>

        {/* Reason / Chief Complaints */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Chief Complaints & Provisional Diagnosis *</label>
          <textarea
            rows={3}
            value={form.reason}
            onChange={(e) => setForm({ ...form, reason: e.target.value })}
            required
            placeholder="Describe clinical symptoms, duration, examination findings, and reasons for tertiary care..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        {/* Special Instructions */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Special Instructions / Logistics Notes</label>
          <input
            type="text"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="e.g., Needs wheelchair assistance at gate, ambulance arranged"
            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500 outline-none transition-all"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-sm rounded-xl shadow-sm hover:shadow-teal-500/20 transition-all duration-200 active:scale-[0.98] disabled:opacity-50"
        >
          {loading ? "Generating Referral..." : "Submit Referral Case"}
        </button>
      </form>
    </div>
  );
}

export default function NewReferralPageWrapper() {
  return (
    <Suspense fallback={<div className="h-64 rounded-2xl anim-shimmer" />}>
      <NewReferralForm />
    </Suspense>
  );
}