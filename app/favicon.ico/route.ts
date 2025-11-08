import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  // Generate a 32x32 PNG and serve it as ICO
  const response = new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF5A2C 0%, #D63616 100%)',
        }}
      >
        {/* Simple jar silhouette for 32x32 */}
        <div
          style={{
            width: 20,
            height: 24,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Lid */}
          <div
            style={{
              width: 18,
              height: 4,
              borderRadius: '2px',
              background: '#FFF',
            }}
          />
          {/* Jar body */}
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: '6px',
              background: '#FFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* "M" letter */}
            <div
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: '#FF5A2C',
                display: 'flex',
              }}
            >
              M
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 32,
      height: 32,
    }
  );

  // Return as ICO format
  return new Response(response.body, {
    headers: {
      'Content-Type': 'image/x-icon',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
