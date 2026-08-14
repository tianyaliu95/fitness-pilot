import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('training');

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
