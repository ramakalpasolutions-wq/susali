// src/app/(patient)/patient/use-referral/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UseReferralPage() {
  const router = useRouter();
  const [offlineCode, setOfflineCode] = useState("");
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [reason, setReason] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/hospitals")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.hospitals || data?.data || [];
        setHospitals(Array.isArray(list) ? list.filter(Boolean) : []);
      })
      .catch(() => setHospitals([]));
  }, []);

  const handleHospitalChange = async (hospitalId) => {
    setSelectedHospital(hospitalId);
    setSelectedDepartment("");
    setDepartments([]);

    if (!hospitalId) return;

    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/departments`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.departments || data?.data || [];
      setDepartments(Array.isArray(list) ? list.filter(Boolean) : []);
    } catch {
      setDepartments([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!offlineCode.trim()) {
      setStatusMsg("Please enter the offline referral code / superintendent slip number.");
      setIsSuccess(false);
      return;
    }

    if (!selectedHospital) {
      setStatusMsg("Please select an empanelled hospital.");
      setIsSuccess(false);
      return;
    }

    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/patient/activate-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode: offlineCode.trim().toUpperCase(),
          hospitalId: selectedHospital,
          departmentId: selectedDepartment || null,
          reason: reason.trim() || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setIsSuccess(true);
        setStatusMsg("Referral submitted successfully! Redirecting...");
        setTimeout(() => router.push("/patient/dashboard"), 1500);
      } else {
        setIsSuccess(false);
        setStatusMsg(data?.error || "Failed to submit referral.");
      }
    } catch {
      setIsSuccess(false);
      setStatusMsg("Server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 -mt-4">
      {/* Header */}
      <div className="text-center">
        <div className="w-16 h-16 mx-auto bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg mb-3">
          <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
        </div>
        <h1 className="text-xl font-bold text-gray-900">Submit Your Referral</h1>
        <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
          Enter the code from your superintendent slip and pick where you'd like to be seen.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-4 rounded-2xl text-sm font-medium flex items-start gap-3 ${
            isSuccess
              ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          <span className="text-lg">{isSuccess ? "✅" : "⚠️"}</span>
          <span className="flex-1">{statusMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Code Input Hero */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <label className="block text-xs font-bold uppercase text-teal-700 tracking-wide mb-2">
            Referral Code / Slip No.
          </label>
          <input
            type="text"
            className="w-full px-4 py-4 bg-teal-50/50 border-2 border-teal-200 rounded-xl uppercase font-mono text-lg text-center text-gray-900 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none tracking-widest"
            placeholder="SUP-REF-84920"
            value={offlineCode}
            onChange={(e) => setOfflineCode(e.target.value)}
            required
          />
          <p className="text-[11px] text-gray-500 mt-2">💡 Exact code from your physical slip</p>
        </div>

        {/* Hospital */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <label className="block text-xs font-bold uppercase text-teal-700 tracking-wide mb-2">
            🏥 Choose Hospital
          </label>
          <select
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
            value={selectedHospital}
            onChange={(e) => handleHospitalChange(e.target.value)}
            required
          >
            <option value="">Select hospital...</option>
            {hospitals.map((h) =>
              h?.id ? (
                <option key={h.id} value={h.id}>
                  {h.name} {h.city ? `• ${h.city}` : ""}
                </option>
              ) : null
            )}
          </select>
        </div>

        {/* Department */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <label className="block text-xs font-bold uppercase text-teal-700 tracking-wide mb-2">
            🚪 Department <span className="text-gray-400 font-normal normal-case">(Optional)</span>
          </label>
          <select
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={!selectedHospital || departments.length === 0}
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
          >
            <option value="">
              {!selectedHospital
                ? "Select a hospital first"
                : departments.length === 0
                ? "No departments available"
                : "General / Not Specified"}
            </option>
            {departments.map((d) =>
              d?.id ? (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ) : null
            )}
          </select>
        </div>

        {/* Reason */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-teal-100">
          <label className="block text-xs font-bold uppercase text-teal-700 tracking-wide mb-2">
            📝 Reason / Symptoms <span className="text-gray-400 font-normal normal-case">(Optional)</span>
          </label>
          <textarea
            rows={3}
            className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none resize-none"
            placeholder="e.g. Chest pain, respiratory checkup..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading || !offlineCode.trim() || !selectedHospital}
          className="w-full py-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-2xl text-base font-bold transition disabled:opacity-50 shadow-lg disabled:shadow-sm"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin"></span>
              Submitting...
            </span>
          ) : (
            "Submit Referral →"
          )}
        </button>
      </form>
    </div>
  );
}