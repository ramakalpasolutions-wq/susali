// src/app/(patient)/patient/layout.jsx
import Link from "next/link";
import { auth } from "@/lib/auth";

export default async function PatientLayout({ children }) {
  const session = await auth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Patient Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col fixed inset-y-0 z-50">
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <span className="text-xl font-bold tracking-wider text-indigo-400">SUSALI PORTAL</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link href="/patient/dashboard" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm">
            🏠 <span>Dashboard</span>
          </Link>
          <Link href="/patient/use-referral" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm">
            🔑 <span>Use Referral Code</span>
          </Link>
          <Link href="/patient/consultations" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm">
            🩺 <span>Consultations</span>
          </Link>
          <Link href="/patient/prescriptions" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm">
            💊 <span>Prescriptions</span>
          </Link>
          <Link href="/patient/reports" className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-800 transition text-sm">
            📄 <span>Lab/Scan Reports</span>
          </Link>
        </nav>
        <div className="p-4 border-t border-slate-800 bg-slate-950 flex flex-col gap-1 text-xs text-slate-400">
          <p className="font-semibold text-slate-200 text-sm truncate">{session?.user?.name}</p>
          <p className="truncate">{session?.user?.email}</p>
          <Link href="/api/auth/signout" className="mt-3 text-red-400 hover:text-red-300 font-medium text-center hover:bg-red-950/20 py-2 rounded-md">
            Sign Out
          </Link>
        </div>
      </aside>

      <div className="pl-64 flex-1 flex flex-col">
        <header className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8">
          <h2 className="font-semibold text-gray-800">Welcome, {session?.user?.name}</h2>
          <span className="bg-indigo-100 text-indigo-800 text-xs px-2.5 py-1 rounded-full font-medium">Patient Dashboard</span>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}