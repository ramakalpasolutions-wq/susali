import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { requirePermission } from "@/lib/permissions";

export async function PUT(request, { params }) {
  try {
    const session = await auth();

    // ONLY Super Admin can modify hospitals
    const denied = requirePermission(session, "hospitals", "update");
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await params;
    const body = await request.json();

    const hospital = await prisma.hospital.update({
      where: { id },
      data: {
        name: body.name,
        code: body.code,
        address: body.address,
        city: body.city,
        state: body.state,
        pinCode: body.pinCode,
        phone: body.phone,
        email: body.email,
        isActive: body.isActive,
      },
    });

    return NextResponse.json(hospital);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await auth();

    // ONLY Super Admin can delete hospitals
    const denied = requirePermission(session, "hospitals", "delete");
    if (denied) return NextResponse.json({ error: denied.error }, { status: denied.status });

    const { id } = await params;

    const referralCount = await prisma.referral.count({ where: { hospitalId: id } });
    if (referralCount > 0) {
      return NextResponse.json(
        { error: "Cannot delete hospital with existing referrals" },
        { status: 400 }
      );
    }

    await prisma.hospital.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}