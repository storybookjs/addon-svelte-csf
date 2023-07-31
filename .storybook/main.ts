import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  framework: '@storybook/svelte-vite',
  stories: [
    '../stories/**/*.stories.svelte',
  ],
  addons: [
    '../dist/preset/index.js',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
};
export default config;