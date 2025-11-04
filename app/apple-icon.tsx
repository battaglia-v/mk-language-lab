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
          background: 'linear-gradient(140deg, #080b12 0%, #141b28 55%, #0b101c 100%)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 103,
            height: 129,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Top speaker */}
          <div
            style={{
              position: 'absolute',
              top: -32,
              width: 82,
              height: 27,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #f8f9fb 0%, #d9dde7 100%)',
              border: '2px solid rgba(255, 255, 255, 0.28)',
              boxShadow: '0 11px 17px rgba(0, 0, 0, 0.35)',
            }}
          />

          {/* Top reflection */}
          <div
            style={{
              position: 'absolute',
              top: -7,
              width: 103,
              height: 18,
              borderRadius: 9,
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
              borderRadius: 23,
              background: 'linear-gradient(165deg, #ff5a2c 0%, #f03819 60%, #ff8042 100%)',
              border: '3px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 19px 26px rgba(5, 7, 15, 0.55)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {/* Top bar */}
            <div
              style={{
                position: 'absolute',
                top: 14,
                left: 19,
                right: 19,
                height: 5,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.35)',
              }}
            />

            {/* Second bar */}
            <div
              style={{
                position: 'absolute',
                top: 25,
                left: 22,
                right: 22,
                height: 4,
                borderRadius: 2,
                background: 'rgba(255, 255, 255, 0.18)',
              }}
            />

            {/* Content card */}
            <div
              style={{
                position: 'absolute',
                top: 44,
                left: 16,
                right: 16,
                height: 52,
                borderRadius: 15,
                background: 'linear-gradient(145deg, #0d111f, #161d2c)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 10px 17px rgba(6, 8, 16, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
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
                bottom: -12,
                left: 15,
                right: 15,
                height: 23,
                borderRadius: 12,
                background: 'linear-gradient(180deg, rgba(7, 8, 15, 0.45), rgba(7, 8, 15, 0))',
              }}
            />
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
