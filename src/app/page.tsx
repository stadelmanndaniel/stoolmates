'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

// Force a fresh render with a version number
const APP_VERSION = '2.0.0';

interface ShitChatContent {
  content: string;
  type: string;
  source: string;
}

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [currentCheckIn, setCurrentCheckIn] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [checkInTime, setCheckInTime] = useState<Date | null>(null);
  const [mounted, setMounted] = useState(false);
  const [duration, setDuration] = useState<string>('');
  const [ripple, setRipple] = useState<{ x: number; y: number } | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [shitChatContent, setShitChatContent] = useState<ShitChatContent | null>(null);

  const fetchCurrentCheckIn = useCallback(async () => {
    try {
      const response = await fetch('/api/checkins/current', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Version': APP_VERSION,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch current check-in');
      }
      
      const data = await response.json();
      if (data.checkIn) {
        setIsCheckedIn(true);
        setCurrentCheckIn(data.checkIn.id);
        setCheckInTime(new Date(data.checkIn.startTime));
      }
    } catch (error) {
      console.error('Error fetching current check-in:', error);
    }
  }, []);

  const handleRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setRipple({ x, y });
    setTimeout(() => setRipple(null), 1000);
  };

  const handleCheckIn = async () => {
    if (status !== 'authenticated') {
      setError('You must be logged in to check in');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setIsTransitioning(true);
      
      // Start the timer immediately with the current time
      const now = new Date();
      setCheckInTime(now);
      setIsCheckedIn(true);
      
      // Make the API call in parallel with the animation
      const response = await fetch('/api/checkins', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Version': APP_VERSION,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check in');
      }

      const data = await response.json();
      setCurrentCheckIn(data.checkIn.id);
      
      // Fetch sh*tchat content
      const shitChatResponse = await fetch('/api/shitchat');
      if (shitChatResponse.ok) {
        const shitChatData = await shitChatResponse.json();
        setShitChatContent(shitChatData);
      } else {
        // Set a fallback message if the API call fails
        setShitChatContent({
          content: "Taking a break? Here's a fun fact: The average person spends about 3 years of their life on the toilet!",
          type: "fact",
          source: "fallback"
        });
      }

      router.refresh();
    } catch (error) {
      console.error('Check-in error:', error);
      setError(error instanceof Error ? error.message : 'Failed to check in');
      // Reset the timer if the API call failed
      setIsCheckedIn(false);
      setCheckInTime(null);
    } finally {
      setLoading(false);
      // Wait for the transition animation to complete before hiding it
      setTimeout(() => {
        setIsTransitioning(false);
      }, 1000);
    }
  };

  const handleCheckOut = async () => {
    if (!currentCheckIn) return;

    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`/api/checkins/${currentCheckIn}/checkout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Version': APP_VERSION,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to check out');
      }

      await response.json();
      setIsCheckedIn(false);
      setCurrentCheckIn(null);
      setCheckInTime(null);
      router.refresh();
    } catch (error) {
      console.error('Check-out error:', error);
      setError(error instanceof Error ? error.message : 'Failed to check out');
      // If there's an error, refetch the current check-in status to ensure UI is in sync
      fetchCurrentCheckIn();
    } finally {
      setLoading(false);
    }
  };

  // Add timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isCheckedIn && checkInTime) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = now.getTime() - checkInTime.getTime();
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setDuration(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isCheckedIn, checkInTime]);

  // Initialize component
  useEffect(() => {
    setMounted(true);
  }, []);

  // Handle authentication
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login');
    }
  }, [status, router]);

  // Fetch current check-in when session is available
  useEffect(() => {
    if (session?.user && mounted) {
      fetchCurrentCheckIn();
    }
  }, [session, fetchCurrentCheckIn, mounted]);

  if (!mounted || status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div className="h-[calc(100vh-8rem)] bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 relative overflow-hidden flex flex-col overscroll-none" key={APP_VERSION}>
      {/* Metallic background effect */}
      <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.3)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer"></div>
      
      {/* Transition overlay */}
      {isTransitioning && (
        <div className="fixed inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 z-50 animate-expand-circle">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-white text-2xl font-medium">checking in...</div>
          </div>
        </div>
      )}

      <div className="relative w-full max-w-3xl mx-auto px-4 flex-1 flex flex-col">
        {error && (
          <div className="mb-4 p-4 text-red-700 bg-red-100 rounded-md">
            {error}
          </div>
        )}

        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center">
            {isCheckedIn && shitChatContent && (
              <div className="mt-32 mb-32 w-full max-w-md mx-auto">
                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl p-6 transform transition-all duration-300 ease-out">
                  <div className="flex flex-col items-center">
                    <h3 className="text-xl font-medium text-gray-900 mb-4 italic">sh*tchat of the day</h3>
                    <p className="text-gray-600 text-center">{shitChatContent.content}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col justify-end pb-16">
            <div className="flex flex-col items-center">
              {isCheckedIn && (
                <div className="text-4xl font-mono font-bold italic text-gray-600 mb-8 text-center">
                  {duration}
                </div>
              )}
              {isCheckedIn ? (
                <button
                  onClick={handleCheckOut}
                  disabled={loading}
                  className="w-32 h-32 rounded-full flex items-center justify-center text-lg font-medium text-white bg-gradient-to-br from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-rose-500 disabled:opacity-50 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-rose-500/30 active:scale-95"
                >
                  {loading ? 'processing...' : 'check out'}
                </button>
              ) : (
                <button
                  onClick={handleCheckIn}
                  disabled={loading || status !== 'authenticated'}
                  className={`w-32 h-32 rounded-full flex items-center justify-center text-lg font-medium text-white bg-gradient-to-br from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 active:scale-95 ${
                    loading || status !== 'authenticated' ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {loading ? 'checking in...' : 'check in'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
