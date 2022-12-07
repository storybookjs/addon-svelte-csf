# Svelte Story Format

Allows to write your stories in Svelte syntax and compiles it to Storybook's CSF syntax. See the native format tab in the [getting started docs](https://storybook.js.org/docs/svelte/get-started/whats-a-story) for an example.

It supports:

- args stories and stories without args ;
- the "template" pattern for args stories, compatible with a svelte syntax ;
- extractions of sources of the stories and compatible with addon-sources
- decorators
- knobs, actions, controls
- storyshots (with a special jest transformation shipped under @storybook/addon-svelte-csf/jest-transform)

## Example

```svelte
<script>
  import { Meta, Story, Template } from '@storybook/addon-svelte-csf';

  import Button from './Button.svelte';

  let count = 0;
  function handleClick() {
    count += 1;
  }
</script>

<Meta title="Button" component={Button}/>

<Template let:args>
  <Button {...args} on:click={handleClick}>
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

# Getting Started

1. `npm install --save-dev @storybook/addon-svelte-csf` or `yarn add --dev @storybook/addon-svelte-csf`
2. In `.storybook/main.js`, add `@storybook/addon-svelte-csf` to the addons array
3. In `.storybook/main.js`, add `*.stories.svelte` to the stories patterns

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

> **Warning**
> v3 and above of this addon requires at least Storybook v7. If you're using Storybook between v6.4.20 and v7.0.0, you should instead use v2 of this addon with `npm install --save-dev @storybook/addon-svelte-csf@^2.0.10` or `yarn add --dev @storybook/addon-svelte-csf@^2.0.10`
