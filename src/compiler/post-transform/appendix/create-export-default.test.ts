import type { Program } from 'estree';
import { print } from 'esrap';
import { describe, it } from 'vitest';

import { createExportDefaultMeta } from './create-export-default';

describe(createExportDefaultMeta.name, () => {
  it('creates a new export default correctly', ({ expect }) => {
    const stringified = print(
      createExportDefaultMeta({
        metaIdentifier: {
          type: 'Identifier',
          name: 'meta',
        },
      }) as unknown as Program
    ).code;

    expect(stringified).toMatchInlineSnapshot(`"export default meta;"`);
  });

  it("works when 'meta' identifier was destructured manually and renamed by user", ({ expect }) => {
    const stringified = print(
      createExportDefaultMeta({
        metaIdentifier: {
          type: 'Identifier',
          name: '__renamed_meta',
        },
      }) as unknown as Program
    ).code;

    expect(stringified).toMatchInlineSnapshot(`"export default __renamed_meta;"`);
  });
});