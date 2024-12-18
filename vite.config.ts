/// <reference types="vitest" />

import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import inspect from 'vite-plugin-inspect';
import path from 'path';

export default defineConfig({
  plugins: [
    svelte(),
    inspect({
      dev: true,
      build: true,
    }),
  ],
  resolve: {
    alias: {
      // This is already set up in svelte.config.js, but we need it explicitly here for vitest
      '$lib': path.resolve(__dirname, 'src'),
    },
  },
  test: {
    dir: './src/',
    environment: 'happy-dom',
    globals: true,
  },
});
