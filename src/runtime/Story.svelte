<script module lang="ts">
  type TemplateSnippet<T extends Cmp> = Snippet<
    [StoryRendererContext<T>['args'], StoryRendererContext<T>['storyContext']]
  >;
</script>

<script
  lang="ts"
  generics="TCmp extends Cmp, TChildren extends Snippet = Snippet, TTemplate extends TemplateSnippet<TCmp> = TemplateSnippet<TCmp>"
>
  import type { Snippet } from 'svelte';

  import { useStoriesExtractor } from './contexts/extractor.svelte.js';
  import { useStoryRenderer, type StoryRendererContext } from './contexts/renderer.svelte.js';

  import { storyNameToExportName } from '../utils/identifier-utils.js';
  import type { Cmp, StoryAnnotations } from '../types.js';
  import { SVELTE_CSF_V4_TAG } from '../constants.js';

  type Props = Partial<StoryAnnotations<TCmp>> & {
    /**
     * @deprecated
     * Use `exportName` instead.
     */
    id?: never;
    /**
     * Name of the story. Can be omitted if `exportName` is provided.
     */
    name?: string;
    /**
     * exportName of the story.
     * If not provided, it will be generated from the 'name', by converting it to a valid, PascalCased JS variable name.
     * eg. 'My story!' -> 'MyStory'
     *
     * Use this prop to explicitly set the export name of the story. This is useful if you have multiple stories with the names
     * that result in duplicate export names like "My story" and "My story!".
     * It's also useful for explicitly defining the export that can be imported in MDX docs.
     */
    exportName?: string;
    /**
     * @deprecrated
     * Use `tags={['autodocs']}` instead.
     * @see {@link https://github.com/storybookjs/addon-svelte-csf/blob/main/MIGRATION.md#story-prop-autodocs-has-been-removed}
     */
    autodocs?: never;
    /**
     * @deprecated
     * Use `parameters={{ docs: { source: { code: "..." } } }}` instead.
     * @see {@link https://github.com/storybookjs/addon-svelte-csf/blob/next/MIGRATION.md#story-prop-source-has-been-removed}
     */
    source?: never;
  } & (
      | {
          /**
           * exportName of the story.
           * If not provided, it will be generated from the 'name', by converting it to a valid, PascalCased JS variable name.
           * eg. 'My story!' -> 'MyStory'
           *
           * Use this prop to explicitly set the export name of the story. This is useful if you have multiple stories with the names
           * that result in duplicate export names like "My story" and "My story!".
           * It's also useful for explicitly defining the export that can be imported in MDX docs.
           */
          exportName: string;
        }
      | {
          /**
           * Name of the story. Can be omitted if `exportName` is provided.
           */
          name: string;
        }
    ) & {
      /**
       * Children to pass to the story's component
       * Or if `asChild` is true, the content to render in the story as **static** markup.
       */
      children?: TChildren;
      /**
       * Make the children the actual story content. This is useful when you want to create a **static story**.
       */
      asChild?: boolean;
      /**
       * The content to render in the story with a snippet taking `args` and `storyContext` as parameters
       *
       * NOTE: Can be omitted if a default template is set with [`render`](https://github.com/storybookjs/addon-svelte-csf/blob/main/README.md#default-snippet)
       */
      template?: TTemplate;
    };
  let {
    children: storyChildren,
    name,
    exportName: exportNameProp,
    play,
    template,
    asChild = false,
    ...restStoryProps
  }: Props = $props();
  const exportName = exportNameProp ?? storyNameToExportName(name!);

  let extractor = useStoriesExtractor<TCmp>();
  let renderer = useStoryRenderer<TCmp>();

  const BUILT_IN_STORY_ANNOTATIONS: (keyof typeof restStoryProps)[] = [
    'decorators',
    'loaders',
    'parameters',
    'experimental_afterEach',
    'beforeEach',
    'render',
    'argTypes',
    'args',
    'storyName',
    'autodocs',
    'globals',
    'mount',
    'tags',
    'id',
    'source',
    'story',
  ];

  let args = $derived.by(() => {
    const storySnippets = Object.fromEntries(
      Object.entries(restStoryProps).filter(([key, value]) => {
        if (BUILT_IN_STORY_ANNOTATIONS.includes(key as any)) {
          return false;
        }
        return isSnippet(value);
      })
    );
    return {
      ...renderer.args,
      ...storySnippets,
      ...(storyChildren ?? renderer.args.children
        ? {
            children: isSnippet(renderer.args.children)
              ? renderer.args.children
              : argsChildrenSnippet,
          }
        : {}),
    };
  });

  let isCurrentlyViewed = $derived(
    !extractor.isExtracting && renderer.currentStoryExportName === exportName
  );

  if (extractor.isExtracting) {
    extractor.register({
      children: storyChildren,
      name,
      exportName,
      play,
      ...restStoryProps,
    } as Parameters<(typeof extractor)['register']>[0]);
  }

  function injectIntoPlayFunction(
    storyContext: typeof renderer.storyContext,
    playToInject: typeof play
  ) {
    if (playToInject && storyContext.playFunction) {
      storyContext.playFunction.__play = playToInject;
    }
  }

  // TODO: Svelte maintainers is still discussing internally if they want to implement official typeguard function.
  // Keep a pulse on this case and then this can be replaced.
  function isSnippet<T extends unknown[]>(value: unknown): value is Snippet<T> {
    return typeof value === 'function';
  }

  $effect(() => {
    if (isCurrentlyViewed) {
      injectIntoPlayFunction(renderer.storyContext, play);
    }
  });

  const isLegacyStory = $derived(
    renderer.storyContext.tags?.some((tag) => tag === SVELTE_CSF_V4_TAG) ?? false
  );
</script>

{#snippet argsChildrenSnippet()}
  {renderer.args.children}
{/snippet}

{#if isCurrentlyViewed}
  {#if isSnippet(storyChildren) && (asChild || isLegacyStory)}
    {@render storyChildren()}
  {:else if isSnippet(template)}
    {@render template(args as any, renderer.storyContext)}
  {:else if renderer.metaRenderSnippet}
    {@render renderer.metaRenderSnippet(args as any, renderer.storyContext)}
  {:else if renderer.storyContext.component}
    <renderer.storyContext.component {...args} />
  {:else if isSnippet(storyChildren)}
    {@render storyChildren()}
  {:else}
    <p>
      No story rendered. See
      <a href="https://github.com/storybookjs/addon-svelte-csf#defining-stories" target="_blank"
        >the docs</a
      > on how to define stories.
    </p>
  {/if}
{/if}
