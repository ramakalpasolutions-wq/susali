// src/app/(dashboard)/dashboard/patients/new/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function NewPatientWithReferral() {
  const router = useRouter();
  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    email: "",
    idCardNumber: "",
    password: "",
    areaId: "",
    hospitalId: "",
    departmentId: "",
    reason: "",
  });
  const [areas, setAreas] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState("");

  useEffect(() => {
    fetch("/api/areas").then((res) => res.json()).then(setAreas);
    fetch("/api/hospitals").then((res) => res.json()).then(setHospitals);
  }, []);

  const handleHospitalChange = (hospitalId) => {
    setForm({ ...form, hospitalId, departmentId: "" });
    if (!hospitalId) return;
    fetch(`/api/hospitals/${hospitalId}/departments`)
      .then((res) => res.json())
      .then(setDepartments);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResultMsg("");

    try {
      const res = await fetch("/api/patients/create-with-referral", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setResultMsg(`Error: ${data.error}`);
      } else {
        setResultMsg(
          `Success! Patient created.\n\n` +
          `User Account Email: ${data.loginEmail}\n` +
          `User Account Password: ${form.password}\n` +
          `Referral ID: ${data.referralId}\n` +
          `Activation Code: ${data.referralCode}`
        );
        setForm({
          fullName: "",
          phone: "",
          email: "",
          idCardNumber: "",
          password: "",
          areaId: "",
          hospitalId: "",
          departmentId: "",
          reason: "",
        });
      }
    } catch (err) {
      setResultMsg("System error encountered.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900">Intake New Patient</h1>
        <p className="text-gray-500 text-sm">Register a profile, set password, and directly link an active referral.</p>
      </div>

      {resultMsg && (
        <div className="p-4 rounded-xl text-sm bg-indigo-50 border border-indigo-200 text-indigo-900 font-medium whitespace-pre-wrap">
          {resultMsg}
        </div>
      )}

      <form onSubmit={handleRegister} className="bg-white border rounded-xl shadow-sm p-6 space-y-5">
        <h3 className="text-md font-bold text-gray-800 border-b pb-2">1. Patient Profile Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">ID Card Number</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.idCardNumber}
              onChange={(e) => setForm({ ...form, idCardNumber: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address (Optional)</label>
            <input
              type="email"
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Set Account Password</label>
            <input
              type="text"
              required
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              placeholder="e.g. Pass@123"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mining Area</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.areaId}
              onChange={(e) => setForm({ ...form, areaId: e.target.value })}
            >
              <option value="">-- Choose Area --</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </div>
        </div>

        <h3 className="text-md font-bold text-gray-800 border-b pb-2 pt-4">2. Link Direct Referral Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Hospital</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              value={form.hospitalId}
              onChange={(e) => handleHospitalChange(e.target.value)}
            >
              <option value="">-- Choose Hospital --</option>
              {hospitals.map((h) => (
                <option key={h.id} value={h.id}>{h.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Department</label>
            <select
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              disabled={!form.hospitalId}
              value={form.departmentId}
              onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
            >
              <option value="">-- Choose Department --</option>
              {departments.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Reason for Referral</label>
            <textarea
              className="w-full px-3 py-2 border rounded-lg text-gray-900 outline-none focus:ring-2 focus:ring-indigo-500"
              rows={3}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-50 mt-4"
        >
          {loading ? "Registering & Linking Referral..." : "Register Patient & Generate Credentials"}
        </button>
      </form>
    </div>
  );
}