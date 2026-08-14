import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('profile');

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
