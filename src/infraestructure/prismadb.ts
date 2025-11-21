import { PrismaClient } from '@/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString });

const prismadb =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ['query'],
    adapter,
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prismadb;

export default prismadb;
