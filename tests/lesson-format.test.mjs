import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { sourceLines, parseGuide, renderMarkdown } from '../lesson-format.mjs';

test('the catalog includes every lesson pair and loads complete explanations', async () => {
  const root = new URL('../lessons/', import.meta.url);
  const catalog = JSON.parse(await readFile(new URL('index.json', root), 'utf8'));
  const files = new Set((await readdir(root, { recursive: true })).map(path => path.replaceAll('\\', '/')));
  const pairs = [...files].filter(path => !path.endsWith('.md') && files.has(`${path}.md`));
  assert.ok(catalog.length > 0);
  assert.equal(new Set(catalog.map(entry => entry.source)).size, catalog.length, 'No duplicate source entries');
  assert.deepEqual(catalog.map(entry => entry.source).sort(), pairs.sort(), 'All lesson pairs belong in the catalog');
  for (const entry of catalog) {
    const lines = sourceLines(await readFile(new URL(entry.source, root), 'utf8'));
    const guide = parseGuide(await readFile(new URL(`${entry.source}.md`, root), 'utf8'), lines.length);
    assert.ok(guide.title);
    assert.ok(guide.overview);
    assert.equal(guide.annotations.size, lines.length, entry.source);
    assert.ok(entry.initialLine >= 1 && entry.initialLine <= lines.length);
    for (let number = 1; number <= lines.length; number++) {
      assert.ok(guide.annotations.get(number)?.body, `${entry.source}, line ${number}`);
    }
  }
});

test('line numbering preserves internal blank lines and ignores a final terminator', () => {
  assert.deepEqual(sourceLines('one\r\n\r\ntwo\r\n'), ['one', '', 'two']);
  assert.deepEqual(sourceLines('one\n\n'), ['one', '']);
  assert.deepEqual(sourceLines(''), ['']);
  assert.deepEqual(sourceLines('\n'), ['']);
});

test('parses Markdown titles, bodies, and optional takeaways', () => {
  const guide = parseGuide('\uFEFF# Greeting\r\n\r\nAn introduction.\r\n\r\n## Line 2: Display\r\n\r\nUse `print`.\r\n\r\n### Good to know\r\n\r\n**Hello!**', 3);
  assert.equal(guide.title, 'Greeting');
  assert.equal(guide.overview, 'An introduction.');
  assert.deepEqual(guide.annotations.get(2), { title: 'Display', body: 'Use `print`.', takeaway: '**Hello!**' });
  assert.equal(guide.annotations.has(1), false);
});

test('line markers inside code fences remain part of the explanation', () => {
  const guide = parseGuide('## Line 1: Example\n\n```markdown\n## Line 999: Literal heading\n### Good to know\n```\n\nStill the body.', 1);
  assert.equal(guide.annotations.size, 1);
  assert.ok(guide.annotations.get(1).body.includes('## Line 999'));
  assert.equal(guide.annotations.get(1).takeaway, '');
});

test('rejects duplicate and invalid line references', () => {
  assert.throws(() => parseGuide('## Line 0: Invalid', 2), /line 0/);
  assert.throws(() => parseGuide('## Line 3: Invalid', 2), /source has 2 lines/);
  assert.throws(() => parseGuide('## Line 1: First\n## Line 1: Again', 2), /more than one/);
});

test('supports file-level descriptions without line annotations', () => {
  const guide = parseGuide('# Overview\n\nA general description.', 2);
  assert.equal(guide.overview, 'A general description.');
  assert.equal(guide.annotations.size, 0);
});

test('renders supported formatting and escapes raw HTML and code', () => {
  const html = renderMarkdown('**Bold** and *emphasis* with `code`.\n\n- First\n- Second\n\n```html\n<script>alert(1)</script>\n```\n\n<img src=x onerror=alert(1)>');
  assert.ok(html.includes('<strong>Bold</strong>'));
  assert.ok(html.includes('<em>emphasis</em>'));
  assert.ok(html.includes('<code>code</code>'));
  assert.ok(html.includes('<ul><li>First</li><li>Second</li></ul>'));
  assert.ok(html.includes('&lt;script&gt;'));
  assert.ok(html.includes('&lt;img'));
  assert.equal(html.includes('<script>'), false);
  assert.equal(html.includes('<img'), false);
});
