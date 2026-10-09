// Generate sequential IDs like PAT-2026-000001
export async function generateId(prefix, model, field) {
  const { prisma } = await import("./db");
  const year = new Date().getFullYear();
  const prefixStr = `${prefix}-${year}-`;

  const lastRecord = await prisma[model].findFirst({
    where: { [field]: { startsWith: prefixStr } },
    orderBy: { [field]: "desc" },
    select: { [field]: true },
  });

  let nextNum = 1;
  if (lastRecord) {
    const lastNum = parseInt(lastRecord[field].split("-").pop(), 10);
    nextNum = lastNum + 1;
  }

  return `${prefixStr}${String(nextNum).padStart(6, "0")}`;
}

// Format date for display
export function formatDate(date) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Format date + time for display
export function formatDateTime(date) {
  if (!date) return "—";
  return new Date(date).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

// Role display names
export const ROLE_LABELS = {
  SUPER_ADMIN: "Super Admin",
  SUPERINTENDENT: "Superintendent",
  SUPPORT_TEAM: "Support Team",
  AREA_MANAGER: "Area Manager",
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Doctor",
};

// Status colors for UI
export const STATUS_COLORS = {
  REFERRAL_CREATED: "bg-blue-100 text-blue-800",
  HOSPITAL_ASSIGNED: "bg-indigo-100 text-indigo-800",
  APPOINTMENT_SCHEDULED: "bg-purple-100 text-purple-800",
  PATIENT_ARRIVED: "bg-green-100 text-green-800",
  DOCTOR_CONSULTATION: "bg-yellow-100 text-yellow-800",
  INVESTIGATION_IN_PROGRESS: "bg-orange-100 text-orange-800",
  REPORT_PENDING: "bg-red-100 text-red-800",
  TREATMENT_COMPLETED: "bg-emerald-100 text-emerald-800",
  CASE_CLOSED: "bg-gray-100 text-gray-800",
};