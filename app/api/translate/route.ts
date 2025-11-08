import { NextRequest, NextResponse } from 'next/server';
import { v2 } from '@google-cloud/translate';
import {
  ValidationError,
  ExternalServiceError,
  fetchWithRetry,
  createErrorResponse,
} from '@/lib/errors';
import { translateRateLimit, checkRateLimit } from '@/lib/rate-limit';

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
    // Rate limiting - protect expensive Google Cloud API
    const ip = request.ip ?? request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const { success, limit, reset, remaining } = await checkRateLimit(translateRateLimit, ip);

    if (!success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': remaining.toString(),
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString(),
          }
        }
      );
    }

    const body = await request.json();
    const text = typeof body?.text === 'string' ? body.text.trim() : '';
    const sourceLangRaw = typeof body?.sourceLang === 'string' ? body.sourceLang.trim().toLowerCase() : '';
    const targetLangRaw = typeof body?.targetLang === 'string' ? body.targetLang.trim().toLowerCase() : '';

    if (!text) {
      throw new ValidationError('Missing text');
    }

    if (text.length > MAX_CHARACTERS) {
      throw new ValidationError('Text exceeds maximum length');
    }

    if (!SUPPORTED_LANGUAGES.has(targetLangRaw)) {
      throw new ValidationError('Unsupported target language');
    }

    const targetLang = targetLangRaw as 'mk' | 'en';
    const sourceLang = SUPPORTED_LANGUAGES.has(sourceLangRaw) ? (sourceLangRaw as 'mk' | 'en') : undefined;

    if (sourceLang && sourceLang === targetLang) {
      throw new ValidationError('Source and target languages must differ');
    }

    const translateClient = getTranslator();

    if (translateClient) {
      try {
        // Google Cloud Translate with timeout wrapper
        const translationPromise = translateClient.translate(text, {
          from: sourceLang,
          to: targetLang,
        });

        // Add timeout to Google Cloud API call
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => reject(new ExternalServiceError('Google Translate timeout', 504)), 15000);
        });

        const [translation] = await Promise.race([translationPromise, timeoutPromise]);

        return NextResponse.json({
          translatedText: typeof translation === 'string' ? translation : String(translation),
          detectedSourceLang: sourceLang ?? null,
        });
      } catch (error) {
        console.error('Google Cloud Translate error:', error);
        throw new ExternalServiceError('Google Cloud Translation failed');
      }
    }

    // Fallback to public Google Translate endpoint with retry logic
    const params = new URLSearchParams({
      client: 'gtx',
      sl: sourceLang ?? 'auto',
      tl: targetLang,
      dt: 't',
      q: text,
    });

    const response = await fetchWithRetry(
      `https://translate.googleapis.com/translate_a/single?${params.toString()}`,
      {
        cache: 'no-store',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
      },
      {
        maxRetries: 3,
        timeoutMs: 10000,
      }
    );

    if (!response.ok) {
      const message = await response.text();
      console.error('Translation request failed', response.status, message);
      throw new ExternalServiceError('Translation provider error', response.status);
    }

    const data = await response.json();
    const segments = Array.isArray(data?.[0]) ? data[0] : [];
    const translatedText = segments
      .map((segment: unknown) => (Array.isArray(segment) && typeof segment[0] === 'string' ? segment[0] : ''))
      .join('')
      .trim();

    if (!translatedText) {
      throw new ExternalServiceError('No translation returned');
    }

    const detectedSourceLang = typeof data?.[2] === 'string' && SUPPORTED_LANGUAGES.has(data[2]) ? data[2] : null;

    return NextResponse.json({
      translatedText,
      detectedSourceLang,
    });
  } catch (error) {
    console.error('Translation error:', error);
    const { response, status } = createErrorResponse(error, 'Translation failed');
    return NextResponse.json(response, { status });
  }
}
