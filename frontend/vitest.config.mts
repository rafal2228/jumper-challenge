import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { loadEnvFile } from 'node:process';
import path from 'node:path';

loadEnvFile(path.join(__dirname, '.env'));

export default defineConfig({
  plugins: [tsconfigPaths(), react()],
  test: {
    environment: 'jsdom',
    env: process.env,
    setupFiles: ['test-setup.ts'],
  },
});
