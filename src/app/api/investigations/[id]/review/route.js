import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { doctorRemarks, additionalTestsRequired } = await request.json();

    const inv = await prisma.investigation.findUnique({
      where: { id },
      include: {
        reports: true,
        consultation: { include: { visit: { include: { referral: true } } } },
      },
    });

    if (!inv) return NextResponse.json({ error: "Investigation not found" }, { status: 404 });

    const now = new Date();
    const referralId = inv.referralId || inv.consultation?.visit?.referralId;

    // 1. Mark investigation as DOCTOR_REVIEWED
    await prisma.investigation.update({
      where: { id: inv.id },
      data: { status: "DOCTOR_REVIEWED" },
    });

    // 2. Mark all its reports as reviewed
    await prisma.investigationReport.updateMany({
      where: { investigationId: inv.id },
      data: {
        doctorReviewed: true,
        reviewedById: session.user.id,
        reviewedAt: now,
      },
    });

    // 3. Update Referral Status
    if (referralId) {
      const nextStatus = additionalTestsRequired ? "INVESTIGATION_RECOMMENDED" : "UNDER_TREATMENT";
      await prisma.referral.update({
        where: { id: referralId },
        data: { status: nextStatus },
      });
    }

    // 4. Activity Log
    await prisma.activityLog.create({
      data: {
        patientId: inv.patientId,
        referralId,
        action: "REPORT_REVIEWED",
        description: `Doctor reviewed ${inv.name} report. Remarks: ${doctorRemarks || "Findings reviewed and discussed with patient"}`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        metadata: { doctorRemarks, additionalTestsRequired },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}