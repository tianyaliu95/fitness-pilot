import type { Metadata } from 'next';
import { HomeClient } from '@/components/HomeClient';
import { buildPageMetadata } from '@/lib/seo';

export const metadata: Metadata = buildPageMetadata('home');

export default function Home() {
  return <HomeClient />;
}
