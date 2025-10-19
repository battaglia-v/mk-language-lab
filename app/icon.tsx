import { ImageResponse } from 'next/og';

export const size = {
  width: 256,
  height: 256,
};

export const contentType = 'image/png';

const ACTIVE_PIXELS = new Set([
  '0-2',
  '0-3',
  '1-1',
  '1-2',
  '1-3',
  '1-4',
  '2-0',
  '2-1',
  '2-3',
  '2-5',
  '3-0',
  '3-2',
  '3-4',
  '3-5',
  '4-1',
  '4-2',
  '4-3',
  '4-4',
  '5-2',
  '5-3',
]);

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
          background: 'radial-gradient(circle at 30% 30%, #ffede2 0%, #ffe3d5 35%, #1a1a24 100%)',
          borderRadius: 32,
        }}
      >
        <div
          style={{
            position: 'relative',
            width: 148,
            height: 188,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: 28,
            background: 'linear-gradient(160deg, #f34711 0%, #ff7433 55%, #f34711 100%)',
            boxShadow:
              '0 18px 28px rgba(227, 61, 6, 0.45), inset 0 0 0 4px rgba(255, 255, 255, 0.18), inset 0 0 0 12px rgba(0, 0, 0, 0.08)',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: -48,
              width: 164,
              height: 68,
              borderRadius: 20,
              background: 'linear-gradient(120deg, #101523 0%, #2f3348 55%, #111627 100%)',
              boxShadow:
                '0 12px 18px rgba(16, 21, 35, 0.45), inset 0 0 0 6px rgba(255, 255, 255, 0.08)',
            }}
          />

          <div
            style={{
              position: 'absolute',
              top: -64,
              width: 112,
              height: 32,
              borderRadius: 16,
              background: 'linear-gradient(90deg, #fece61 0%, #ffe28d 50%, #fece61 100%)',
              boxShadow: '0 6px 12px rgba(255, 190, 64, 0.45)',
            }}
          />

          <div
            style={{
              width: '62%',
              height: '56%',
              borderRadius: 18,
              background: 'linear-gradient(145deg, rgba(17, 19, 36, 0.92) 0%, rgba(17, 19, 30, 0.78) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow:
                '0 0 0 6px rgba(255, 255, 255, 0.05), inset 0 0 0 4px rgba(255, 255, 255, 0.08)',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: 96,
              }}
            >
              {Array.from({ length: 6 }, (_, row) => (
                <div
                  key={`row-${row}`}
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                  }}
                >
                  {Array.from({ length: 6 }, (_, col) => {
                    const isActive = ACTIVE_PIXELS.has(`${row}-${col}`);
                    const background = isActive
                      ? 'linear-gradient(135deg, #59ffb0 0%, #34d6ff 100%)'
                      : 'rgba(255, 255, 255, 0.06)';

                    const pixelStyle: Record<string, string | number> = {
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      background,
                      margin: 1,
                    };

                    if (isActive) {
                      pixelStyle.boxShadow = '0 2px 4px rgba(52, 214, 255, 0.45)';
                    }

                    return <div key={`${row}-${col}`} style={pixelStyle} />;
                  })}
                </div>
              ))}
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
