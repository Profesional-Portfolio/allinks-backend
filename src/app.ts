import Server from '@/presentation/server';
import { ENV } from '@/config/index';
import AppRoutes from './presentation/routes';
import prismadb from '@/infraestructure/prismadb';

async function main() {
  const server = new Server({ port: ENV.PORT, routes: AppRoutes.routes });
  await server.start();
}

(() => {
  main().then(async () => {
    await prismadb.$disconnect();
  });
})();
