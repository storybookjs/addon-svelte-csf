/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import inspect from 'vite-plugin-inspect';

export default defineConfig({
  define: {
    'import.meta.vitest': 'undefined',
  },
  plugins: [
    svelte(),
    inspect({
      dev: true,
      build: true,
    }),
  ],
  test: {
    dir: './src/',
    environment: 'jsdom',
    globals: true,
    includeSource: ['src/**/*.ts'],
  },
});
