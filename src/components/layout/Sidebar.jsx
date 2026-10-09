"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Overview", icon: "📊", roles: ["SUPER_ADMIN", "SUDO_ADMIN", "AREA_MANAGER", "HOSPITAL", "SUPPORT"] },
  { href: "/dashboard/patients", label: "Patients", icon: "🧑‍🤝‍🧑", roles: ["SUPER_ADMIN", "SUDO_ADMIN", "AREA_MANAGER", "SUPPORT", "HOSPITAL"] },
  { href: "/dashboard/referrals", label: "Referrals", icon: "📋", roles: ["SUPER_ADMIN", "SUDO_ADMIN", "AREA_MANAGER", "SUPPORT", "HOSPITAL"] },
  { href: "/dashboard/appointments", label: "Appointments", icon: "📅", roles: ["SUPER_ADMIN", "SUDO_ADMIN", "AREA_MANAGER", "HOSPITAL", "SUPPORT"] },
  { href: "/dashboard/investigations", label: "Lab & Scans", icon: "🔬", roles: ["SUPER_ADMIN", "SUDO_ADMIN", "HOSPITAL"] },
  { href: "/dashboard/followups", label: "Follow-ups", icon: "🩺", roles: ["SUPER_ADMIN", "SUDO_ADMIN", "AREA_MANAGER", "HOSPITAL", "SUPPORT"] },
  { href: "/dashboard/hospitals", label: "Hospitals", icon: "🏥", roles: ["SUPER_ADMIN", "SUDO_ADMIN"] },
  { href: "/dashboard/areas", label: "Mining Areas", icon: "📍", roles: ["SUPER_ADMIN", "SUDO_ADMIN"] },
  { href: "/dashboard/users", label: "Users & Access", icon: "👥", roles: ["SUPER_ADMIN"] },
  { href: "/dashboard/reports", label: "Analytics", icon: "📈", roles: ["SUPER_ADMIN", "SUDO_ADMIN", "AREA_MANAGER"] },
  { href: "/dashboard/audit-logs", label: "Audit Trail", icon: "🔒", roles: ["SUPER_ADMIN"] },
];

const ROLE_COLORS = {
  SUPER_ADMIN: "bg-rose-500",
  SUDO_ADMIN: "bg-purple-500",
  SUPPORT: "bg-teal-500",
  AREA_MANAGER: "bg-amber-500",
  HOSPITAL: "bg-emerald-500",
};

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  SUDO_ADMIN: "Sudo Admin",
  SUPPORT: "Support",
  AREA_MANAGER: "Area Manager",
  HOSPITAL: "Hospital Coord.",
};

export default function Sidebar({ userRole, userName }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const filteredNav = NAV_ITEMS.filter((item) => item.roles.includes(userRole));

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden anim-fade"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 lg:hidden w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center shadow-lg hover:bg-slate-700 transition-colors"
      >
        {mobileOpen ? "✕" : "☰"}
      </button>

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-slate-900 border-r border-slate-800 transition-all duration-300 ease-in-out flex flex-col ${
          collapsed ? "w-[72px]" : "w-[260px]"
        } ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        <div className={`flex items-center gap-3 px-4 py-5 border-b border-slate-700/50 ${collapsed ? "justify-center" : ""}`}>
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-teal-500/30 shrink-0">
            S
          </div>
          {!collapsed && (
            <div className="anim-slide-left">
              <h1 className="text-lg font-extrabold text-white tracking-tight">SUSALI</h1>
              <p className="text-[10px] text-teal-400 font-medium -mt-0.5">Healthcare Management</p>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {filteredNav.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  collapsed ? "justify-center" : ""
                } ${
                  isActive
                    ? "bg-teal-500/20 text-teal-300 shadow-sm shadow-teal-500/10 font-bold"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
                title={collapsed ? item.label : undefined}
              >
                <span className={`text-lg transition-transform duration-200 ${isActive ? "scale-110" : "group-hover:scale-110"}`}>
                  {item.icon}
                </span>
                {!collapsed && <span className="truncate">{item.label}</span>}
                {isActive && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />}
              </Link>
            );
          })}
        </nav>

        <div className={`border-t border-slate-700/50 p-3 ${collapsed ? "text-center" : ""}`}>
          {!collapsed && (
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                {userName?.charAt(0) || "U"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate">{userName}</p>
                <span className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold text-white ${ROLE_COLORS[userRole] || "bg-slate-500"}`}>
                  {ROLE_LABELS[userRole] || userRole}
                </span>
              </div>
            </div>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-all ${collapsed ? "justify-center" : ""}`}
          >
            <span>🚪</span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden lg:flex absolute -right-3 top-8 w-6 h-6 rounded-full bg-slate-700 border-2 border-slate-600 text-slate-300 items-center justify-center text-xs hover:bg-teal-600 hover:text-white transition-all shadow-md"
        >
          {collapsed ? "→" : "←"}
        </button>
      </aside>
    </>
  );
}