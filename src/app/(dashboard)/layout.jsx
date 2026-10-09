// src/app/(dashboard)/layout.jsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import AuthProvider from "@/components/providers/AuthProvider";

export default async function DashboardLayout({ children }) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <AuthProvider session={session}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-24px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        @keyframes countUp {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .anim-fade { animation: fadeIn 0.4s ease-out both; }
        .anim-slide-up { animation: slideUp 0.5s ease-out both; }
        .anim-slide-left { animation: slideInLeft 0.4s ease-out both; }
        .anim-scale { animation: scaleIn 0.3s ease-out both; }
        .anim-count { animation: countUp 0.6s ease-out both; }
        .anim-shimmer {
          background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
          background-size: 200% 100%;
          animation: shimmer 1.5s infinite;
        }
        .d1 { animation-delay: 50ms; }
        .d2 { animation-delay: 100ms; }
        .d3 { animation-delay: 150ms; }
        .d4 { animation-delay: 200ms; }
        .d5 { animation-delay: 250ms; }
        .d6 { animation-delay: 300ms; }
        .d7 { animation-delay: 350ms; }
        .d8 { animation-delay: 400ms; }

        /* Custom scrollbar */
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #f1f5f9; }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
      `}</style>

      <div className="flex h-screen overflow-hidden bg-slate-50">
        <Sidebar userRole={session.user?.role} userName={session.user?.name} />
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <Header user={session.user} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto anim-fade">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}