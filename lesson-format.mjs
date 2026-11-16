// Shared by bundled lessons and source/Markdown pairs chosen in the explorer.
export function escapeHTML(text) {
  return String(text).replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[character]));
}

export function sourceLines(source) {
  const lines = source.replace(/\r\n|\r/g, '\n').split('\n');
  // A final newline terminates the last source line; it is not an extra line.
  if (lines.length > 1 && lines.at(-1) === '') lines.pop();
  return lines;
}

export function parseGuide(markdown, lineCount) {
  const annotations = new Map();
  const introduction = [];
  let section = null;
  let takeaway = false;
  let fenced = false;
  for (const line of markdown.replace(/^\uFEFF/, '').replace(/\r\n|\r/g, '\n').split('\n')) {
    if (/^\s*```/.test(line)) fenced = !fenced;
    const match = !fenced && /^##\s+Line\s+(\d+)\s*:\s*(.+)$/i.exec(line);
    if (match) {
      const number = Number(match[1]);
      if (number < 1 || number > lineCount) throw new Error(`Markdown refers to line ${number}, but the source has ${lineCount} ${lineCount === 1 ? 'line' : 'lines'}.`);
      if (annotations.has(number)) throw new Error(`Markdown contains more than one explanation for line ${number}.`);
      section = { title: match[2].trim(), body: [], takeaway: [] };
      annotations.set(number, section);
      takeaway = false;
    } else if (section && !fenced && /^###\s+Good to know\s*$/i.test(line)) {
      takeaway = true;
    } else if (section) section[takeaway ? 'takeaway' : 'body'].push(line);
    else introduction.push(line);
  }
  for (const section of annotations.values()) {
    section.body = section.body.join('\n').trim();
    section.takeaway = section.takeaway.join('\n').trim();
  }
  const intro = introduction.join('\n').trim();
  const title = /^#\s+(.+)$/m.exec(intro);
  return {
    title: title?.[1].trim() || '',
    overview: (title ? intro.replace(title[0], '') : intro).trim(),
    annotations,
  };
}

function inlineMarkdown(text) {
  // Escape first; raw HTML in a companion file is always displayed as text.
  return escapeHTML(text).replace(/`([^`]+)`|\*\*([^*]+)\*\*|\*([^*]+)\*/g,
    (_, code, bold, emphasis) => code !== undefined ? `<code>${code}</code>` : bold !== undefined ? `<strong>${bold}</strong>` : `<em>${emphasis}</em>`);
}

export function renderMarkdown(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let paragraph = [];
  let list = [];
  let code = null;
  function flush() {
    if (paragraph.length) blocks.push(`<p>${inlineMarkdown(paragraph.join(' '))}</p>`);
    if (list.length) blocks.push(`<ul>${list.map(item => `<li>${inlineMarkdown(item)}</li>`).join('')}</ul>`);
    paragraph = [];
    list = [];
  }
  for (const line of lines) {
    if (/^\s*```/.test(line)) {
      flush();
      if (code !== null) { blocks.push(`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`); code = null; }
      else code = [];
    } else if (code !== null) code.push(line);
    else if (!line.trim()) flush();
    else if (/^#{1,6}\s/.test(line)) { flush(); blocks.push(`<h4>${inlineMarkdown(line.replace(/^#{1,6}\s+/, ''))}</h4>`); }
    else if (/^[-*]\s+/.test(line)) {
      if (paragraph.length) flush();
      list.push(line.replace(/^[-*]\s+/, ''));
    } else {
      if (list.length) flush();
      paragraph.push(line);
    }
  }
  flush();
  if (code !== null) blocks.push(`<pre><code>${escapeHTML(code.join('\n'))}</code></pre>`);
  return blocks.join('');
}
