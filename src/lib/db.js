import { PrismaClient } from '@/generated/prisma';

// Cache the PrismaClient on globalThis in EVERY environment, including
// production. On Vercel, a single warm Lambda may handle multiple concurrent
// requests; without this cache, each request would instantiate a fresh client
// and hold its own connections, blowing the Prisma Postgres connection cap
// ("too many connections for role 'prisma_migration'"). Caching means at most
// one client per Lambda instance regardless of in-flight requests.
const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

globalForPrisma.prisma = db;
