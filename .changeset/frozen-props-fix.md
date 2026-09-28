---
'@storybook/addon-svelte-csf': patch
---

Fix "Cannot add property 0, object is not extensible" with Vite 7 and older when `defineMeta` or a story gets an empty object or array.
