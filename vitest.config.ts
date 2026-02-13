import { defineConfig } from 'vitest/config';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright'

export default defineConfig({
  test: {
    projects: [
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
            provider: playwright({}),
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
    ]
  }
});
