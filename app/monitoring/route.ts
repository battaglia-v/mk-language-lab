import { NextRequest, NextResponse } from 'next/server';

/**
 * Sentry tunnel endpoint to proxy requests to Sentry.
 * This helps avoid ad-blockers and content blockers that might block Sentry requests.
 *
 * See: https://docs.sentry.io/platforms/javascript/troubleshooting/#using-the-tunnel-option
 */
export async function POST(request: NextRequest) {
  try {
    const envelope = await request.text();
    const pieces = envelope.split('\n');
    const header = JSON.parse(pieces[0]);

    // Extract DSN from the envelope header
    const { host, project_id } = header.dsn ? parseDsn(header.dsn) : { host: null, project_id: null };

    if (!host || !project_id) {
      return NextResponse.json({ error: 'Invalid DSN' }, { status: 400 });
    }

    // Forward the envelope to Sentry
    const sentryUrl = `https://${host}/api/${project_id}/envelope/`;

    const response = await fetch(sentryUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-sentry-envelope',
      },
      body: envelope,
    });

    if (!response.ok) {
      console.error('Failed to forward to Sentry:', response.status, response.statusText);
      return NextResponse.json({ error: 'Failed to forward to Sentry' }, { status: response.status });
    }

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('Error in Sentry tunnel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

function parseDsn(dsn: string): { host: string; project_id: string } {
  try {
    const url = new URL(dsn);
    const host = url.host;
    const project_id = url.pathname.replace('/', '');
    return { host, project_id };
  } catch {
    return { host: '', project_id: '' };
  }
}
