import dedent from 'dedent';

import type { SvelteAST } from '$lib/parser/ast.js';
import type { SvelteASTNodes } from '$lib/parser/extract/svelte/nodes.js';
import { StorybookSvelteCSFError } from '$lib/utils/error.js';

const BASE_INITIAL_SNIPPET = dedent`
<script module>
  import { defineMeta } from "@storybook/addon-svelte-csf";
  
  const { Story } = defineMeta({});
</script>
`;

export class MissingModuleTagError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 1;
  public documentation = true;

  constructor(filename?: string) {
    super({ filename });
  }

  template() {
    return dedent`
      The file '${this.filepathURL}'
      does not have a module context (<script module> ... </script>).

      defineMeta(...) should be called inside a module script tag, like so:

      ${BASE_INITIAL_SNIPPET}
    `;
  }
}

export class DefaultOrNamespaceImportUsedError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 2;
  public documentation = true;

  constructor(filename?: StorybookSvelteCSFError['filename']) {
    super({ filename });
  }

  template() {
    return dedent`
      The file '${this.filepathURL}'
      is using the default/namespace import from "${StorybookSvelteCSFError.packageName}".
      Only named imports are supported.
    `;
  }
}

export class MissingDefineMetaImportError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 3;
  public documentation = true;

  constructor(filename?: StorybookSvelteCSFError['filename']) {
    super({ filename });
  }

  template() {
    return dedent`
      The file '${this.filepathURL}'
      does not import defineMeta from "${StorybookSvelteCSFError.packageName}" inside the module context.

      Make sure to import defineMeta from the package and use it inside the module context like so:

      ${BASE_INITIAL_SNIPPET}
    `;
  }
}

export class MissingDefineMetaVariableDeclarationError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 4;
  public documentation = true;

  constructor(filename?: StorybookSvelteCSFError['filename']) {
    super({ filename });
  }

  template() {
    return dedent`
    The file '${this.filepathURL}'
    does not store the result of calling defineMeta(). While defineMeta() might have been called,
    it's return value needs to be stored and destructured for the parsing to succeed, eg.:

    ${BASE_INITIAL_SNIPPET}
    `;
  }
}

export class NoStoryComponentDestructuredError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 5;
  public documentation = true;

  public defineMetaImport: SvelteASTNodes['defineMetaImport'];

  constructor({
    filename,
    defineMetaImport,
  }: {
    filename?: StorybookSvelteCSFError['filename'];
    defineMetaImport: NoStoryComponentDestructuredError['defineMetaImport'];
  }) {
    super({ filename });
    this.defineMetaImport = defineMetaImport;
  }

  template() {
    return dedent`
      The file '${this.filepathURL}'
      does not destructure the Story component from the '${this.defineMetaImport.local.name}({ ... })' function call.
      eg.:

      ${BASE_INITIAL_SNIPPET}
    `;
  }
}

export class GetDefineMetaFirstArgumentError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 6;
  public documentation = true;

  public defineMetaVariableDeclaration: SvelteASTNodes['defineMetaVariableDeclaration'];

  constructor({
    filename,
    defineMetaVariableDeclaration,
  }: {
    filename?: StorybookSvelteCSFError['filename'];
    defineMetaVariableDeclaration: SvelteASTNodes['defineMetaVariableDeclaration'];
  }) {
    super({ filename });
    this.defineMetaVariableDeclaration = defineMetaVariableDeclaration;
  }

  template() {
    return dedent`
      The file '${this.filepathURL}'
      passes an invalid first argument to the 'defineMeta' call.

      The first argument must be an object expression with the meta properties set.
    `;
  }
}

export class InvalidStoryTemplateAttributeError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 7;
  public documentation = true;

  public templateAttribute: SvelteAST.Attribute;

  constructor({
    filename,
    component,
    templateAttribute,
  }: {
    filename?: StorybookSvelteCSFError['filename'];
    component: NonNullable<StorybookSvelteCSFError['component']>;
    templateAttribute: InvalidStoryTemplateAttributeError['templateAttribute'];
  }) {
    super({ filename, component });
    this.templateAttribute = templateAttribute;
  }

  template() {
    return dedent`
      Component '${this.quickStoryRawCodeIdentifier}' in the stories file '${this.filepathURL}'
      has an invalid 'template'-prop.

      When set, the 'template'-prop must be an expression with reference to a root-level snippet.

      Eg.:

      {#snippet template()}
        ...
      {/snippet}

      <Story name="${this.storyNameFromAttribute}" template={template} />
    `;
  }
}

export class IndexerParseError extends StorybookSvelteCSFError {
  readonly category = StorybookSvelteCSFError.CATEGORY.parserExtractSvelte;
  readonly code = 9;
  public documentation = true;

  constructor(options?: ConstructorParameters<typeof Error>[1]) {
    super({}, options);
  }

  template() {
    return dedent`
      Storybook stories indexer parser threw an unrecognized error.
      If you see this error, please report it on the issue tracker on GitHub.
    `;
  }
}
