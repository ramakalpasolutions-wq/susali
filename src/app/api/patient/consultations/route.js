// src/app/api/patient/consultations/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const consultations = await prisma.consultation.findMany({
      where: { patientId: session.user.patientId },
      include: {
        doctor: { select: { name: true, specialization: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(consultations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}