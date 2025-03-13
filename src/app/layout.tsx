import type { Metadata } from 'next';
import './globals.css';
import { Inter } from 'next/font/google';
import { Outfit } from 'next/font/google';
import Providers from '@/components/providers/SessionProvider';
import Navbar from '@/components/layout/Navbar';
import BottomNav from '@/components/layout/BottomNav';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/auth';

const inter = Inter({ subsets: ['latin'] });
const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
});

export const metadata: Metadata = {
  title: 'Stoolmates',
  description: 'Track your bathroom visits with friends',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
      </head>
      <body className={`${inter.className} ${outfit.variable} font-sans`} suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-100 via-gray-50 to-gray-100 relative">
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-shimmer"></div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_100%)]"></div>
            <div className="relative flex flex-col flex-1">
              <Navbar session={session} />
              <main className="flex-1 pb-16">
                {children}
              </main>
              <BottomNav />
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
