# Svelte Story Format

Allows you to write your stories in `.svelte` syntax rather than `.js` syntax.

It supports:

- args stories and stories without args ;
- the "template" pattern for args stories, compatible with a svelte syntax ;
- extractions of sources of the stories and compatible with addon-sources
- decorators
- knobs, actions, controls
- storyshots (with a special jest transformation shipped under `@storybook/addon-svelte-csf/jest-transform`)

## Example

Have a basic button component:

```svelte
<script>
  export let rounded = true;
</script>

<style>
  .rounded {
    border-radius: 35px;
  }

  button {
    border: 3px solid;
    padding: 10px 20px;
    background-color: white;
    outline: none;
  }
</style>

<button class="button" class:rounded on:click={onClick}>
  <slot />
</button>
```

And a `button.stories.svelte` file:

```svelte
<script context="module">
  import Button from './Button.svelte';

  export const meta = {
    title: "Button",
    component: Button
  }
</script>

<script>
  import { Story, Template } from '@storybook/addon-svelte-csf';

  let count = 0;
  function handleClick() {
    count += 1;
  }
</script>

<Template let:args>
  <!--👇 'on:click' allows to forward event to addon-actions  -->
  <Button {...args} 
    on:click
    on:click={handleClick}>
    You clicked: {count}
  </Button>
</Template>

<Story name="Rounded" args={{rounded: true}}/>

<Story name="Square" source args={{rounded: false}}/>

<!-- Dynamic snippet should be disabled for this story -->
<Story name="Button No Args">
  <Button>Label</Button>
</Story>
```

Actions are automatically registered by Storybook. To be used by this addon, you just have to forward the event (`on:click` in the previous example).


## Getting Started

1. `npm install --save-dev @storybook/addon-svelte-csf` or `yarn add --dev @storybook/addon-svelte-csf`
2. In `.storybook/main.js`, add `@storybook/addon-svelte-csf` to the addons array
4. In `.storybook/main.js`, include .stories.svelte files in your stories patterns, eg. by changing the patterns to `'../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'`

An example `main.js` configuration could look like this:

```js
module.exports = {
  stories: ['../src/**/*.stories.@(js|jsx|ts|tsx|svelte)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-svelte-csf',
  ],
  framework: '@storybook/svelte-vite',
};
```

## Version Dependencies

### 4.0.0

Version 4 of this addon requires _at least_:

- Storybook v7
- Svelte v4
- Vite v4 (if using Vite)
- `@sveltejs/vite-plugin-svelte` v2 (if using Vite)

If you're using Svelte v3 you can use version `^3.0.0` of this addon instead.

### 3.0.0

Version 3 of this addon requires at least Storybook v7.

If you're using Storybook between v6.4.20 and v7.0.0, you should instead use version `^2.0.0` of this addon.
