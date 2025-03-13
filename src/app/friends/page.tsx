'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface Friend {
  id: string;
  name: string;
  email: string;
  image?: string;
}

interface FriendRequest {
  id: string;
  sender: {
    id: string;
    name: string;
    email: string;
    image?: string;
  };
  status: string;
  createdAt: string;
}

export default function FriendsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>([]);

  useEffect(() => {
    if (session?.user) {
      fetchFriends();
      fetchFriendRequests();
    }
  }, [session]);

  const fetchFriends = async () => {
    try {
      const response = await fetch('/api/friends');
      if (!response.ok) throw new Error('Failed to fetch friends');
      const data = await response.json();
      setFriends(data);
    } catch {
      // Handle error silently
    }
  };

  const fetchFriendRequests = async () => {
    try {
      const response = await fetch('/api/friends/requests');
      if (!response.ok) throw new Error('Failed to fetch friend requests');
      const data = await response.json();
      setFriendRequests(data);
    } catch {
      // Handle error silently
    }
  };

  const sendFriendRequest = async (email: string) => {
    try {
      const response = await fetch('/api/friends/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!response.ok) throw new Error('Failed to send friend request');
      router.refresh();
    } catch {
      // Handle error silently
    }
  };

  const acceptFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}/accept`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to accept friend request');
      fetchFriends();
      fetchFriendRequests();
    } catch {
      // Handle error silently
    }
  };

  const rejectFriendRequest = async (requestId: string) => {
    try {
      const response = await fetch(`/api/friends/requests/${requestId}/reject`, {
        method: 'POST',
      });
      if (!response.ok) throw new Error('Failed to reject friend request');
      fetchFriendRequests();
    } catch {
      // Handle error silently
    }
  };

  if (!session?.user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-24 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-2xl font-bold italic text-gray-900">friends</h2>
          </div>
          <div className="p-4">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Friend Requests</h3>
                {friendRequests.length === 0 ? (
                  <p className="text-gray-500">No pending friend requests</p>
                ) : (
                  <div className="space-y-4">
                    {friendRequests.map((request) => (
                      <div key={request.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          {request.sender.image && (
                            <img
                              src={request.sender.image}
                              alt={request.sender.name}
                              className="h-10 w-10 rounded-full"
                            />
                          )}
                          <div>
                            <p className="font-medium text-gray-900">{request.sender.name}</p>
                            <p className="text-sm text-gray-500">{request.sender.email}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => acceptFriendRequest(request.id)}
                            className="px-3 py-1 text-sm font-medium text-white bg-violet-600 rounded-md hover:bg-violet-700"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => rejectFriendRequest(request.id)}
                            className="px-3 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Your Friends</h3>
                {friends.length === 0 ? (
                  <p className="text-gray-500">No friends yet</p>
                ) : (
                  <div className="space-y-4">
                    {friends.map((friend) => (
                      <div key={friend.id} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
                        {friend.image && (
                          <img
                            src={friend.image}
                            alt={friend.name}
                            className="h-10 w-10 rounded-full"
                          />
                        )}
                        <div>
                          <p className="font-medium text-gray-900">{friend.name}</p>
                          <p className="text-sm text-gray-500">{friend.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Add Friend</h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const email = (e.target as HTMLFormElement).email.value;
                    sendFriendRequest(email);
                    (e.target as HTMLFormElement).reset();
                  }}
                  className="flex space-x-2"
                >
                  <input
                    type="email"
                    name="email"
                    placeholder="Enter email address"
                    required
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 text-white bg-violet-600 rounded-md hover:bg-violet-700"
                  >
                    Send Request
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 