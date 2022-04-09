import fs from 'fs';
import path from 'path';
import preprocess from 'svelte-preprocess';
import svelteStoriesLoader from './svelte-stories-loader';

describe('svelte-stories-loader', () => {
  test('Extract Stories', async () => {
    const result = await loadResource('../components/__tests__/TestStories.svelte');
    expect(result).toContain('export default __storiesMetaData.meta');
  });
  test('Extract Stories with typescript  preprocessor', async () => {
    const result = await loadResource('../components/__tests__/TestStories.ts.svelte', {
      preprocess: preprocess(),
    });
    expect(result).toContain('export default __storiesMetaData.meta');
  });
});

async function loadResource(filename, options) {
  const resource = path.resolve(__dirname, filename);
  const code = await fs.promises.readFile(resource, 'utf8');
  return new Promise((resolve, reject) => {
    const webpackMock = {
      _module: { resource },
      query: options,
      async() {
        return (err, result) => {
          if (err) {
            reject(err);
          }
          resolve(result);
        };
      },
    };
    const result = svelteStoriesLoader.call(webpackMock, code);
  });
}
