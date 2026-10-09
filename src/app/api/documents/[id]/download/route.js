// src/app/api/documents/[id]/download/route.js
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getPresignedDownloadUrl } from "@/lib/r2";

export async function GET(request, { params }) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // In Next.js 15+, params is a Promise
    const resolvedParams = await params;
    const { id } = resolvedParams;

    // Check if document exists in Document table
    let document = await prisma.document.findUnique({
      where: { id },
    });

    // If not found in Document, check InvestigationReport table
    if (!document) {
      const invReport = await prisma.investigationReport.findUnique({
        where: { id },
      });

      if (invReport) {
        document = {
          fileKey: invReport.fileKey || invReport.fileUrl?.split("/").pop(),
          fileName: invReport.fileName || "investigation-report.pdf",
          fileUrl: invReport.fileUrl,
        };
      }
    }

    if (!document) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // If file is stored directly via public URL, redirect or return URL
    if (document.fileUrl && !document.fileKey) {
      return NextResponse.redirect(document.fileUrl);
    }

    // Generate fresh presigned download URL
    const fileKey = document.fileKey || document.fileUrl?.split("/").pop();
    const downloadUrl = await getPresignedDownloadUrl(fileKey, 3600, document.fileName);

    return NextResponse.json({ downloadUrl, fileName: document.fileName });
  } catch (error) {
    console.error("Document download URL generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate download link", details: error.message },
      { status: 500 }
    );
  }
}