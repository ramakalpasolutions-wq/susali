// src/app/(patient)/patient/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function PatientDashboard() {
  const [data, setData] = useState({ referrals: [], stats: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/patient/dashboard")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center p-8">Loading Portal...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">My Referrals</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.totalReferrals || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Consultations</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.totalConsultations || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Prescriptions</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.totalPrescriptions || 0}</p>
        </div>
        <div className="bg-white p-5 rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs font-semibold text-gray-400 uppercase">Uploaded Reports</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{data.stats.totalReports || 0}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm space-y-4">
        <h3 className="text-lg font-bold text-gray-800">My Referral Actions</h3>
        {data.referrals.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-gray-500 mb-4">No active referrals assigned to you yet.</p>
            <Link href="/patient/use-referral" className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700">
              Apply Referral Code
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-100 text-sm font-semibold text-gray-500">
                  <th className="py-3">Referral ID</th>
                  <th className="py-3">Referral Code</th>
                  <th className="py-3">Target Hospital</th>
                  <th className="py-3">Department</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm text-gray-600">
                {data.referrals.map((r) => (
                  <tr key={r.id}>
                    <td className="py-3 font-medium text-indigo-600">{r.referralId}</td>
                    <td className="py-3 font-mono">{r.referralCode || "N/A"}</td>
                    <td className="py-3">{r.hospital?.name || "Pending Selection"}</td>
                    <td className="py-3">{r.department?.name || "Pending Selection"}</td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-medium text-xs rounded-full">
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}