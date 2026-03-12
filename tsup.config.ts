import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/app.ts'],
  format: ['esm'],
  outDir: 'dist',
  bundle: true,
  sourcemap: true,
  clean: true,
  esbuildOptions(options) {
    options.alias = {
      '@/prisma/*': './generated/prisma/*',
      '@/presentation/*': './src/presentation/*',
      '@/config/*': './src/config/*',
      '@/domain/*': './src/domain/*',
      '@/infraestructure/*': './src/infraestructure/*',
      '@/data/*': './src/data/*',
    };
  },
});
