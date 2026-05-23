import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/app/generated/prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

const connectionString = process.env.DATABASE_URL;

const prismaClientSingleton = () => {
  if (!connectionString) {
    console.error('DATABASE_URL must be set');
    process.exit(1);
  }

  // The pool was being passed into PrismaPg directly in v6, but in v7 the PrismaPg adapter expects
  // a config object. The finding notes to fix this: `new PrismaPg({ connectionString })`
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
};

const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export { prisma };
