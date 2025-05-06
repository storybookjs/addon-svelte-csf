import { defineWorkspace } from 'vitest/config';
import { storybookTest } from '@storybook/experimental-addon-test/vitest-plugin';

export default defineWorkspace([
  {
    extends: './vite.config.ts',
    test: {
      name: 'unit',
      dir: './src/',
      environment: 'happy-dom',
      globals: true,
    },
  },
  {
    extends: './vite.config.ts',
    plugins: [
      storybookTest({
        storybookScript: 'pnpm run storybook --no-open',
      }),
    ],
    test: {
      name: 'storybook',
      browser: {
        enabled: true,
        provider: 'playwright',
        instances: [
          {
            browser: 'chromium',
            headless: true,
          },
        ],
      },
      setupFiles: ['./.storybook/vitest.setup.ts'],
    },
  },
]);
