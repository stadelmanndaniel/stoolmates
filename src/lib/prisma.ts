import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not set');
  }

  return new PrismaClient({
    log: ['error', 'warn'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'pretty',
  });
};

let prisma: PrismaClient;

try {
  prisma = global.prisma ?? prismaClientSingleton();
} catch (error) {
  console.error('Failed to initialize Prisma client:', error);
  throw error;
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma; 