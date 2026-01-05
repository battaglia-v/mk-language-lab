import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

/**
 * Favicon (32x32) - Simplified Ajvar jar with М
 * Design: Bold, simple shapes that read well at small sizes
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #FF5A2C 0%, #D63616 100%)',
          borderRadius: '6px',
        }}
      >
        {/* Simplified Ajvar jar */}
        <div
          style={{
            width: 22,
            height: 26,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Jar lid - simplified */}
          <div
            style={{
              width: 18,
              height: 4,
              borderRadius: '1px',
              background: 'linear-gradient(180deg, #E8EAED 0%, #B8BDC6 100%)',
              marginBottom: 1,
            }}
          />

          {/* Jar body */}
          <div
            style={{
              width: 22,
              height: 21,
              borderRadius: '4px',
              background: '#E63E2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Label with М */}
            <div
              style={{
                width: 14,
                height: 12,
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 800,
                  color: '#2C3E50',
                  fontFamily: 'system-ui, sans-serif',
                }}
              >
                М
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
