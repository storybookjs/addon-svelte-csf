<script context="module">
  import { typed } from '../src/index.js';
  import Button from './Button.svelte';

  let count = 0;
  function handleClick() {
    count += 1;
  }

  export const meta = {
    component: Button,
  };

  const { Story, Template } = typed(meta);

</script>

<Template let:args let:text>
  <Button {...args} on:click={handleClick} on:click>
    You clicked: {count}
  </Button>
</Template>

<Story name="Default"/>

<Story name="Rounded" args={{ rounded: true }}/>

<Story name="Square" source args={{rounded: false}}/>

<!-- Dynamic snippet should be disabled for this story -->
<Story name="Button No Args">
  <Button>Label</Button>
</Story>