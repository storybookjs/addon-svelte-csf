/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';
import inspect from 'vite-plugin-inspect';

export default defineConfig({
  // define: {
  //   'import.meta.vitest': 'undefined',
  // },
  plugins: [
    sveltekit(),
    inspect({
      dev: true,
      build: true,
    }),
  ],
  test: {
    dir: './src/',
    environment: 'jsdom',
    globals: true,
    // includeSource: ['**/*.ts'],
  },
});
