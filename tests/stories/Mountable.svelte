<script lang="ts">
  import { onMount } from 'svelte'

  interface Props {
    /** Is this the principal call to action on the page? */
    text: string
    /** The onclick event handler */
    onMounted: () => void
  }

  const { text, onMounted }: Props = $props()

  onMount(() => {
    onMounted()
  })
</script>

<div>
  {text}
</div>
