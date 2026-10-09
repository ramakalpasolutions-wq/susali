import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      consultationId,
      doctorId,
      type = "FINAL",
      diagnosis,
      notes,
      fileUrl,
      fileName,
      finalizeTreatment = false,
    } = body;

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: { hospital: true, patient: true },
    });

    if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    let targetConsultationId = consultationId;
    if (!targetConsultationId) {
      const latestConsult = await prisma.consultation.findFirst({
        where: { referralId: referral.id },
        orderBy: { createdAt: "desc" },
      });
      if (latestConsult) {
        targetConsultationId = latestConsult.id;
      } else {
        const visit = await prisma.hospitalVisit.create({
          data: {
            referralId: referral.id,
            hospitalId: referral.hospitalId,
            patientId: referral.patientId,
            checkedInAt: new Date(),
            status: "CHECKED_IN",
          },
        });
        const newConsult = await prisma.consultation.create({
          data: {
            visitId: visit.id,
            referralId: referral.id,
            patientId: referral.patientId,
            diagnosis,
          },
        });
        targetConsultationId = newConsult.id;
      }
    }

    const now = new Date();

    const prescription = await prisma.prescription.create({
      data: {
        consultationId: targetConsultationId,
        referralId: referral.id,
        patientId: referral.patientId,
        doctorId: doctorId || null,
        hospitalId: referral.hospitalId,
        type,
        diagnosis,
        notes,
        fileUrl,
        fileName: fileName || `${type}_Prescription.pdf`,
        uploadedById: session.user.id,
        uploadedAt: now,
      },
    });

    if (fileUrl) {
      await prisma.document.create({
        data: {
          patientId: referral.patientId,
          referralId: referral.id,
          docType: `${type}_PRESCRIPTION`,
          fileUrl,
          fileName: fileName || `${type}_Prescription.pdf`,
          uploadedById: session.user.id,
          uploadedAt: now,
        },
      });
    }

    let nextStatus = type === "FINAL" ? "FINAL_PRESCRIPTION_UPLOADED" : "UNDER_TREATMENT";
    if (finalizeTreatment) {
      nextStatus = "TREATMENT_COMPLETED";
    }

    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        status: nextStatus,
        completedAt: finalizeTreatment ? now : referral.completedAt,
      },
    });

    await prisma.activityLog.create({
      data: {
        patientId: referral.patientId,
        referralId: referral.id,
        action: `${type}_PRESCRIPTION_UPLOADED`,
        description: `${type} prescription recorded for ${referral.patient.fullName}.${finalizeTreatment ? " Treatment marked complete." : ""}`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        metadata: { prescriptionId: prescription.id, type, finalizeTreatment },
      },
    });

    return NextResponse.json(prescription, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}