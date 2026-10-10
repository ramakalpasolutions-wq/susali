import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/db';
import bcrypt from 'bcryptjs';

// GET /api/patient/profile
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let patientId = session.user.patientId;

    // Fallback if patientId is missing directly on session
    if (!patientId && session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { patientId: true },
      });
      patientId = user?.patientId;
    }

    if (!patientId) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 });
    }

    // 1. Fetch patient with area and userAccounts
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: {
        area: {
          select: { id: true, name: true, code: true },
        },
        userAccounts: {
          select: { id: true, email: true, role: true, createdAt: true },
          take: 1,
        },
      },
    });

    if (!patient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    // 2. Fetch accurate stats in parallel
    const [referralsCount, consultationsCount, prescriptionsCount, investigationsCount] =
      await Promise.all([
        prisma.referral.count({ where: { patientId } }).catch(() => 0),
        prisma.consultation
          ? prisma.consultation.count({ where: { referral: { patientId } } }).catch(() => 0)
          : 0,
        prisma.prescription
          ? prisma.prescription.count({ where: { referral: { patientId } } }).catch(() => 0)
          : 0,
        prisma.investigation
          ? prisma.investigation.count({ where: { referral: { patientId } } }).catch(() => 0)
          : 0,
      ]);

    const userAccount = patient.userAccounts?.[0] || null;

    return NextResponse.json({
      success: true,
      patient: {
        id: patient.id,
        fullName: patient.fullName,
        phone: patient.phone,
        email: patient.email || userAccount?.email || '',
        idCardNumber: patient.idCardNumber,
        area: patient.area,
        userAccount,
        stats: {
          referrals: referralsCount,
          consultations: consultationsCount,
          prescriptions: prescriptionsCount,
          investigations: investigationsCount,
        },
        createdAt: patient.createdAt,
      },
    });
  } catch (error) {
    console.error('Error fetching patient profile:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT /api/patient/profile (Update details & password)
export async function PUT(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let patientId = session.user.patientId;
    if (!patientId && session.user.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { patientId: true },
      });
      patientId = user?.patientId;
    }

    if (!patientId) {
      return NextResponse.json({ error: 'Patient record not found' }, { status: 404 });
    }

    const body = await request.json();
    const { fullName, phone, email, currentPassword, newPassword } = body;

    const currentPatient = await prisma.patient.findUnique({
      where: { id: patientId },
      include: { userAccounts: { take: 1 } },
    });

    if (!currentPatient) {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }

    const linkedUserId = currentPatient.userAccounts?.[0]?.id || session.user.id;

    // 1. Password change
    if (newPassword) {
      if (!currentPassword) {
        return NextResponse.json(
          { error: 'Current password is required to set a new password' },
          { status: 400 }
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: linkedUserId },
      });

      if (!user) {
        return NextResponse.json({ error: 'User account not found' }, { status: 404 });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isMatch) {
        return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
      }

      if (newPassword.length < 6) {
        return NextResponse.json(
          { error: 'New password must be at least 6 characters' },
          { status: 400 }
        );
      }

      const newHash = await bcrypt.hash(newPassword, 10);
      await prisma.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });
    }

    // 2. Update patient record
    const updatedPatient = await prisma.patient.update({
      where: { id: patientId },
      data: {
        ...(fullName ? { fullName } : {}),
        ...(phone ? { phone } : {}),
        ...(email ? { email } : {}),
      },
    });

    // 3. Keep linked User record in sync
    if (linkedUserId) {
      await prisma.user.update({
        where: { id: linkedUserId },
        data: {
          ...(fullName ? { name: fullName } : {}),
          ...(email ? { email } : {}),
        },
      }).catch(() => {});
    }

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      patient: updatedPatient,
    });
  } catch (error) {
    console.error('Error updating patient profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}