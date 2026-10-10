// src/app/(patient)/patient/layout.jsx
import { auth } from "@/lib/auth";
import PatientBottomNav from "@/components/patient/PatientBottomNav";
import PatientTopBar from "@/components/patient/PatientTopBar";

export default async function PatientLayout({ children }) {
  const session = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-teal-50 via-white to-emerald-50 pb-24">
      <PatientTopBar user={session?.user} />
      <main className="max-w-2xl mx-auto px-4 pt-4 pb-10">{children}</main>
      <PatientBottomNav />
    </div>
  );
}