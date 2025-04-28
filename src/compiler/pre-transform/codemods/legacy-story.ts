import {
  createASTArrayExpression,
  createASTAttribute,
  createASTExpressionTag,
  createASTObjectExpression,
  createASTProperty,
  type ESTreeAST,
  type SvelteAST,
} from '$lib/parser/ast.js';
import { InvalidTemplateAttribute } from '$lib/utils/error/legacy-api/index.js';

import { hashTemplateName } from '$lib/utils/identifier-utils.js';
import type { State } from '../index.js';

interface Params {
  component: SvelteAST.Component;
  filename?: string;
  state: State;
}

export function transformLegacyStory(params: Params): SvelteAST.Component {
  const { component, filename, state } = params;
  let { attributes, fragment, ...rest } = component;
  let newAttributes: SvelteAST.Component['attributes'] = [];
  let autodocs: SvelteAST.Attribute | undefined;
  let source: SvelteAST.Attribute | undefined;
  let parameters: SvelteAST.Attribute | undefined;
  let tags: SvelteAST.Attribute | undefined;
  let letDirectiveArgs: SvelteAST.LetDirective | undefined;
  let letDirectiveContext: SvelteAST.LetDirective | undefined;
  let hasTemplateAttribute = false;

  for (let attribute of attributes) {
    if (attribute.type === 'LetDirective' && attribute.name === 'args') {
      letDirectiveArgs = attribute;
      continue;
    }

    if (attribute.type === 'LetDirective' && attribute.name === 'context') {
      letDirectiveContext = attribute;
      continue;
    }

    if (attribute.type === 'Attribute' && attribute.name === 'autodocs') {
      autodocs = attribute;
      continue;
    }

    if (attribute.type === 'Attribute' && attribute.name === 'source') {
      source = attribute;
      continue;
    }

    if (attribute.type === 'Attribute' && attribute.name === 'parameters') {
      parameters = attribute;
      continue;
    }

    if (attribute.type === 'Attribute' && attribute.name === 'tags') {
      tags = attribute;
      continue;
    }

    if (attribute.type === 'Attribute' && attribute.name === 'template') {
      attribute = templateToChildren(attribute, filename);
      hasTemplateAttribute = true;
    }

    newAttributes.push(attribute);
  }

  // NOTE: is self-closing
  // AND has no template attribute
  // AND there is an existing unidentified <Template> components in the stories file
  if (fragment.nodes.length === 0 && !hasTemplateAttribute && state.unidentifiedTemplateComponent) {
    newAttributes.push(
      createASTAttribute(
        'template',
        createASTExpressionTag({
          type: 'Identifier',
          name: 'sb_default_template',
        })
      )
    );
  }

  if (!tags) {
    tags = createASTAttribute('tags', createASTExpressionTag(createASTArrayExpression()));
  }

  if (autodocs) {
    transformAutodocs({
      autodocs,
      tags,
      newAttributes,
    });
  }

  if (source) {
    transformSource({
      source,
      parameters,
      newAttributes,
    });
  }

  if (letDirectiveArgs || letDirectiveContext) {
    fragment = transformFragment({
      letDirectiveArgs,
      letDirectiveContext,
      fragment,
    });
  }

  if (parameters) {
    newAttributes.push(parameters);
  }

  // Always add 'legacy' tag to all legacy stories
  if (
    typeof tags.value === 'object' &&
    !Array.isArray(tags.value) &&
    tags.value.type === 'ExpressionTag' &&
    tags.value.expression.type === 'ArrayExpression' &&
    !tags.value.expression.elements.some(
      (el) => el && el.type === 'Literal' && el.value === 'legacy'
    )
  ) {
    tags.value.expression.elements.push({
      type: 'Literal',
      value: 'legacy',
    });
  }

  newAttributes.push(tags);

  return {
    ...rest,
    attributes: newAttributes,
    fragment,
  };
}

interface InsertAutodocsParams {
  autodocs?: SvelteAST.Attribute;
  tags?: SvelteAST.Attribute;
  newAttributes: SvelteAST.Component['attributes'];
}
function transformAutodocs(params: InsertAutodocsParams): void {
  let { autodocs, tags, newAttributes } = params;

  if (!autodocs) {
    return;
  }

  if (!tags) {
    tags = createASTAttribute('tags', createASTExpressionTag(createASTArrayExpression()));
  }

  const autodocsLiteral = {
    type: 'Literal',
    value: 'autodocs',
  } satisfies ESTreeAST.Literal;

  ((tags.value as SvelteAST.ExpressionTag).expression as ESTreeAST.ArrayExpression).elements.push(
    autodocsLiteral
  );

  newAttributes.push(tags);
}

interface InsertSourceParams {
  source?: SvelteAST.Attribute;
  parameters?: SvelteAST.Attribute;
  newAttributes: SvelteAST.Component['attributes'];
}
function transformSource(params: InsertSourceParams): void {
  let { source, parameters, newAttributes } = params;

  if (!source) return;

  const value = getSourceValue(source);

  if (!value) return;

  const codeLiteralValue = {
    type: 'Literal',
    value,
  } satisfies ESTreeAST.Literal;

  if (!parameters) {
    parameters = createASTAttribute(
      'parameters',
      createASTExpressionTag(createASTObjectExpression())
    );
  }

  let docsProperty = (
    (parameters.value as SvelteAST.ExpressionTag).expression as ESTreeAST.ObjectExpression
  ).properties.find(
    (property) =>
      property.type === 'Property' && (property.key as ESTreeAST.Identifier).name === 'docs'
  );

  if (!docsProperty) {
    docsProperty = createASTProperty('docs', createASTObjectExpression());
  }

  let sourceProperty = (docsProperty.value as ESTreeAST.ObjectExpression).properties.find(
    (property) =>
      property.type === 'Property' && (property.key as ESTreeAST.Identifier).name === 'source'
  );

  if (!sourceProperty) {
    sourceProperty = createASTProperty('source', createASTObjectExpression());
  }

  let codeProperty = (sourceProperty.value as ESTreeAST.ObjectExpression).properties.find(
    (property) =>
      property.type === 'Property' && (property.key as ESTreeAST.Identifier).name === 'code'
  );

  if (!codeProperty) {
    codeProperty = createASTProperty('code', codeLiteralValue);
    (sourceProperty.value as ESTreeAST.ObjectExpression).properties.push(codeProperty);
    (docsProperty.value as ESTreeAST.ObjectExpression).properties.push(sourceProperty);
    (
      (parameters.value as SvelteAST.ExpressionTag).expression as ESTreeAST.ObjectExpression
    ).properties.push(docsProperty);
  }

  newAttributes.push(parameters);
}

function getSourceValue(attribute: SvelteAST.Attribute): string | undefined {
  const { value } = attribute;

  if (value === true) {
    return;
  }

  if (!Array.isArray(value)) {
    if (value.expression.type === 'Literal' && typeof value.expression.value === 'string') {
      return value.expression.value;
    }

    if (value.expression.type === 'TemplateLiteral') {
      return value.expression.quasis.map((q) => q.value.cooked).join('');
    }
  }

  if (value[0].type === 'Text') {
    return value[0].raw;
  }
}

function templateToChildren(
  attribute: SvelteAST.Attribute,
  filename?: string
): SvelteAST.Attribute {
  const { name, value, ...rest } = attribute;

  if (value === true) {
    throw new InvalidTemplateAttribute({ attribute, filename });
  }

  return {
    ...rest,
    name: 'template',
    value: [
      createASTExpressionTag({
        type: 'Identifier',
        name: hashTemplateName(
          value[0].type === 'Text'
            ? value[0].data
            : ((value[0].expression as ESTreeAST.Literal).value as string)
        ),
      }),
    ],
  };
}

interface TransformFragmentParams {
  letDirectiveArgs?: SvelteAST.LetDirective;
  letDirectiveContext?: SvelteAST.LetDirective;
  fragment: SvelteAST.Fragment;
}
function transformFragment(params: TransformFragmentParams): SvelteAST.Fragment {
  let { letDirectiveArgs, letDirectiveContext, fragment } = params;

  let parameters: SvelteAST.SnippetBlock['parameters'] = [
    {
      type: 'Identifier',
      name: letDirectiveArgs ? 'args' : '_args',
    },
  ];

  if (letDirectiveContext) {
    parameters.push({
      type: 'Identifier',
      name: 'context',
    });
  }

  const snippetBlock = {
    type: 'SnippetBlock',
    body: fragment,
    expression: {
      type: 'Identifier',
      name: 'template',
    },
    parameters,
  } satisfies SvelteAST.SnippetBlock;

  return {
    ...fragment,
    nodes: [snippetBlock],
  };
}
