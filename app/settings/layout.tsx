import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('settings');

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
