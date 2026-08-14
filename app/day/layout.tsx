import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('day');

export default function DayLayout({ children }: { children: React.ReactNode }) {
  return children;
}
