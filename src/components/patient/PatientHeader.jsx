// src/components/patient/PatientHeader.jsx
"use client";

import { signOut } from "next-auth/react";

export default function PatientHeader({ user }) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold text-gray-900">Welcome, {user?.name}</h2>
        <p className="text-sm text-gray-500">Track your referrals, consultations, and reports</p>
      </div>
      <button
        onClick={() => signOut({ callbackUrl: "/login" })}
        className="px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
      >
        Sign Out
      </button>
    </header>
  );
}