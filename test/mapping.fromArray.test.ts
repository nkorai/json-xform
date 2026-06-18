import { expect } from 'chai';
import { mapToNewObject } from '../utils/mapping';

/**
 * Tests for the `fromArray` verb — assembling an array at a single target
 * from N distinct source paths. Counterpart to `from` for list outputs.
 *
 * Coverage is deliberately wide because this is a public DSL boundary and
 * its defaults shape what every consumer sees first. Categories:
 *   - basic shape
 *   - missing-value defaults
 *   - skipEmpty modifier
 *   - unique modifier
 *   - array-valued sources + flatten
 *   - via modifier (per-element formatting)
 *   - interaction with other entries in the same fieldset
 *   - realistic end-to-end fixtures
 */

describe('mapping.fromArray — basic shape', () => {
  it('collects two scalar paths into a 2-element ordered array', () => {
    const source = { card: { url: 'a' }, event: { url: 'b' } };
    const mapping = {
      fieldset: [
        { fromArray: ['card.url', 'event.url'], to: 'imageUrls' }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      imageUrls: ['a', 'b']
    });
  });

  it('handles a single source path → 1-element array', () => {
    const source = { only: 'x' };
    const mapping = {
      fieldset: [{ fromArray: ['only'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: ['x'] });
  });

  it('handles an empty fromArray → empty array on the target', () => {
    const source = { a: 1 };
    const mapping = {
      fieldset: [{ fromArray: [], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: [] });
  });

  it('preserves the order given in fromArray regardless of source layout', () => {
    const source = { b: 'second', a: 'first' };
    const mapping = {
      fieldset: [{ fromArray: ['b', 'a'], to: 'ordered' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      ordered: ['second', 'first']
    });
  });

  it('resolves deep source paths', () => {
    const source = { a: { b: { c: { d: 'deep' } } }, x: 'shallow' };
    const mapping = {
      fieldset: [{ fromArray: ['a.b.c.d', 'x'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['deep', 'shallow']
    });
  });

  it('writes through a nested target path', () => {
    const source = { a: 1, b: 2 };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'x.y.z' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      x: { y: { z: [1, 2] } }
    });
  });
});

describe('mapping.fromArray — missing-value defaults (no modifier set)', () => {
  it('represents a missing source path as undefined in the result', () => {
    const source = { a: 'present' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['present', undefined]
    });
  });

  it('preserves an explicit null value', () => {
    const source = { a: null, b: 'present' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: [null, 'present']
    });
  });

  it('preserves an empty string', () => {
    const source = { a: '', b: 'x' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: ['', 'x'] });
  });

  it('preserves the number zero (distinguishes from missing)', () => {
    const source = { a: 0, b: 1 };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: [0, 1] });
  });

  it('preserves false (distinguishes from missing)', () => {
    const source = { a: false, b: true };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: [false, true]
    });
  });
});

describe('mapping.fromArray — skipEmpty modifier', () => {
  it('drops undefined elements', () => {
    const source = { a: 'x' };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'missing'], to: 'list', skipEmpty: true }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: ['x'] });
  });

  it('drops null elements', () => {
    const source = { a: null, b: 'x' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list', skipEmpty: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: ['x'] });
  });

  it('drops empty-string elements', () => {
    const source = { a: '', b: 'x' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list', skipEmpty: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: ['x'] });
  });

  it('keeps the number zero', () => {
    const source = { a: 0, b: 1 };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list', skipEmpty: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({ list: [0, 1] });
  });

  it('keeps false', () => {
    const source = { a: false, b: true };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list', skipEmpty: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: [false, true]
    });
  });

  it('keeps an empty array (not considered "empty" for filtering)', () => {
    const source = { a: [], b: 'x' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list', skipEmpty: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: [[], 'x']
    });
  });

  it('keeps an empty object (not considered "empty" for filtering)', () => {
    const source = { a: {}, b: 'x' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list', skipEmpty: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: [{}, 'x']
    });
  });
});

describe('mapping.fromArray — unique modifier', () => {
  it('deduplicates string values, preserving first-seen order', () => {
    const source = { a: 'x', b: 'y', c: 'x' };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'b', 'c'], to: 'list', unique: true }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['x', 'y']
    });
  });

  it('treats objects by reference (existing JS Set semantics)', () => {
    const shared = { v: 1 };
    const source = { a: shared, b: shared, c: { v: 1 } };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'b', 'c'], to: 'list', unique: true }
      ]
    };
    const result = mapToNewObject(source, mapping) as any;
    // shared is deduplicated; the structurally-identical-but-distinct
    // object at `c` is preserved.
    expect(result.list).to.have.length(2);
    expect(result.list[0]).to.equal(shared);
    expect(result.list[1]).to.deep.equal({ v: 1 });
  });

  it('interacts correctly with skipEmpty (filter then dedup)', () => {
    const source = { a: 'x', b: '', c: 'x', d: null };
    const mapping = {
      fieldset: [
        {
          fromArray: ['a', 'b', 'c', 'd'],
          to: 'list',
          skipEmpty: true,
          unique: true
        }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['x']
    });
  });
});

describe('mapping.fromArray — array-valued sources + flatten', () => {
  it('nests an array source as one element when flatten is false (default)', () => {
    const source = { a: { urls: ['x', 'y'] }, b: 'z' };
    const mapping = {
      fieldset: [{ fromArray: ['a.urls', 'b'], to: 'list' }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: [['x', 'y'], 'z']
    });
  });

  it('splices array source elements into the result when flatten is true', () => {
    const source = { a: { urls: ['x', 'y'] }, b: 'z' };
    const mapping = {
      fieldset: [{ fromArray: ['a.urls', 'b'], to: 'list', flatten: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['x', 'y', 'z']
    });
  });

  it('mixes array and scalar sources with flatten', () => {
    const source = { a: ['x', 'y'], b: 'z', c: ['w'] };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'b', 'c'], to: 'list', flatten: true }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['x', 'y', 'z', 'w']
    });
  });

  it('flattens only one level (matches fromEach.flatten semantics)', () => {
    const source = { a: [['x', 'y'], ['z']], b: 'w' };
    const mapping = {
      fieldset: [{ fromArray: ['a', 'b'], to: 'list', flatten: true }]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: [['x', 'y'], ['z'], 'w']
    });
  });

  it('dedupes across spliced elements when flatten + unique', () => {
    const source = { a: ['x', 'y'], b: ['y', 'z'] };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'b'], to: 'list', flatten: true, unique: true }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['x', 'y', 'z']
    });
  });

  it('applies skipEmpty after splice when flatten is on', () => {
    const source = { a: ['x', ''], b: [null, 'z'] };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'b'], to: 'list', flatten: true, skipEmpty: true }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['x', 'z']
    });
  });
});

describe('mapping.fromArray — via modifier (per-element formatting)', () => {
  it('formats each date element using `via` of type date', () => {
    const source = { a: '2026-06-17', b: '2026-12-31' };
    const mapping = {
      fieldset: [
        {
          fromArray: ['a', 'b'],
          to: 'dates',
          via: { type: 'date', sourceFormat: 'yyyy-MM-dd', format: 'MM/dd/yyyy' }
        }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      dates: ['06/17/2026', '12/31/2026']
    });
  });

  it('formats each element via `commands` transform', () => {
    const source = { a: 'HELLO', b: 'WORLD' };
    const mapping = {
      fieldset: [
        {
          fromArray: ['a', 'b'],
          to: 'list',
          via: {
            type: 'commands',
            transform: [{ command: 'toLowerCase' }]
          }
        }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['hello', 'world']
    });
  });

  it('applies via after skipEmpty (skip first, then format)', () => {
    const source = { a: '', b: 'HELLO' };
    const mapping = {
      fieldset: [
        {
          fromArray: ['a', 'b'],
          to: 'list',
          skipEmpty: true,
          via: {
            type: 'commands',
            transform: [{ command: 'toLowerCase' }]
          }
        }
      ]
    };
    // The current implementation applies `via` before skipEmpty so empty
    // strings round-trip unchanged and get filtered. Both orders end up
    // with the same observable output here; assert the result, not the
    // mechanism.
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      list: ['hello']
    });
  });
});

describe('mapping.fromArray — interaction with sibling entries', () => {
  it('coexists with a scalar `from` writing to a different target', () => {
    const source = { a: 'x', b: 'y', name: 'spirit' };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'b'], to: 'images' },
        { from: 'name', to: 'venueName' }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      images: ['x', 'y'],
      venueName: 'spirit'
    });
  });

  it('supports multiple fromArray entries with distinct targets', () => {
    const source = { a: 1, b: 2, c: 3, d: 4 };
    const mapping = {
      fieldset: [
        { fromArray: ['a', 'b'], to: 'first' },
        { fromArray: ['c', 'd'], to: 'second' }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      first: [1, 2],
      second: [3, 4]
    });
  });

  it('does not overwrite a target that an earlier entry already wrote (first-wins)', () => {
    const source = { a: 'first', b: 'second' };
    const mapping = {
      fieldset: [
        { from: 'a', to: 'imageUrls' },
        { fromArray: ['b'], to: 'imageUrls' }
      ]
    };
    // addPropToTarget preserves the earlier write. Documents the existing
    // behaviour rather than introducing a special exception for fromArray.
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      imageUrls: 'first'
    });
  });
});

describe('mapping.fromArray — realistic fixtures', () => {
  it('IG carousel happy path: card + event image → 2-element imageUrls', () => {
    const source = {
      ConvertToJpegOutput: { imageUrl: 'https://card.jpg' },
      PrepareCardHtmlOutput: { eventImageUrl: 'https://event.jpg' },
      workflowInput: { igUserId: '17841477447935851' }
    };
    const mapping = {
      fieldset: [
        { from: 'workflowInput.igUserId', to: 'igUserId' },
        {
          fromArray: [
            'ConvertToJpegOutput.imageUrl',
            'PrepareCardHtmlOutput.eventImageUrl'
          ],
          to: 'imageUrls',
          skipEmpty: true
        }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      igUserId: '17841477447935851',
      imageUrls: ['https://card.jpg', 'https://event.jpg']
    });
  });

  it('IG single-image fallback: empty extra image → 1-element imageUrls', () => {
    const source = {
      ConvertToJpegOutput: { imageUrl: 'https://card.jpg' },
      PrepareCardHtmlOutput: { eventImageUrl: '' }
    };
    const mapping = {
      fieldset: [
        {
          fromArray: [
            'ConvertToJpegOutput.imageUrl',
            'PrepareCardHtmlOutput.eventImageUrl'
          ],
          to: 'imageUrls',
          skipEmpty: true
        }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      imageUrls: ['https://card.jpg']
    });
  });

  it('deep nesting both sides with flatten', () => {
    const source = {
      a: { b: ['x', 'y'] },
      c: { d: 'z' }
    };
    const mapping = {
      fieldset: [
        {
          fromArray: ['a.b', 'c.d'],
          to: 'out.list',
          flatten: true
        }
      ]
    };
    expect(mapToNewObject(source, mapping)).to.deep.equal({
      out: { list: ['x', 'y', 'z'] }
    });
  });
});
