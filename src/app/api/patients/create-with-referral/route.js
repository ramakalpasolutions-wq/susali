// src/app/api/patients/create-with-referral/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

function generateReferralCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || !["SUPER_ADMIN", "SUDO_ADMIN", "SUPPORT", "AREA_MANAGER"].includes(session.user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fullName, phone, email, idCardNumber, password, areaId, hospitalId, departmentId, reason } = await request.json();

    if (!fullName || !phone || !idCardNumber || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const cleanedEmail = email?.trim().toLowerCase() || `${phone}@patient.susali.in`;

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanedEmail },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email or phone number already in use" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const year = new Date().getFullYear();
    const count = await prisma.patient.count();
    const patientId = `PAT-${year}-${String(count + 1).padStart(6, "0")}`;

    const referralCount = await prisma.referral.count();
    const referralId = `REF-${year}-${String(referralCount + 1).padStart(6, "0")}`;
    const referralCode = generateReferralCode();

    const result = await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          patientId,
          fullName,
          mobile: phone,
          idCardNumber,
          beneficiaryId: idCardNumber,
          areaId: areaId || null,
          createdByUserId: session.user.id,
        },
      });

      await tx.user.create({
        data: {
          name: fullName,
          email: cleanedEmail,
          password: hashedPassword,
          phone,
          role: "PATIENT",
          patientId: patient.id,
        },
      });

      const referral = await tx.referral.create({
        data: {
          referralId,
          referralCode,
          patientId: patient.id,
          hospitalId: hospitalId || null,
          departmentId: departmentId || null,
          createdById: session.user.id,
          status: hospitalId ? "HOSPITAL_ASSIGNED" : "REFERRAL_CREATED",
          reason: reason || "Standard Referral Intake",
        },
      });

      await tx.activityLog.create({
        data: {
          patientId: patient.id,
          referralId: referral.id,
          action: "REFERRAL_CREATED",
          description: `Patient and referral created by staff. Referral Lookup Code: ${referralCode}`,
          userId: session.user.id,
          userName: session.user.name,
          userRole: session.user.role,
        },
      });

      return { patientId, referralId, referralCode };
    });

    return NextResponse.json({ success: true, ...result, loginEmail: cleanedEmail });
  } catch (error) {
    console.error("Intake error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}