import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Македонски • MK Language Lab - Learn Macedonian';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(140deg, #080b12 0%, #141b28 55%, #0b101c 100%)',
          position: 'relative',
        }}
      >
        {/* Main content */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 40,
          }}
        >
          {/* Phone illustration */}
          <div
            style={{
              position: 'relative',
              width: 200,
              height: 250,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Top speaker */}
            <div
              style={{
                position: 'absolute',
                top: -60,
                width: 160,
                height: 53,
                borderRadius: 27,
                background: 'linear-gradient(135deg, #f8f9fb 0%, #d9dde7 100%)',
                border: '4px solid rgba(255, 255, 255, 0.28)',
                boxShadow: '0 21px 32px rgba(0, 0, 0, 0.35)',
              }}
            />

            {/* Phone body */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                borderRadius: 45,
                background: 'linear-gradient(165deg, #ff5a2c 0%, #f03819 60%, #ff8042 100%)',
                border: '7px solid rgba(255, 255, 255, 0.1)',
                boxShadow: '0 37px 50px rgba(5, 7, 15, 0.55)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 27,
                  left: 37,
                  right: 37,
                  height: 11,
                  borderRadius: 5,
                  background: 'rgba(255, 255, 255, 0.35)',
                }}
              />

              {/* Second bar */}
              <div
                style={{
                  position: 'absolute',
                  top: 48,
                  left: 43,
                  right: 43,
                  height: 8,
                  borderRadius: 4,
                  background: 'rgba(255, 255, 255, 0.18)',
                }}
              />

              {/* Content card */}
              <div
                style={{
                  position: 'absolute',
                  top: 85,
                  left: 32,
                  right: 32,
                  height: 101,
                  borderRadius: 29,
                  background: 'linear-gradient(145deg, #0d111f, #161d2c)',
                  border: '1.5px solid rgba(255, 255, 255, 0.06)',
                  boxShadow: '0 19px 32px rgba(6, 8, 16, 0.55)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 16,
                }}
              >
                <div
                  style={{
                    width: '70%',
                    height: 8,
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #ff753e, #ff9660)',
                  }}
                />
                <div
                  style={{
                    width: '54%',
                    height: 8,
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #37fca2, #40d2ff)',
                  }}
                />
                <div
                  style={{
                    width: '62%',
                    height: 8,
                    borderRadius: 4,
                    background: 'linear-gradient(90deg, #ffd463, #ffe489)',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Text content */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 16,
              marginTop: 20,
            }}
          >
            <h1
              style={{
                fontSize: 72,
                fontWeight: 700,
                color: '#ffffff',
                margin: 0,
                textAlign: 'center',
                letterSpacing: '-0.02em',
              }}
            >
              Македонски • MK Language Lab
            </h1>
            <p
              style={{
                fontSize: 32,
                color: '#a0a0a0',
                margin: 0,
                textAlign: 'center',
                maxWidth: 900,
              }}
            >
              Learn Macedonian with AI-powered tutoring, translation, and interactive lessons
            </p>
          </div>
        </div>

        {/* Badge */}
        <div
          style={{
            position: 'absolute',
            bottom: 40,
            right: 60,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '16px 24px',
            background: 'rgba(255, 90, 44, 0.15)',
            border: '2px solid rgba(255, 90, 44, 0.3)',
            borderRadius: 50,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: 6,
              background: '#ff5a2c',
            }}
          />
          <span
            style={{
              fontSize: 24,
              color: '#ff8a6b',
              fontWeight: 600,
            }}
          >
            Free & Open Source
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
