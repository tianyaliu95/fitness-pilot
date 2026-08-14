import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('workout-log');

export default function WorkoutLogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
