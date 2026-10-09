import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { generateId } from "@/lib/utils";

export async function GET(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const hospitalId = searchParams.get("hospitalId");
    const assignedToId = searchParams.get("assignedToId");

    const where = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    if (session.user.role === "HOSPITAL") {
      where.hospitalId = session.user.hospitalId;
    } else if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (session.user.role === "AREA_MANAGER") {
      where.assignedToId = session.user.id;
    } else if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    const referrals = await prisma.referral.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        patient: { select: { id: true, patientId: true, fullName: true, mobile: true, gender: true, age: true, areaId: true } },
        hospital: { select: { id: true, name: true, code: true } },
        department: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
        assignedTo: { select: { id: true, name: true } },
        appointments: { orderBy: { appointmentDate: "desc" }, take: 1 },
      },
    });

    return NextResponse.json(referrals);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { patientId, hospitalId, departmentId, assignedToId, priority, reason, notes, appointmentDate, appointmentTime } = body;

    if (!patientId || !hospitalId) {
      return NextResponse.json({ error: "Patient and Hospital are required" }, { status: 400 });
    }

    const referralId = await generateId("REF", "referral", "referralId");

    const referral = await prisma.referral.create({
      data: {
        referralId,
        patientId,
        hospitalId,
        departmentId: departmentId || null,
        createdById: session.user.id,
        assignedToId: assignedToId || null,
        priority: priority || "NORMAL",
        reason,
        notes,
        status: appointmentDate ? "APPOINTMENT_SCHEDULED" : "HOSPITAL_ASSIGNED",
        appointmentDate: appointmentDate ? new Date(appointmentDate) : null,
      },
      include: {
        patient: true,
        hospital: true,
      },
    });

    if (appointmentDate) {
      await prisma.appointment.create({
        data: {
          referralId: referral.id,
          patientId: referral.patientId,
          hospitalId: referral.hospitalId,
          departmentId: referral.departmentId,
          appointmentDate: new Date(appointmentDate),
          appointmentTime: appointmentTime || null,
          status: "CONFIRMED",
          createdById: session.user.id,
        },
      });
    }

    await prisma.activityLog.create({
      data: {
        patientId: referral.patientId,
        referralId: referral.id,
        action: "REFERRAL_CREATED",
        description: `Hospital referral created (${referral.referralId}) to ${referral.hospital.name}`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      },
    });

    return NextResponse.json(referral, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}