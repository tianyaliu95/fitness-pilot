import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('planning');

export default function PlanningLayout({ children }: { children: React.ReactNode }) {
  return children;
}
