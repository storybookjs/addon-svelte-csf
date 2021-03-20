# Svelte Story Format

Allows to write your stories in svelte syntax.

It supports:

- args stories and stories without args ;
- the "template" pattern for args stories, compatible with a svelte syntax ;
- extractions of sources of the stories and compatible with addon-sources
- decorators
- knobs, actions, controls
- storyshots (with a special jest transformation shipped under @storybook/addon-svelte-csf/jest-transform)

## Example

```
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

1. Add '@storybook/addon-svelte-csf' to your dev dependencies
2. In `.storybook/main.js`, add `*.stories.svelte` to the stories patterns
3. In `.storybook/main.js`, add `@storybook/addon-svelte-csf` to the addons array
