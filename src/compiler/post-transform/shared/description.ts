import { logger } from '@storybook/node-logger';
import dedent from 'dedent';

import type { ESTreeAST, SvelteAST } from '$lib/parser/ast.js';

import { createASTObjectExpression } from '$lib/parser/ast.js';

interface FindPropertyOptions {
  name: string;
  node: ESTreeAST.ObjectExpression;
  filename?: string;
  component?: SvelteAST.Component;
}

/**
 * In order to be able to access AST node - {@link Property} - from the {@link ObjectExpression},
 * we need to have its index based on the property name, so the key must be an identifier.
 * NOTE: Reminder, it always returns a number and `-1` means not found.
 */
export function findASTPropertyIndex(options: FindPropertyOptions) {
  const { node, name } = options;

  return node.properties.findIndex(
    (p) => p.type === 'Property' && p.key.type === 'Identifier' && p.key.name === name
  );
}

export const findPropertyParametersIndex = (options: Omit<FindPropertyOptions, 'name'>) => {
  return findASTPropertyIndex({
    ...options,
    name: 'parameters',
  });
};

export const getParametersProperty = (options: Omit<FindPropertyOptions, 'name'>) => {
  const { node } = options;

  return node.properties[findPropertyParametersIndex(options)] as ESTreeAST.Property;
};

export const getParametersPropertyValue = (
  options: Omit<FindPropertyOptions, 'name'>
): ESTreeAST.ObjectExpression => {
  const { filename, component } = options;
  let property = getParametersProperty(options);

  // NOTE: is a getter property - `get parameters()`
  // WARN: This is probably a bad idea. Need second opinion.
  // In the case when attribute _(prop)_ `parameters` was defined by the user in the `<Story />` component,
  // svelte internally will convert provided value into `Proxy`(?) _(I'm guessing on initial research)_.
  // This is some sort of reactivity-optimization(?).
  // The visualization below explains what's going to happen:
  //
  // Before:
  //
  // ```js
  // get parameters() {
  //   return something;
  // }
  //
  // ```js
  // parameters: {
  //   ...something,
  // },
  //
  if (
    property.kind === 'get' &&
    property.value.type === 'FunctionExpression' &&
    property.value.body.body[0].type === 'ReturnStatement'
  ) {
    const properties: ESTreeAST.ObjectExpression['properties'] = [];
    if (property.value.body.body[0].argument) {
      properties.push({
        type: 'SpreadElement',
        argument: property.value.body.body[0].argument,
      });
    }

    property.kind = 'init';
    property.value = createASTObjectExpression(properties);
  }

  if (property.value.type !== 'ObjectExpression') {
    logger.warn(dedent`
      Svelte CSF:
        Could not access 'parameters' of ${component ? "Story's prop" : 'defineMeta'}}.
        Expected value to be an object expression.
        Instead it was '${property.value.type}', in: 
        ${filename}
        Property:
        ${JSON.stringify(property, null, 2)}
    `);
    // NOTE: We're emitting a warning when it happens
    return undefined as never;
  }

  // FIXME: This is a dirty workaround.
  // I couldn't figure out how and where it gets `Object.preventExtension(properties)` enabled, or anything that gives the same effect.
  // There's no possibility to push an element to 'properties' array - throws an error related to "Object is not extensible".
  if (!Object.isExtensible(property.value.properties)) {
    property.value.properties = Array.from(property.value.properties);
  }

  return property.value;
};

export const findPropertyDocsIndex = (options: Omit<FindPropertyOptions, 'name'>) => {
  return findASTPropertyIndex({
    ...options,
    name: 'docs',
    node: getParametersPropertyValue(options),
  });
};

export const getDocsProperty = (options: Omit<FindPropertyOptions, 'name'>) => {
  return getParametersPropertyValue(options).properties[
    findPropertyDocsIndex(options)
  ] as ESTreeAST.Property;
};

export const getDocsPropertyValue = (options: Omit<FindPropertyOptions, 'name'>) => {
  const { filename, component } = options;
  const property = getDocsProperty(options);
  const { value } = property;

  if (value.type !== 'ObjectExpression') {
    logger.warn(dedent`
      Svelte CSF:
        Could not access 'parameters.docs' of ${component ? "Story's prop" : 'defineMeta'}}.
        Expected value to be an object expression.
        Instead it was '${property.value.type}', in: 
        ${filename}
        Property:
        ${JSON.stringify(property, null, 2)}
    `);
    // NOTE: We're emitting a warning when it happens
    return undefined as never;
  }

  return value;
};

export const findPropertyDescriptionIndex = (options: Omit<FindPropertyOptions, 'name'>) => {
  return findASTPropertyIndex({
    ...options,
    name: 'description',
    node: getDocsPropertyValue(options),
  });
};

export const getDescriptionProperty = (options: Omit<FindPropertyOptions, 'name'>) => {
  return getDocsPropertyValue(options).properties[
    findPropertyDescriptionIndex(options)
  ] as ESTreeAST.Property;
};

export const getDescriptionPropertyValue = (options: Omit<FindPropertyOptions, 'name'>) => {
  const { filename, component } = options;
  const property = getDescriptionProperty(options);
  const { value } = property;

  if (value.type !== 'ObjectExpression') {
    logger.warn(dedent`
      Svelte CSF:
        Could not access 'parameters.docs.description' of ${component ? "Story's prop" : 'defineMeta'}}.
        Expected value to be an object expression.
        Instead it was '${property.value.type}', in: 
        ${filename}
        Property:
        ${JSON.stringify(property, null, 2)}
    `);
    // NOTE: We're emitting a warning when it happens
    return undefined as never;
  }

  return value;
};
