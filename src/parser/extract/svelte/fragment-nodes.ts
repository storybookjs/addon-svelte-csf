import type { Visitors } from 'zimmerframe';

import type { extractModuleNodes } from './module-nodes.js';
import type { extractInstanceNodes } from './instance-nodes.js';

import type { SvelteAST } from '$lib/parser/ast.js';

interface Result {
  storyComponents: Array<{
    /** Leading HTML comment as AST nodes which can be used as description for the story. */
    comment?: SvelteAST.Comment;
    /** '<Story>' component AST node. */
    component: SvelteAST.Component;
  }>;
  /**
   * "First level" _(at the root of fragment)_ snippet blocks AST nodes, which can be used for further transformation.
   *
   * For example:
   * Determining the source code of the `<Story />`.
   * Based on either `setTemplate` call,
   * or by passing `template` as prop from the outer Svelte snippet block definition - e.g. `Story template={template1} />`.
   */
  snippetBlocks: SvelteAST.SnippetBlock[];
}

interface Params {
  fragment: SvelteAST.Fragment;
  filename?: string;
  instanceNodes: Awaited<ReturnType<typeof extractInstanceNodes>>;
  moduleNodes: Awaited<ReturnType<typeof extractModuleNodes>>;
}

/**
 * Extract Svelte AST nodes via `svelte.compile`,
 * and from the fragment aka HTML code.
 * They are needed for further code analysis/transformation.
 */
export async function extractFragmentNodes(params: Params): Promise<Result> {
  const { walk } = await import('zimmerframe');

  const { fragment, moduleNodes } = params;
  const { storyIdentifier } = moduleNodes;

  let latestComment: SvelteAST.Comment | undefined;

  const state: Result = {
    storyComponents: [],
    snippetBlocks: [],
  };

  const visitors: Visitors<SvelteAST.SvelteNode, typeof state> = {
    Comment(node, { next }) {
      latestComment = node;
      next();
    },

    Component(node, { state }) {
      if (node.name === storyIdentifier.name) {
        state.storyComponents.push({
          comment: latestComment,
          component: node,
        });
        latestComment = undefined;
      }
    },

    SnippetBlock(node, { state }) {
      state.snippetBlocks.push(node);
    },
  };

  walk(fragment, state, visitors);

  return state;
}
