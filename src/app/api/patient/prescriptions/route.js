// src/app/api/patient/prescriptions/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session || session.user.role !== "PATIENT") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const prescriptions = await prisma.prescription.findMany({
      where: { patientId: session.user.patientId },
      include: {
        doctor: {
          select: {
            name: true,
            hospital: { select: { name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(prescriptions);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}