// src/app/(patient)/patient/use-referral/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function UseReferral() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [activating, setActivating] = useState(false);

  // Safely fetch hospitals on component load
  useEffect(() => {
    fetch("/api/hospitals")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.hospitals || data?.data || [];
        setHospitals(Array.isArray(list) ? list.filter(Boolean) : []);
      })
      .catch((err) => {
        console.error("Failed to load hospitals:", err);
        setHospitals([]);
      });
  }, []);

  const handleLookup = async (e) => {
    if (e) e.preventDefault();
    if (!code.trim()) {
      setStatusMsg("Please enter a referral code.");
      return;
    }

    setLoading(true);
    setStatusMsg("");
    setVerificationResult(null);

    try {
      const res = await fetch("/api/patient/verify-referral-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referralCode: code.toUpperCase().trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setStatusMsg(data?.error || "Invalid referral code or not found.");
      } else if (data?.referral) {
        setVerificationResult(data.referral);
        if (data.referral.hospitalId) {
          setSelectedHospital(data.referral.hospitalId);
          loadDepartments(data.referral.hospitalId);
        }
        if (data.referral.departmentId) {
          setSelectedDepartment(data.referral.departmentId);
        }
      } else {
        setStatusMsg("No referral data returned.");
      }
    } catch (err) {
      console.error("Lookup error:", err);
      setStatusMsg("Failed to verify referral code. Please check your network.");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async (hospitalId) => {
    setSelectedHospital(hospitalId);
    setSelectedDepartment("");
    setDepartments([]);

    if (!hospitalId) return;

    try {
      const res = await fetch(`/api/hospitals/${hospitalId}/departments`);
      const data = await res.json();
      const list = Array.isArray(data) ? data : data?.departments || data?.data || [];
      setDepartments(Array.isArray(list) ? list.filter(Boolean) : []);
    } catch (err) {
      console.error("Failed to load departments:", err);
      setDepartments([]);
    }
  };

  const handleActivate = async (e) => {
    if (e) e.preventDefault();

    if (!verificationResult?.id) {
      setStatusMsg("Please verify a valid referral code first.");
      return;
    }

    if (!selectedHospital) {
      setStatusMsg("Please select a target hospital.");
      return;
    }

    setActivating(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/patient/activate-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralId: verificationResult.id,
          hospitalId: selectedHospital,
          departmentId: selectedDepartment || null,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg("Referral successfully activated! Redirecting to dashboard...");
        setTimeout(() => {
          router.push("/patient/dashboard");
        }, 1500);
      } else {
        setStatusMsg(data?.error || "Failed to activate referral.");
      }
    } catch (err) {
      console.error("Activation error:", err);
      setStatusMsg("Server error activating referral.");
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
      <div className="space-y-1">
        <h3 className="text-xl font-bold text-gray-800">Use Referral Code</h3>
        <p className="text-gray-500 text-sm">
          Enter your referral lookup code to choose your preferred empanelled hospital and department.
        </p>
      </div>

      {statusMsg && (
        <div
          className={`p-3 rounded-lg text-sm font-medium ${
            statusMsg.includes("success") || statusMsg.includes("Redirecting")
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}
        >
          {statusMsg}
        </div>
      )}

      {/* Code Search Input */}
      {!verificationResult ? (
        <form onSubmit={handleLookup} className="flex gap-2">
          <input
            type="text"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg uppercase tracking-wider font-mono outline-none text-gray-900 focus:ring-2 focus:ring-indigo-500"
            placeholder="ENTER CODE (e.g. AB4CD6)"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            required
          />
          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-medium disabled:opacity-50 transition"
          >
            {loading ? "Searching..." : "Search Code"}
          </button>
        </form>
      ) : (
        /* Hospital Selection Form */
        <div className="space-y-4 border-t border-gray-100 pt-4">
          <div className="bg-gray-50 p-4 rounded-lg text-sm space-y-1 border border-gray-200">
            <p className="text-gray-400 font-semibold text-xs uppercase">Verified Referral</p>
            <p className="font-bold text-gray-800 text-base">
              {verificationResult?.referralId || "Referral Found"}
            </p>
            <p className="text-gray-600">
              Reason: {verificationResult?.reason || "General Consultation"}
            </p>
            {verificationResult?.priority && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 text-indigo-700">
                Priority: {verificationResult.priority}
              </span>
            )}
          </div>

          <form onSubmit={handleActivate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Empanelled Hospital <span className="text-red-500">*</span>
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                value={selectedHospital}
                onChange={(e) => loadDepartments(e.target.value)}
                required
              >
                <option value="">-- Select Hospital --</option>
                {Array.isArray(hospitals) &&
                  hospitals.map((h) =>
                    h?.id ? (
                      <option key={h.id} value={h.id}>
                        {h.name} {h.city ? `(${h.city})` : ""}
                      </option>
                    ) : null
                  )}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Department
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-indigo-500 outline-none disabled:bg-gray-100 bg-white"
                disabled={!selectedHospital || departments.length === 0}
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                <option value="">
                  {departments.length === 0 && selectedHospital
                    ? "-- No Specific Department Listed --"
                    : "-- Select Department --"}
                </option>
                {Array.isArray(departments) &&
                  departments.map((d) =>
                    d?.id ? (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ) : null
                  )}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => {
                  setVerificationResult(null);
                  setStatusMsg("");
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 text-sm font-medium"
              >
                Search Another Code
              </button>
              <button
                type="submit"
                disabled={activating || !selectedHospital}
                className="flex-1 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition"
              >
                {activating ? "Activating..." : "Activate Referral"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}