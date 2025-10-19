import { ImageResponse } from 'next/og';

export const size = {
  width: 256,
  height: 256,
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
          background: 'linear-gradient(140deg, #080b12 0%, #141b28 55%, #0b101c 100%)',
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 150,
            height: 188,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -46,
              width: 120,
              height: 40,
              borderRadius: 20,
              background: 'linear-gradient(135deg, #f8f9fb 0%, #d9dde7 100%)',
              border: '3px solid rgba(255, 255, 255, 0.28)',
              boxShadow: '0 16px 24px rgba(0, 0, 0, 0.35)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: -10,
              width: 150,
              height: 26,
              borderRadius: 13,
              background: 'linear-gradient(90deg, rgba(255, 255, 255, 0.16), rgba(255, 255, 255, 0))',
              opacity: 0.65,
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              borderRadius: 34,
              background: 'linear-gradient(165deg, #ff5a2c 0%, #f03819 60%, #ff8042 100%)',
              border: '5px solid rgba(255, 255, 255, 0.1)',
              boxShadow: '0 28px 38px rgba(5, 7, 15, 0.55)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 20,
                left: 28,
                right: 28,
                height: 8,
                borderRadius: 4,
                background: 'rgba(255, 255, 255, 0.35)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 36,
                left: 32,
                right: 32,
                height: 6,
                borderRadius: 3,
                background: 'rgba(255, 255, 255, 0.18)',
              }}
            />

            <div
              style={{
                position: 'absolute',
                top: 64,
                left: 24,
                right: 24,
                height: 76,
                borderRadius: 22,
                background: 'linear-gradient(145deg, #0d111f, #161d2c)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                boxShadow: '0 14px 24px rgba(6, 8, 16, 0.55)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: '70%',
                  height: 6,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #ff753e, #ff9660)',
                }}
              />
              <div
                style={{
                  width: '54%',
                  height: 6,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #37fca2, #40d2ff)',
                }}
              />
              <div
                style={{
                  width: '62%',
                  height: 6,
                  borderRadius: 3,
                  background: 'linear-gradient(90deg, #ffd463, #ffe489)',
                }}
              />
            </div>

            <div
              style={{
                position: 'absolute',
                bottom: -18,
                left: 22,
                right: 22,
                height: 34,
                borderRadius: 18,
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
