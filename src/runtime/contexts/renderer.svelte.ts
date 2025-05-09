import { getContext, hasContext, setContext, type Snippet } from 'svelte';

import type { Cmp, StoryAnnotations, StoryContext } from '../../types.js';

const CONTEXT_KEY = 'storybook-story-renderer-context';

interface ContextProps<TCmp extends Cmp> {
  currentStoryExportName: string | undefined;
  args: NonNullable<StoryAnnotations<Record<string, any>, TCmp>['args']>;
  storyContext: StoryContext<TCmp>;
  metaRenderSnippet?: Snippet<
    [StoryAnnotations<Record<string, any>, TCmp>['args'], StoryContext<TCmp>]
  >;
}

function buildContext<TCmp extends Cmp>(props: ContextProps<TCmp>) {
  let currentStoryExportName = $state(props.currentStoryExportName);
  let args = $state(props.args);
  let storyContext = $state(props.storyContext);
  let metaRenderSnippet = $state(props.metaRenderSnippet);

  function set(props: ContextProps<TCmp>) {
    currentStoryExportName = props.currentStoryExportName;
    args = props.args;
    storyContext = props.storyContext;
    metaRenderSnippet = props.metaRenderSnippet;
  }

  return {
    get args() {
      return args;
    },
    get storyContext() {
      return storyContext;
    },
    get currentStoryExportName() {
      return currentStoryExportName;
    },
    get metaRenderSnippet() {
      return metaRenderSnippet;
    },
    set,
  };
}

export type StoryRendererContext<TCmp extends Cmp = Cmp> = ReturnType<typeof buildContext<TCmp>>;

function createStoryRendererContext<TCmp extends Cmp>(): void {
  const ctx = buildContext<TCmp>({
    currentStoryExportName: undefined,
    args: {},
    // @ts-expect-error FIXME: I don't know how to satisfy this one
    storyContext: {},
  });

  setContext(CONTEXT_KEY, ctx);
}

export function useStoryRenderer<TCmp extends Cmp>() {
  if (!hasContext(CONTEXT_KEY)) {
    createStoryRendererContext<TCmp>();
  }

  return getContext<StoryRendererContext<TCmp>>(CONTEXT_KEY);
}
