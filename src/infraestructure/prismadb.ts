import { PrismaClient } from '@/generated/prisma';
import 'dotenv/config';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const prismadb =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismadb;

export default prismadb;
