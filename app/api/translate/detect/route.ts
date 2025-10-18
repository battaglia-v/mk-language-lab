import { NextRequest, NextResponse } from 'next/server';
import { v2 } from '@google-cloud/translate';

const translator = process.env.GOOGLE_APPLICATION_CREDENTIALS 
  ? new v2.Translate({
      projectId: process.env.GOOGLE_PROJECT_ID,
    })
  : null;

export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text) {
      return NextResponse.json(
        { error: 'Missing text field' },
        { status: 400 }
      );
    }

    // If Google Translate is configured, use it
    if (translator) {
      const [detection] = await translator.detect(text);
      return NextResponse.json({ 
        language: detection.language,
        confidence: detection.confidence 
      });
    }

    // Fallback: simple heuristic detection
    const cyrillicPattern = /[\u0400-\u04FF]/;
    const detectedLang = cyrillicPattern.test(text) ? 'mk' : 'en';
    
    return NextResponse.json({ 
      language: detectedLang,
      mock: true,
      message: 'Using mock language detection. Configure GOOGLE_APPLICATION_CREDENTIALS for accurate detection.'
    });
  } catch (error) {
    console.error('Language detection error:', error);
    return NextResponse.json(
      { error: 'Language detection failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
