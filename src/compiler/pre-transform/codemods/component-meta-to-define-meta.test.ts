import type { Comment, Component } from 'svelte/compiler';
import { print } from 'svelte-ast-print';
import { describe, it } from 'vitest';

import { transformComponentMetaToDefineMeta } from './component-meta-to-define-meta';

import { parseAndExtractSvelteNode } from '#tests/extractor';

describe(transformComponentMetaToDefineMeta.name, () => {
  it('works with a simple example', async ({ expect }) => {
    const code = `
      <script context="module">
        import { Meta } from "@storybook/addon-svelte-csf";
      </script>

      <Meta title="Atoms/Button" component={Button} />
    `;
    const node = await parseAndExtractSvelteNode<Component>(code, 'Component');

    expect(
      print(
        transformComponentMetaToDefineMeta({
          component: node,
        })
      )
    ).toMatchInlineSnapshot(
      `"const { Story } = defineMeta({ title: "Atoms/Button", component: Button });"`
    );
  });

  it('leading comments are included', async ({ expect }) => {
    const code = `
      <script context="module">
        import { Meta } from "@storybook/addon-svelte-csf";
      </script>

			<!-- This is a description for the **Button** component stories. -->
      <Meta title="Atoms/Button" component={Button} />
    `;
    const [comment, component] = await Promise.all([
      parseAndExtractSvelteNode<Comment>(code, 'Comment'),
      parseAndExtractSvelteNode<Component>(code, 'Component'),
    ]);

    expect(
      print(
        transformComponentMetaToDefineMeta({
          component,
          comment,
        })
      )
    ).toMatchInlineSnapshot(`
      "/** This is a description for the **Button** component stories. */ const { Story } = defineMeta({ title: "Atoms/Button", component: Button });"
    `);
  });

  it('supports <Meta> parameters with functions', async ({ expect }) => {
    const code = `
      <script context="module">
        import { Meta } from "@storybook/addon-svelte-csf";
        import WithParameters from './WithParameters.svelte';
      </script>

      <Meta component={WithParameters} parameters={{
          docs: {
            source: {
              transform: (code) => {
                return code + 'transformed';
              }
            }
          }
        }} />
    `;
    const component = await parseAndExtractSvelteNode<Component>(code, 'Component');

    expect(print(transformComponentMetaToDefineMeta({ component }))).toMatchInlineSnapshot(`
      "const { Story } = defineMeta({
      	component: WithParameters,
      	parameters: {
      		docs: {
      			source: {
      				transform: (code) => {
      					return code + 'transformed';
      				}
      			}
      		}
      	}
      });"
    `);
  });

  it('supports <Meta> with parameters being referenced to variable in the instance tag', async ({
    expect,
  }) => {
    const code = `
      <script>
        const parameters = { foo: 'bar' };
      </script>

      <Meta component={WithParameters} parameters={{ ...parameters, baz: 'yes'}} />
    `;
    const component = await parseAndExtractSvelteNode<Component>(code, 'Component');

    expect(print(transformComponentMetaToDefineMeta({ component }))).toMatchInlineSnapshot(`
      "const { Story } = defineMeta({
      	component: WithParameters,
      	parameters: { ...parameters, baz: 'yes' }
      });"
    `);
  });
});