import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    const denied = requirePermission(session, "appointments", "reject");
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await params;
    const { reason } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: "Rejection reason is required" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { referral: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    if (session.user.role === "HOSPITAL_ADMIN" && appointment.referral.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    await prisma.referral.update({
      where: { id: appointment.referralId },
      data: { status: "APPOINTMENT_PENDING" },
    });

    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        oldStatus: appointment.status,
        newStatus: "CANCELLED",
        reason,
        changedById: session.user.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        patientId: appointment.referral.patientId,
        referralId: appointment.referralId,
        action: "APPOINTMENT_REJECTED",
        description: `Hospital rejected appointment. Reason: ${reason}`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}