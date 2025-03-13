'use client';

import { useSession, signOut } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold italic text-gray-900">stoolmates</span>
            </Link>
          </div>
          <div className="flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <Link
                  href="/friends"
                  className={`text-sm font-medium ${
                    isActive('/friends')
                      ? 'text-violet-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  friends
                </Link>
                <Link
                  href="/leaderboard"
                  className={`text-sm font-medium ${
                    isActive('/leaderboard')
                      ? 'text-violet-600'
                      : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  leaderboard
                </Link>
                <button
                  onClick={() => signOut()}
                  className="text-sm font-medium text-gray-500 hover:text-gray-900"
                >
                  sign out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="text-sm font-medium text-gray-500 hover:text-gray-900"
              >
                sign in
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}