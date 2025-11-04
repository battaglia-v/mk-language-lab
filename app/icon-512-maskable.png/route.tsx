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
            width: 240,
            height: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top speaker */}
          <div
            style={{
              position: 'absolute',
              top: -73,
              width: 192,
              height: 64,
              borderRadius: 32,
              background: 'linear-gradient(135deg, #f8f9fb 0%, #d9dde7 100%)',
              border: '5px solid rgba(255, 255, 255, 0.28)',
              boxShadow: '0 26px 38px rgba(0, 0, 0, 0.35)',
            }}
          />

          {/* Top reflection */}
          <div
            style={{
              position: 'absolute',
              top: -16,
              width: 240,
              height: 42,
              borderRadius: 21,
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
              borderRadius: 54,
              background: 'linear-gradient(165deg, #ff5a2c 0%, #f03819 60%, #ff8042 100%)',
              border: '8px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 45px 60px rgba(5, 7, 15, 0.55)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top bar */}
            <div
              style={{
                position: 'absolute',
                top: 32,
                left: 45,
                right: 45,
                height: 13,
                borderRadius: 6,
                background: 'rgba(255, 255, 255, 0.35)',
              }}
            />

            {/* Second bar */}
            <div
              style={{
                position: 'absolute',
                top: 58,
                left: 51,
                right: 51,
                height: 10,
                borderRadius: 5,
                background: 'rgba(255, 255, 255, 0.18)',
              }}
            />

            {/* Content card */}
            <div
              style={{
                position: 'absolute',
                top: 102,
                left: 38,
                right: 38,
                height: 121,
                borderRadius: 35,
                background: 'linear-gradient(145deg, #0d111f, #161d2c)',
                border: '2px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 22px 38px rgba(6, 8, 16, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 19,
              }}
            >
              <div
                style={{
                  width: '70%',
                  height: 10,
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #ff753e, #ff9660)',
                }}
              />
              <div
                style={{
                  width: '54%',
                  height: 10,
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #37fca2, #40d2ff)',
                }}
              />
              <div
                style={{
                  width: '62%',
                  height: 10,
                  borderRadius: 5,
                  background: 'linear-gradient(90deg, #ffd463, #ffe489)',
                }}
              />
            </div>

            {/* Bottom shadow */}
            <div
              style={{
                position: 'absolute',
                bottom: -29,
                left: 35,
                right: 35,
                height: 54,
                borderRadius: 29,
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
