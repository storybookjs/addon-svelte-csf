export { default as Meta } from './components/Meta.svelte';
import Story from './components/Story.svelte';
import Template from './components/Template.svelte';

export { Story, Template };

export function makeFrom() {
  return { Story, Template };
}
if (module?.hot?.decline) {
  module.hot.decline();
}
