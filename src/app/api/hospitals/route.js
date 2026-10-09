import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const hospitals = await prisma.hospital.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        departments: { select: { id: true, name: true } },
        _count: { select: { referrals: true, doctors: true } },
      },
    });

    return NextResponse.json(hospitals);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUDO_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { name, code, address, city, state, pinCode, phone, email } = body;

    if (!name || !code) {
      return NextResponse.json({ error: "Name and Code are required" }, { status: 400 });
    }

    const hospital = await prisma.hospital.create({
      data: { name, code, address, city, state, pinCode, phone, email },
    });

    return NextResponse.json(hospital, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}