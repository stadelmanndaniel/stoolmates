'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface FriendRequest {
  id: string;
  sender: {
    username: string;
  };
}

export default function BottomNav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [pendingRequests, setPendingRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    const fetchRequests = async () => {
      // Don't fetch if we're not authenticated
      if (status !== 'authenticated' || !session?.user) {
        setPendingRequests([]);
        return;
      }
      
      try {
        console.log('Fetching friend requests...');
        const response = await fetch('/api/friends/requests', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include'
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            console.log('User not authenticated');
            setPendingRequests([]);
            return;
          }
          const errorData = await response.json().catch(() => ({}));
          console.error('Error response:', errorData);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Friend requests data:', data);
        setPendingRequests(data.receivedRequests);
      } catch (error) {
        console.error('Error fetching requests:', error);
        // Don't set pending requests to empty array on error
      }
    };

    if (status === 'authenticated' && session?.user) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 30000);
      return () => clearInterval(interval);
    }
  }, [session, status]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-around items-center h-16">
          <Link 
            href="/" 
            className={`flex flex-col items-center justify-center flex-1 h-full relative ${
              pathname === '/' ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <div className={`absolute inset-0 rounded-t-xl transition-all duration-200 ${
              pathname === '/' ? 'bg-indigo-50 shadow-[0_-2px_10px_rgba(99,102,241,0.1)]' : ''
            }`} />
            <span className="text-2xl mb-1 relative">💩</span>
            <span className="text-xs relative">check in</span>
          </Link>

          <Link 
            href="/leaderboard" 
            className={`flex flex-col items-center justify-center flex-1 h-full relative ${
              pathname === '/leaderboard' ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <div className={`absolute inset-0 rounded-t-xl transition-all duration-200 ${
              pathname === '/leaderboard' ? 'bg-indigo-50 shadow-[0_-2px_10px_rgba(99,102,241,0.1)]' : ''
            }`} />
            <span className="text-2xl mb-1 relative">🏆</span>
            <span className="text-xs relative">leaderboard</span>
          </Link>
          
          <Link 
            href="/friends" 
            className={`flex flex-col items-center justify-center flex-1 h-full relative ${
              pathname === '/friends' ? 'text-indigo-600' : 'text-gray-500'
            }`}
          >
            <div className={`absolute inset-0 rounded-t-xl transition-all duration-200 ${
              pathname === '/friends' ? 'bg-indigo-50 shadow-[0_-2px_10px_rgba(99,102,241,0.1)]' : ''
            }`} />
            <div className="relative">
              <span className="text-2xl mb-1 relative">💌</span>
              {pendingRequests.length > 0 && (
                <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 flex items-center justify-center text-xs text-white">
                  {pendingRequests.length}
                </span>
              )}
            </div>
            <span className="text-xs relative">friends</span>
          </Link>
        </div>
      </div>
    </nav>
  );
} 