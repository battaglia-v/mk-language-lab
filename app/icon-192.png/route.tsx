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
            width: 110,
            height: 138,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top speaker */}
          <div
            style={{
              position: 'absolute',
              top: -34,
              width: 88,
              height: 29,
              borderRadius: 15,
              background: 'linear-gradient(135deg, #f8f9fb 0%, #d9dde7 100%)',
              border: '2px solid rgba(255, 255, 255, 0.28)',
              boxShadow: '0 12px 18px rgba(0, 0, 0, 0.35)',
            }}
          />

          {/* Top reflection */}
          <div
            style={{
              position: 'absolute',
              top: -7,
              width: 110,
              height: 19,
              borderRadius: 10,
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
              borderRadius: 25,
              background: 'linear-gradient(165deg, #ff5a2c 0%, #f03819 60%, #ff8042 100%)',
              border: '4px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 21px 28px rgba(5, 7, 15, 0.55)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top bar */}
            <div
              style={{
                position: 'absolute',
                top: 15,
                left: 21,
                right: 21,
                height: 6,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.35)',
              }}
            />

            {/* Second bar */}
            <div
              style={{
                position: 'absolute',
                top: 27,
                left: 24,
                right: 24,
                height: 4,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.18)',
              }}
            />

            {/* Content card */}
            <div
              style={{
                position: 'absolute',
                top: 47,
                left: 18,
                right: 18,
                height: 56,
                borderRadius: 16,
                background: 'linear-gradient(145deg, #0d111f, #161d2c)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 10px 18px rgba(6, 8, 16, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 9,
              }}
            >
              <div
                style={{
                  width: '70%',
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #ff753e, #ff9660)',
                }}
              />
              <div
                style={{
                  width: '54%',
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #37fca2, #40d2ff)',
                }}
              />
              <div
                style={{
                  width: '62%',
                  height: 4,
                  borderRadius: 2,
                  background: 'linear-gradient(90deg, #ffd463, #ffe489)',
                }}
              />
            </div>

            {/* Bottom shadow */}
            <div
              style={{
                position: 'absolute',
                bottom: -13,
                left: 16,
                right: 16,
                height: 25,
                borderRadius: 13,
                background: 'linear-gradient(180deg, rgba(7, 8, 15, 0.45), rgba(7, 8, 15, 0))',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      width: 192,
      height: 192,
    }
  );
}
