import React from 'react';
import DayReaderClient from './DayReaderClient';
import planData from '@/data/readingPlan.json';

export const dynamicParams = false;

export function generateStaticParams() {
  return planData.days.map((d) => ({
    day: d.day.toString(),
  }));
}

export default async function DayPage({
  params,
}: {
  params: Promise<{ day: string }>;
}) {
  const resolvedParams = await params;
  const dayNum = parseInt(resolvedParams.day, 10) || 1;

  return <DayReaderClient day={dayNum} />;
}
