import { NextRequest, NextResponse } from 'next/server';
import { v2 } from '@google-cloud/translate';

let translator: v2.Translate | null | undefined;

const SUPPORTED_LANGUAGES = new Set(['mk', 'en']);
const MAX_CHARACTERS = 1800;

const parseCredentials = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf-8');
      return JSON.parse(decoded);
    } catch {
      throw error;
    }
  }
};

const getTranslator = () => {
  if (translator !== undefined) {
    return translator;
  }

  const projectId = process.env.GOOGLE_PROJECT_ID;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const jsonCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!projectId) {
    translator = null;
    return translator;
  }

  try {
    if (jsonCredentials) {
      const credentials = parseCredentials(jsonCredentials);
      translator = new v2.Translate({ projectId, credentials });
      return translator;
    }

    if (keyPath) {
      translator = new v2.Translate({ projectId, keyFilename: keyPath });
      return translator;
    }
  } catch (error) {
    console.error('Failed to configure Google Translate client:', error);
  }

  translator = null;
  return translator;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const sourceLangRaw = typeof body?.sourceLang === 'string' ? body.sourceLang.trim().toLowerCase() : '';
    const targetLangRaw = typeof body?.targetLang === 'string' ? body.targetLang.trim().toLowerCase() : '';

    if (!text) {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    if (text.length > MAX_CHARACTERS) {
      return NextResponse.json({ error: 'Text exceeds maximum length' }, { status: 413 });
    }

    if (!SUPPORTED_LANGUAGES.has(targetLangRaw)) {
      return NextResponse.json({ error: 'Unsupported target language' }, { status: 400 });
    }

    const targetLang = targetLangRaw as 'mk' | 'en';
    const sourceLang = SUPPORTED_LANGUAGES.has(sourceLangRaw) ? (sourceLangRaw as 'mk' | 'en') : undefined;

    if (sourceLang && sourceLang === targetLang) {
      return NextResponse.json({ error: 'Source and target languages must differ' }, { status: 400 });
    }

    const translateClient = getTranslator();

    if (translateClient) {
      const [translation] = await translateClient.translate(text, {
        from: sourceLang,
        to: targetLang,
      });

      return NextResponse.json({
        translatedText: typeof translation === 'string' ? translation : String(translation),
        detectedSourceLang: sourceLang ?? null,
      });
    }

    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLang ?? 'auto',
      tl: targetLang,
      dt: 't',
      q: text,
    });

    const response = await fetch(`https://translate.googleapis.com/translate_a/single?${params.toString()}`, {
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
    });

    if (!response.ok) {
      const message = await response.text();
      console.error('Translation request failed', response.status, message);
      return NextResponse.json({ error: 'Translation provider error' }, { status: 502 });
    }

    const data = await response.json();
    const segments = Array.isArray(data?.[0]) ? data[0] : [];
    const translatedText = segments
      .map((segment: unknown) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
      .join('')
      .trim();

    if (!translatedText) {
      return NextResponse.json({ error: 'No translation returned' }, { status: 502 });
    }

    const detectedSourceLang = typeof data?.[2] === 'string' && SUPPORTED_LANGUAGES.has(data[2]) ? data[2] : null;

    return NextResponse.json({
      translatedText,
      detectedSourceLang,
    });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
