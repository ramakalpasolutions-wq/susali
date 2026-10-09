import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "susali-medical-docs";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "mock-key",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "mock-secret",
  },
});

/**
 * Generates a signed PUT URL for direct frontend client uploads
 */
export async function getUploadPresignedUrl(key, contentType) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  // Valid for 15 minutes
  return await getSignedUrl(r2Client, command, { expiresIn: 900 });
}

/**
 * Generates a signed GET URL for secure private document viewing/download
 */
export async function getDownloadPresignedUrl(key, originalFileName = null) {
  const command = new GetObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: key,
    ResponseContentDisposition: originalFileName
      ? `inline; filename="${originalFileName}"`
      : "inline",
  });

  // Valid for 1 hour
  return await getSignedUrl(r2Client, command, { expiresIn: 3600 });
}