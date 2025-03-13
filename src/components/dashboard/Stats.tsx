'use client';

import React from 'react';
import { useSession } from 'next-auth/react';

interface StatsProps {
  totalCheckIns: number;
  totalDuration: string;
  averageDuration: string;
}

export default function Stats({ totalCheckIns, totalDuration, averageDuration }: StatsProps) {
  const { data: session } = useSession();

  if (!session?.user) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500">Total Check-ins</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{totalCheckIns}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500">Total Duration</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{totalDuration}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h3 className="text-sm font-medium text-gray-500">Average Duration</h3>
        <p className="mt-2 text-3xl font-bold text-gray-900">{averageDuration}</p>
      </div>
    </div>
  );
} 