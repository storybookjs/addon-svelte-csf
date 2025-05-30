import { print } from 'esrap';
import MagicString from 'magic-string';

import { createExportOrderVariableDeclaration } from './appendix/create-export-order.js';
import { createRuntimeStoriesImport } from './appendix/create-import.js';
import { createVariableFromRuntimeStoriesCall } from './appendix/create-variable-from-runtime-stories-call.js';
import { createNamedExportStories } from './appendix/create-named-export-stories.js';

import { STORYBOOK_META_IDENTIFIER } from '$lib/constants.js';
import { createASTIdentifier, type ESTreeAST, type SvelteAST } from '$lib/parser/ast.js';
import { getStoriesIdentifiers } from '$lib/parser/analyse/story/attributes/identifiers.js';
import type { CompiledASTNodes } from '$lib/parser/extract/compiled/nodes.js';
import type { SvelteASTNodes } from '$lib/parser/extract/svelte/nodes.js';
import { createRuntimeStoryVariableDeclaration } from './appendix/create-runtime-story-variable-declaration.js';

interface Params {
  code: MagicString;
  nodes: {
    compiled: CompiledASTNodes;
    svelte: SvelteASTNodes;
  };
  filename?: string;
}

export async function createAppendix(params: Params) {
  const { code, nodes, filename } = params;
  const { compiled, svelte } = nodes;
  const { storiesFunctionDeclaration } = compiled;

  const storiesIdentifiers = getStoriesIdentifiers({
    nodes: svelte,
    filename,
  });
  const variableFromRuntimeStoriesCall = createVariableFromRuntimeStoriesCall({
    storiesFunctionDeclaration,
    filename,
  });
  const storiesVariableDeclarations = storiesIdentifiers.map(({ exportName }, idx) =>
    createRuntimeStoryVariableDeclaration({
      exportName,
      filename,
      nodes: {
        variable: variableFromRuntimeStoriesCall,
        tags: getStoryTags({
          storyComponents: params.nodes.svelte.storyComponents,
          idx,
        }),
      },
    })
  );

  const appendix = print({
    type: 'Program',
    sourceType: 'module',
    body: [
      createRuntimeStoriesImport(),
      variableFromRuntimeStoriesCall,
      createExportDefaultMeta(),
      createExportOrderVariableDeclaration({ storiesIdentifiers, filename }),
      ...storiesVariableDeclarations,
      createNamedExportStories({ storiesIdentifiers }),
    ],
  });

  code.append('\n' + appendix.code);
}

function createExportDefaultMeta(): ESTreeAST.ExportDefaultDeclaration {
  return {
    type: 'ExportDefaultDeclaration',
    declaration: createASTIdentifier(STORYBOOK_META_IDENTIFIER),
  };
}

interface GetStoryTagsParams {
  storyComponents: SvelteASTNodes['storyComponents'];
  idx: number;
}
function getStoryTags(params: GetStoryTagsParams): ESTreeAST.ArrayExpression | undefined {
  const storyComponent = params.storyComponents[params.idx];
  const tags = storyComponent.component.attributes.find((a) => a.name === 'tags');

  if (!tags) return;

  return (tags.value as SvelteAST.ExpressionTag).expression as ESTreeAST.ArrayExpression;
}
