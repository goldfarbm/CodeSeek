// Catalog sources are relative to their language folder, not the app root.
export function parseCatalog(catalog, path) {
  const folder = path.slice(0, path.lastIndexOf('/') + 1);
  const fail = message => { throw new Error(`${path}: ${message}`); };
  if (typeof catalog?.language !== 'string' || !catalog.language.trim()) fail('Provide a language name.');
  if (!Array.isArray(catalog.lessons) || !catalog.lessons.length) fail('Provide a nonempty lessons array.');
  const sources = new Set();
  return catalog.lessons.map(entry => {
    if (typeof entry?.tab !== 'string' || !entry.tab.trim()) fail('Each lesson needs a tab title.');
    if (typeof entry.source !== 'string' || !entry.source || entry.source.split('/').some(part => !part || part === '.' || part === '..') || /[\\?#:%]/.test(entry.source)) fail('Each lesson needs a relative source path inside its language folder.');
    if (entry.initialLine !== undefined && (!Number.isInteger(entry.initialLine) || entry.initialLine < 1)) fail('initialLine must be a positive integer.');
    if (sources.has(entry.source)) fail(`Duplicate source: ${entry.source}.`);
    sources.add(entry.source);
    return { ...entry, language: catalog.language.trim(), source: folder + entry.source };
  });
}

export async function loadCatalogs(fetchText) {
  let paths;
  try {
    paths = JSON.parse(await fetchText('api/lessons'));
  } catch {
    throw new Error('Lesson discovery requires the CodeSeek server. Start it with python3 server.py.');
  }
  if (!Array.isArray(paths) || !paths.length) throw new Error('No language catalogs found in lessons/*/*.json.');
  if (paths.some(path => typeof path !== 'string' || !/^[^/.][^/]*\/[^/]+\.json$/.test(path) || /[\\?#:%]/.test(path))) throw new Error('The server returned an invalid catalog path.');
  const groups = await Promise.all(paths.map(async path => parseCatalog(JSON.parse(await fetchText(`lessons/${path}`)), path)));
  const lessons = groups.flat();
  if (new Set(lessons.map(entry => entry.source)).size !== lessons.length) throw new Error('Language catalogs contain duplicate lesson sources.');
  return { lessons, paths };
}
