/**
 * Practice Audio Storage
 *
 * Abstracts audio file uploads to Vercel Blob or AWS S3
 * based on PRACTICE_AUDIO_STORAGE env variable.
 *
 * Configuration:
 *   PRACTICE_AUDIO_STORAGE="blob" | "s3"
 *   BLOB_READ_WRITE_TOKEN (for Vercel Blob)
 *   AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION, AWS_S3_BUCKET (for S3)
 */

import { put as blobPut } from '@vercel/blob';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

type StorageProvider = 'blob' | 's3';

type UploadResult = {
  url: string;
  provider: StorageProvider;
};

/**
 * Get the configured storage provider
 */
export function getStorageProvider(): StorageProvider {
  const provider = process.env.PRACTICE_AUDIO_STORAGE?.toLowerCase();
  if (provider === 's3') return 's3';
  return 'blob'; // default to Vercel Blob
}

/**
 * Upload a file to the configured storage
 */
export async function uploadAudioFile(
  file: File | Buffer,
  filename: string,
  contentType: string = 'audio/mpeg'
): Promise<UploadResult> {
  const provider = getStorageProvider();

  if (provider === 's3') {
    return uploadToS3(file, filename, contentType);
  }

  return uploadToBlob(file, filename, contentType);
}

/**
 * Upload to Vercel Blob
 */
async function uploadToBlob(
  file: File | Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (!token) {
    throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
  }

  const blob = await blobPut(`practice-audio/${filename}`, file, {
    access: 'public',
    contentType,
    token,
  });

  return {
    url: blob.url,
    provider: 'blob',
  };
}

/**
 * Upload to AWS S3
 */
async function uploadToS3(
  file: File | Buffer,
  filename: string,
  contentType: string
): Promise<UploadResult> {
  const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
  const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
  const region = process.env.AWS_REGION || 'us-east-1';
  const bucket = process.env.AWS_S3_BUCKET;

  if (!accessKeyId || !secretAccessKey || !bucket) {
    throw new Error('AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_S3_BUCKET) are not configured');
  }

  const s3Client = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  // @ts-ignore - File.arrayBuffer() exists in runtime but TypeScript definitions are incomplete
  const fileBuffer = file instanceof Buffer ? file : Buffer.from(await file.arrayBuffer());

  const key = `practice-audio/${filename}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: fileBuffer,
      ContentType: contentType,
      ACL: 'public-read',
    })
  );

  // Construct public URL
  const url = `https://${bucket}.s3.${region}.amazonaws.com/${key}`;

  return {
    url,
    provider: 's3',
  };
}

/**
 * Generate a unique filename with timestamp
 */
export function generateFilename(originalName: string, suffix?: string): string {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 8);
  const extension = originalName.split('.').pop() || 'mp3';
  const baseName = originalName.replace(/\.[^/.]+$/, '').replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  if (suffix) {
    return `${baseName}-${suffix}-${timestamp}-${randomString}.${extension}`;
  }

  return `${baseName}-${timestamp}-${randomString}.${extension}`;
}
