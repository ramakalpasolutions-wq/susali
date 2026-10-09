import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: {
        patient: true,
        hospital: true,
        department: true,
        createdBy: { select: { id: true, name: true, role: true } },
        assignedTo: { select: { id: true, name: true, role: true } },
        appointments: {
          orderBy: { createdAt: "desc" },
          include: { history: true },
        },
        visits: {
          orderBy: { createdAt: "desc" },
          include: {
            consultations: {
              include: {
                doctor: true,
                investigations: { include: { reports: true } },
                prescriptions: true,
              },
            },
          },
        },
        followUps: { orderBy: { followUpDate: "desc" } },
        documents: { orderBy: { createdAt: "desc" } },
        activityLogs: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    if (session.user.role === "HOSPITAL" && referral.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Access Denied to this hospital's patient record" }, { status: 403 });
    }

    return NextResponse.json(referral);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.referral.findUnique({ where: { id } });
    if (!existing) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    const updated = await prisma.referral.update({
      where: { id },
      data: {
        status: body.status || existing.status,
        priority: body.priority || existing.priority,
        assignedToId: body.assignedToId !== undefined ? body.assignedToId : existing.assignedToId,
        hospitalId: body.hospitalId || existing.hospitalId,
        departmentId: body.departmentId || existing.departmentId,
        notes: body.notes !== undefined ? body.notes : existing.notes,
        appointmentDate: body.appointmentDate ? new Date(body.appointmentDate) : existing.appointmentDate,
      },
    });

    if (body.status && body.status !== existing.status) {
      await prisma.activityLog.create({
        data: {
          patientId: existing.patientId,
          referralId: existing.id,
          action: "STATUS_CHANGED",
          description: `Referral status updated from ${existing.status} to ${body.status}`,
          userId: session.user.id,
          userName: session.user.name,
          userRole: session.user.role,
        },
      });

      await prisma.auditLog.create({
        data: {
          action: "REFERRAL_STATUS_UPDATED",
          entityType: "Referral",
          entityId: id,
          oldValue: { status: existing.status },
          newValue: { status: body.status },
          userId: session.user.id,
          userName: session.user.name,
          userRole: session.user.role,
        },
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}