import { ImageResponse } from 'next/og';

export const size = {
  width: 180,
  height: 180,
};

export const contentType = 'image/png';

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
        {/* Ajvar jar silhouette */}
        <div
          style={{
            width: 90,
            height: 108,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {/* Jar lid */}
          <div
            style={{
              width: 81,
              height: 18,
              borderRadius: '4px',
              background: 'linear-gradient(135deg, #CDD2DB 0%, #A8ADB8 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 2,
            }}
          >
            {/* Lid shine */}
            <div
              style={{
                width: 54,
                height: 5,
                borderRadius: '3px',
                background: 'rgba(255, 255, 255, 0.4)',
              }}
            />
          </div>

          {/* Jar body */}
          <div
            style={{
              width: 90,
              height: 90,
              borderRadius: '14px',
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
                top: 10,
                left: 10,
                width: 36,
                height: 54,
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
              }}
            />

            {/* Label */}
            <div
              style={{
                width: 54,
                height: 45,
                borderRadius: '7px',
                background: 'rgba(255, 255, 255, 0.95)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 5,
              }}
            >
              {/* Label text lines */}
              <div
                style={{
                  width: 36,
                  height: 5,
                  borderRadius: '3px',
                  background: 'rgba(44, 62, 80, 0.8)',
                }}
              />
              <div
                style={{
                  width: 31,
                  height: 4,
                  borderRadius: '2px',
                  background: 'rgba(44, 62, 80, 0.6)',
                }}
              />
              <div
                style={{
                  width: 27,
                  height: 4,
                  borderRadius: '2px',
                  background: 'rgba(44, 62, 80, 0.5)',
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
