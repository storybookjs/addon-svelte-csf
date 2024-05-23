import fs from 'node:fs';

import type { SvelteConfig } from '@sveltejs/vite-plugin-svelte';
import MagicString from 'magic-string';
import { preprocess } from 'svelte/compiler';
import { createFilter, type Plugin } from 'vite';

import { getNameFromFilename } from '../svelte/component-name.js';
import { extractStories } from '../../parser/extract-stories.js';
import { createAppendix } from '../../transformer/create-appendix.js';

export default function plugin(svelteOptions: SvelteConfig): Plugin {
  const include = /\.stories\.svelte$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-svelte-csf-plugin-post',
    enforce: 'post',
    async transform(code_, id) {
      if (!filter(id)) return undefined;

      let code = new MagicString(code_);

      const componentName = getNameFromFilename(id);

      if (!componentName) {
        throw new Error(`Failed to extract component name from filename: ${id}`);
      }

      let source = fs.readFileSync(id).toString();

      // FIXME: Do we have to do it twice?
      if (svelteOptions && svelteOptions.preprocess) {
        const processed = await preprocess(source.toString(), svelteOptions.preprocess, {
          filename: id,
        });

        source = processed.code;
      }

      const storiesFileMeta = extractStories(source.toString());

      createAppendix({ code, storiesFileMeta, componentName });

      return {
        code: code.toString(),
        map: code.generateMap({ hires: true, source: id }),
      };
    },
  };
}