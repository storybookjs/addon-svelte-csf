import type { StorybookConfig } from '@storybook/svelte-vite';

const config: StorybookConfig = {
  framework: '@storybook/svelte-vite',
  stories: [{
    directory: '../stories',
    files:'**/*.stories.svelte',
    titlePrefix:'Demo'
  }],
  addons: [
    '../dist/preset/index.js',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
  ],
  docs: {
    autodocs: 'tag'
  }
};
export default config;
