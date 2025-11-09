import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

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
        }}
      >
        {/* Ajvar jar simplified for 32x32 favicon */}
        <div
          style={{
            width: 18,
            height: 22,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Jar lid */}
          <div
            style={{
              width: 16,
              height: 3,
              borderRadius: '1px',
              background: 'linear-gradient(135deg, #CDD2DB 0%, #A8ADB8 100%)',
              marginBottom: 1,
            }}
          />

          {/* Jar body */}
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: '4px',
              background: '#E63E2A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}
          >
            {/* Glass shine effect */}
            <div
              style={{
                position: 'absolute',
                top: 2,
                left: 2,
                width: 7,
                height: 10,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.25)',
              }}
            />

            {/* Label */}
            <div
              style={{
                width: 10,
                height: 8,
                borderRadius: '2px',
                background: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 1,
              }}
            >
              {/* Label lines */}
              <div
                style={{
                  width: 7,
                  height: 1,
                  borderRadius: '1px',
                  background: 'rgba(44, 62, 80, 0.8)',
                }}
              />
              <div
                style={{
                  width: 6,
                  height: 1,
                  borderRadius: '1px',
                  background: 'rgba(44, 62, 80, 0.6)',
                }}
              />
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
