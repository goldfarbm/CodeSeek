import { escapeHTML, sourceLines, parseGuide, renderMarkdown } from './lesson-format.mjs';

let lessons = [];
let lessonIndex = 0;
let selectedLine = 0;
let activeDocument = null;
let fileRequest = 0;
let localFiles = new Map();
let folderRequest = 0;
let markdownHidden = false;
const descriptionVersions = new Map();
const editorDialog = document.querySelector('#description-editor');
const markdownDraft = document.querySelector('#markdown-draft');
let editingDocument = null;
const codeElement = document.querySelector('#code');
const lessonSelect = document.querySelector('#lesson');
const previousLesson = document.querySelector('#previous-lesson');
const nextLesson = document.querySelector('#next-lesson');
const explanationElement = document.querySelector('#explanation');
const loadStatus = document.querySelector('#load-status');
const explorer = document.querySelector('#file-explorer');
const directory = document.querySelector('#directory');
const folderStatus = document.querySelector('#folder-status');
const folderInput = document.querySelector('#folder-input');
const languageSelect = document.querySelector('#language');
languageSelect.disabled = true;

function status(message = '') {
  loadStatus.textContent = message;
  loadStatus.hidden = !message;
}

function detectLanguage(name) {
  return /\.pyw?$/i.test(name) ? 'Python' : /\.(?:[cm]?js|jsx)$/i.test(name) ? 'JavaScript' : /\.(vfl|vex)$/i.test(name) ? 'VEX' : 'Plain text';
}

function highlight(source) {
  if (['Plain text', 'VEX'].includes(activeDocument.language)) return escapeHTML(source);
  const tokens = activeDocument.language === 'Python'
    ? /(#.*$|f?"[^"\n]*"|\b(?:def|return|for|in|if|elif|else|True|False)\b|\b\d+\b|\b(?:greet|print)(?=\())/g
    : /(\/\/.*$|`[^`]*`|"[^"\n]*"|\b(?:function|const|return|for|of|if|else|true|false)\b|\b\d+\b|\b(?:greet|log)(?=\())/g;
  let result = '';
  let end = 0;
  for (const match of source.matchAll(tokens)) {
    result += escapeHTML(source.slice(end, match.index));
    const token = match[0];
    const type = /^(\/\/|#)/.test(token) ? 'comment' : /^(f?"|`)/.test(token) ? 'string' : /^\d/.test(token) ? 'number' : /^(greet|log|print)$/.test(token) ? 'function' : 'keyword';
    result += `<span class="token-${type}">${escapeHTML(token)}</span>`;
    end = match.index + token.length;
  }
  return result + escapeHTML(source.slice(end));
}

function selectLine(index, focus = false) {
  if (!activeDocument) return;
  const doc = activeDocument;
  selectedLine = Math.max(0, Math.min(index, doc.lines.length - 1));
  codeElement.querySelectorAll('.code-line').forEach((button, i) => {
    button.setAttribute('aria-pressed', String(i === selectedLine));
    button.tabIndex = i === selectedLine ? 0 : -1;
    if (focus && i === selectedLine) button.focus({ preventScroll: true });
  });
  const source = doc.lines[selectedLine];
  const annotation = doc.guide?.annotations.get(selectedLine + 1);
  const title = annotation?.title || (doc.guide?.overview ? 'About this file' : 'No explanation for this line');
  const body = annotation?.body || doc.guide?.overview || doc.guideError || `Add a companion file named ${doc.filename}.md with a heading such as “## Line ${selectedLine + 1}: Explanation title”.`;
  explanationElement.innerHTML = `<div class="explanation-label">LINE ${String(selectedLine + 1).padStart(2, '0')} · ${doc.guide ? 'FROM MARKDOWN' : 'SOURCE FILE'}</div><h3 class="explanation-title">${escapeHTML(title)}</h3><pre class="selected-code">${escapeHTML(source || '(blank line)')}</pre><div class="explanation-copy markdown-body">${renderMarkdown(body)}</div>${annotation?.takeaway ? `<div class="takeaway"><span class="takeaway-icon" aria-hidden="true">♧</span><div><strong>GOOD TO KNOW</strong><div class="markdown-body">${renderMarkdown(annotation.takeaway)}</div></div></div>` : ''}`;
  document.querySelector('#previous').disabled = selectedLine === 0;
  document.querySelector('#next').disabled = selectedLine === doc.lines.length - 1;
  document.querySelector('#line-position').textContent = `${selectedLine + 1} of ${doc.lines.length} lines`;
}

function showDocument(doc, initialLine = 1) {
  doc.originalMarkdown = doc.markdown || '';
  const versions = descriptionVersions.get(documentKey(doc));
  if (versions?.length && versions.at(-1).source === doc.lines.join('\n')) {
    const latest = versions.at(-1);
    doc.markdown = latest.markdown;
    doc.guide = parseGuide(doc.markdown, doc.lines.length);
    doc.guideError = '';
    doc.version = versions.length;
    doc.originalMarkdown = versions[0].originalMarkdown;
  }
  activeDocument = doc;
  document.querySelector('#edit-description').disabled = false;
  document.querySelector('#description-version').textContent = doc.version ? `Version ${doc.version} · this session` : '';
  const local = doc.kind === 'local';
  const group = lessonGroup(doc.language);
  if (group.length) languageSelect.value = doc.language;
  renderLessonPicker(languageSelect.value);
  document.querySelector('#lesson-meta').textContent = local ? 'LOCAL FILE · READ ONLY' : `LESSON ${String(group.indexOf(lessonIndex) + 1).padStart(2, '0')} / ${String(group.length).padStart(2, '0')} · THE FUNDAMENTALS`;
  document.querySelector('#lesson-title').textContent = doc.guide?.title || doc.filename;
  document.querySelector('#lesson-description').textContent = local ? doc.path : doc.guide?.overview || doc.path;
  document.querySelector('#filename').textContent = doc.filename;
  document.querySelector('.language-badge').textContent = doc.language;
  document.querySelector('.language-badge').classList.toggle('python', doc.language === 'Python');
  document.querySelector('.live-label').innerHTML = `<span></span> ${doc.guide ? 'MARKDOWN' : 'SOURCE FILE'}`;
  const reference = document.querySelector('.github-link');
  reference.hidden = doc.language === 'Plain text';
  reference.href = doc.language === 'Python' ? 'https://docs.python.org/3/tutorial/' : doc.language === 'VEX' ? 'https://www.sidefx.com/docs/houdini/vex/' : 'https://developer.mozilla.org/en-US/docs/Web/JavaScript';
  reference.innerHTML = `${escapeHTML(doc.language)} reference <span>↗</span>`;
  document.querySelector('#line-count').textContent = `${doc.lines.length} ${doc.lines.length === 1 ? 'line' : 'lines'} · UTF-8`;
  codeElement.innerHTML = doc.lines.map((source, i) => `<button class="code-line" aria-label="Line ${i + 1}: ${escapeHTML(source || 'blank line')}" aria-pressed="false" data-line="${i}"><span class="line-number" aria-hidden="true">${i + 1}</span><span>${highlight(source) || ' '}</span></button>`).join('');
  const scroller = document.querySelector('.code-scroll');
  scroller.scrollTop = 0;
  scroller.scrollLeft = 0;
  selectLine(initialLine - 1);
  markSelectedFile(doc.fileButton || null);
  status();
}

function documentKey(doc) {
  return `${doc.kind}:${doc.path}`;
}

function previewDescription() {
  const errorElement = document.querySelector('#editor-error');
  const preview = document.querySelector('#markdown-preview');
  const save = document.querySelector('#save-description-version');
  try {
    const markdown = markdownDraft.value;
    if (!markdown.trim()) throw new Error('Write a description before saving.');
    if (new Blob([markdown]).size > 2 * 1024 * 1024) throw new Error('Keep the Markdown file under 2 MB.');
    const guide = parseGuide(markdown, editingDocument.lines.length);
    const annotation = guide.annotations.get(selectedLine + 1);
    document.querySelector('#preview-label').textContent = `Preview · Line ${selectedLine + 1}`;
    preview.innerHTML = `<h3>${escapeHTML(annotation?.title || guide.title || 'Description')}</h3>${renderMarkdown(annotation?.body || guide.overview || 'No explanation for this line.')}${annotation?.takeaway ? `<h4>Good to know</h4>${renderMarkdown(annotation.takeaway)}` : ''}`;
    errorElement.hidden = true;
    save.disabled = false;
    return guide;
  } catch (error) {
    errorElement.textContent = error.message;
    errorElement.hidden = false;
    preview.replaceChildren();
    save.disabled = true;
    return null;
  }
}

document.querySelector('#edit-description').addEventListener('click', () => {
  if (!activeDocument) return;
  fileRequest++; // Keep a pending lesson/file load from replacing the edited document.
  status();
  editingDocument = activeDocument;
  markdownDraft.value = activeDocument.markdown || `# ${activeDocument.filename}\n\nDescribe this file.\n\n${activeDocument.lines.map((_, index) => `## Line ${index + 1}: Explanation title\n\nDescribe this line.\n`).join('\n')}`;
  document.querySelector('#editor-filename').textContent = `${activeDocument.filename}.md · edit the full companion`;
  previewDescription();
  editorDialog.showModal();
  markdownDraft.focus();
});
markdownDraft.addEventListener('input', previewDescription);
function closeDescriptionEditor() {
  editorDialog.close();
  editingDocument = null;
  document.querySelector('#edit-description').focus();
}
document.querySelector('#cancel-description-editor').addEventListener('click', closeDescriptionEditor);
document.querySelector('#close-description-editor').addEventListener('click', closeDescriptionEditor);
editorDialog.addEventListener('cancel', event => {
  event.preventDefault();
  closeDescriptionEditor();
});
document.querySelector('#save-description-version').addEventListener('click', () => {
  const guide = previewDescription();
  if (!guide || !editingDocument) return;
  const doc = editingDocument;
  const key = documentKey(doc);
  const versions = descriptionVersions.get(key) || [];
  const version = versions.length + 1;
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const filename = `${doc.filename}.v${String(version).padStart(3, '0')}-${timestamp}.md`;
  const markdown = markdownDraft.value;
  const url = URL.createObjectURL(new Blob([markdown], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
  versions.push({ markdown, filename, source: doc.lines.join('\n'), originalMarkdown: doc.originalMarkdown });
  descriptionVersions.set(key, versions);
  doc.markdown = markdown;
  doc.guide = guide;
  doc.guideError = '';
  const line = selectedLine + 1;
  closeDescriptionEditor();
  showDocument(doc, line);
  status(`Version ${version} downloaded as ${filename}. To use it in a future session, place it beside the source as ${doc.filename}.md. Keep the versioned copy for your history.`);
});

async function fetchText(path) {
  const response = await fetch(path, { cache: 'no-cache' });
  if (!response.ok) throw new Error(`Could not load ${path} (${response.status}).`);
  return response.text();
}

async function loadLesson(index) {
  const entry = lessons[index];
  if (!entry) return;
  const request = ++fileRequest;
  renderLessonPicker(entry.language, index);
  status('Loading lesson files…');
  try {
    const [source, markdown] = await Promise.all([fetchText(`lessons/${entry.source}`), fetchText(`lessons/${entry.source}.md`)]);
    const lines = sourceLines(source);
    const guide = parseGuide(markdown, lines.length);
    if (request !== fileRequest) return;
    lessonIndex = index;
    showDocument({ kind: 'lesson', filename: entry.source.split('/').at(-1), path: entry.source, language: entry.language, lines, guide, markdown }, entry.initialLine || 1);
  } catch (error) {
    if (request === fileRequest) {
      renderLessonPicker(languageSelect.value);
      status(`${error.message} Check the source file and its .md companion, then select the lesson to retry.`);
    }
  }
}

function lessonGroup(language) {
  return lessons.flatMap((lesson, index) => lesson.language === language ? [index] : []);
}

function renderLessonPicker(language, index = activeDocument?.kind === 'lesson' ? lessonIndex : -1) {
  const group = lessonGroup(language);
  const position = group.indexOf(index);
  lessonSelect.innerHTML = `${position < 0 ? '<option value="" disabled selected>Choose a lesson</option>' : ''}${group.map((index, order) => `<option value="${index}">${String(order + 1).padStart(2, '0')} · ${escapeHTML(lessons[index].tab)}</option>`).join('')}`;
  if (position >= 0) lessonSelect.value = String(index);
  lessonSelect.disabled = !group.length;
  previousLesson.disabled = position <= 0;
  nextLesson.disabled = !group.length || position === group.length - 1;
}

function chooseLanguage(language) {
  renderLessonPicker(language);
  return loadLesson(lessonGroup(language)[0]);
}

languageSelect.addEventListener('change', event => chooseLanguage(event.target.value));
lessonSelect.addEventListener('change', event => loadLesson(Number(event.target.value)));
function stepLesson(direction) {
  const group = lessonGroup(languageSelect.value);
  const position = lessonSelect.value === '' ? -1 : group.indexOf(Number(lessonSelect.value));
  const target = position + direction;
  if (target >= 0 && target < group.length) loadLesson(group[target]);
}
previousLesson.addEventListener('click', () => stepLesson(-1));
nextLesson.addEventListener('click', () => stepLesson(1));
codeElement.addEventListener('click', event => {
  const line = event.target.closest('[data-line]');
  if (line) selectLine(Number(line.dataset.line));
});
codeElement.addEventListener('keydown', event => {
  if (!activeDocument || !['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const index = event.key === 'Home' ? 0 : event.key === 'End' ? activeDocument.lines.length - 1 : selectedLine + (event.key === 'ArrowDown' ? 1 : -1);
  selectLine(index, true);
});
document.querySelector('#previous').addEventListener('click', () => selectLine(selectedLine - 1));
document.querySelector('#next').addEventListener('click', () => selectLine(selectedLine + 1));

function setExplorerVisible(visible) {
  explorer.hidden = !visible;
  document.querySelector('#toggle-explorer').setAttribute('aria-expanded', String(visible));
  document.querySelector('#toggle-explorer span').textContent = visible ? 'Hide files' : 'Show files';
  if (!visible && explorer.contains(document.activeElement)) document.querySelector('#toggle-explorer').focus();
}

document.querySelector('#toggle-explorer').addEventListener('click', () => setExplorerVisible(explorer.hidden));
document.querySelector('#close-explorer').addEventListener('click', () => setExplorerVisible(false));

function markSelectedFile(button) {
  directory.querySelectorAll('[aria-current]').forEach(item => item.removeAttribute('aria-current'));
  if (button) button.setAttribute('aria-current', 'true');
}

async function readLocalText(file) {
  if (file.size > 2 * 1024 * 1024) throw new Error(`${file.name} is too large to preview. Choose a text file smaller than 2 MB.`);
  const bytes = new Uint8Array(await file.arrayBuffer());
  if (bytes.includes(0)) throw new Error(`${file.name} cannot be previewed as text.`);
  try { return new TextDecoder('utf-8', { fatal: true }).decode(bytes); }
  catch { throw new Error(`${file.name} is not UTF-8 text.`); }
}

async function openLocalFile(file, path, button) {
  const request = ++fileRequest;
  status();
  folderStatus.textContent = `Opening ${path}…`;
  try {
    const source = await readLocalText(file);
    const lines = sourceLines(source);
    const companion = localFiles.get(`${path}.md`);
    let guide = null;
    let guideError = '';
    let markdown = '';
    if (companion) {
      try {
        markdown = await readLocalText(companion);
        guide = parseGuide(markdown, lines.length);
      }
      catch (error) { guideError = `Could not read ${file.name}.md: ${error.message}`; }
    }
    if (request !== fileRequest) return;
    showDocument({ kind: 'local', filename: file.name, path, language: detectLanguage(file.name), lines, guide, guideError, markdown, fileButton: button });
    folderStatus.textContent = guideError || `Viewing ${path}${guide ? ` · Explanations from ${file.name}.md` : ` · No ${file.name}.md companion found.`}`;
  } catch (error) {
    if (request === fileRequest) folderStatus.textContent = error.message || 'Unable to read this file. Try opening the folder again.';
  }
}

function fileItem(file) {
  const item = document.createElement('li');
  const button = document.createElement('button');
  button.className = 'directory-file';
  if (/\.(md|markdown)$/i.test(file.name)) button.classList.add('file-markdown');
  else button.classList.add('file-code');
  button.textContent = file.name;
  button.title = file.webkitRelativePath;
  button.addEventListener('click', () => openLocalFile(file, file.webkitRelativePath, button));
  item.append(button);
  return item;
}

function folderItem(name, expanded = false) {
  const item = document.createElement('li');
  const details = document.createElement('details');
  details.open = expanded;
  const summary = document.createElement('summary');
  summary.textContent = name;
  const children = document.createElement('ul');
  details.append(summary, children);
  item.append(details);
  return { item, children };
}

function updateMarkdownVisibility() {
  directory.querySelectorAll('.file-markdown').forEach(button => {
    button.closest('li').hidden = markdownHidden;
  });
  const toggle = document.querySelector('#toggle-markdown');
  toggle.textContent = markdownHidden ? 'Show .md files' : 'Hide .md files';
  toggle.setAttribute('aria-pressed', String(markdownHidden));
}

document.querySelector('#toggle-markdown').addEventListener('click', () => {
  markdownHidden = !markdownHidden;
  updateMarkdownVisibility();
});
async function openLessonsFolder() {
  const request = ++folderRequest;
  fileRequest++;
  folderStatus.textContent = 'Opening lessons…';
  try {
    const catalog = JSON.parse(await fetchText('lessons/index.json'));
    // The browser cannot preset a native picker to the app's filesystem path.
    // Serve the bundled folder through the same explorer as user-selected files.
    const paths = ['index.json', ...catalog.flatMap(entry => [entry.source, `${entry.source}.md`])];
    const files = paths.map(path => ({
      name: path.split('/').at(-1),
      webkitRelativePath: `lessons/${path}`,
      size: 0,
      async arrayBuffer() {
        const response = await fetch(`lessons/${path}`, { cache: 'no-cache' });
        if (!response.ok) throw new Error(`Could not load lessons/${path} (${response.status}).`);
        const buffer = await response.arrayBuffer();
        if (buffer.byteLength > 2 * 1024 * 1024) throw new Error(`${this.name} is too large to preview. Choose a text file smaller than 2 MB.`);
        return buffer;
      }
    }));
    if (request === folderRequest) showFolder(files);
  } catch (error) {
    if (request !== folderRequest) return;
    folderStatus.textContent = `${error.message} Run CodeSeek through the local web server to browse lessons, or choose another folder.`;
  }
}

document.querySelector('#open-folder').addEventListener('click', openLessonsFolder);
document.querySelector('#choose-folder').addEventListener('click', () => folderInput.click());
folderInput.addEventListener('change', () => {
  const files = Array.from(folderInput.files);
  folderInput.value = '';
  if (files.length) showFolder(files);
});

function showFolder(files) {
  folderRequest++;
  fileRequest++;
  status();
  localFiles = new Map(files.map(file => [file.webkitRelativePath, file]));
  const rootName = files[0].webkitRelativePath.split('/')[0];
  const root = { name: rootName, folders: new Map(), files: [] };
  for (const file of files) {
    const parts = file.webkitRelativePath.split('/').slice(1);
    let folder = root;
    for (const part of parts.slice(0, -1)) {
      if (!folder.folders.has(part)) folder.folders.set(part, { name: part, folders: new Map(), files: [] });
      folder = folder.folders.get(part);
    }
    folder.files.push(file);
  }
  function renderFolder(folder, expanded = false) {
    const view = folderItem(folder.name, expanded);
    for (const child of [...folder.folders.values()].sort((a, b) => a.name.localeCompare(b.name))) view.children.append(renderFolder(child));
    for (const file of folder.files.sort((a, b) => a.name.localeCompare(b.name))) view.children.append(fileItem(file));
    return view.item;
  }
  const list = document.createElement('ul');
  list.append(renderFolder(root, true));
  directory.replaceChildren(list);
  updateMarkdownVisibility();
  folderStatus.textContent = `${rootName} · ${files.length} files. Select a source file to load its .md companion.`;
}

async function initialize() {
  status('Loading lesson catalog…');
  try {
    const catalog = JSON.parse(await fetchText('lessons/index.json'));
    if (!Array.isArray(catalog) || !catalog.length || catalog.some(entry => !entry.source || !entry.language || !entry.tab)) throw new Error('The lesson catalog must contain source, language, and tab entries.');
    lessons = catalog;
    const languages = [...new Set(lessons.map(entry => entry.language))];
    languageSelect.replaceChildren(...languages.map(language => {
      const option = document.createElement('option');
      option.value = option.textContent = language;
      return option;
    }));
    languageSelect.disabled = false;
    // Do not replace a local file opened while the catalog was loading.
    if (!activeDocument && fileRequest === 0) await chooseLanguage(languages[0]);
    else if (activeDocument?.kind === 'local') {
      languageSelect.value = lessonGroup(activeDocument.language).length ? activeDocument.language : languages[0];
      renderLessonPicker(languageSelect.value);
      showDocument(activeDocument, selectedLine + 1);
    }
  } catch (error) {
    status(`${error.message} Run CodeSeek through the local web server to load lesson files. You can still open a local folder.`);
  }
}
initialize();
