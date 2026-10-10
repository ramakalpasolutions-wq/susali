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

    const patientId = session.user.patientId;
    if (!patientId) {
      return NextResponse.json({ error: "Patient record not found" }, { status: 404 });
    }

    const body = await request.json();
    const { referralCode, hospitalId, departmentId, reason, referralId } = body;

    if (!hospitalId) {
      return NextResponse.json({ error: "Hospital is required" }, { status: 400 });
    }

    const year = new Date().getFullYear();

    // 1. If an existing referral record is being updated
    if (referralId) {
      const updated = await prisma.$transaction(async (tx) => {
        const ref = await tx.referral.update({
          where: { id: referralId },
          data: {
            referralCode: referralCode || undefined,
            hospitalId,
            departmentId: departmentId || null,
            reason: reason || undefined,
            status: "HOSPITAL_ASSIGNED",
          },
        });

        await tx.activityLog.create({
          data: {
            patientId,
            referralId: ref.id,
            action: "HOSPITAL_ASSIGNED",
            description: `Offline referral code [${referralCode || ref.referralCode}] submitted. Hospital selected.`,
            userId: session.user.id,
            userName: session.user.name,
            userRole: "PATIENT",
          },
        });

        return ref;
      });

      return NextResponse.json({ success: true, referral: updated });
    }

    // 2. Direct intake from offline code: create new Referral record directly
    const referralCount = await prisma.referral.count();
    const newReferralId = `REF-${year}-${String(referralCount + 1).padStart(6, "0")}`;

    const newReferral = await prisma.$transaction(async (tx) => {
      const ref = await tx.referral.create({
        data: {
          referralId: newReferralId,
          referralCode: referralCode || `OFFLINE-${Date.now().toString().slice(-6)}`,
          patientId,
          hospitalId,
          departmentId: departmentId || null,
          createdById: session.user.id,
          status: "HOSPITAL_ASSIGNED",
          reason: reason || "Offline Superintendent Referral",
        },
      });

      await tx.activityLog.create({
        data: {
          patientId,
          referralId: ref.id,
          action: "REFERRAL_CREATED",
          description: `Patient submitted offline referral slip code [${referralCode}]. Hospital selected.`,
          userId: session.user.id,
          userName: session.user.name,
          userRole: "PATIENT",
        },
      });

      return ref;
    });

    return NextResponse.json({ success: true, referral: newReferral });
  } catch (error) {
    console.error("activate-referral error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}