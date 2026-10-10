// src/app/api/patient/activate-referral/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { referralId, hospitalId, departmentId } = await request.json();

    if (!referralId || !hospitalId) {
      return NextResponse.json({ error: "Referral ID and Hospital are required" }, { status: 400 });
    }

    const referral = await prisma.referral.findUnique({
      where: { id: referralId },
    });

    if (!referral || referral.patientId !== session.user.patientId) {
      return NextResponse.json({ error: "Referral not found or access restricted" }, { status: 403 });
    }

    const updatedReferral = await prisma.$transaction(async (tx) => {
      const updated = await tx.referral.update({
        where: { id: referralId },
        data: {
          hospitalId,
          departmentId: departmentId || null,
          status: "HOSPITAL_ASSIGNED",
        },
      });

      await tx.activityLog.create({
        data: {
          patientId: referral.patientId,
          referralId: referral.id,
          action: "HOSPITAL_ASSIGNED",
          description: "Patient configured their target hospital and clinic department self-service.",
          userId: session.user.id,
          userName: session.user.name,
          userRole: "PATIENT",
        },
      });

      return updated;
    });

    return NextResponse.json({ success: true, referral: updatedReferral });
  } catch (error) {
    console.error("activate-referral error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}