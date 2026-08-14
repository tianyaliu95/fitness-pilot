import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import { AppShell } from '@/components/AppShell';
import { JsonLd } from '@/components/JsonLd';
import {
  buildOrganizationJsonLd,
  buildRootMetadata,
  buildSoftwareApplicationJsonLd,
  buildWebsiteJsonLd,
} from '@/lib/seo';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = buildRootMetadata();

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#e8eef5' },
    { media: '(prefers-color-scheme: dark)', color: '#e8eef5' },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN" className={outfit.variable}>
      <body className="min-h-screen font-sans">
        <JsonLd
          data={[
            buildWebsiteJsonLd(),
            buildSoftwareApplicationJsonLd(),
            buildOrganizationJsonLd(),
          ]}
        />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
