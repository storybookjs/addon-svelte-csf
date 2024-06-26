# Svelte CSF

This Storybook addon allows you to write Storybook stories using the Svelte language instead of ESM that regular CSF is based on.

```bash
npx storybook@latest add @storybook/addon-svelte-csf
```

Using the Svelte language makes it easier to write stories for composed components that rely on snippets or slots, which aren't easily re-created outside of Svelte files.

## 🐣 Getting Started

> [!TIP]
> If you've initialized your Storybook project with Storybook version 8.2.0 or above, this addon is already set up for you!

> [!IMPORTANT]  
> Not running the latest and greatest versions of Storybook or Svelte? Be sure to check [the version compatibility section below](#version-compatibility).

The easiest way to install the addon is with `storybook add`:

```bash
npx storybook@latest add @storybook/addon-svelte-csf
```

You can also add the addon manually. First, install the package:

```bash
npm install --save-dev @storybook/addon-svelte-csf
```

Then modify your `main.ts` Storybook configuration to include the addon and include `*.stories.svelte` files:

```diff
export default {
-  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)',
+  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx|svelte)'],
  addons: [
+    '@storybook/addon-svelte-csf',
    ...
  ],
  ...
}
```

Restart your Storybook server for the changes to take effect.

## 🐓 Usage

> [!NOTE]
> The documentation here does not cover all of Storybook's features, only the aspects that are specific to the addon and Svelte CSF. We recommend that you familiarize yourself with Storybook's core concepts at https://storybook.js.org/docs.

The [`examples`](./examples/) directory contains examples describing each feature of the addon. The [`Button.stories.svelte` example](./examples/Button.stories.svelte) is a good one to get started with. [The Storybook with all the examples is published on Chromatic here](https://next--667492d3e52064f1d418ec95.chromatic.com).

Svelte CSF stories files must always have the `.stories.svelte` extension.

### Defining the meta

All stories files must have a "meta" (aka. "default export") defined, and its structure follows what's described in [the official docs on the subject](https://storybook.js.org/docs/api/csf#default-export). To define the meta in Svelte CSF, call the `defineMeta` function **within the module context**, with the meta properties you want:

```svelte
<script context="module">
  //    👆 notice the module context, defineMeta does not work in a regular <script> tag
  import { defineMeta } from "@storybook/addon-svelte-csf";

  import MyComponent from "./MyComponent.svelte";

  //      👇 Get the Story component from the return value
  const { Story } = defineMeta({
    title: 'Path/To/MyComponent',
    component: MyComponent,
    decorators: [ ... ],
    parameters: { ... },
  });
</script>
```

`defineMeta` returns an object with a `Story` component (see [Defining stories](#defining-stories) below) that you must destructure out to use.

### Defining stories

To define stories, you use the `Story` component returned from the `defineMeta` function. Depending on what you want the story to contain, there are multiple ways to use the `Story` component. Common for all the use case is that all properties of [a regular CSF story](https://storybook.js.org/docs/api/csf#named-story-exports) are passed as props to the `Story` component, with the exception of the `render` function, which does not have any effect in Svelte CSF.

All story requires either the `name` prop or [`exportName` prop](#custom-export-name).

> [!TIP]
> In versions prior to v5 of this addon, it was always required to define a template story with the `<Template>` component. This is no longer required and stories will default to render the component from `meta` if no template is set.

#### Plain Story

If your component only accepts props and doesn't require snippets or slots, you can use the simple form of defining stories, only using args:

```svelte
<Story name="Primary" args={{ primary: true }} />
```

This will render the component defined in the meta, with the args passed as props.

#### Static template

If you need more customization of the story, like composing components or defining snippets, you can pass in children to the `Story`, and write whatever component structure you desire:

```svelte
<Story name="Composed">
  <MyComponent>
    <AChild label="Hello world!" />
  </MyComponent>
</Story>
```

> [!IMPORTANT]  
> This format completely ignores args, as they are not passed down to any of the child components defined. Even if your story has args and Controls, they won't have an effect. See the snippet-based formats below.

#### Inline snippet

If you need composition/snippets but also want a dynamic story that reacts to args or the story context, you can define a `children` snippet in the `Story` component:

```svelte
<Story name="Simple Children" args={{ simpleChild: true }}>
  {#snippet children(args, storyContext)}
    <MyComponent {...args}>
      {#if args.simpleChild}
        <AChild data={args.childProps} />
      {:else}
        <ComplexChildA data={args.childProps} />
        <ComplexChildB data={args.childProps} />
      {/if}
    </MyComponent>
  {/snippet}
</Story>
```

#### Shared snippet

Often your stories are very similar and their only differences are args or play-functions. In this case it can be cumbersome to define the same `children` snippet over and over again. You can share snippets by defining them at the top-level and passing them as props to `Story`:

```svelte
{#snippet template(args, storyContext)}
  <MyComponent {...args}>
    {#if args.simpleChild}
      <AChild data={args.childProps} />
    {:else}
      <ComplexChildA data={args.childProps} />
      <ComplexChildB data={args.childProps} />
    {/if}
  </MyComponent>
{/snippet}

<Story name="Simple Children" args={{ simpleChild: true }} children={template} />

<Story name="Complex Children" args={{ simpleChild: false }} children={template} />
```

You can also use this pattern to define multiple templates and share the different templates among different stories.

#### Default snippet

If you only need a single template that you want to share, it can be tedious to include `children={template}` in each `Story` component. In this case you can use the `setTemplate()` helper function that sets a default template for all stories. In regular CSF terms, this is the equivalent of defining a meta-level `render`-function versus story-level `render`-functions:

```svelte
<script context="module">
  import { defineMeta, setTemplate } from "@storybook/addon-svelte-csf";
  //                   👆 import the function
  import MyComponent from "./MyComponent.svelte";

  const { Story } = defineMeta({ ... });
</script>

<script>
  // 👆 note this must be within a regular <script> tag as the module context can not reference snippets defined in the markup
  setTemplate(template);
  //          👆 the name of the snippet as defined below (can be any name)
</script>

{#snippet template(args, storyContext)}
  <MyComponent {...args}>
    {#if args.simpleChild}
      <AChild data={args.childProps} />
    {:else}
      <ComplexChildA data={args.childProps} />
      <ComplexChildB data={args.childProps} />
    {/if}
  </MyComponent>
{/snippet}

<Story name="Simple Children" args={{ simpleChild: true }} />

<Story name="Complex Children" args={{ simpleChild: false }} />
```

Stories can still override this default snippet using any of the methods for defining story-level content.

#### Custom export name

Behind-the-scenes, each `<Story />` definition is compiled to a variable export like `export const MyStory = ...;`. In most cases you don't have to care about this detail, however sometimes naming conflicts can arise from this. The variable names are simplifications of the story names - to make them valid JavaScript variables.

This can cause conflicts, eg. two stories with the names _"my story!"_ and _"My Story"_ will both be simplified to `MyStory`.

You can explicitly define the variable name of any story by passing the `exportName` prop:

```svelte
<Story exportName="MyStory1" name="my story!" />
<Story exportName="MyStory2" name="My Story" />
```

At least one of the `name` or `exportName` props must be passed to the `Story` component - passing both is also valid.

### TypeScript

Story snippets and args can be type-safe when necessary. The type of the args are inferred from the component passed to `defineMeta`.

You can make your snippets type-safe with the `Args` and `StoryContext` helper types:

```svelte
<script context="module" lang="ts">
  import { defineMeta, type Args, type StoryContext } from '@storybook/addon-svelte-csf';

  import MyComponent from './MyComponent.svelte';

  const { Story } = defineMeta({
    component: MyComponent,
  });
</script>

{#snippet template(args: Args<typeof Story>, context: StoryContext<typeof Story>)}
  <MyComponent {...args} />
{/snippet}
```

If you need to customize the type of the args, you can pass in a generic to `defineMeta` that will override the types inferred from the component:

```svelte
const { Story } = defineMeta<{ anotherProp: boolean }>( ... );
```

## Version compatibility

### latest

Version 5 and up of this addon requires _at least_:

- Storybook v8.0.0
- Svelte v5.0.0
- Vite v5.0.0
- `@sveltejs/vite-plugin-svelte` v4.0.0

As of v5 this addon does not support Webpack.

### v4

```bash
npm install --save-dev @storybook/addon-svelte-csf@^4
```

Version 4 of this addon requires _at least_:

- Storybook v7
- Svelte v4
- Vite v4 (if using Vite)
- `@sveltejs/vite-plugin-svelte` v2 (if using Vite)

### v3

```bash
npm install --save-dev @storybook/addon-svelte-csf@^3
```

Version 3 of this addon requires _at least_:

- Storybook v7
- Svelte v3

### v2

```bash
npm install --save-dev @storybook/addon-svelte-csf@^2
```

If you're using Storybook between v6.4.20 and v7.0.0, you should use version `^2.0.0` of this addon.

## 🤝 Contributing

This project uses [pnpm](https://pnpm.io/installation) for dependency management.

1. Install dependencies with `pnpm install`
2. Concurrently start the compilation and the internal Storybook with `pnpm start`.
3. Restarting the internal Storybook is often needed for changes to take effect.
