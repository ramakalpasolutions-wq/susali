import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    // ONLY Hospital Admin can set the exact schedule
    const denied = requirePermission(session, "appointments", "schedule");
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await params;
    const { newDate, newTime, doctorId, departmentId, notes } = await request.json();

    if (!newDate) {
      return NextResponse.json({ error: "Appointment date is required" }, { status: 400 });
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

    // Record old state
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        oldDate: appointment.appointmentDate,
        oldTime: appointment.appointmentTime,
        newDate: new Date(newDate),
        newTime: newTime || null,
        oldStatus: appointment.status,
        newStatus: "CONFIRMED",
        reason: "Hospital scheduled exact time slot",
        changedById: session.user.id,
      },
    });

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        appointmentDate: new Date(newDate),
        appointmentTime: newTime || null,
        doctorId: doctorId || appointment.doctorId,
        departmentId: departmentId || appointment.departmentId,
        status: "CONFIRMED",
        notes: notes || appointment.notes,
      },
    });

    await prisma.referral.update({
      where: { id: appointment.referralId },
      data: {
        appointmentDate: new Date(newDate),
        status: "APPOINTMENT_SCHEDULED",
      },
    });

    await prisma.activityLog.create({
      data: {
        patientId: appointment.referral.patientId,
        referralId: appointment.referralId,
        action: "APPOINTMENT_SCHEDULED",
        description: `Hospital set appointment to ${newDate} at ${newTime || "TBD"}`,
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