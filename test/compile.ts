import pkg from '@storybook/addon-svelte-csf/package.json' with { type: 'json' };
import { svelte } from '@sveltejs/vite-plugin-svelte';
import { build } from 'vite';
import virtual from 'vite-plugin-virtual';

export async function compileFromString(code: string): Promise<string> {
  const virtualModuleName = 'virtual:stories.svelte';
  const buildOutput = await build({
    configFile: false,
    plugins: [
      svelte(),
      virtual({
        [virtualModuleName]: code,
      }),
    ],
    build: {
      write: false,
      minify: false,
      reportCompressedSize: false,
      sourcemap: false,
      rollupOptions: {
        input: {
          mainModule: virtualModuleName,
        },
        external: [pkg.name, 'svelte'],
      },
    },
    optimizeDeps: {
      exclude: ['svelte'],
    },
  });

  if ('output' in buildOutput) {
    const { output } = buildOutput;
    const { modules } = output[0];
    const module = modules[`/@virtual:vite-plugin-virtual/${virtualModuleName}`];
    const { code } = module;

    if (!code) {
      throw new Error('Failed to get output code from the virtual module');
    }

    return code;
  }

  throw new Error("Couldn't get output from vite build");
}
