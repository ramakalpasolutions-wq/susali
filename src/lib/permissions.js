import { auth } from "@/lib/auth";

export const PERMISSIONS = {
  SUPER_ADMIN: [
    "areas:create", "areas:read", "areas:update", "areas:delete",
    "hospitals:create", "hospitals:read", "hospitals:update", "hospitals:delete",
    "departments:create", "departments:read", "departments:update", "departments:delete",
    "doctors:create", "doctors:read", "doctors:update", "doctors:delete",
    "users:create", "users:read", "users:update", "users:delete",
    "patients:create", "patients:read", "patients:update", "patients:delete",
    "referrals:create", "referrals:read", "referrals:update", "referrals:delete",
    "appointments:create", "appointments:read", "appointments:update", "appointments:reschedule", "appointments:delete",
    "consultations:create", "consultations:read", "consultations:update",
    "investigations:create", "investigations:read", "investigations:update", "investigations:upload_report", "investigations:review",
    "prescriptions:create", "prescriptions:read", "prescriptions:update",
    "followups:create", "followups:read", "followups:update",
    "documents:upload", "documents:read", "documents:delete",
    "reports:view", "reports:export", "audit_logs:read",
  ],

  SUDO_ADMIN: [
    "areas:read", "hospitals:read", "departments:read", "doctors:read", "doctors:create",
    "users:read", "users:create", "users:update",
    "patients:create", "patients:read", "patients:update",
    "referrals:create", "referrals:read", "referrals:update",
    "appointments:create", "appointments:read", "appointments:reschedule", "appointments:update",
    "consultations:read", "investigations:read", "prescriptions:read", "followups:read",
    "documents:upload", "documents:read", "reports:view",
  ],

  SUPPORT: [
    "areas:read", "hospitals:read", "departments:read", "doctors:read",
    "patients:create", "patients:read", "patients:update",
    "referrals:create", "referrals:read", "referrals:update",
    "appointments:create", "appointments:read", "appointments:reschedule",
    "consultations:read", "investigations:read", "prescriptions:read", "followups:read",
    "documents:upload", "documents:read",
  ],

  AREA_MANAGER: [
    "areas:read", "hospitals:read", "departments:read", "doctors:read",
    "patients:read",
    "referrals:read", "referrals:update",
    "appointments:read", "appointments:reschedule", "appointments:update",
    "consultations:read", "investigations:read", "prescriptions:read",
    "followups:create", "followups:read", "followups:update",
    "documents:upload", "documents:read",
    "reports:view",
  ],

  HOSPITAL: [
    "hospitals:read", "departments:read", "doctors:read", "doctors:create",
    "patients:read",
    "referrals:read", "referrals:update",
    "appointments:read", "appointments:update", "appointments:reschedule",
    "consultations:create", "consultations:read", "consultations:update",
    "investigations:create", "investigations:read", "investigations:update", "investigations:upload_report", "investigations:review",
    "prescriptions:create", "prescriptions:read", "prescriptions:update",
    "followups:create", "followups:read", "followups:update",
    "documents:upload", "documents:read",
  ],
};

export function hasPermission(role, permission) {
  if (!role) return false;
  if (role === "SUPER_ADMIN") return true;
  const rolePerms = PERMISSIONS[role];
  if (!rolePerms) return false;
  return rolePerms.includes(permission);
}

export async function requirePermission(permission) {
  const session = await auth();

  if (!session?.user) {
    return {
      error: "Unauthorized. Please log in.",
      status: 401,
      user: null,
    };
  }

  const role = session.user.role;

  if (!hasPermission(role, permission)) {
    return {
      error: `Forbidden. Role '${role}' does not have '${permission}' permission.`,
      status: 403,
      user: null,
    };
  }

  return { user: session.user, status: 200 };
}

export function canAccessHospital(user, hospitalId) {
  if (!user) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "SUDO_ADMIN") return true;
  if (user.role === "HOSPITAL") {
    return user.hospitalId === hospitalId;
  }
  return true;
}

export function canAccessReferral(user, referral) {
  if (!user || !referral) return false;
  if (user.role === "SUPER_ADMIN" || user.role === "SUDO_ADMIN" || user.role === "SUPPORT") return true;

  if (user.role === "AREA_MANAGER") {
    if (user.areaId && referral.patient?.areaId) {
      return user.areaId === referral.patient.areaId;
    }
    return referral.assignedToId === user.id;
  }

  if (user.role === "HOSPITAL") {
    return user.hospitalId === referral.hospitalId;
  }

  return true;
}