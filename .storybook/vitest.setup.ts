import { beforeAll } from 'vitest';
import { setProjectAnnotations } from '@storybook/svelte';

// This is an important step to apply the right configuration when testing your stories.
// More info at: https://storybook.js.org/docs/api/portable-stories/portable-stories-vitest#setprojectannotations
const project = setProjectAnnotations([]);

beforeAll(project.beforeAll);