import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(140deg, #080b12 0%, #141b28 55%, #0b101c 100%)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 300,
            height: 376,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top speaker */}
          <div
            style={{
              position: 'absolute',
              top: -92,
              width: 240,
              height: 80,
              borderRadius: 40,
              background: 'linear-gradient(135deg, #f8f9fb 0%, #d9dde7 100%)',
              border: '6px solid rgba(255, 255, 255, 0.28)',
              boxShadow: '0 32px 48px rgba(0, 0, 0, 0.35)',
            }}
          />

          {/* Top reflection */}
          <div
            style={{
              position: 'absolute',
              top: -20,
              width: 300,
              height: 52,
              borderRadius: 26,
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0))',
              opacity: 0.65,
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
              borderRadius: 68,
              background: 'linear-gradient(165deg, #ff5a2c 0%, #f03819 60%, #ff8042 100%)',
              border: '10px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 56px 76px rgba(5, 7, 15, 0.55)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top bar */}
            <div
              style={{
                position: 'absolute',
                top: 40,
                left: 56,
                right: 56,
                height: 16,
                borderRadius: 8,
                background: 'rgba(255, 255, 255, 0.35)',
              }}
            />

            {/* Second bar */}
            <div
              style={{
                position: 'absolute',
                top: 72,
                left: 64,
                right: 64,
                height: 12,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.18)',
              }}
            />

            {/* Content card */}
            <div
              style={{
                position: 'absolute',
                top: 128,
                left: 48,
                right: 48,
                height: 152,
                borderRadius: 44,
                background: 'linear-gradient(145deg, #0d111f, #161d2c)',
                border: '2px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 28px 48px rgba(6, 8, 16, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
              }}
            >
              <div
                style={{
                  width: '70%',
                  height: 12,
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #ff753e, #ff9660)',
                }}
              />
              <div
                style={{
                  width: '54%',
                  height: 12,
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #37fca2, #40d2ff)',
                }}
              />
              <div
                style={{
                  width: '62%',
                  height: 12,
                  borderRadius: 6,
                  background: 'linear-gradient(90deg, #ffd463, #ffe489)',
                }}
              />
            </div>

            {/* Bottom shadow */}
            <div
              style={{
                position: 'absolute',
                bottom: -36,
                left: 44,
                right: 44,
                height: 68,
                borderRadius: 36,
                background: 'linear-gradient(180deg, rgba(7, 8, 15, 0.45), rgba(7, 8, 15, 0))',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
    }
  );
}
