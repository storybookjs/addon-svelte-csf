<script>
  import { Meta, Story } from '../src/index';
  import { expect } from '@storybook/jest';
  import { userEvent, within } from '@storybook/testing-library';

  import Counter from './Counter.svelte';
  import { tick } from 'svelte';

  async function play({ canvasElement }) {
    const canvas = within(canvasElement);
    await userEvent.click(await canvas.findByText('Increment'));

    const count = await canvas.findByTestId('count');
    expect(count.textContent).toEqual('You clicked 1 times');
  }

  let i = 0;
</script>

<Meta title="Interactions" component={Counter} />

<Story name="Play" {play}>
  <Counter />
</Story>

<Story
  name="Play (capturing scope)"
  play={async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const p = canvas.getByTestId('count');
    expect(p.textContent).toEqual('0');
    i++;
    await tick();
    expect(p.textContent).toEqual('1');
  }}
>
  <p data-testid="count">{i}</p>
</Story>
