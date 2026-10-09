import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { mobile, beneficiaryId, fullName, dateOfBirth } = await request.json();

    const conditions = [];

    if (mobile) {
      conditions.push({ mobile });
    }
    if (beneficiaryId) {
      conditions.push({ beneficiaryId });
    }
    if (fullName && dateOfBirth) {
      conditions.push({
        fullName: { contains: fullName, mode: "insensitive" },
        dateOfBirth: new Date(dateOfBirth),
      });
    }

    if (conditions.length === 0) {
      return NextResponse.json({ duplicates: [] });
    }

    const duplicates = await prisma.patient.findMany({
      where: { OR: conditions },
      select: {
        id: true, patientId: true, fullName: true,
        mobile: true, dateOfBirth: true, gender: true,
        village: true, beneficiaryId: true,
      },
      take: 10,
    });

    return NextResponse.json({ duplicates });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}