import test from 'node:test';
import assert from 'node:assert/strict';
import { loadCatalogs, parseCatalog } from '../lesson-catalog.mjs';

const example = { language: 'Ruby', lessons: [{ tab: 'Greeting', source: 'hello.rb', initialLine: 2 }] };

test('discovers arbitrary languages and catalog names, preserving lesson order', async () => {
  const files = {
    'api/lessons': ['ruby/tutorials.json', 'python/lessons.json'],
    'lessons/ruby/tutorials.json': example,
    'lessons/python/lessons.json': { language: 'Python', lessons: [{ tab: 'First', source: 'first.py' }, { tab: 'Second', source: 'second.py' }] },
  };
  const result = await loadCatalogs(async path => {
    assert.ok(Object.hasOwn(files, path), path);
    return JSON.stringify(files[path]);
  });
  assert.deepEqual(result.paths, files['api/lessons']);
  assert.deepEqual(result.lessons.map(entry => [entry.language, entry.source]), [
    ['Ruby', 'ruby/hello.rb'], ['Python', 'python/first.py'], ['Python', 'python/second.py'],
  ]);
});

test('validates catalogs and keeps source paths inside their language folder', () => {
  for (const source of ['../hello.rb', '/hello.rb', 'https://example.com/code', 'hello.rb?x', 'a\\b.rb']) {
    assert.throws(() => parseCatalog({ ...example, lessons: [{ tab: 'Hello', source }] }, 'ruby/lessons.json'), /relative source/);
  }
  assert.throws(() => parseCatalog({ lessons: [] }, 'ruby/lessons.json'), /language name/);
  assert.throws(() => parseCatalog({ ...example, lessons: [] }, 'ruby/lessons.json'), /nonempty/);
  assert.throws(() => parseCatalog({ ...example, lessons: [{ ...example.lessons[0], initialLine: 0 }] }, 'ruby/lessons.json'), /positive integer/);
  assert.throws(() => parseCatalog({ ...example, lessons: [example.lessons[0], example.lessons[0]] }, 'ruby/lessons.json'), /Duplicate/);
});

test('explains discovery failures and rejects duplicate sources across catalogs', async () => {
  await assert.rejects(loadCatalogs(async () => '<html>404</html>'), /python3 server.py/);
  await assert.rejects(loadCatalogs(async () => '[]'), /No language catalogs/);
  await assert.rejects(loadCatalogs(async path => JSON.stringify(path === 'api/lessons' ? ['ruby/one.json', 'ruby/two.json'] : example)), /duplicate lesson sources/);
});
