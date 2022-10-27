module.exports = {
  presets: ['@babel/preset-env', '@babel/preset-typescript'],
  env: {
    esm: {
      presets: [
        [
          '@babel/env',
          {
            modules: false,
          },
        ],
      ],
    },
  },
};
