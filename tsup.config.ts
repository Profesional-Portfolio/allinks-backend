import { defineConfig } from 'tsup';

export default defineConfig({
  bundle: true,
  clean: true,
  entry: ['src/app.ts'],
  esbuildOptions(options) {
    options.alias = {
      '@/config/*': './src/config/*',
      '@/data/*': './src/data/*',
      '@/domain/*': './src/domain/*',
      '@/infraestructure/*': './src/infraestructure/*',
      '@/presentation/*': './src/presentation/*',
      '@/prisma/*': './generated/prisma/*',
    };
  },
  format: ['esm'],
  outDir: 'dist',
  sourcemap: true,
});
