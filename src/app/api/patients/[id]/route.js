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

    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        area: true,
        referrals: {
          orderBy: { createdAt: "desc" },
          include: {
            hospital: {
              select: { id: true, name: true, code: true },
            },
            department: {
              select: { id: true, name: true },
            },
            createdBy: {
              select: { id: true, name: true },
            },
            assignedTo: {
              select: { id: true, name: true },
            },
            appointments: {
              orderBy: { appointmentDate: "desc" },
            },
            visits: {
              orderBy: { createdAt: "desc" },
              include: {
                consultations: {
                  include: {
                    doctor: true,
                    investigations: {
                      include: { reports: true },
                    },
                    prescriptions: true,
                  },
                },
              },
            },
            followUps: {
              orderBy: { followUpDate: "desc" },
            },
            documents: true,
          },
        },
        activityLogs: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        documents: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    return NextResponse.json(patient);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    const existing = await prisma.patient.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Patient not found" }, { status: 404 });
    }

    const updated = await prisma.patient.update({
      where: { id },
      data: {
        fullName: body.fullName || existing.fullName,
        dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : existing.dateOfBirth,
        age: body.age !== undefined ? parseInt(body.age) : existing.age,
        gender: body.gender || existing.gender,
        mobile: body.mobile || existing.mobile,
        alternateMobile: body.alternateMobile !== undefined ? body.alternateMobile : existing.alternateMobile,
        address: body.address !== undefined ? body.address : existing.address,
        village: body.village !== undefined ? body.village : existing.village,
        mandal: body.mandal !== undefined ? body.mandal : existing.mandal,
        district: body.district !== undefined ? body.district : existing.district,
        state: body.state !== undefined ? body.state : existing.state,
        pinCode: body.pinCode !== undefined ? body.pinCode : existing.pinCode,
        beneficiaryId: body.beneficiaryId !== undefined ? body.beneficiaryId : existing.beneficiaryId,
        areaId: body.areaId !== undefined ? body.areaId : existing.areaId,
        emergencyContact: body.emergencyContact !== undefined ? body.emergencyContact : existing.emergencyContact,
        emergencyRelation: body.emergencyRelation !== undefined ? body.emergencyRelation : existing.emergencyRelation,
        emergencyMobile: body.emergencyMobile !== undefined ? body.emergencyMobile : existing.emergencyMobile,
      },
      include: {
        area: true,
      },
    });

    await prisma.activityLog.create({
      data: {
        patientId: id,
        action: "PATIENT_UPDATED",
        description: `Patient profile updated by ${session.user.name}`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}