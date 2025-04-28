import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

import MagicString from 'magic-string';
import { parseAst } from 'rollup/parseAst';
import { describe, it } from 'vitest';

import { transformStoriesCode } from './index.js';

import { getSvelteAST } from '$lib/parser/ast.js';
import { extractSvelteASTNodes } from '$lib/parser/extract/svelte/nodes.js';
import { extractCompiledASTNodes } from '$lib/parser/extract/compiled/nodes.js';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

describe(transformStoriesCode.name, () => {
  it('transformed code matches inlined snapshot', async ({ expect }) => {
    const filename = path.resolve(__dirname, '../../../tests/stories/Example.stories.svelte');
    const originalCode = fs.readFileSync(filename).toString();
    const compiledPreTransformCode = fs
      .readFileSync(
        path.resolve(__dirname, '../../../tests/__compiled__/pre-transform/Example.stories.dev.js')
      )
      .toString();
    const svelteAST = getSvelteAST({ code: originalCode, filename });
    const svelteASTNodes = await extractSvelteASTNodes({
      ast: svelteAST,
      filename,
    });
    const compiledASTNodes = await extractCompiledASTNodes({
      ast: parseAst(compiledPreTransformCode),
      filename,
    });
    const code = new MagicString(compiledPreTransformCode);

    await transformStoriesCode({
      code,
      nodes: {
        svelte: svelteASTNodes,
        compiled: compiledASTNodes,
      },
      filename,
      originalCode,
    });

    expect(code.toString()).toMatchInlineSnapshot(
      `
      "import "svelte/internal/disclose-version";

      $.mark_module_start();
      Example_stories[$.FILENAME] = "tests/stories/Example.stories.svelte";

      import * as $ from "svelte/internal/client";
      import { action } from '@storybook/addon-actions';
      import { defineMeta, setTemplate } from '@storybook/addon-svelte-csf';
      import Example from './Example.svelte';

      /**
       * Description set explicitly in the comment above \`defineMeta\`.
       *
       * Multiline supported. And also Markdown syntax:
       *
       * * **Bold**,
       * * _Italic_,
       * * \`Code\`.
       */
      const meta = {
      	title: 'Example',
      	component: Example,
      	tags: ['autodocs'],
      	args: {
      		onclick: action('onclick'),
      		onmouseenter: action('onmouseenter'),
      		onmouseleave: action('onmouseleave')
      	},
      	parameters: {
      		docs: {
      			description: {
      				component: "Description set explicitly in the comment above \`defineMeta\`.\\n\\nMultiline supported. And also Markdown syntax:\\n\\n* **Bold**,\\n* _Italic_,\\n* \`Code\`."
      			}
      		}
      	}
      };
      const { Story } = defineMeta(meta);

      var root_2 = $.add_locations($.template(\`<p> </p> <p> </p> <br>\`, 1), Example_stories[$.FILENAME], [[43, 2], [44, 2], [44, 44]]);
      var root = $.add_locations($.template(\`<!> <!> <!> <!> <!>\`, 1), Example_stories[$.FILENAME], []);

      function Example_stories($$anchor, $$props) {
      	$.check_target(new.target);
      	$.push($$props, true, Example_stories);

      	const render = $.wrap_snippet(Example_stories, ($$anchor, $$arg0, context = $.noop) => {
      		let _ = () => $$arg0?.().children;

      		_();

      		let args = () => $.exclude_from_object($$arg0?.(), ["children"]);

      		args();

      		var fragment = $.comment();
      		var node = $.first_child(fragment);

      		Example(node, $.spread_props(args, {
      			onclick: handleClick,
      			children: $.wrap_snippet(Example_stories, ($$anchor, $$slotProps) => {
      				var fragment_1 = root_2();
      				var p = $.first_child(fragment_1);
      				var text = $.child(p, true);

      				$.reset(p);

      				var p_1 = $.sibling(p, 2);
      				var text_1 = $.child(p_1, true);

      				$.reset(p_1);

      				var text_2 = $.sibling(p_1);

      				$.next();

      				$.template_effect(() => {
      					$.set_text(text, args().id);
      					$.set_text(text_1, context().name);
      					$.set_text(text_2, \` You clicked: \${$.get(count) ?? ""}\`);
      				});

      				$.append($$anchor, fragment_1);
      			}),
      			$$slots: { default: true }
      		}));

      		$.append($$anchor, fragment);
      	});

      	$.validate_prop_bindings($$props, [], [], Example_stories);

      	let count = $.state(0);

      	function handleClick() {
      		$.set(count, $.get(count) + 1);
      	}

      	setTemplate(render);

      	var fragment_2 = root();
      	var node_1 = $.first_child(fragment_2);

      	Story(node_1, {
      	name: "Default",
      	parameters: {
      		docs: {
      			description: { story: "Description for the default story" }
      		},
      		__svelteCsf: {
      			rawCode: "<Example {...args} onclick={handleClick}>\\n  <p>{args.id}</p>\\n  <p>{context.name}</p>\\n  You clicked: {count}<br />\\n</Example>"
      		}
      	}
      });

      	var node_2 = $.sibling(node_1, 2);

      	Story(node_2, {
      	name: "Rounded",
      	args: { rounded: true },
      	parameters: {
      		docs: {
      			description: { story: "Description for the rounded story" }
      		},
      		__svelteCsf: {
      			rawCode: "<Example {...args} onclick={handleClick}>\\n  <p>{args.id}</p>\\n  <p>{context.name}</p>\\n  You clicked: {count}<br />\\n</Example>"
      		}
      	}
      });

      	var node_3 = $.sibling(node_2, 2);

      	Story(node_3, {
      	name: "Square",
      	args: { rounded: false },
      	parameters: {
      		docs: {
      			description: { story: "Description for the squared story" }
      		},
      		__svelteCsf: {
      			rawCode: "<Example {...args} onclick={handleClick}>\\n  <p>{args.id}</p>\\n  <p>{context.name}</p>\\n  You clicked: {count}<br />\\n</Example>"
      		}
      	}
      });

      	var node_4 = $.sibling(node_3, 2);

      	Story(node_4, {
      	name: "As child",
      	asChild: true,
      	children: $.wrap_snippet(Example_stories, ($$anchor, $$slotProps) => {
      		var fragment_3 = $.comment();
      		var node_5 = $.first_child(fragment_3);

      		Example(node_5, {
      			children: $.wrap_snippet(Example_stories, ($$anchor, $$slotProps) => {
      				$.next();

      				var text_3 = $.text("Label");

      				$.append($$anchor, text_3);
      			}),
      			$$slots: { default: true }
      		});

      		$.append($$anchor, fragment_3);
      	}),
      	$$slots: { default: true },
      	parameters: {
      		__svelteCsf: { rawCode: "<Example>Label</Example>" }
      	}
      });

      	var node_6 = $.sibling(node_4, 2);

      	Story(node_6, {
      	name: "Children forwared",
      	children: $.wrap_snippet(Example_stories, ($$anchor, $$slotProps) => {
      		$.next();

      		var text_4 = $.text("Forwarded label");

      		$.append($$anchor, text_4);
      	}),
      	$$slots: { default: true },
      	parameters: {
      		__svelteCsf: {
      			rawCode: "<Example {...args}>\\n  Forwarded label\\n</Example>"
      		}
      	}
      });

      	$.append($$anchor, fragment_2);
      	return $.pop({ ...$.legacy_api() });
      }

      if (import.meta.hot) {
      	Example_stories = $.hmr(Example_stories, () => Example_stories[$.HMR].source);

      	import.meta.hot.acceptExports(["default"],(module) => {
      		module.default[$.HMR].source = Example_stories[$.HMR].source;
      		$.set(Example_stories[$.HMR].source, module.default[$.HMR].original);
      	});
      }



      $.mark_module_end(Example_stories);

      import { createRuntimeStories } from "@storybook/addon-svelte-csf/internal/create-runtime-stories";

      const __stories = createRuntimeStories(Example_stories, meta);

      export default meta;

      export const __namedExportsOrder = [
      	"Default",
      	"Rounded",
      	"Square",
      	"AsChild",
      	"ChildrenForwared"
      ];

      export const Default = { ...__stories["Default"], tags: [] };
      export const Rounded = { ...__stories["Rounded"], tags: [] };
      export const Square = { ...__stories["Square"], tags: [] };
      export const AsChild = { ...__stories["AsChild"], tags: [] };
      export const ChildrenForwared = { ...__stories["ChildrenForwared"], tags: [] };"
    `
    );
  });
});
