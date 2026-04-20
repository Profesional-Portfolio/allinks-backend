import { ENV } from '@/config/index';
import Server from '@/presentation/server';

import prismadb from './infraestructure/prismadb';
import AppRoutes from './presentation/routes';

async function main() {
  const server = new Server({ port: ENV.PORT, routes: AppRoutes.routes });
  await server.start();
}

main().catch((error: unknown) => {
  const err = error as Error;
  console.error('Error during server startup:', err.message);
  process.exit(1);
});

// Disconnect Prisma on process termination
const shutdown = async () => {
  try {
    await prismadb.$disconnect();
    console.log('Prisma client disconnected');
  } catch (e) {
    console.error('Error during Prisma disconnect:', e);
  } finally {
    process.exit(0);
  }
};
process.on('SIGINT', () => {
  void shutdown();
});

process.on('SIGTERM', () => {
  void shutdown();
});
