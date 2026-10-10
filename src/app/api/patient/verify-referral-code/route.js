// src/app/api/patient/verify-referral-code/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session || session.user?.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const referralCode = body?.referralCode?.trim()?.toUpperCase();

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code is required" }, { status: 400 });
    }

    const referral = await prisma.referral.findFirst({
      where: { referralCode },
      include: {
        hospital: { select: { id: true, name: true } },
        department: { select: { id: true, name: true } },
      },
    });

    if (!referral) {
      return NextResponse.json({ error: "No matching referral found with this code" }, { status: 404 });
    }

    if (referral.patientId !== session.user.patientId) {
      return NextResponse.json({ error: "This referral does not belong to your patient account" }, { status: 403 });
    }

    return NextResponse.json({ referral });
  } catch (error) {
    console.error("verify-referral-code error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}