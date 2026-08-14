import { ImageResponse } from 'next/og';
import { SITE_NAME, SITE_TAGLINE_EN, SITE_TAGLINE_ZH } from '@/lib/seo';

export const runtime = 'edge';
export const alt = `${SITE_NAME} — ${SITE_TAGLINE_ZH}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(145deg, #edf2f7 0%, #d4e5f6 45%, #e8eef5 100%)',
          color: '#1a1a2e',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 16,
            fontSize: 28,
            fontWeight: 700,
            letterSpacing: '-0.02em',
          }}
        >
          <div
            style={{
              width: 48,
              height: 48,
              borderRadius: 14,
              background: 'linear-gradient(135deg, #5b8def 0%, #3d6fd4 100%)',
            }}
          />
          {SITE_NAME}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              maxWidth: 980,
            }}
          >
            {SITE_TAGLINE_ZH}
          </div>
          <div style={{ fontSize: 32, color: '#4a5568', fontWeight: 600 }}>
            {SITE_TAGLINE_EN}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 18px',
              borderRadius: 999,
              background: '#5b8def',
              color: 'white',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            Low Carb
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 18px',
              borderRadius: 999,
              background: '#f59e42',
              color: 'white',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            High Carb
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '10px 18px',
              borderRadius: 999,
              background: 'rgba(26,26,46,0.08)',
              color: '#1a1a2e',
              fontSize: 22,
              fontWeight: 700,
            }}
          >
            PWA · Cloud Sync
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
