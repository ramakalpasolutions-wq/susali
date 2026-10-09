import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = session.user.role;
    const whereReferral = {};
    const whereAppt = {};

    if (role === "HOSPITAL") {
      whereReferral.hospitalId = session.user.hospitalId;
      whereAppt.hospitalId = session.user.hospitalId;
    } else if (role === "AREA_MANAGER") {
      whereReferral.assignedToId = session.user.id;
    }

    const [
      totalPatients,
      activeReferrals,
      scheduledAppointments,
      pendingInvestigations,
      recentReferrals,
    ] = await Promise.all([
      prisma.patient.count(),
      prisma.referral.count({
        where: {
          ...whereReferral,
          status: { notIn: ["TREATMENT_COMPLETED", "CASE_CLOSED"] },
        },
      }),
      prisma.appointment.count({
        where: {
          ...whereAppt,
          status: { in: ["REQUESTED", "CONFIRMED", "RESCHEDULED"] },
        },
      }),
      prisma.investigation.count({
        where: {
          status: { in: ["RECOMMENDED", "SCHEDULED", "IN_PROGRESS", "REPORT_PENDING"] },
        },
      }),
      prisma.referral.findMany({
        where: whereReferral,
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          patient: { select: { fullName: true, mobile: true } },
          hospital: { select: { name: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalPatients,
        activeReferrals,
        scheduledAppointments,
        pendingInvestigations,
      },
      recentReferrals,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}