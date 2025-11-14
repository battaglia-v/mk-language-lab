/**
 * Admin Practice Audio Upload API
 *
 * Handles multipart form uploads for practice audio clips.
 * Streams files to Vercel Blob or S3, persists PracticeAudio records.
 *
 * Auth: Requires admin role
 *
 * Form fields:
 *  - primaryFile: Audio file (required)
 *  - slowFile: Slow-speed audio file (optional)
 *  - promptId: Practice prompt ID (required)
 *  - sourceType: 'human' | 'tts' (required)
 *  - speaker: Speaker name (optional)
 *  - language: Language code (default: 'mk')
 *  - isPublished: 'true' | 'false' (default: 'false')
 */

import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { uploadAudioFile, generateFilename } from '@/lib/practice-audio-storage';
import { PracticeAudioSource, PracticeAudioStatus } from '@prisma/client';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Check auth
  const session = await auth().catch(() => null);

  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check admin role
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }

  try {
    const formData = await request.formData();

    // Extract form fields - FormData.get() returns FormDataEntryValue | null
    const primaryFileEntry = formData.get('primaryFile');
    const slowFileEntry = formData.get('slowFile');
    const primaryFile = primaryFileEntry instanceof File ? primaryFileEntry : null;
    const slowFile = slowFileEntry instanceof File ? slowFileEntry : null;
    const promptId = String(formData.get('promptId') || '');
    const sourceType = String(formData.get('sourceType') || '');
    const speakerEntry = formData.get('speaker');
    const speaker = speakerEntry ? String(speakerEntry) : null;
    const language = String(formData.get('language') || 'mk');
    const isPublished = formData.get('isPublished') === 'true';

    // Validate required fields
    if (!primaryFile) {
      return NextResponse.json({ error: 'Primary audio file is required' }, { status: 400 });
    }

    if (!promptId) {
      return NextResponse.json({ error: 'promptId is required' }, { status: 400 });
    }

    if (!sourceType || !['human', 'tts'].includes(sourceType)) {
      return NextResponse.json({ error: 'sourceType must be "human" or "tts"' }, { status: 400 });
    }

    // Upload primary file
    const primaryFilename = generateFilename(primaryFile.name, 'primary');
    const primaryResult = await uploadAudioFile(primaryFile, primaryFilename, primaryFile.type);

    // Upload slow file if provided
    let slowUrl: string | null = null;
    if (slowFile) {
      const slowFilename = generateFilename(slowFile.name, 'slow');
      const slowResult = await uploadAudioFile(slowFile, slowFilename, slowFile.type);
      slowUrl = slowResult.url;
    }

    // Create or update PracticeAudio record
    const audioSource = sourceType === 'human' ? PracticeAudioSource.human : PracticeAudioSource.tts;
    const status = isPublished ? PracticeAudioStatus.published : PracticeAudioStatus.draft;

    const record = await prisma.practiceAudio.upsert({
      where: { promptId },
      update: {
        sourceType: audioSource,
        cdnUrl: primaryResult.url,
        slowUrl,
        language,
        speaker,
        status,
        publishedAt: isPublished ? new Date() : null,
        updatedAt: new Date(),
      },
      create: {
        promptId,
        sourceType: audioSource,
        cdnUrl: primaryResult.url,
        slowUrl,
        language,
        speaker,
        status,
        publishedAt: isPublished ? new Date() : null,
      },
    });

    return NextResponse.json({
      success: true,
      record: {
        id: record.id,
        promptId: record.promptId,
        primaryUrl: record.cdnUrl,
        slowUrl: record.slowUrl,
        status: record.status,
        publishedAt: record.publishedAt,
      },
    });
  } catch (error) {
    console.error('[AdminPracticeAudioAPI] Upload failed:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 500 }
    );
  }
}
