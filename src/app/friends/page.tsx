'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon as SearchIcon } from '@heroicons/react/24/outline';

interface User {
  id: string;
  username: string;
}

interface FriendRequest {
  id: string;
  sender: User;
  receiver: User;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
}

interface Friend {
  id: string;
  username: string;
}

export default function FriendsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  const [pendingSentRequests, setPendingSentRequests] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (session?.user) {
      fetchFriends();
      fetchFriendRequests();
      fetchSentRequests();
    }
  }, [session]);

  // Initialize pendingSentRequests when sentRequests changes
  useEffect(() => {
    if (!sentRequests) return;
    const pendingUserIds = new Set(sentRequests.map(request => request?.receiver?.id).filter(Boolean));
    setPendingSentRequests(pendingUserIds);
  }, [sentRequests]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data || []);
    } catch {
      setFriends([]);
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests');
      if (!response.ok) throw new Error('Failed to fetch friend requests');
      const data = await response.json();
      setReceivedRequests(data?.receivedRequests || []);
    } catch {
      setReceivedRequests([]);
    }
  };

  const fetchSentRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests/sent');
      if (!response.ok) throw new Error('Failed to fetch sent requests');
      const data = await response.json();
      setSentRequests(data?.requests || []);
    } catch {
      setSentRequests([]);
    }
  };

  const sendFriendRequest = async (userId: string) => {
    try {
      const response = await fetch('/api/friends/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ friendId: userId }),
      });
      if (!response.ok) throw new Error('Failed to send friend request');
      setPendingSentRequests(prev => new Set(Array.from(prev).concat(userId)));
      await Promise.all([fetchFriendRequests(), fetchSentRequests()]);
    } catch {
      // Handle error silently
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'ACCEPTED' }),
      });
      if (!response.ok) throw new Error('Failed to accept friend request');
      await Promise.all([fetchFriends(), fetchFriendRequests(), fetchSentRequests()]);
    } catch {
      // Handle error silently
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'REJECTED' }),
      });
      if (!response.ok) throw new Error('Failed to reject friend request');
      await fetchFriendRequests();
    } catch {
      // Handle error silently
    }
  };

  const removeFriend = async (friendId: string) => {
    try {
      const response = await fetch(`/api/friends/${friendId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to remove friend');
      await fetchFriends();
    } catch {
      // Handle error silently
    }
  };

  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }

      try {
        const response = await fetch(`/api/users/search?query=${encodeURIComponent(searchQuery)}`);
        if (!response.ok) throw new Error('Failed to search users');
        const data = await response.json();
        setSearchResults(data.users);
      } catch {
        setSearchResults([]);
      }
    };

    const debounceTimer = setTimeout(searchUsers, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery]);

  if (status === 'loading') {
    return <div className="flex items-center justify-center min-h-screen">loading...</div>;
  }

  if (!session?.user) {
    return null;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl pt-24 pb-16">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Your Stoolmates Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold italic text-gray-900">your stoolmates</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {friends.length === 0 ? (
              <div className="p-4 text-gray-500 text-center">No stoolmates yet</div>
            ) : (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-base font-medium text-gray-900">{friend.username}</span>
                  <button
                    onClick={() => removeFriend(friend.id)}
                    className="text-red-600 hover:text-red-700 transition-colors duration-200"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Your Requests Section */}
        {receivedRequests.length > 0 && (
          <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
            <div className="p-4 border-b border-gray-200">
              <h2 className="text-2xl font-bold italic text-gray-900">your requests</h2>
            </div>
            <div className="divide-y divide-gray-200">
              {receivedRequests.map((request) => (
                <div
                  key={request.id}
                  className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                >
                  <span className="text-base font-medium text-gray-900">{request.sender.username}</span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => acceptFriendRequest(request.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-emerald-500 to-teal-600 rounded-md hover:from-emerald-600 hover:to-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 shadow-lg shadow-emerald-500/30"
                    >
                      accept
                    </button>
                    <button
                      onClick={() => rejectFriendRequest(request.id)}
                      className="px-3 py-1 text-sm font-medium text-white bg-gradient-to-r from-red-500 to-rose-600 rounded-md hover:from-red-600 hover:to-rose-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 shadow-lg shadow-red-500/30"
                    >
                      reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Stoolmates Section */}
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold italic text-gray-900">add stoolmates</h2>
          </div>
          <div className="p-4">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full px-4 py-3 bg-gradient-to-r from-violet-50 to-fuchsia-50 border-2 border-violet-100 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-violet-500 focus:outline-none transition-all duration-200 placeholder-violet-300 text-violet-900"
              />
              <SearchIcon className="absolute right-4 top-3.5 h-5 w-5 text-violet-400" />
            </div>
            {searchQuery.trim() && (
              <div className="mt-4">
                {(() => {
                  const filteredResults = searchResults.filter(user => !friends.some(friend => friend.id === user.id));
                  return filteredResults.length === 0 ? (
                    <div className="p-4 text-gray-500 text-center">No users found</div>
                  ) : (
                    <div className="space-y-2">
                      {filteredResults.map((user) => (
                        <div
                          key={user.id}
                          className="p-3 flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                        >
                          <span className="text-base font-medium text-gray-900">{user.username}</span>
                          <button
                            onClick={() => sendFriendRequest(user.id)}
                            disabled={pendingSentRequests.has(user.id)}
                            className={`text-violet-600 hover:text-violet-700 transition-colors duration-200 ${
                              pendingSentRequests.has(user.id) ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 