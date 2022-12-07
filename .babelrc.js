module.exports = {
  presets: [['@babel/preset-env', { targets: { node: '16' } }], '@babel/preset-typescript'],
  plugins: ['@babel/plugin-transform-runtime'],
  env: {
    esm: {
      presets: [
        [
          '@babel/env',
          {
            modules: false,
            targets: { chrome: '100' },
          },
        ],
      ],
    },
  },
};
