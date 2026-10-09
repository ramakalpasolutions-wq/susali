"use client";

const BADGE_MAP = {
  // Roles
  SUPER_ADMIN: { label: "Super Admin", color: "bg-rose-100 text-rose-800 border-rose-200" },
  SUDO_ADMIN: { label: "Sudo Admin", color: "bg-purple-100 text-purple-800 border-purple-200" },
  SUPPORT: { label: "Support", color: "bg-teal-100 text-teal-800 border-teal-200" },
  AREA_MANAGER: { label: "Area Manager", color: "bg-amber-100 text-amber-800 border-amber-200" },
  HOSPITAL: { label: "Hospital", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },

  // Priorities
  LOW: { label: "Low", color: "bg-slate-100 text-slate-700 border-slate-200" },
  NORMAL: { label: "Normal", color: "bg-blue-100 text-blue-700 border-blue-200" },
  HIGH: { label: "High", color: "bg-orange-100 text-orange-700 border-orange-200" },
  URGENT: { label: "Urgent", color: "bg-rose-100 text-rose-700 border-rose-200 font-black" },

  // Referral / Clinical Statuses
  REFERRAL_CREATED: { label: "Referral Created", color: "bg-slate-100 text-slate-700 border-slate-200" },
  HOSPITAL_ASSIGNED: { label: "Hospital Assigned", color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  APPOINTMENT_SCHEDULED: { label: "Appt Scheduled", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  PATIENT_ARRIVED: { label: "Checked In", color: "bg-emerald-100 text-emerald-700 border-emerald-200 font-bold" },
  DOCTOR_CONSULTATION: { label: "Under Consultation", color: "bg-amber-100 text-amber-700 border-amber-200" },
  INVESTIGATION_RECOMMENDED: { label: "Tests Ordered", color: "bg-violet-100 text-violet-700 border-violet-200" },
  REPORT_UPLOADED: { label: "Reports Uploaded", color: "bg-teal-100 text-teal-700 border-teal-200" },
  DOCTOR_REVIEW_PENDING: { label: "Review Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200 font-bold" },
  FINAL_PRESCRIPTION_UPLOADED: { label: "Prescription Uploaded", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  FOLLOWUP_SCHEDULED: { label: "Follow-up Scheduled", color: "bg-blue-100 text-blue-700 border-blue-200" },
  FOLLOWUP_DUE: { label: "Follow-up Due", color: "bg-rose-100 text-rose-700 border-rose-200 font-bold" },
  TREATMENT_COMPLETED: { label: "Treatment Completed", color: "bg-emerald-100 text-emerald-800 border-emerald-300" },
  CASE_CLOSED: { label: "Case Closed", color: "bg-slate-200 text-slate-800 border-slate-300" },
};

export default function StatusBadge({ status }) {
  if (!status) return null;
  const config = BADGE_MAP[status] || {
    label: status.replace(/_/g, " "),
    color: "bg-slate-100 text-slate-700 border-slate-200",
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${config.color}`}
    >
      {config.label}
    </span>
  );
}