'use client';

import { useParams } from 'next/navigation';
import { DayDetail } from '@/components/DayDetail';
import { buildDayInfo } from '@/lib/day-info';
import { useAppState } from '@/lib/storage';

export default function DayPage() {
  const params = useParams();
  const date = params.date as string;
  const { state } = useAppState();
  const day = buildDayInfo(date, state);

  return <DayDetail day={day} />;
}
