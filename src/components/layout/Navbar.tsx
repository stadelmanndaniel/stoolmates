'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSession, signOut } from 'next-auth/react';
import type { Session } from 'next-auth';
import Notifications from './Notifications';

interface CustomSession extends Session {
  user: {
    id?: string;
    email?: string | null;
    username?: string;
    image?: string | null;
  };
}

export default function Navbar() {
  const { data: session, status } = useSession() as { data: CustomSession | null; status: string };
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center relative h-16">
          {/* Logo */}
          <div className="w-full flex justify-center">
            <Link href="/" className="text-2xl font-outfit font-bold italic bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent hover:from-purple-600 hover:to-indigo-500 transition-all duration-300 transform hover:scale-105 tracking-tight">
              stoolmates
            </Link>
          </div>

          {/* Desktop menu */}
          {session?.user && (
            <div className="hidden md:block ml-auto">
              <div className="flex items-center space-x-4">
                <span className="text-base font-bold italic text-gray-700">
                  hi, {session.user.username || 'guest'}
                </span>
                <button
                  onClick={() => signOut()}
                  className="text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium hover:bg-red-50"
                >
                  sign out
                </button>
              </div>
            </div>
          )}

          {/* Hamburger menu button - only show when logged in */}
          {session?.user && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="absolute right-4 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500 md:hidden"
            >
              <span className="sr-only">open main menu</span>
              <div className="w-6 h-6 relative flex flex-col justify-center">
                <span className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'rotate-45 translate-y-0.5' : ''}`} />
                <span className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'opacity-0' : 'my-1'}`} />
                <span className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${isMobileMenuOpen ? '-rotate-45 -translate-y-0.5' : ''}`} />
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Mobile menu - only show when logged in */}
      {session?.user && (
        <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            <div className="px-3 py-2 text-base font-bold italic text-gray-700">
              hi, {session.user.username || 'guest'}
            </div>
            <button
              onClick={() => signOut()}
              className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}