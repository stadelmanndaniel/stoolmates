'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

type TimeFrame = 'daily' | 'weekly';

interface LeaderboardEntry {
  id: string;
  username: string;
  checkInCount: number;
  isCurrentUser: boolean;
}

export default function LeaderboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [timeframe, setTimeframe] = useState<TimeFrame>('daily');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchLeaderboard();
    }
  }, [session, timeframe]);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await fetch(`/api/leaderboard?timeframe=${timeframe}`);
      const data = await response.json();
      
      if (response.ok) {
        setLeaderboard(data.leaderboard);
      } else {
        setError(data.error || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      setError('An error occurred while fetching the leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  const getTimeframeButtonClass = (type: TimeFrame) => {
    return type === timeframe
      ? 'px-4 py-2 rounded-md text-sm font-medium bg-gradient-to-r from-violet-500 to-fuchsia-600 text-white shadow-lg shadow-violet-500/30'
      : 'px-4 py-2 rounded-md text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200';
  };

  const getEntryClass = (isCurrentUser: boolean) => {
    return isCurrentUser
      ? 'p-3 flex items-center bg-gradient-to-r from-violet-50 to-fuchsia-50'
      : 'p-3 flex items-center hover:bg-gray-50 transition-colors duration-200';
  };

  const getUsernameClass = (isCurrentUser: boolean) => {
    return isCurrentUser
      ? 'text-base font-medium bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent'
      : 'text-base font-medium text-gray-900';
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold italic text-gray-900">leaderboard</h2>
              <div className="flex space-x-2">
                <button
                  onClick={() => setTimeframe('daily')}
                  className={getTimeframeButtonClass('daily')}
                  disabled={loading}
                >
                  daily
                </button>
                <button
                  onClick={() => setTimeframe('weekly')}
                  className={getTimeframeButtonClass('weekly')}
                  disabled={loading}
                >
                  weekly
                </button>
              </div>
            </div>
          </div>

          {error ? (
            <div className="p-4">
              <div className="text-red-600">{error}</div>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {loading ? (
                // Loading skeleton with same number of entries as current leaderboard
                [...Array(leaderboard.length || 3)].map((_, index) => (
                  <div key={index} className="p-3 flex items-center animate-pulse">
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="flex-grow ml-3">
                      <div className="h-5 bg-gray-200 rounded w-1/3"></div>
                    </div>
                    <div className="flex-shrink-0 w-6 h-6 bg-gray-200 rounded-full"></div>
                  </div>
                ))
              ) : (
                leaderboard.map((entry, index) => (
                  <div
                    key={entry.id}
                    className={getEntryClass(entry.isCurrentUser)}
                  >
                    <div className="flex-shrink-0 w-6 text-base font-bold text-gray-500">
                      {index + 1}
                    </div>
                    <div className="flex-grow">
                      <span className={getUsernameClass(entry.isCurrentUser)}>
                        {entry.username}
                      </span>
                    </div>
                    <div className="flex-shrink-0 text-xl font-bold bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                      {entry.checkInCount}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 