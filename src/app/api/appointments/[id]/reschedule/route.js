import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    // ONLY Area Manager (and Super Admin) can reschedule
    const denied = requirePermission(session, "appointments", "reschedule");
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await params;
    const { newDate, newTime, reason } = await request.json();

    if (!newDate || !reason) {
      return NextResponse.json({ error: "New date and reason are required" }, { status: 400 });
    }

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { referral: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Area Manager can only reschedule their own assigned cases
    if (session.user.role === "AREA_MANAGER" && appointment.referral.assignedToId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden: This case is not assigned to you" }, { status: 403 });
    }

    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        oldDate: appointment.appointmentDate,
        oldTime: appointment.appointmentTime,
        newDate: new Date(newDate),
        newTime: newTime || null,
        oldStatus: appointment.status,
        newStatus: "RESCHEDULED",
        reason,
        changedById: session.user.id,
      },
    });

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: new Date(newDate),
        appointmentTime: newTime || null,
        status: "RESCHEDULED",
      },
    });

    await prisma.referral.update({
      where: { id: appointment.referralId },
      data: { appointmentDate: new Date(newDate) },
    });

    await prisma.activityLog.create({
      data: {
        patientId: appointment.referral.patientId,
        referralId: appointment.referralId,
        action: "APPOINTMENT_RESCHEDULED",
        description: `Area Manager rescheduled to ${newDate} ${newTime || ""}. Reason: ${reason}`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      },
    });

    await prisma.auditLog.create({
      data: {
        action: "APPOINTMENT_RESCHEDULED",
        entityType: "Appointment",
        entityId: id,
        oldValue: { date: appointment.appointmentDate, time: appointment.appointmentTime },
        newValue: { date: newDate, time: newTime },
        reason,
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