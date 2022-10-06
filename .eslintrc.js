module.exports = {
  root: true,
  extends: ['@storybook/eslint-config-storybook'],
  rules: {
    '@typescript-eslint/dot-notation': 'off',
    '@typescript-eslint/no-implied-eval': 'off',
    '@typescript-eslint/no-throw-literal': 'off',
    '@typescript-eslint/return-await': 'off',
  },
  overrides: [],
};
