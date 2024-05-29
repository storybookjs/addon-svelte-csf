<script context="module">
  import { defineMeta } from '@storybook/addon-svelte-csf';
  const { Story } = defineMeta({});
</script>

<Story name="Story1" />

<Story name="Story2" />

<Story name="Story3">
  <p>Story 3 children</p>
</Story>
