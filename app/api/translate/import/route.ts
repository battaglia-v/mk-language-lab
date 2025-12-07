import { NextRequest, NextResponse } from 'next/server';
import {
  ValidationError,
  ExternalServiceError,
  createErrorResponse,
} from '@/lib/errors';
import { translateRateLimit, checkRateLimit } from '@/lib/rate-limit';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Use dynamic import for pdf-parse since it's CommonJS
const getPdfParse = async () => {
  const pdfParse = await import('pdf-parse');
  // @ts-ignore - pdf-parse has complex module exports
  return pdfParse.default || pdfParse;
};

const MAX_FILE_SIZE = 1024 * 1024; // 1MB
const MAX_TEXT_LENGTH = 50000; // 50k characters

// Extract text content from HTML
function extractTextFromHTML(html: string): string {
  // Remove script and style tags
  let text = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  text = text.replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '');

  // Remove HTML tags
  text = text.replace(/<[^>]+>/g, ' ');

  // Decode HTML entities
  text = text
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–');

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

// Extract title from HTML
function extractTitleFromHTML(html: string): string {
  const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (titleMatch && titleMatch[1]) {
    return titleMatch[1].trim();
  }

  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match && h1Match[1]) {
    return extractTextFromHTML(h1Match[1]).trim();
  }

  return 'Imported Text';
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? '127.0.0.1';
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

    const contentType = request.headers.get('content-type') || '';

    // Handle URL import
    if (contentType.includes('application/json')) {
      const body = await request.json();
      const type = body?.type;
      const url = body?.url;

      if (type === 'url') {
        if (!url || typeof url !== 'string') {
          throw new ValidationError('Missing or invalid URL');
        }

        // Validate URL format
        let parsedUrl: URL;
        try {
          parsedUrl = new URL(url);
        } catch {
          throw new ValidationError('Invalid URL format');
        }

        // Only allow http/https
        if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
          throw new ValidationError('Only HTTP/HTTPS URLs are supported');
        }

        // Fetch the URL content
        try {
          const response = await fetch(url, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (compatible; MKLanguageLab/1.0)',
            },
            signal: AbortSignal.timeout(10000), // 10s timeout
          });

          if (!response.ok) {
            throw new ExternalServiceError(`Failed to fetch URL: ${response.statusText}`, response.status);
          }

          const contentType = response.headers.get('content-type') || '';

          // Only handle text/html content
          if (!contentType.includes('text/html')) {
            throw new ValidationError('URL must return HTML content');
          }

          const html = await response.text();

          if (html.length > MAX_TEXT_LENGTH * 10) {
            throw new ValidationError('URL content is too large');
          }

          const text = extractTextFromHTML(html);

          if (!text) {
            throw new ValidationError('No text content found in URL');
          }

          if (text.length > MAX_TEXT_LENGTH) {
            throw new ValidationError(`Extracted text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
          }

          const title = extractTitleFromHTML(html);
          const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;

          return NextResponse.json({
            text,
            metadata: {
              source: url,
              title,
              wordCount,
              type: 'url',
            },
          });
        } catch (error) {
          if (error instanceof ValidationError || error instanceof ExternalServiceError) {
            throw error;
          }
          console.error('URL fetch error:', error);
          throw new ExternalServiceError('Failed to fetch URL content');
        }
      }

      throw new ValidationError('Invalid import type');
    }

    // Handle file upload (multipart/form-data)
    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      // @ts-ignore - FormData.get() exists at runtime but TypeScript types are incomplete
      const file = formData.get('file');

      if (!file || !(file instanceof File)) {
        throw new ValidationError('Missing or invalid file');
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        throw new ValidationError(`File size exceeds maximum of ${MAX_FILE_SIZE / 1024}KB`);
      }

      // Check file type
      const isPDF = file.type.includes('application/pdf') || file.name.endsWith('.pdf');
      const isTxt = file.type.includes('text/plain') || file.name.endsWith('.txt');

      if (!isPDF && !isTxt) {
        throw new ValidationError('Only .txt and .pdf files are supported');
      }

      let text: string;

      // Handle PDF files
      if (isPDF) {
        try {
          const pdfParse = await getPdfParse();
          const arrayBuffer = await file.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);
          const data = await pdfParse(buffer);
          text = data.text;

          if (!text || text.trim().length === 0) {
            throw new ValidationError('No text content found in PDF');
          }
        } catch (error) {
          console.error('PDF parsing error:', error);
          throw new ValidationError('Failed to parse PDF file. Please ensure it contains extractable text.');
        }
      } else {
        // Handle text files
        text = await file.text();

        if (!text || text.trim().length === 0) {
          throw new ValidationError('File is empty');
        }
      }

      if (text.length > MAX_TEXT_LENGTH) {
        throw new ValidationError(`File content exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
      }

      const wordCount = text.trim().split(/\s+/).filter(w => w.length > 0).length;

      return NextResponse.json({
        text: text.trim(),
        metadata: {
          source: file.name,
          title: file.name.replace(/\.[^/.]+$/, ''), // Remove extension
          wordCount,
          type: 'file',
        },
      });
    }

    throw new ValidationError('Invalid content type. Use application/json for URLs or multipart/form-data for files');
  } catch (error) {
    console.error('Import error:', error);
    const { response, status } = createErrorResponse(error, 'Import failed');
    return NextResponse.json(response, { status });
  }
}
