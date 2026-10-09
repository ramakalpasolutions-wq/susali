import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function GET() {
  try {
    const session = await auth();
    const denied = requirePermission(session, "appointments", "read");
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const where = {};

    // Hospital Admin: only their hospital
    if (session.user.role === "HOSPITAL_ADMIN") {
      where.referral = { hospitalId: session.user.hospitalId };
    }

    // Area Manager: only their assigned cases
    if (session.user.role === "AREA_MANAGER") {
      where.referral = { assignedToId: session.user.id };
    }

    const appointments = await prisma.appointment.findMany({
      where,
      orderBy: { appointmentDate: "desc" },
      include: {
        referral: {
          include: {
            patient: { select: { id: true, patientId: true, fullName: true, mobile: true } },
            hospital: { select: { id: true, name: true } },
          },
        },
        history: { orderBy: { changedAt: "desc" }, take: 3 },
      },
    });

    return NextResponse.json(appointments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}