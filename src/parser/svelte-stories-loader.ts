import dedent from 'ts-dedent';
import { readFileSync } from 'fs';
import * as svelte from 'svelte/compiler';
import { PreprocessorGroup } from 'svelte/types/compiler/preprocess/types';
import { extractStories } from './extract-stories';

const parser = require.resolve('./collect-stories').replace(/[/\\]/g, '/');

// From https://github.com/sveltejs/svelte/blob/8db3e8d0297e052556f0b6dde310ef6e197b8d18/src/compiler/compile/utils/get_name_from_filename.ts
// Copied because it is not exported from the compiler
export function getNameFromFilename(filename: string): string {
  if (!filename) return null;

  const parts = filename.split(/[/\\]/).map(encodeURI);

  if (parts.length > 1) {
    const indexMatch = parts[parts.length - 1].match(/^index(\.\w+)/);
    if (indexMatch) {
      parts.pop();
      parts[parts.length - 1] += indexMatch[1];
    }
  }

  const base = parts
    .pop()
    .replace(/%/g, 'u')
    .replace(/\.[^.]+$/, '')
    .replace(/[^a-zA-Z_$0-9]+/g, '_')
    .replace(/^_/, '')
    .replace(/_$/, '')
    .replace(/^(\d)/, '_$1');

  if (!base) {
    throw new Error(`Could not derive component name from file ${filename}`);
  }

  return base[0].toUpperCase() + base.slice(1);
}

async function transformSvelteStories(
  code: string,
  resource: string,
  preprocess?: PreprocessorGroup | PreprocessorGroup[]
) {
  const componentName = getNameFromFilename(resource);

  let source = readFileSync(resource).toString();
  if (preprocess) {
    source = (await svelte.preprocess(source, preprocess, { filename: resource })).code;
  }

  const storiesDef = extractStories(source);
  const { stories } = storiesDef;

  const storyDef = Object.entries(stories)
    .filter(([, def]) => !def.template)
    .map(([id]) => `export const ${id} = __storiesMetaData.stories[${JSON.stringify(id)}]`)
    .join('\n');

  const codeWithoutDefaultExport = code.replace('export default ', '//export default');

  return dedent`${codeWithoutDefaultExport}
    const { default: parser } = require('${parser}');
    const __storiesMetaData = parser(${componentName}, ${JSON.stringify(storiesDef)});
    export default __storiesMetaData.meta;
    ${storyDef};
  `;
}


function svelteStoriesLoader(code: string): void {
  // eslint-disable-next-line no-underscore-dangle
  const { resource } = this._module;
  const callback = this.async();
  const preprocess = typeof this.query === 'object' ? this.query.preprocess : undefined;
  transformSvelteStories(code, resource, preprocess).then((processed) => callback(null, processed));
}

export default svelteStoriesLoader;
