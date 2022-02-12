export function managerEntries(entry = []) {
  return [...entry, require.resolve('./manager')];
}

export async function webpack(config, options) {
  const svelteOptions = await options.presets.apply('svelteOptions', {}, options);
  return {
    ...config,
    module: {
      ...config.module,
      rules: [
        ...config.module.rules,
        {
          test: /\.stories\.svelte$/,
          enforce: 'post',
          use: [
            {
              loader: require.resolve('../parser/svelte-stories-loader'),
              options: svelteOptions,
            },
          ],
        },
      ],
    },
  };
}
