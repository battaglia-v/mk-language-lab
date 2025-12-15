/**
 * Image Storage Service
 * 
 * Provides persistent image caching using multiple storage backends.
 * Supports S3-compatible storage (AWS S3, R2, etc.) for production
 * and fallback to in-memory caching for development.
 * 
 * @see /app/api/news/image/route.ts
 */

import { S3Client, PutObjectCommand, GetObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';

// ==================== Configuration ====================

interface ImageStorageConfig {
  enabled: boolean;
  bucket: string;
  region: string;
  endpoint?: string;
  accessKeyId?: string;
  secretAccessKey?: string;
  cdnUrl?: string;
  ttlSeconds: number;
}

const config: ImageStorageConfig = {
  enabled: !!(process.env.IMAGE_STORAGE_BUCKET && process.env.IMAGE_STORAGE_ACCESS_KEY),
  bucket: process.env.IMAGE_STORAGE_BUCKET || '',
  region: process.env.IMAGE_STORAGE_REGION || 'auto',
  endpoint: process.env.IMAGE_STORAGE_ENDPOINT,
  accessKeyId: process.env.IMAGE_STORAGE_ACCESS_KEY,
  secretAccessKey: process.env.IMAGE_STORAGE_SECRET_KEY,
  cdnUrl: process.env.IMAGE_STORAGE_CDN_URL,
  ttlSeconds: 7 * 24 * 60 * 60, // 7 days
};

// ==================== S3 Client ====================

let s3Client: S3Client | null = null;

function getS3Client(): S3Client | null {
  if (!config.enabled) return null;
  
  if (!s3Client) {
    s3Client = new S3Client({
      region: config.region,
      ...(config.endpoint && { endpoint: config.endpoint }),
      credentials: config.accessKeyId && config.secretAccessKey ? {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      } : undefined,
    });
  }
  
  return s3Client;
}

// ==================== Cache Key Generation ====================

/**
 * Generate a storage key from URL
 * Creates a path like: news-images/2025/12/15/{hash}.{ext}
 */
export function generateStorageKey(url: string): string {
  const hash = hashUrl(url);
  const ext = getExtensionFromUrl(url);
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return `news-images/${year}/${month}/${day}/${hash}${ext}`;
}

/**
 * Simple hash function for URLs
 */
function hashUrl(url: string): string {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(36);
}

/**
 * Extract file extension from URL
 */
function getExtensionFromUrl(url: string): string {
  try {
    const pathname = new URL(url).pathname;
    const match = pathname.match(/\.(jpe?g|png|gif|webp|svg|avif)$/i);
    return match ? match[0].toLowerCase() : '.jpg';
  } catch {
    return '.jpg';
  }
}

// ==================== Storage Operations ====================

export interface StoredImage {
  data: ArrayBuffer;
  contentType: string;
  key: string;
  cdnUrl?: string;
}

export interface StorageStats {
  enabled: boolean;
  bucket: string;
  hasCdn: boolean;
}

/**
 * Check if an image exists in storage
 */
export async function imageExists(key: string): Promise<boolean> {
  const client = getS3Client();
  if (!client) return false;
  
  try {
    await client.send(new HeadObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }));
    return true;
  } catch {
    return false;
  }
}

/**
 * Get an image from storage
 */
export async function getStoredImage(key: string): Promise<StoredImage | null> {
  const client = getS3Client();
  if (!client) return null;
  
  try {
    const response = await client.send(new GetObjectCommand({
      Bucket: config.bucket,
      Key: key,
    }));
    
    if (!response.Body) return null;
    
    const data = await response.Body.transformToByteArray();
    
    return {
      data: data.buffer as ArrayBuffer,
      contentType: response.ContentType || 'image/jpeg',
      key,
      cdnUrl: config.cdnUrl ? `${config.cdnUrl}/${key}` : undefined,
    };
  } catch {
    return null;
  }
}

/**
 * Store an image in persistent storage
 */
export async function storeImage(
  key: string,
  data: ArrayBuffer,
  contentType: string
): Promise<string | null> {
  const client = getS3Client();
  if (!client) return null;
  
  try {
    await client.send(new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: new Uint8Array(data),
      ContentType: contentType,
      CacheControl: `public, max-age=${config.ttlSeconds}`,
      Metadata: {
        'stored-at': new Date().toISOString(),
      },
    }));
    
    // Return CDN URL if available, otherwise the key
    return config.cdnUrl ? `${config.cdnUrl}/${key}` : key;
  } catch (error) {
    console.error('[ImageStorage] Failed to store image:', error);
    return null;
  }
}

/**
 * Get storage statistics
 */
export function getStorageStats(): StorageStats {
  return {
    enabled: config.enabled,
    bucket: config.bucket,
    hasCdn: !!config.cdnUrl,
  };
}

/**
 * Check if storage is properly configured
 */
export function isStorageEnabled(): boolean {
  return config.enabled;
}
