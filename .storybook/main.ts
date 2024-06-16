import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  stories: [
    {
      directory: '../examples',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: 'Examples',
    },
    {
      directory: '../tests/stories',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: 'Tests',
    },
  ],
  framework: '@storybook/svelte-vite',
  addons: ['../dist/preset.js', '@storybook/addon-essentials', '@storybook/addon-interactions'],
};

export default config;
