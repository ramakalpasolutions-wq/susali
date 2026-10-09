"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  SUDO_ADMIN: "Sudo Admin",
  SUPPORT: "Support",
  AREA_MANAGER: "Area Manager",
  HOSPITAL: "Hospital Coordinator",
};

export default function Header({ user }) {
  const { data: session } = useSession();
  const u = session?.user || user;
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/80 px-4 sm:px-6 lg:px-8 py-3">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 pl-10 lg:pl-0">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-800">
              {u?.hospitalName || u?.areaName || "SUSALI Dashboard"}
            </h2>
            <p className="text-xs text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className={`hidden md:flex items-center bg-slate-100 rounded-xl px-3 py-2 transition-all duration-300 ${searchFocused ? "w-64 ring-2 ring-teal-500/30 bg-white" : "w-48"}`}>
            <span className="text-slate-400 text-sm mr-2">🔍</span>
            <input
              type="text"
              placeholder="Search patients..."
              className="bg-transparent text-sm text-slate-700 placeholder-slate-400 outline-none w-full"
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
            />
          </div>

          <button className="relative w-9 h-9 rounded-xl bg-slate-100 hover:bg-teal-50 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95">
            <span className="text-lg">🔔</span>
            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 rounded-full text-[9px] text-white font-bold flex items-center justify-center animate-pulse">
              3
            </span>
          </button>

          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {u?.name?.charAt(0) || "U"}
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-semibold text-slate-700 leading-tight">{u?.name}</p>
              <p className="text-[10px] text-slate-400">{ROLE_LABELS[u?.role] || u?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}