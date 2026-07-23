---
'@storybook/addon-svelte-csf': patch
---

Load the Svelte config once per process in the story indexer instead of re-running the config lookup for every `.stories.svelte` file, eliminating redundant config-file scans and the resulting repeated "no Svelte config found" log lines.
