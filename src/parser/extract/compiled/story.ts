import type { ESTreeAST } from '#parser/ast';
import type { extractStoriesNodesFromExportDefaultFn } from '#parser/extract/compiled/stories';
import { NoCompiledStoryPropsObjectExpression } from '#utils/error/parser/extract/compiled';

interface Params {
  node: Awaited<ReturnType<typeof extractStoriesNodesFromExportDefaultFn>>[number];
  filename?: string;
}

/**
 * Get an {@link ObjectExpression} with props _(attributes)_ passed down to Svelte component in compiled code.
 *
 * - In **development** mode, extract from the {@link ExpressionStatement}.
 *   How it looks in **development** mode:
 *
 *   ```js
 *   $.validate_component(Story)(node_1, { props })
 *   ```
 *
 * - In **production** mode, extract from the {@link CallExpression}.
 *   And in **production** mode:
 *
 *   ```js
 *   Story(node_1, { props })
 *   ```
 */
export function getStoryPropsObjectExpression(params: Params): ESTreeAST.ObjectExpression {
  const { node, filename } = params;
  if (node.type === 'CallExpression') {
    const secondArg = node.arguments[1];
    if (secondArg.type === 'ObjectExpression') {
      return secondArg;
    }
    if (secondArg.type === 'CallExpression' && secondArg.arguments[0].type === 'ObjectExpression') {
      return secondArg.arguments[0];
    }
  }

  if (
    node.type === 'ExpressionStatement' &&
    node.expression.type === 'CallExpression' &&
    node.expression.arguments[1].type === 'ObjectExpression'
  ) {
    return node.expression.arguments[1];
  }

  throw new NoCompiledStoryPropsObjectExpression({
    filename,
    node,
  });
}
