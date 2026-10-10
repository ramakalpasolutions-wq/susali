// src/app/api/patient/dashboard/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const patientId = session.user.patientId;

    const referrals = await prisma.referral.findMany({
      where: { patientId },
      include: {
        hospital: { select: { name: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const stats = {
      totalReferrals: referrals.length,
      totalConsultations: await prisma.consultation.count({ where: { patientId } }),
      totalPrescriptions: await prisma.prescription.count({ where: { patientId } }),
      totalReports: await prisma.investigationReport.count({ where: { patientId } }),
    };

    return NextResponse.json({ referrals, stats });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}