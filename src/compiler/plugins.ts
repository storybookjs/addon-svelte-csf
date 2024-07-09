/**
 * NOTE:
 *
 * 1. Why Svelte AST nodes had to be included?
 *    - During the compilation from Svelte to JS, HTML comments are removed.
 *    - Rollup' internal `this.parse()` excludes `leadingComments` from parsing.
 *      I couldn't find an option to override this behavior.
 *      I wanted to avoid adding another package for parsing _(getting AST)_ - e.g. `acorn`
 */

import fs from 'node:fs';

import MagicString from 'magic-string';
import { preprocess } from 'svelte/compiler';
import type { Plugin } from 'vite';

import { codemodLegacyNodes } from '#compiler/pre-transform/index';
import { transformStoriesCode } from '#compiler/post-transform/index';
import { getSvelteAST } from '#parser/ast';
import { extractCompiledASTNodes } from '#parser/extract/compiled/nodes';
import { extractSvelteASTNodes } from '#parser/extract/svelte/nodes';

export async function preTransformPlugin(): Promise<Plugin> {
  const [{ createFilter }] = await Promise.all([import('vite')]);
  const include = /\.stories\.svelte$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-svelte-csf-plugin-pre',
    enforce: 'pre',
    async transform(code, id) {
      if (!filter(id)) return undefined;

      const { print } = await import('svelte-ast-print');

      const svelteAST = getSvelteAST({ code, filename: id });
      const transformedSvelteAST = await codemodLegacyNodes(svelteAST);

      let magicCode = new MagicString(code);

      magicCode.overwrite(0, code.length - 1, print(transformedSvelteAST));

      return {
        code: magicCode.toString(),
        map: magicCode.generateMap({ hires: true, source: id }),
      };
    },
  };
}

export async function postTransformPlugin(): Promise<Plugin> {
  const [{ createFilter }, { loadSvelteConfig }] = await Promise.all([
    import('vite'),
    import('@sveltejs/vite-plugin-svelte'),
  ]);

  const svelteConfig = await loadSvelteConfig();
  const include = /\.stories\.svelte$/;
  const filter = createFilter(include);

  return {
    name: 'storybook:addon-svelte-csf-plugin-post',
    enforce: 'post',
    async transform(compiledCode, id) {
      if (!filter(id)) return undefined;

      const compiledAST = this.parse(compiledCode);
      let magicCompiledCode = new MagicString(compiledCode);

      // FIXME: This needs to change.
      // we need to access the code - results from `pre-transform` plugin - 'storybook:addon-svelte-csf-plugin-post'.
      // But how?

      // @ts-expect-error FIXME: `this.originalCode` exists at runtime in the development mode only.
      // Need to research if its documented somewhere
      let rawCode = this.originalCode ?? fs.readFileSync(id).toString();

      if (svelteConfig?.preprocess) {
        const processed = await preprocess(rawCode, svelteConfig.preprocess, {
          filename: id,
        });
        rawCode = processed.code;
      }

      const svelteAST = getSvelteAST({ code: rawCode, filename: id });
      const svelteASTNodes = await extractSvelteASTNodes({
        ast: svelteAST,
        filename: id,
      });
      const compiledASTNodes = await extractCompiledASTNodes({
        ast: compiledAST,
        filename: id,
      });

      await transformStoriesCode({
        code: magicCompiledCode,
        nodes: {
          svelte: svelteASTNodes,
          compiled: compiledASTNodes,
        },
        filename: id,
        originalCode: rawCode,
      });

      return {
        code: magicCompiledCode.toString(),
        map: magicCompiledCode.generateMap({ hires: true, source: id }),
      };
    },
  };
}