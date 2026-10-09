import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const followUps = await prisma.followUp.findMany({
      where: { referralId: id },
      orderBy: { followUpDate: "asc" },
    });

    return NextResponse.json(followUps);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const { followUpDate, followUpTime, reason, instructions, doctorId } = await request.json();

    if (!followUpDate) {
      return NextResponse.json({ error: "Follow-up date is required" }, { status: 400 });
    }

    const referral = await prisma.referral.findUnique({
      where: { id },
      include: { hospital: true, patient: true },
    });

    if (!referral) return NextResponse.json({ error: "Referral not found" }, { status: 404 });

    const followUp = await prisma.followUp.create({
      data: {
        referralId: referral.id,
        patientId: referral.patientId,
        hospitalId: referral.hospitalId,
        doctorId: doctorId || null,
        followUpDate: new Date(followUpDate),
        followUpTime: followUpTime || "10:00 AM",
        reason,
        instructions,
        status: "SCHEDULED",
      },
    });

    await prisma.referral.update({
      where: { id: referral.id },
      data: { status: "FOLLOWUP_SCHEDULED" },
    });

    await prisma.activityLog.create({
      data: {
        patientId: referral.patientId,
        referralId: referral.id,
        action: "FOLLOWUP_SCHEDULED",
        description: `Follow-up visit scheduled for ${new Date(followUpDate).toLocaleDateString("en-IN")} (${followUpTime || "10:00 AM"}). Reason: ${reason || "Routine review"}`,
        userId: session.user.id,
        userName: session.user.name,
        userRole: session.user.role,
        metadata: { followUpId: followUp.id, followUpDate },
      },
    });

    return NextResponse.json(followUp, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}