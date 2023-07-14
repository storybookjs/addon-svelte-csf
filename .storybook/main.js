const path = require("path")

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
}
