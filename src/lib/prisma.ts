import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is not set');
    return null;
  }

  try {
    return new PrismaClient({
      log: ['error', 'warn'],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
      errorFormat: 'pretty',
    });
  } catch (error) {
    console.error('Failed to create Prisma client:', error);
    return null;
  }
};

let prisma: PrismaClient | null = null;

try {
  prisma = global.prisma ?? prismaClientSingleton();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma ?? undefined;
}

export default prisma; 