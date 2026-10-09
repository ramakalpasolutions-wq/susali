import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function POST(request, { params }) {
  try {
    const session = await auth();

    // ONLY Hospital Admin can accept appointments
    const denied = requirePermission(session, "appointments", "accept");
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await params;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: { referral: true },
    });

    if (!appointment) {
      return NextResponse.json({ error: "Appointment not found" }, { status: 404 });
    }

    // Hospital isolation: can only accept appointments for their hospital
    if (session.user.role === "HOSPITAL_ADMIN" && appointment.referral.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Forbidden: This appointment belongs to another hospital" }, { status: 403 });
    }

    // Accept the appointment
    const updated = await prisma.appointment.update({
      where: { id },
      data: { status: "CONFIRMED" },
    });

    // Update referral status
    await prisma.referral.update({
      where: { id: appointment.referralId },
      data: { status: "APPOINTMENT_SCHEDULED" },
    });

    // Record history
    await prisma.appointmentHistory.create({
      data: {
        appointmentId: id,
        oldStatus: appointment.status,
        newStatus: "CONFIRMED",
        reason: "Hospital accepted the appointment request",
        changedById: session.user.id,
      },
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        patientId: appointment.referral.patientId,
        referralId: appointment.referralId,
        action: "APPOINTMENT_ACCEPTED",
        description: `Hospital confirmed appointment for ${new Date(appointment.appointmentDate).toLocaleDateString("en-IN")}`,
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