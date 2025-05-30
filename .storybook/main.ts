import type { StorybookConfig } from '@storybook/svelte-vite';

const examplesOnly = process.env.EXAMPLES_ONLY === 'true';

const config: StorybookConfig = {
  stories: [
    '../**/*.mdx',
    {
      directory: '../examples',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: examplesOnly ? undefined : 'Examples',
    },
    !examplesOnly && {
      directory: '../tests/stories',
      files: '**/*.stories.@(ts|svelte)',
      titlePrefix: 'Tests',
    },
  ].filter(Boolean) as StorybookConfig['stories'],
  framework: '@storybook/svelte-vite',
  addons: [
    {
      name: '../dist/preset.js',
      options: {
        legacyTemplate: true,
      },
    },
    '@chromatic-com/storybook',
    '@storybook/addon-docs',
    '@storybook/addon-vitest',
  ],
};

export default config;
