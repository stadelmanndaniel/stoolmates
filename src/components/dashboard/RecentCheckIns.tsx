'use client';

import React from 'react';

interface CheckIn {
  id: string;
  startTime: string;
  endTime: string | null;
  duration: number | null;
}

interface RecentCheckInsProps {
  checkIns: CheckIn[];
}

export default function RecentCheckIns({ checkIns }: RecentCheckInsProps) {
  const formatDuration = (duration: number) => {
    const minutes = Math.floor(duration / 60);
    const seconds = duration % 60;
    return `${minutes}m ${seconds}s`;
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg font-medium leading-6 text-gray-900">Recent Check-ins</h3>
      </div>
      <div className="border-t border-gray-200">
        <ul role="list" className="divide-y divide-gray-200">
          {checkIns.length === 0 ? (
            <li className="px-4 py-4 sm:px-6">
              <p className="text-gray-500 text-center">No recent check-ins</p>
            </li>
          ) : (
            checkIns.map((checkIn) => (
              <li key={checkIn.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-indigo-600">
                      {formatTime(checkIn.startTime)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {checkIn.endTime ? formatTime(checkIn.endTime) : 'Active'}
                    </p>
                  </div>
                  {checkIn.duration && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {formatDuration(checkIn.duration)}
                    </span>
                  )}
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
} 