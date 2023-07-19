import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  framework: '@storybook/svelte-vite',
  stories: [
    '../stories/**/*.stories.svelte',
  ],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '../dist/preset/index.js',
  ],
};
export default config;