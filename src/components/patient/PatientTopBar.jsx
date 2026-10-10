// src/components/patient/PatientTopBar.jsx
"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export default function PatientTopBar({ user }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "P";

  return (
    <div className="bg-gradient-to-br from-teal-600 to-emerald-700 text-white rounded-b-[2rem] px-6 pt-6 pb-10 shadow-lg">
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div>
          <p className="text-teal-100 text-sm font-medium">{getGreeting()},</p>
          <h1 className="text-2xl font-bold tracking-tight mt-0.5">{user?.name?.split(" ")[0] || "Patient"} 👋</h1>
          <p className="text-teal-100 text-xs mt-1">Your health journey matters.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="w-9 h-9 bg-white/15 hover:bg-white/25 rounded-full flex items-center justify-center transition"
            title="Sign Out"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>

          <Link
            href="/patient/profile"
            className="w-11 h-11 bg-white text-teal-700 rounded-full flex items-center justify-center font-bold shadow-md hover:scale-105 transition"
          >
            {initials}
          </Link>
        </div>
      </div>
    </div>
  );
}