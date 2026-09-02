---
"@storybook/addon-svelte-csf": patch
---

Migrate `LegacyTemplate.svelte` and `LegacyStory.svelte` runtime mocks from Svelte 4 `export let` syntax to Svelte 5 `$props()` runes.

Fixes a silent failure in Vite 8 (Rolldown): the optimizer pre-bundles `.svelte` files in `node_modules` via `vite-plugin-svelte:optimize` and rejects `export let` as `legacy_export_invalid`, causing Storybook to render a blank preview with no error message.

These files are mock stubs only (never rendered — the pre-transform codemod rewrites them before Svelte compilation), so this change has no behavioral impact.
