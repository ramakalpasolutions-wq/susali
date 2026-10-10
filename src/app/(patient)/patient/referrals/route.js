// src/app/api/patient/referrals/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      where: { patient: { id: session.user.patientId } },
      include: {
        hospital: { select: { name: true, city: true } },
        department: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ referrals });
  } catch (error) {
    console.error("Patient referrals error:", error);
    return NextResponse.json({ error: "Failed to fetch referrals" }, { status: 500 });
  }
}