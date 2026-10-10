// src/app/api/patients/register/route.js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(request) {
  try {
    const { fullName, idCardNumber, phone, email, password } = await request.json();

    if (!fullName || !idCardNumber || !phone || !password) {
      return NextResponse.json({ error: "Required fields missing" }, { status: 400 });
    }

    const cleanedEmail = email?.trim().toLowerCase() || `${phone}@patient.susali.in`;

    const existingUser = await prisma.user.findUnique({
      where: { email: cleanedEmail },
    });
    if (existingUser) {
      return NextResponse.json({ error: "Email/Phone already exists" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const year = new Date().getFullYear();
    const count = await prisma.patient.count();
    const patientId = `PAT-${year}-${String(count + 1).padStart(6, "0")}`;

    await prisma.$transaction(async (tx) => {
      const patient = await tx.patient.create({
        data: {
          patientId,
          fullName,
          idCardNumber,
          mobile: phone,
          beneficiaryId: idCardNumber,
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
    });

    return NextResponse.json({ success: true, patientId });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}