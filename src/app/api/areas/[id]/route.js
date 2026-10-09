import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const area = await prisma.area.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        state: body.state,
        district: body.district,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(area);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;

    // Check for related records
    const dispensaryCount = await prisma.dispensary.count({ where: { areaId: id } });
    if (dispensaryCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete area with existing dispensaries" },
        { status: 400 }
      );
    }

    await prisma.area.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}