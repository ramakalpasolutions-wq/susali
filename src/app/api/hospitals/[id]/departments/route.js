import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const departments = await prisma.hospitalDepartment.findMany({
      where: { hospitalId: id, isActive: true },
      orderBy: { name: "asc" },
      include: {
        doctors: { select: { id: true, name: true, specialization: true } },
      },
    });

    return NextResponse.json(departments);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "SUPER_ADMIN" && session.user.role !== "SUDO_ADMIN")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const { name } = await request.json();

    if (!name) {
      return NextResponse.json({ error: "Department name is required" }, { status: 400 });
    }

    const department = await prisma.hospitalDepartment.create({
      data: {
        name,
        hospitalId: id,
      },
    });

    return NextResponse.json(department, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}