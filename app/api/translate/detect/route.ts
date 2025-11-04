import { NextRequest, NextResponse } from 'next/server';
import { v2 } from '@google-cloud/translate';
import {
  ValidationError,
  ExternalServiceError,
  createErrorResponse,
} from '@/lib/errors';

const translator = process.env.GOOGLE_APPLICATION_CREDENTIALS
  ? new v2.Translate({
      projectId: process.env.GOOGLE_PROJECT_ID,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      throw new ValidationError('Missing text field');
    }

    // If Google Translate is configured, use it with timeout
    if (translator) {
      try {
        const detectionPromise = translator.detect(text);

        // Add timeout to Google Cloud API call
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new ExternalServiceError('Language detection timeout', 504)), 10000);
        });

        const [detection] = await Promise.race([detectionPromise, timeoutPromise]);

        return NextResponse.json({
          language: detection.language,
          confidence: detection.confidence
        });
      } catch (error) {
        console.error('Google Cloud language detection error:', error);
        // Fall through to fallback heuristic
      }
    }

    // Fallback: simple heuristic detection
    const cyrillicPattern = /[\u0400-\u04FF]/;
    const detectedLang = cyrillicPattern.test(text) ? 'mk' : 'en';

    return NextResponse.json({
      language: detectedLang,
      mock: true,
      message: 'Using fallback language detection. Configure GOOGLE_APPLICATION_CREDENTIALS for accurate detection.'
    });
  } catch (error) {
    console.error('Language detection error:', error);
    const { response, status } = createErrorResponse(error, 'Language detection failed');
    return NextResponse.json(response, { status });
  }
}
