import { defineWorkspace, mergeConfig } from 'vitest/config';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';
import path from 'path';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import inspect from 'vite-plugin-inspect';

export default defineWorkspace([
  {
    extends: './vite.config.ts',
    resolve: {
      alias: {
        // This is already set up in svelte.config.js, but we need it explicitly here for vitest
        $lib: path.resolve(__dirname, 'src'),
      },
    },
    test: {
      name: 'unit',
      dir: './src/',
      environment: 'happy-dom',
      globals: true,
    },
  },
  {
    // extends: './vite.config.ts', 👈 commented out
    plugins: [
      storybookTest({
        storybookScript: 'pnpm run storybook --no-open',
      }),
      // 👆 BEFORE svelte plugin
      svelte(),
      inspect({
        dev: true,
        build: true,
      }),
    ],
    resolve: {
      alias: {
        // This is already set up in svelte.config.js, but we need it explicitly here for vitest
        $lib: path.resolve(__dirname, 'src'),
      },
    },
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
      },
      setupFiles: ['./.storybook/vitest.setup.ts'],
    },
  },
]);
