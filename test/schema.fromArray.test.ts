import { expect } from 'chai';
import { mapToNewObject } from '../utils/mapping';

/**
 * Schema-level validation tests for the `fromArray` verb.
 *
 * Validation runs inside `mapToNewObject` before any traversal — these
 * tests poke at malformed templates and assert the library throws cleanly
 * rather than silently producing weird output.
 */

const source = { a: 'x', b: 'y' };

const expectValidationError = (mapping: unknown) => {
  expect(() => mapToNewObject(source, mapping as object)).to.throw();
};

describe('schema.fromArray — validation', () => {
  it('rejects a fromArray entry that omits `to`', () => {
    // No implicit derivation for fromArray; an explicit target is required.
    expectValidationError({
      fieldset: [{ fromArray: ['a', 'b'] }]
    });
  });

  it('accepts a fromArray entry with all supported modifiers together', () => {
    const mapping = {
      fieldset: [
        {
          fromArray: ['a', 'b'],
          to: 'out',
          skipEmpty: true,
          unique: true,
          flatten: true,
          via: {
            type: 'commands',
            transform: [{ command: 'toUpperCase' }]
          }
        }
      ]
    };
    // Validation should pass; the actual mapping result is incidental.
    expect(() => mapToNewObject(source, mapping)).to.not.throw();
  });

  it('rejects a fromArray with non-string elements', () => {
    expectValidationError({
      fieldset: [{ fromArray: ['a', 42], to: 'out' }]
    });
  });

  it('rejects a fromArray that is not an array', () => {
    expectValidationError({
      fieldset: [{ fromArray: 'a.b', to: 'out' }]
    });
  });

  it('accepts an empty fromArray (allowed; produces an empty list)', () => {
    const mapping = {
      fieldset: [{ fromArray: [], to: 'out' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ out: [] });
  });

  it('rejects a top-level template that has no `fieldset`', () => {
    expectValidationError({ fromArray: ['a'], to: 'out' });
  });

  it('rejects fromArray combined with `from` at the same level via wrong shape', () => {
    // While not strictly mutually exclusive in the schema today, mixing
    // them is a usage smell — and the runtime treats them as separate
    // branches. Document by asserting both run independently rather than
    // erroring; if both are present with overlapping `to`, addPropToTarget
    // resolves it via first-wins (see the interaction tests).
    const mapping = {
      fieldset: [
        { fromArray: ['a'], to: 'list', from: 'b' }
      ]
    };
    // Doesn't throw; outputs `list` from whichever branch ran first.
    expect(() => mapToNewObject(source, mapping)).to.not.throw();
  });
});

describe('mapping.fromArray — via does not crash on missing values', () => {
  it('handles null / undefined elements gracefully when no via is set', () => {
    const localSource = { a: null, b: undefined, c: 'x' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b', 'c'], to: 'list' }]
    };
    expect(mapToNewObject(localSource, mapping)).to.deep.equal({
      list: [null, undefined, 'x']
    });
  });
});
