import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getUploadPresignedUrl, r2Client } from "@/lib/r2";
import { PutObjectCommand } from "@aws-sdk/client-s3";

const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const contentTypeHeader = request.headers.get("content-type") || "";

    // OPTION A: Presigned URL Request (JSON payload)
    if (contentTypeHeader.includes("application/json")) {
      const { fileName, fileType, folder = "general" } = await request.json();

      if (!ALLOWED_MIME_TYPES.includes(fileType?.toLowerCase())) {
        return NextResponse.json(
          { error: "Invalid file type. Allowed: PDF, JPG, JPEG, PNG, WEBP" },
          { status: 400 }
        );
      }

      const timestamp = Date.now();
      const sanitizedName = (fileName || "document")
        .replace(/[^a-zA-Z0-9.-]/g, "_")
        .toLowerCase();
      const fileKey = `${folder}/${timestamp}_${sanitizedName}`;

      let uploadUrl = "";
      try {
        uploadUrl = await getUploadPresignedUrl(fileKey, fileType);
      } catch {
        // Fallback for local mock dev if R2 credentials aren't set
        uploadUrl = `/api/documents/mock-upload?key=${fileKey}`;
      }

      return NextResponse.json({
        uploadUrl,
        fileKey,
        fileUrl: `https://${process.env.R2_PUBLIC_DOMAIN || "r2.susali.in"}/${fileKey}`,
      });
    }

    // OPTION B: Direct Multipart Form Data Upload
    if (contentTypeHeader.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file");
      const folder = formData.get("folder") || "medical";

      if (!file) {
        return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
      }

      if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
        return NextResponse.json(
          { error: "Invalid file format. Upload PDF or Image (PNG/JPG/JPEG)" },
          { status: 400 }
        );
      }

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const fileKey = `${folder}/${timestamp}_${sanitizedName}`;

      try {
        await r2Client.send(
          new PutObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME || "susali-medical-docs",
            Key: fileKey,
            Body: buffer,
            ContentType: file.type,
          })
        );
      } catch (e) {
        console.warn("R2 Direct upload skipped, using mock URL:", e.message);
      }

      const fileUrl = `https://${process.env.R2_PUBLIC_DOMAIN || "r2.susali.in"}/${fileKey}`;

      return NextResponse.json({
        success: true,
        fileUrl,
        fileKey,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
      });
    }

    return NextResponse.json({ error: "Unsupported Content-Type" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}