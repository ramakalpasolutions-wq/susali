import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();
    const {
      visitId,
      doctorId,
      department,
      symptoms,
      clinicalNotes,
      diagnosis,
      doctorAdvice,
      investigationRequired,
      investigations = [],
      prescriptionProvided,
      prescriptionText,
      followUpRequired,
    } = body;

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: { hospital: true, patient: true },
    });

    if (!referral) {
      return NextResponse.json({ error: "Referral not found" }, { status: 404 });
    }

    let targetVisitId = visitId;
    if (!targetVisitId) {
      const latestVisit = await prisma.hospitalVisit.findFirst({
        where: { referralId: referral.id },
        orderBy: { createdAt: "desc" },
      });
      if (latestVisit) {
        targetVisitId = latestVisit.id;
      } else {
        const newVisit = await prisma.hospitalVisit.create({
          data: {
            referralId: referral.id,
            hospitalId: referral.hospitalId,
            patientId: referral.patientId,
            checkedInAt: new Date(),
            checkedInBy: session.user.name,
            status: "CHECKED_IN",
          },
        });
        targetVisitId = newVisit.id;
      }
    }

    const now = new Date();

    const consultation = await prisma.consultation.create({
      data: {
        visitId: targetVisitId,
        referralId: referral.id,
        patientId: referral.patientId,
        doctorId: doctorId || null,
        department: department || (referral.departmentId ? undefined : "General"),
        symptoms,
        clinicalNotes,
        diagnosis,
        doctorAdvice,
        investigationRequired: !!investigationRequired,
        prescriptionProvided: !!prescriptionProvided,
        followUpRequired: !!followUpRequired,
        startTime: now,
        endTime: now,
      },
    });

    const createdInvestigations = [];
    if (investigationRequired && investigations.length > 0) {
      for (const inv of investigations) {
        const invId = await generateId("INV", "investigation", "investigationId");
        const createdInv = await prisma.investigation.create({
          data: {
            investigationId: invId,
            consultationId: consultation.id,
            referralId: referral.id,
            patientId: referral.patientId,
            doctorId: doctorId || null,
            type: inv.type || "LAB",
            name: inv.name,
            status: "RECOMMENDED",
            requestedAt: now,
          },
        });
        createdInvestigations.push(createdInv);
      }
    }

    if (prescriptionProvided && prescriptionText) {
      await prisma.prescription.create({
        data: {
          consultationId: consultation.id,
          referralId: referral.id,
          patientId: referral.patientId,
          doctorId: doctorId || null,
          hospitalId: referral.hospitalId,
          type: investigationRequired ? "INTERIM" : "FINAL",
          diagnosis,
          notes: prescriptionText,
          uploadedById: session.user.id,
          uploadedAt: now,
        },
      });
    }

    let nextStatus = "DOCTOR_CONSULTATION";
    if (investigationRequired && investigations.length > 0) {
      nextStatus = "INVESTIGATION_RECOMMENDED";
    } else if (prescriptionProvided) {
      nextStatus = "FINAL_PRESCRIPTION_UPLOADED";
    }

    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: nextStatus },
    });

    const invSummary = createdInvestigations.map((i) => i.name).join(", ");
    await prisma.activityLog.create({
      data: {
        patientId: referral.patientId,
        referralId: referral.id,
        action: "DOCTOR_CONSULTATION",
        description: `Consultation recorded. Diagnosis: ${diagnosis || "Under evaluation"}.${
          invSummary ? ` Ordered tests: ${invSummary}` : ""
        }`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        metadata: { consultationId: consultation.id, investigationsCount: createdInvestigations.length },
      },
    });

    return NextResponse.json({
      success: true,
      consultation,
      investigations: createdInvestigations,
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}