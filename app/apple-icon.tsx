import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

/**
 * Apple Touch Icon (180x180) - Full detail Ajvar jar with М
 * Design: Traditional Macedonian ajvar jar with learning element
 */
export default function AppleIcon() {
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
        }}
      >
        {/* Ajvar jar with full detail */}
        <div
          style={{
            width: 100,
            height: 120,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Jar lid with shine */}
          <div
            style={{
              width: 85,
              height: 18,
              borderRadius: '4px',
              background: 'linear-gradient(180deg, #E8EAED 0%, #B8BDC6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 3,
            }}
          >
            {/* Lid shine */}
            <div
              style={{
                width: 50,
                height: 6,
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.5)',
              }}
            />
          </div>

          {/* Jar body */}
          <div
            style={{
              width: 100,
              height: 99,
              borderRadius: '14px',
              background: '#E63E2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: 'inset 3px 3px 10px rgba(255, 255, 255, 0.2)',
            }}
          >
            {/* Glass shine effect */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                width: 30,
                height: 50,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.15)',
              }}
            />

            {/* Label with М */}
            <div
              style={{
                width: 60,
                height: 50,
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
              }}
            >
              <span
                style={{
                  fontSize: 36,
                  fontWeight: 700,
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
