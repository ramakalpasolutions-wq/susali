import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    const where = search
      ? {
          OR: [
            { patientId: { contains: search, mode: "insensitive" } },
            { fullName: { contains: search, mode: "insensitive" } },
            { mobile: { contains: search } },
            { beneficiaryId: { contains: search, mode: "insensitive" } },
          ],
        }
      : {};

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          area: { select: { name: true } },
          _count: { select: { referrals: true } },
        },
      }),
      prisma.patient.count({ where }),
    ]);

    return NextResponse.json({
      patients,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();

    const patientId = await generateId("PAT", "patient", "patientId");

    const patient = await prisma.patient.create({
      data: {
        patientId,
        fullName: body.fullName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
        age: body.age ? parseInt(body.age) : null,
        gender: body.gender || null,
        mobile: body.mobile || null,
        alternateMobile: body.alternateMobile || null,
        address: body.address || null,
        village: body.village || null,
        mandal: body.mandal || null,
        district: body.district || null,
        state: body.state || null,
        pinCode: body.pinCode || null,
        beneficiaryId: body.beneficiaryId || null,
        areaId: body.areaId || null,
        emergencyContact: body.emergencyContact || null,
        emergencyRelation: body.emergencyRelation || null,
        emergencyMobile: body.emergencyMobile || null,
        createdByUserId: session.user.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        patientId: patient.id,
        action: "PATIENT_CREATED",
        description: `Patient profile created: ${patient.fullName} (${patient.patientId})`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}