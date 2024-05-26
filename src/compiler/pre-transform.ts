import type { SvelteConfig } from '@sveltejs/vite-plugin-svelte';
import MagicString from 'magic-string';
import type { Plugin } from 'vite';

import { extractASTNodes } from '../utils/parser/extract-ast-nodes.js';
import { getAST } from '../utils/parser/ast.js';
import { transformDefineMeta } from '../utils/transformer/define-meta.js';

export async function preTransformPlugin(): Promise<Plugin> {
  const { createFilter } = await import('vite');

  const include = /\.stories\.svelte$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-svelte-csf-plugin-pre',
    enforce: 'pre',
    async transform(code_, id) {
      if (!filter(id)) return;

      const { module } = getAST(code_);
      const nodes = await extractASTNodes(module);
      const code = new MagicString(code_);

      transformDefineMeta({ code, nodes });

      return {
        code: code.toString(),
        map: code.generateMap({ hires: true, source: id }),
      };
    },
  };
}