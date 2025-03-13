'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function HomePage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleCheckIn = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/check-in', {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Check-in failed');
      router.refresh();
    } catch (_error) {
      // Handle error silently
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

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {session?.user ? (
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold italic text-gray-900">check in</h2>
            </div>
            <div className="p-4">
              <button
                onClick={handleCheckIn}
                disabled={loading}
                className={`w-full py-3 px-4 rounded-xl text-lg font-medium text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 active:scale-95 ${
                  loading ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {loading ? 'checking in...' : 'check in'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100 p-8 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Welcome to Stoolmates</h1>
            <p className="text-gray-600 mb-8">Track your bathroom visits with friends</p>
            <div className="space-x-4">
              <Link
                href="/login"
                className="inline-block py-3 px-6 rounded-xl text-lg font-medium text-white bg-gradient-to-r from-violet-500 to-fuchsia-600 hover:from-violet-600 hover:to-fuchsia-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg hover:shadow-violet-500/30 active:scale-95"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="inline-block py-3 px-6 rounded-xl text-lg font-medium text-gray-700 bg-white border-2 border-gray-200 hover:border-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-lg active:scale-95"
              >
                Sign Up
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}