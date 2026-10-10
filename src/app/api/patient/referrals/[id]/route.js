// src/app/api/patient/referrals/[id]/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const referral = await prisma.referral.findFirst({
      where: {
        id,
        patient: { id: session.user.patientId },
      },
      include: {
        hospital: { select: { name: true, city: true, phone: true } },
        department: { select: { name: true } },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    const [consultations, prescriptions, reports, activityLogs] = await Promise.all([
      prisma.consultation.findMany({
        where: { referralId: id },
        include: { doctor: { select: { name: true, specialization: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.prescription.findMany({
        where: { referralId: id },
        orderBy: { createdAt: "desc" },
      }),
      prisma.investigationReport.findMany({
        where: { referralId: id },
        include: { investigation: { select: { name: true, type: true } } },
        orderBy: { createdAt: "desc" },
      }),
      prisma.activityLog.findMany({
        where: { referralId: id },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      referral,
      consultations,
      prescriptions,
      reports,
      activityLogs,
    });
  } catch (error) {
    console.error("Patient referral detail error:", error);
    return NextResponse.json({ error: "Failed to fetch referral" }, { status: 500 });
  }
}