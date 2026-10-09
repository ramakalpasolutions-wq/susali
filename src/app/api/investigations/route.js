import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const type = searchParams.get("type");

    const where = {};
    if (status) where.status = status;
    if (type) where.type = type;

    if (session.user.role === "HOSPITAL") {
      where.consultation = {
        visit: { hospitalId: session.user.hospitalId },
      };
    }

    const investigations = await prisma.investigation.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        doctor: { select: { name: true } },
        reports: { orderBy: { createdAt: "desc" } },
        consultation: {
          include: {
            visit: {
              include: {
                hospital: { select: { name: true } },
                referral: {
                  include: {
                    patient: { select: { id: true, patientId: true, fullName: true, mobile: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    return NextResponse.json(investigations);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}