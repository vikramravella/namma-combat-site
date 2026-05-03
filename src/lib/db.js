import { PrismaClient } from '@prisma/client';
import { withAccelerate } from '@prisma/extension-accelerate';

// Runtime queries go through Accelerate (HTTPS proxy) so the Vercel Lambda
// doesn't need to load a Prisma engine binary — sidestepping the rhel-openssl
// engine-bundling pain we hit on Vercel. Schema changes (db push, migrate)
// still go through DIRECT_URL since Accelerate doesn't support DDL.
//
// Cache on globalThis so a warm Lambda reuses one client across concurrent
// requests instead of opening a fresh connection per request.
const globalForPrisma = globalThis;

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  }).$extends(withAccelerate());

globalForPrisma.prisma = db;
