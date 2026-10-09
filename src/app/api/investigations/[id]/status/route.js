import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PATCH(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { status } = await request.json();

    const allowed = [
      "RECOMMENDED",
      "SCHEDULED",
      "IN_PROGRESS",
      "COMPLETED",
      "REPORT_PENDING",
      "REPORT_UPLOADED",
      "DOCTOR_REVIEWED",
    ];

    if (!allowed.includes(status)) {
      return NextResponse.json({ error: "Invalid investigation status" }, { status: 400 });
    }

    const inv = await prisma.investigation.findUnique({
      where: { id },
      include: {
        consultation: {
          include: { visit: { include: { referral: true } } },
        },
      },
    });

    if (!inv) return NextResponse.json({ error: "Investigation not found" }, { status: 404 });

    const updateData = { status };
    if (status === "SCHEDULED") updateData.scheduledAt = new Date();
    if (status === "IN_PROGRESS") updateData.startedAt = new Date();
    if (status === "COMPLETED") updateData.completedAt = new Date();

    const updated = await prisma.investigation.update({
      where: { id },
      data: updateData,
    });

    // Update referral status to match investigation progress
    const referralId = inv.referralId || inv.consultation?.visit?.referralId;
    if (referralId) {
      let refStatus = "INVESTIGATION_IN_PROGRESS";
      if (status === "REPORT_PENDING") refStatus = "REPORT_PENDING";
      if (status === "REPORT_UPLOADED") refStatus = "DOCTOR_REVIEW_PENDING";

      await prisma.referral.update({
        where: { id: referralId },
        data: { status: refStatus },
      });
    }

    // Activity Log
    await prisma.activityLog.create({
      data: {
        patientId: inv.patientId,
        referralId,
        action: `INVESTIGATION_${status}`,
        description: `Investigation ${inv.name} (${inv.investigationId}) status updated to ${status.replace(/_/g, " ")}`,
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