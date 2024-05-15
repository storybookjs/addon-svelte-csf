import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  framework: '@storybook/svelte-vite',
  addons: [
    '../dist/preset.js',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  stories: [
    {
      directory: '../stories',
      files: '**/*.stories.svelte',
      titlePrefix: 'Demo',
    },
  ],
  docs: {
    autodocs: 'tag',
  },
};
export default config;
