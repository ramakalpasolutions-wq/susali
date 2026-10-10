// src/components/patient/PatientSidebar.jsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/patient/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/patient/referrals", label: "My Referrals", icon: "📋" },
  { href: "/patient/use-referral", label: "Use Referral Code", icon: "🔑" },
  { href: "/patient/consultations", label: "Consultations", icon: "🩺" },
  { href: "/patient/prescriptions", label: "Prescriptions", icon: "💊" },
  { href: "/patient/reports", label: "Lab & Scan Reports", icon: "📄" },
];

export default function PatientSidebar({ user }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">S</span>
          </div>
          <div>
            <h1 className="font-bold text-gray-900">SUSALI</h1>
            <p className="text-xs text-gray-500">Patient Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
            {user?.name?.[0] || "P"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.name}</p>
            <p className="text-xs text-gray-500">Patient</p>
          </div>
        </div>
      </div>
    </aside>
  );
}