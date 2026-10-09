import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { visitType = "INITIAL" } = await request.json().catch(() => ({}));

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: { hospital: true, patient: true },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    if (session.user.role === "HOSPITAL" && referral.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Forbidden: You cannot check in patients from another hospital" }, { status: 403 });
    }

    const now = new Date();

    const visit = await prisma.hospitalVisit.create({
      data: {
        referralId: referral.id,
        hospitalId: referral.hospitalId,
        patientId: referral.patientId,
        visitType,
        checkedInAt: now,
        checkedInBy: session.user.name,
        status: "CHECKED_IN",
      },
    });

    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: "PATIENT_ARRIVED",
      },
    });

    const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
    const todayEnd = new Date(new Date().setHours(23, 59, 59, 999));

    await prisma.appointment.updateMany({
      where: {
        referralId: referral.id,
        appointmentDate: { gte: todayStart, lte: todayEnd },
        status: { in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"] },
      },
      data: {
        status: "PATIENT_ARRIVED",
      },
    });

    await prisma.activityLog.create({
      data: {
        patientId: referral.patientId,
        referralId: referral.id,
        action: "PATIENT_ARRIVED",
        description: `Patient checked in at ${referral.hospital.name} for ${visitType.toLowerCase()} visit`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        metadata: { visitId: visit.id, checkedInAt: now },
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "HOSPITAL_CHECK_IN",
        entityType: "HospitalVisit",
        entityId: visit.id,
        newValue: { referralId: referral.id, status: "PATIENT_ARRIVED", checkedInAt: now },
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      },
    });

    return NextResponse.json({ success: true, visit });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}