const { test } = require('node:test');
const assert = require('node:assert/strict');
const { draw, persistentDraw } = require('../src/utils/randomSelection');
const verses = require('../src/constants/enhanced-verses.json');
const colors = require('../src/constants/enhanced-colors.json');

function seeded() {
  let state = 28770;
  return () => ((state = (Math.imul(state, 1664525) + 1013904223) >>> 0) / 2 ** 32);
}
test('dataset identity and 1,000 weighted draws avoid the most recent 200 verses', () => {
  assert.ok(verses.length >= 5000 && verses.length <= 10000);
  const key = (v) => v.id;
  const weight = (v) => v.tier === 'featured' ? 5 : 1;
  assert.equal(new Set(verses.map(key)).size, verses.length);
  assert.equal(new Set(verses.map((v) => v.content.replace(/[，、。！？]/g, ''))).size, verses.length);
  assert.ok(verses.every((v) => v.author && v.title && v.dynasty && v.source));
  let history = [];
  const unique = new Set();
  let featured = 0;
  const rng = seeded();
  for (let i = 0; i < 1000; i++) {
    const result = draw(verses, history, 200, key, weight, rng);
    assert.ok(!history.includes(result.item.id));
    history = result.history;
    unique.add(result.item.id);
    featured += Number(result.item.tier === 'featured');
  }
  assert.ok(featured > 320 && featured < 550);
  assert.ok(unique.size > 850);
  console.log({ distinctVerses: unique.size, featured });
});
test('color history works when switching light and dark mode', () => {
  let history = [];
  const rng = seeded();
  assert.equal(new Set(colors.map((c) => c.name)).size, colors.length);
  assert.equal(new Set(colors.map((c) => c.hex)).size, colors.length);
  for (let i = 0; i < 500; i++) {
    const eligible = colors.filter((c) => i % 2 ? c.lightSuitable : c.darkSuitable);
    const result = draw(eligible, history, 10, (c) => c.hex, () => 1, rng);
    assert.ok(!history.includes(result.item.hex));
    history = result.history;
  }
});
test('short and damaged histories fall back safely', () => {
  const run = (pool, history) => draw(pool, history, 200, (x) => x, () => 1, () => 0);
  assert.equal(run([], {}).item, undefined);
  assert.equal(run(['a'], ['a']).item, 'a');
  assert.equal(run(['a', 'b'], ['a', 'bogus', 'a', 'b']).item, 'b');
});
test('corrupt and full storage still avoid repeats within the tab', async () => {
  globalThis.localStorage = { getItem: () => '{', setItem: () => { throw new Error('full'); } };
  try {
    const results = await Promise.all([1, 2, 3].map(() => persistentDraw('test', ['a', 'b', 'c'], 2, (x) => x)));
    assert.equal(new Set(results).size, 3);
  } finally {
    delete globalThis.localStorage;
  }
});
