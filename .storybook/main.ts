import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: [
    {
      directory: '../stories',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: 'Demo',
    },
    {
      directory: '../examples',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: 'Examples',
    },
  ],
  framework: '@storybook/svelte-vite',
  addons: ['../dist/preset.js', '@storybook/addon-essentials', '@storybook/addon-interactions'],
};

export default config;
