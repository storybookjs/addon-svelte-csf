module.exports = {
  clearMocks: true,
  transform: {
    '^.+\\.[jt]s$': 'babel-jest',
    '^.+\\.stories\\.svelte$': '<rootDir>/src/jest-transform',
    '^.+\\.svelte$': 'svelte-jester',
  },
  moduleNameMapper: {
    '!!raw-loader!.*': '<rootDir>/__mocks__/fileMock.js',
  },
  moduleFileExtensions: ['js', 'ts', 'svelte', 'json'],
  testEnvironment: 'jest-environment-jsdom',
  transformIgnorePatterns: ['node_modules/(?!(@storybook/svelte)/)'],
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
};
