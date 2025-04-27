<script module>
  import { defineMeta } from '@storybook/addon-svelte-csf';
  import { within, expect, fn } from '@storybook/test';

  import Mountable from './stories/Mountable.svelte';

  // More on how to set up stories at: https://storybook.js.org/docs/writing-stories
  const { Story } = defineMeta({
    title: 'Play() mount',
    component: Mountable,
    tags: ['xautodocs'],
    argTypes: {},
    args: {
      text: 'Mountable',
      onMounted: fn(),
    },
  });
</script>

<!-- play no mount -->
<Story
  name="Play no mount"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    expect(canvas.getByText('Mountable')).toBeInTheDocument();
  }}
></Story>

<!-- play and mount only -->
<Story
  name="With mount only"
  play={async ({ mount }) => {
    console.log('Pre');
    await mount();
    console.log('Post');
  }}
></Story>

<!-- play and mount -->
<Story
  name="With mount"
  play={async ({ args, mount, canvasElement }) => {
    const canvas = within(canvasElement);

    // passing test does no show pre mount, so we test after mount
    const preMountLabel = canvas.queryByText('Mountable');

    await mount();

    expect(preMountLabel).toBeNull(); // Here so shows in Component Test panel

    expect(canvas.getByText('Mountable')).toBeInTheDocument();
    expect(args.onMounted).toHaveBeenCalled();
  }}
></Story>
