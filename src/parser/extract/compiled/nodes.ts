import pkg from '@storybook/addon-svelte-csf/package.json' with { type: 'json' };
import type { ProgramNode } from 'rollup';
import type { Visitors } from 'zimmerframe';

import type { ESTreeAST } from '$lib/parser/ast.js';
import {
  MissingDefineMetaVariableDeclarationError,
  MissingImportedDefineMetaError,
  NoExportDefaultError,
  NoStoriesFunctionDeclarationError,
  NoStoryIdentifierFoundError,
} from '$lib/utils/error/parser/extract/compiled.js';
import { DefaultOrNamespaceImportUsedError } from '$lib/utils/error/parser/extract/svelte.js';

/**
 * Important AST nodes from the compiled output of a single `*.stories.svelte` file.
 * They are needed for further code transformation by this addon.
 * Powered by `rollup`'s internal [`this.parse()`](https://rollupjs.org/plugin-development/#this-parse)
 */
export interface CompiledASTNodes {
  /**
   * Import specifier for `defineMeta` imported from this addon package.
   * Could be renamed - e.g. `import { defineMeta } from "@storybook/addon-svelte-csf"`
   */
  defineMetaImport: ESTreeAST.ImportSpecifier;
  /**
   * Variable declaration: `const { Story } = defineMeta({ })`
   * Could be destructured with rename - e.g. `const { Story: S } = defineMeta({ ... })`
   */
  defineMetaVariableDeclaration: ESTreeAST.VariableDeclaration;
  /**
   * Store the `export default declaration`, we will need to remove it later.
   * Why? Storybook expects `export default meta`, instead of what `@sveltejs/vite-plugin-svelte` will produce.
   */
  exportDefault: ESTreeAST.ExportDefaultDeclaration;
  /**
   * An identifier for the addon's component `<Story />`.
   * It could be destructured with rename - e.g. `const { Story: S } = defineMeta({ ... })`
   */
  storyIdentifier: ESTreeAST.Identifier;
  /**
   * A function declaration for the main Svelte component which is the `*.stories.svelte` file.
   */
  storiesFunctionDeclaration: ESTreeAST.FunctionDeclaration;
}

const AST_NODES_NAMES = {
  defineMeta: 'defineMeta',
  Story: 'Story',
} as const;

interface Params {
  ast: ESTreeAST.Program | ProgramNode;
  filename?: string;
}

/**
 * Extract compiled AST nodes from Vite _(via `rollup`)_.
 * Those nodes are required for further code transformation.
 */
export async function extractCompiledASTNodes(params: Params): Promise<CompiledASTNodes> {
  const { ast, filename } = params;

  const { walk } = await import('zimmerframe');

  const state: Partial<CompiledASTNodes> & {
    potentialStoriesFunctionDeclaration: ESTreeAST.FunctionDeclaration[];
  } = { potentialStoriesFunctionDeclaration: [] };
  const visitors: Visitors<ESTreeAST.Node | ESTreeAST.Comment, typeof state> = {
    ImportDeclaration(node, { state, visit }) {
      const { source, specifiers } = node;

      if (source.value === pkg.name) {
        for (const specifier of specifiers) {
          if (specifier.type !== 'ImportSpecifier') {
            throw new DefaultOrNamespaceImportUsedError(filename);
          }

          visit(specifier, state);
        }
      }
    },

    ImportSpecifier(node) {
      if (node.imported.name === AST_NODES_NAMES.defineMeta) {
        state.defineMetaImport = node;
      }
    },

    VariableDeclaration(node, { state }) {
      const { declarations } = node;
      const declaration = declarations[0];
      const { id, init } = declaration;

      if (
        id.type === 'ObjectPattern' &&
        init?.type === 'CallExpression' &&
        init.callee.type === 'Identifier' &&
        init.callee.name === state.defineMetaImport?.local.name
      ) {
        state.defineMetaVariableDeclaration = node;

        for (const property of id.properties) {
          if (
            property.type === 'Property' &&
            property.key.type === 'Identifier' &&
            property.key.name === AST_NODES_NAMES.Story &&
            property.value.type === 'Identifier'
          ) {
            state.storyIdentifier = property.value;
          }
        }
      }
    },

    FunctionDeclaration(node, { state }) {
      state.potentialStoriesFunctionDeclaration.push(node);
    },

    ExportDefaultDeclaration(node, { state }) {
      state.exportDefault = node;
      if (node.declaration.type === 'FunctionDeclaration') {
        /*
        In production, Svelte will compile the component to:
        export default COMPONENT_NAME () {...}
        */
        state.storiesFunctionDeclaration = node.declaration as ESTreeAST.FunctionDeclaration;
      } else if (node.declaration.type === 'Identifier') {
        /*
        In development, Svelte will compile the component to:
        function COMPONENT_NAME () {...}
        export default COMPONENT_NAME;
        */
        const { name } = node.declaration as ESTreeAST.Identifier;
        state.storiesFunctionDeclaration = state.potentialStoriesFunctionDeclaration?.find(
          (potential) => potential.id.name === name
        );
      }
    },
  };

  walk(ast as ESTreeAST.Program, state, visitors);

  const {
    defineMetaImport,
    defineMetaVariableDeclaration,
    exportDefault,
    storyIdentifier,
    storiesFunctionDeclaration,
  } = state;

  if (!defineMetaImport) {
    throw new MissingImportedDefineMetaError(filename);
  }

  if (!defineMetaVariableDeclaration) {
    throw new MissingDefineMetaVariableDeclarationError(filename);
  }

  if (!exportDefault) {
    throw new NoExportDefaultError(filename);
  }

  if (!storyIdentifier) {
    throw new NoStoryIdentifierFoundError(filename);
  }

  if (!storiesFunctionDeclaration) {
    throw new NoStoriesFunctionDeclarationError(filename);
  }

  return {
    defineMetaImport,
    defineMetaVariableDeclaration,
    exportDefault,
    storyIdentifier,
    storiesFunctionDeclaration,
  };
}
