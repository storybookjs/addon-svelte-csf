import type { StorybookConfig } from '@storybook/svelte-vite';
import type { Options } from 'storybook/internal/types';

import { transformPlugin, preTransformPlugin } from '$lib/compiler/plugins.js';
import { createIndexer } from '$lib/indexer/index.js';

export interface StorybookAddonSvelteCsFOptions extends Options {
  /**
   * Enable support for legacy templating.
   * This option is deprecated, it will be removed in a future major version and should only be used for gradual migration purposes.
   * Please migrate to the new snippet-based templating API when possible.
   *
   * Enabling this can slow down the build-performance because it requires more transformations.
   *
   * @default false
   * @deprecated
   */
  legacyTemplate?: boolean;
  /**
   * Enable support for injecting component CSS into the document head.
   */
  injectComponentCss?: boolean;
}

export const viteFinal: StorybookConfig['viteFinal'] = async (
  config,
  options: StorybookAddonSvelteCsFOptions
) => {
  const { plugins = [], ...restConfig } = config;
  const { legacyTemplate = false, injectComponentCss = true } = options;
  if (legacyTemplate) {
    plugins.unshift(await preTransformPlugin());
  }
  plugins.push(await transformPlugin());

  if (injectComponentCss) {
    // Force Svelte to inject component CSS at runtime in Storybook builds
    //When Svelte emits CSS as separate files, Vite hoists shared CSS into a single chunk that loads before the per-story chunks, which reverses the declaration order of equal-specificity rules vs. the user's app build, causing Storybook to render differently from SvelteKit even though the source is the same. 
    // Injecting CSS into the JS module ties cascade odrer to component mount order so Storybook output matches how the app would reder
    plugins.push({
      name: 'storybook-svelte-csf:inject-component-css',
      enforce: 'post',
      configResolved(resolved) {
        const cfg = resolved.plugins.find(p => p?.name === 'vite-plugin-svelte:config');
        const opts = cfg?.api?.options;
        if (!opts) {
          console.debug('[@storybook/addon-svelte-csf] could not locate vite-plugin-svelte options; skipping CSS-injection patch.');
          return;
        }
        opts.emitCss = false;
        opts.compilerOptions = { ...(opts.compilerOptions ?? {}), css: 'injected' };
      },
    });
  }

  return { ...restConfig, plugins };
}

export const experimental_indexers: StorybookConfig['experimental_indexers'] = (
  indexers,
  options: StorybookAddonSvelteCsFOptions
) => {
  return [createIndexer(options.legacyTemplate ?? false), ...(indexers || [])];
};

export const optimizeViteDeps = ['@storybook/addon-svelte-csf'];
