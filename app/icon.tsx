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
          background: 'linear-gradient(135deg, #0a0e17 0%, #1a1f2e 100%)',
        }}
      >
        {/* Modern, clean Ajvar jar */}
        <div
          style={{
            position: 'relative',
            width: 120,
            height: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Jar Lid - Sleek and minimal */}
          <div
            style={{
              position: 'absolute',
              top: 0,
              width: 100,
              height: 24,
              borderRadius: '12px',
              background: 'linear-gradient(180deg, #E8EBF0 0%, #CDD2DB 50%, #B4BAC7 100%)',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            }}
          />

          {/* Lid shine */}
          <div
            style={{
              position: 'absolute',
              top: 4,
              width: 70,
              height: 8,
              borderRadius: '6px',
              background: 'rgba(255, 255, 255, 0.35)',
              opacity: 0.8,
            }}
          />

          {/* Jar Body - Premium red */}
          <div
            style={{
              position: 'absolute',
              top: 22,
              width: 110,
              height: 128,
              borderRadius: '28px',
              background: 'linear-gradient(165deg, #FF6B47 0%, #F04122 50%, #D63616 100%)',
              boxShadow: '0 12px 24px rgba(0, 0, 0, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Glass reflection */}
            <div
              style={{
                position: 'absolute',
                top: 12,
                left: 12,
                width: 86,
                height: 52,
                borderRadius: '20px',
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0))',
                opacity: 0.6,
              }}
            />

            {/* Label - Clean and modern */}
            <div
              style={{
                width: 72,
                height: 58,
                borderRadius: '10px',
                background: 'linear-gradient(180deg, #FAFBFC 0%, #E8EBF0 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
              }}
            >
              {/* Label lines - minimal */}
              <div
                style={{
                  width: 52,
                  height: 5,
                  borderRadius: '3px',
                  background: 'rgba(13, 17, 31, 0.75)',
                }}
              />
              <div
                style={{
                  width: 44,
                  height: 4,
                  borderRadius: '2px',
                  background: 'rgba(13, 17, 31, 0.5)',
                }}
              />
              <div
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: '2px',
                  background: 'rgba(13, 17, 31, 0.45)',
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
