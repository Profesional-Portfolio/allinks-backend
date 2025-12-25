import Server from '@/presentation/server';
import { ENV } from '@/config/index';
import AppRoutes from './presentation/routes';
import prismadb from './infraestructure/prismadb';

async function main() {
  const server = new Server({ port: ENV.PORT, routes: AppRoutes.routes });
  await server.start();
}

// Graceful shutdown handling
(async () => {
  try {
    await main();
  } catch (error) {
    console.error('Error during server startup:', error);
    process.exit(1);
  }
})();

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
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
process.on('exit', shutdown);
