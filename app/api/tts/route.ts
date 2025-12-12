import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient, protos } from '@google-cloud/text-to-speech';
import { ValidationError, createErrorResponse } from '@/lib/errors';

// Voice configurations
// Note: Macedonian is not supported by Google Cloud TTS, so we use Serbian (sr-RS) 
// as the closest linguistic match. Serbian Chirp3-HD voices sound natural and are
// mutually intelligible with Macedonian speakers.
const VOICE_CONFIG = {
  mk: {
    languageCode: 'sr-RS', // Serbian as fallback for Macedonian
    name: 'sr-RS-Chirp3-HD-Aoede', // Female, natural-sounding
    alternates: ['sr-RS-Chirp3-HD-Charon', 'sr-RS-Chirp3-HD-Fenrir'], // Male options
  },
  en: {
    languageCode: 'en-US',
    name: 'en-US-Neural2-J', // Male, natural
    alternates: ['en-US-Neural2-F', 'en-US-Wavenet-D'], // Female, alternate male
  },
} as const;

type SupportedLanguage = keyof typeof VOICE_CONFIG;

const MAX_TEXT_LENGTH = 5000;

let ttsClient: TextToSpeechClient | null | undefined;

const parseCredentials = (value: string) => {
  try {
    return JSON.parse(value);
  } catch (error) {
    try {
      const decoded = Buffer.from(value, 'base64').toString('utf-8');
      const cleaned = decoded.replace(/^['"]|['"]$/g, '');
      return JSON.parse(cleaned);
    } catch {
      throw error;
    }
  }
};

const getTTSClient = (): TextToSpeechClient | null => {
  if (ttsClient !== undefined) {
    return ttsClient;
  }

  const projectId = process.env.GOOGLE_PROJECT_ID;
  const keyPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const jsonCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON;

  if (!projectId) {
    ttsClient = null;
    return ttsClient;
  }

  try {
    if (jsonCredentials) {
      const credentials = parseCredentials(jsonCredentials);
      ttsClient = new TextToSpeechClient({ projectId, credentials });
      return ttsClient;
    }

    if (keyPath) {
      ttsClient = new TextToSpeechClient({ projectId, keyFilename: keyPath });
      return ttsClient;
    }
  } catch (error) {
    console.error('Failed to configure Google TTS client:', error);
  }

  ttsClient = null;
  return ttsClient;
};

class TTSConfigError extends Error {
  name = 'TTSConfigError';
}

class TTSServiceError extends Error {
  name = 'TTSServiceError';
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text, language = 'mk', voiceGender = 'female' } = body;

    // Validation
    if (!text || typeof text !== 'string') {
      throw new ValidationError('Text is required and must be a string');
    }

    if (text.length > MAX_TEXT_LENGTH) {
      throw new ValidationError(`Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
    }

    const lang = language.toLowerCase() as SupportedLanguage;
    if (!VOICE_CONFIG[lang]) {
      throw new ValidationError('Language must be "mk" or "en"');
    }

    const client = getTTSClient();
    if (!client) {
      throw new TTSConfigError(
        'Google Cloud TTS not configured. Set GOOGLE_PROJECT_ID and credentials.'
      );
    }

    // Select voice based on language and gender preference
    const voiceConfig = VOICE_CONFIG[lang];
    const voiceName = voiceGender === 'male' && voiceConfig.alternates.length > 0
      ? voiceConfig.alternates[0]
      : voiceConfig.name;

    // Build the TTS request
    const ttsRequest: protos.google.cloud.texttospeech.v1.ISynthesizeSpeechRequest = {
      input: { text },
      voice: {
        languageCode: voiceConfig.languageCode,
        name: voiceName,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: 0.95, // Slightly slower for language learning
        pitch: 0, // Default pitch
        effectsProfileId: ['small-bluetooth-speaker-class-device'], // Optimized for mobile
      },
    };

    // Generate speech
    const [response] = await client.synthesizeSpeech(ttsRequest);

    if (!response.audioContent) {
      throw new TTSServiceError('No audio content returned from TTS service');
    }

    // Return audio as base64 or binary
    const audioBuffer = Buffer.isBuffer(response.audioContent)
      ? response.audioContent
      : Buffer.from(response.audioContent);

    // Return as audio/mpeg with appropriate headers
    return new NextResponse(new Uint8Array(audioBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache for 24 hours
        'X-Voice-Used': voiceName,
        'X-Language-Code': voiceConfig.languageCode,
      },
    });
  } catch (error) {
    console.error('[TTS API] Error:', error);

    if (error instanceof ValidationError) {
      return createErrorResponse(error);
    }

    if (error instanceof TTSConfigError) {
      return NextResponse.json(
        { error: error.message, code: 'TTS_NOT_CONFIGURED' },
        { status: 503 }
      );
    }

    if (error instanceof TTSServiceError) {
      return NextResponse.json(
        { error: error.message, code: 'TTS_SERVICE_ERROR' },
        { status: 500 }
      );
    }

    // Handle Google Cloud errors
    if (error instanceof Error) {
      const message = error.message || 'TTS synthesis failed';
      return NextResponse.json(
        { error: message, code: 'TTS_ERROR' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: 'An unexpected error occurred', code: 'INTERNAL_ERROR' },
      { status: 500 }
    );
  }
}

// GET endpoint for simple text-to-speech with query params
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const text = searchParams.get('text');
  const language = searchParams.get('lang') || 'mk';
  const voiceGender = searchParams.get('gender') || 'female';

  if (!text) {
    return NextResponse.json(
      { error: 'Text query parameter is required' },
      { status: 400 }
    );
  }

  // Reuse POST logic by creating a mock request body
  const mockRequest = {
    json: async () => ({ text, language, voiceGender }),
  } as NextRequest;

  return POST(mockRequest);
}
