import type { SvelteComponent, ComponentType } from 'svelte'
import type { Addon_BaseMeta as BaseMeta, Addon_BaseAnnotations as BaseAnnotations, StoryContext, WebRenderer } from '@storybook/types';


type DecoratorReturnType = void | SvelteComponent | {
    Component: any,
    props?: any
}

interface StoryProps<Props = any> extends BaseAnnotations<Props, DecoratorReturnType, WebRenderer> {
    /**
     * Id of the story.
     * 
     * Optional, auto-generated from name if not specified.
     */
    id?: string;
    /**
     * Name of the story.
     */
    name: string;
    /**
     * Id of the template used by this story.
     * 
     * Optional. Used if the story has no body.
     * If not specified, use the 'default' template.
     */
    template?: string;
    /**
     * Specify which sources should be shown.
     * 
     * By default, sources for an args story are auto-generated.
     * If source is true, then the source of the story will be used instead.
     * If source is a string, it replaces the source of the story.
     */
    source?: boolean | string
}

interface TemplateProps<Props = any> extends BaseAnnotations<Props, DecoratorReturnType> {
    /**
     * Id of the template.
     * 
     * Optional. Use 'default' if not specified.
     */
    id?: string;
}

interface MetaProps extends BaseMeta<any>, BaseAnnotations<any, DecoratorReturnType> {
    /**
     * Enable the tag 'autodocs'.
     * 
     * @see [Automatic documentation](https://storybook.js.org/docs/svelte/writing-docs/autodocs)
     */
    autodocs?: boolean;
    /**
     * List of tags to add to the stories.
     * 
     * It should be a static array of strings.
     * 
     * @example tags={['autodocs']}
     */
    tags?: string[];
}

interface Slots<Props extends Record<string, any> = any> {
    default: Props & {
        args: Props;
        context: StoryContext;
    }
}
/**
 * Meta.
 * 
 * @deprecated Use `export const meta`. See https://github.com/storybookjs/addon-svelte-csf for an example
 */
export class Meta extends SvelteComponent<MetaProps> { }
/**
 * Story.
 */
export class Story<Props = any> extends SvelteComponent<StoryProps<Props>, any, Slots<Props>> { }
/**
 * Template.
 * 
 * Allow to reuse definition between stories.
 */
export class Template<Props extends Record<string, any> = any> extends SvelteComponent<TemplateProps<Props>, any, Slots<Props>> { }

export interface StoriesComponents<Props = any> {
    Template: ComponentType<Template<Props>>,
    Story: ComponentType<Story<Props>>
}

/**
 * Generate typed Template and Story components.
 * 
 * @exemple
 * ```
 * <script context="meta">
 *   import { makeFrom } from "@storybook/addon-svelte-csf";
 *   import Button from "./Button.svelte";
 *   const { Template, Story } = makeFrom(Button);
 * </script>
 * 
 * <Template let:args>
 *  <!- args is typed here -->
 *   <Button {...args}/>
 * </Template>
 * 
 * <!-- args is type checked here -->
 * <Story args={{rounded: false}}/>
 * ```
 * 
 * @param component Component
 */
export function makeFrom<C extends SvelteComponent>(component?: ComponentType<C>): 
    C extends SvelteComponent<infer Props> ? StoriesComponents<Props> : never;