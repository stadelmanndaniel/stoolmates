'use client';

import React from 'react';

interface StatsProps {
  dailyCount: number;
  weeklyCount: number;
  averageDuration: number;
}

export default function Stats({ dailyCount, weeklyCount, averageDuration }: StatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Today's Visits</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{dailyCount}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">This Week's Visits</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">{weeklyCount}</p>
      </div>
      <div className="bg-white p-4 rounded-lg shadow">
        <h3 className="text-sm font-medium text-gray-500">Average Duration</h3>
        <p className="mt-2 text-3xl font-semibold text-indigo-600">
          {averageDuration > 0 ? `${Math.round(averageDuration / 60)}m` : '-'}
        </p>
      </div>
    </div>
  );
} 