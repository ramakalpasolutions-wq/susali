import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const doc = await prisma.document.findUnique({
      where: { id },
      include: {
        referral: true,
      },
    });

    if (!doc) return NextResponse.json({ error: "Document not found" }, { status: 404 });

    // Isolation check
    if (session.user.role === "HOSPITAL_ADMIN") {
      if (doc.referral && doc.referral.hospitalId !== session.user.hospitalId) {
        return NextResponse.json({ error: "Access Denied: Document belongs to another hospital" }, { status: 403 });
      }
    }

    // Generate temporary 10-minute signed URL
    const signedUrl = await getPresignedDownloadUrl(doc.fileUrl);

    return NextResponse.json({
      downloadUrl: signedUrl,
      fileName: doc.fileName,
      mimeType: doc.mimeType,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}