import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: [
    {
      directory: '../stories',
      files: '**/*.stories.svelte',
      titlePrefix: 'Demo',
    },
  ],
  framework: '@storybook/svelte-vite',
  addons: [
    '../dist/preset.js',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
};

export default config;
