import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { fileUrl, fileName, fileSize, mimeType, reportType, remarks } = body;

    if (!fileUrl) {
      return NextResponse.json({ error: "File URL / Document is required" }, { status: 400 });
    }

    const investigation = await prisma.investigation.findUnique({
      where: { id },
      include: {
        consultation: {
          include: {
            visit: true,
          },
        },
      },
    });

    if (!investigation) {
      return NextResponse.json({ error: "Investigation record not found" }, { status: 404 });
    }

    const now = new Date();

    // 1. Create InvestigationReport record
    const report = await prisma.investigationReport.create({
      data: {
        investigationId: investigation.id,
        patientId: investigation.patientId,
        referralId: investigation.referralId,
        reportType: reportType || investigation.type,
        reportDate: now,
        fileUrl,
        fileName: fileName || `${investigation.name}_Report.pdf`,
        fileSize: fileSize || null,
        mimeType: mimeType || "application/pdf",
        remarks,
        doctorReviewed: false,
        uploadedById: session.user.id,
        uploadedAt: now,
      },
    });

    // 2. Update Document repository
    await prisma.document.create({
      data: {
        patientId: investigation.patientId,
        referralId: investigation.referralId,
        visitId: investigation.consultation?.visitId,
        docType: `${investigation.type}_REPORT`,
        fileUrl,
        fileName: fileName || `${investigation.name}_Report`,
        fileSize: fileSize || null,
        mimeType: mimeType || "application/pdf",
        remarks,
        uploadedById: session.user.id,
      },
    });

    // 3. Update Investigation status to REPORT_UPLOADED
    await prisma.investigation.update({
      where: { id: investigation.id },
      data: {
        status: "REPORT_UPLOADED",
        completedAt: now,
      },
    });

    // 4. Update Referral status to DOCTOR_REVIEW_PENDING
    if (investigation.referralId) {
      await prisma.referral.update({
        where: { id: investigation.referralId },
        data: {
          status: "DOCTOR_REVIEW_PENDING",
        },
      });

      // 5. Patient Timeline Activity
      await prisma.activityLog.create({
        data: {
          patientId: investigation.patientId,
          referralId: investigation.referralId,
          action: "REPORT_UPLOADED",
          description: `${investigation.type} Report uploaded for ${investigation.name} (${fileName || "Document"}). Doctor review pending.`,
          userId: session.user.id,
          userName: session.user.name,
          userRole: session.user.role,
          metadata: { reportId: report.id, investigationId: investigation.id },
        },
      });
    }

    return NextResponse.json({ success: true, report }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}