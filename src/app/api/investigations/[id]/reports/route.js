import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const { fileUrl, fileName, fileSize, mimeType, reportType, remarks, reportDate } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL is required" }, { status: 400 });
    }

    const inv = await prisma.investigation.findUnique({
      where: { id },
      include: {
        consultation: { include: { visit: { include: { referral: true } } } },
      },
    });

    if (!inv) return NextResponse.json({ error: "Investigation not found" }, { status: 404 });

    const now = new Date();
    const referralId = inv.referralId || inv.consultation?.visit?.referralId;

    // 1. Create Report
    const report = await prisma.investigationReport.create({
      data: {
        investigationId: inv.id,
        patientId: inv.patientId,
        referralId,
        reportType: reportType || inv.type,
        reportDate: reportDate ? new Date(reportDate) : now,
        fileUrl,
        fileName: fileName || `${inv.name}_Report.pdf`,
        fileSize: fileSize || null,
        mimeType: mimeType || "application/pdf",
        remarks,
        uploadedById: session.user.id,
        uploadedAt: now,
      },
    });

    // 2. Also catalog as Patient Document
    await prisma.document.create({
      data: {
        patientId: inv.patientId,
        referralId,
        visitId: inv.consultation?.visitId,
        docType: `${inv.type}_REPORT`,
        fileUrl,
        fileName: fileName || `${inv.name}_Report.pdf`,
        fileSize: fileSize || null,
        mimeType: mimeType || "application/pdf",
        remarks,
        uploadedById: session.user.id,
        uploadedAt: now,
      },
    });

    // 3. Transition investigation status to REPORT_UPLOADED
    await prisma.investigation.update({
      where: { id: inv.id },
      data: {
        status: "REPORT_UPLOADED",
        completedAt: now,
      },
    });

    // 4. Update referral status to DOCTOR_REVIEW_PENDING
    if (referralId) {
      await prisma.referral.update({
        where: { id: referralId },
        data: { status: "DOCTOR_REVIEW_PENDING" },
      });
    }

    // 5. Activity Log
    await prisma.activityLog.create({
      data: {
        patientId: inv.patientId,
        referralId,
        action: "REPORT_UPLOADED",
        description: `Diagnostic report uploaded for ${inv.name} (${inv.investigationId}). Awaiting doctor review.`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        metadata: { reportId: report.id, fileName },
      },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}