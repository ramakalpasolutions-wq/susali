
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getPresignedUploadUrl } from "@/lib/r2";
import crypto from "crypto";

export async function POST(request) {
  try {
    const session = await auth();
    if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { fileName, fileType, docType, patientId, referralId } = await request.json();

    if (!fileName || !fileType) {
      return NextResponse.json({ error: "fileName and fileType are required" }, { status: 400 });
    }

    // Generate unique storage key: patientId/referralId/uuid-sanitized_file_name
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_");
    const uniqueId = crypto.randomBytes(6).toString("hex");
    const key = `medical_records/${patientId || "general"}/${referralId || "general"}/${uniqueId}-${cleanFileName}`;

    const uploadUrl = await getPresignedUploadUrl(key, fileType);

    return NextResponse.json({
      uploadUrl,
      fileKey: key,
      expiresIn: 900,
    });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}