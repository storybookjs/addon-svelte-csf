const path = require("path");

module.exports = {
  framework: '@storybook/svelte-webpack5',
  stories: [
    "../stories/**/*.stories.svelte",
  ],
  addons: [
    "../preset.js",
    "@storybook/addon-essentials",
    "@storybook/addon-interactions",
  ],
  webpackFinal: async (config, { configType }) => {
		// `configType` has a value of 'DEVELOPMENT' or 'PRODUCTION'
		// You can change the configuration based on that.
		// 'PRODUCTION' is used when building the static version of storybook.

		config.resolve = {
			...config.resolve,
			alias: {
				svelte: path.resolve("node_modules", "svelte"),
			},
		};

		config.module.rules = [ {
			resourceQuery: /raw/,
			type: 'asset/source'
		}, ...config.module.rules]

		config.module.rules
			.filter(r => r.test && r.test.toString().includes("svelte"))
			.forEach(r => r.resourceQuery = { not: [/raw/] });

		// Return the altered config
		return config;
	},
};
