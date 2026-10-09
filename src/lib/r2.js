// src/lib/r2.js
import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID;
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID;
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "susali-healthcare";
const R2_PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || "";

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID || "",
    secretAccessKey: R2_SECRET_ACCESS_KEY || "",
  },
});

/**
 * Generate a presigned PUT URL for uploading a file directly to R2
 */
export async function getUploadPresignedUrl(fileKey, contentType, expiresIn = 3600) {
  const command = new PutObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn });
  const publicUrl = R2_PUBLIC_DOMAIN 
    ? `${R2_PUBLIC_DOMAIN.replace(/\/$/, "")}/${fileKey}`
    : uploadUrl.split("?")[0];

  return { uploadUrl, publicUrl, fileKey };
}

/**
 * Generate a presigned GET URL for downloading or viewing a private file from R2
 */
export async function getDownloadPresignedUrl(fileKey, expiresIn = 3600, fileName = null) {
  const commandInput = {
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  };

  if (fileName) {
    commandInput.ResponseContentDisposition = `attachment; filename="${fileName}"`;
  }

  const command = new GetObjectCommand(commandInput);
  return await getSignedUrl(r2Client, command, { expiresIn });
}

/**
 * Delete an object from R2
 */
export async function deleteFileFromR2(fileKey) {
  const command = new DeleteObjectCommand({
    Bucket: R2_BUCKET_NAME,
    Key: fileKey,
  });
  return await r2Client.send(command);
}

// Aliases to support both naming styles across the codebase
export const getPresignedUploadUrl = getUploadPresignedUrl;
export const getPresignedDownloadUrl = getDownloadPresignedUrl;