import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/login',
    newUser: '/',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Missing credentials');
        }

        const user = await prisma.user.findFirst({
          where: {
            OR: [
              { email: credentials.email },
              { username: credentials.email }
            ]
          },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isValid = await compare(credentials.password, user.password);

        if (!isValid) {
          throw new Error('Invalid credentials');
        }

        // Delete all existing sessions for this user
        await prisma.session.deleteMany({
          where: { userId: user.id }
        });

        // Also check out from any active check-ins
        const activeCheckIn = await prisma.checkIn.findFirst({
          where: {
            userId: user.id,
            endTime: null
          }
        });

        if (activeCheckIn) {
          const now = new Date();
          const duration = Math.floor((now.getTime() - activeCheckIn.startTime.getTime()) / 1000);
          await prisma.checkIn.update({
            where: { id: activeCheckIn.id },
            data: {
              endTime: now,
              duration
            }
          });
        }

        return {
          id: user.id,
          email: user.email,
          username: user.username,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.username = token.username as string;
      }
      return session;
    },
  },
  events: {
    async signIn({ user }) {
      // Delete all existing sessions for this user
      if (user.id) {
        await prisma.session.deleteMany({
          where: { userId: user.id }
        });

        // Also check out from any active check-ins
        const activeCheckIn = await prisma.checkIn.findFirst({
          where: {
            userId: user.id,
            endTime: null
          }
        });

        if (activeCheckIn) {
          const now = new Date();
          const duration = Math.floor((now.getTime() - activeCheckIn.startTime.getTime()) / 1000);
          await prisma.checkIn.update({
            where: { id: activeCheckIn.id },
            data: {
              endTime: now,
              duration
            }
          });
        }
      }
      console.log('User signed in:', user.email);
    },
  },
  debug: process.env.NODE_ENV === 'development',
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 