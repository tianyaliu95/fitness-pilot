import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('intake');

export default function IntakeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
