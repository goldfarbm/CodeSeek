---
name: codeseek-markdown-guide
description: Create or update a CodeSeek Markdown companion for a given source code file, with an explanation for each physical source line and the exact filename-plus-.md pairing convention.
---

# Create a CodeSeek Markdown companion

Given a code file, create a beginner-friendly Markdown guide that CodeSeek can display beside its source. Keep the code and its guide in separate, adjacent files.

## Input and output

Read the complete source file before writing explanations. If the file or its contents have not been supplied and cannot be located from the request, ask for the code file.

Append `.md` to the **complete source filename**, preserving its directory and extension:

```text
examples/the_code_file.py
examples/the_code_file.py.md
```

For JavaScript, `example.js` pairs with `example.js.md`. The same rule applies to other languages. Do not replace the source extension with `.md` or place the guide in another folder.

Write only the requested companion file. Do not modify or reformat the source, embed the guide in application code, or change the lesson catalog unless requested. When a companion already exists, update it against the current source and preserve useful, accurate explanations.

If working in a chat without filesystem access, return the Markdown document and identify its intended filename separately. Do not wrap the entire deliverable in a code fence that would become part of the saved guide.

## Required document format

Start with one level-one title and a short introductory paragraph describing the file's purpose. The introduction is used as the lesson description, so keep it plain text and avoid duplicating the entire source there.

Then write one section for **every physical source line**, in ascending order, using this exact heading form:

```markdown
## Line 1: A short explanation title
```

Follow each heading with a nonempty explanation of that line. An optional `### Good to know` subsection may provide a useful takeaway. Put that subsection after the main explanation and before the next line heading.

Do not use line ranges, repeated line numbers, or alternate labels such as `Lines 1–3`, `L1`, or `Line #1`. CodeSeek recognizes individual `## Line N: Title` headings.

### Line numbering

- Start at 1 and count comments, blank lines, decorators, imports, and closing delimiters.
- Count physical lines, not editor word wrapping or logical statements. A statement spanning several lines needs a section for each physical line.
- Treat CRLF and CR line endings as single line breaks.
- A final line terminator does not add an extra source line. For example, `a\n` has one line; `a\n\n` has two, the second blank.
- CodeSeek displays an empty file as one blank line; explain that line without inventing behavior.

## Writing explanations

Explain the line in the context of the complete program. Describe what it does, why it matters here, and how its values or control flow relate to nearby code. Use the learner's requested level; default to a beginner who understands ordinary computing terms.

Distinguish definitions from execution, arguments from parameters, return values from printed output, assignment from comparison, and the selected branch from skipped branches when relevant. For a fragment of a multiline statement, explain its role in the enclosing expression rather than treating it as an independently executable instruction.

For blank lines and closing delimiters, give a brief, accurate explanation of spacing or block structure. For comments, explain their intent and whether they affect execution. Do not say that a blank line alone ends a Python block.

Use concrete values from the file when they help. State exact output only when it follows from the code and known inputs; label illustrative or conditional outcomes. Do not invent library behavior, data, credentials, external responses, or the contents of unavailable dependencies. Identify uncertainty or assumptions briefly when context is missing.

Explain existing bugs or misleading comments honestly without silently fixing the source. Reading the source is normally sufficient; do not run the program merely to produce a guide, especially when it performs external actions or requires secrets.

Aim for a short paragraph per line, expanding only when the behavior needs it. Use `### Good to know` for a useful distinction, consequence, or edge case rather than repeating the paragraph. Skip it when it adds nothing.

## Supported Markdown

Use paragraphs, inline code, **bold**, *italics*, `-` bullet lists, and triple-backtick fenced code blocks. Keep examples small and close all code fences. The CodeSeek viewer supports a limited Markdown subset; do not rely on tables, images, raw HTML, links, frontmatter, or advanced Markdown features in the generated companion.

Reserve `## Line N: Title` for source-line explanations and `### Good to know` for takeaways. A literal line-heading example must be inside a fenced code block so the parser does not mistake it for another annotation.

The companion itself must not contain YAML frontmatter or these skill instructions.

## Example

For a source file named `hello.py` with exactly these two lines:

```python
name = "Alex"
print(f"Hello, {name}!")
```

Create `hello.py.md` containing:

```markdown
# A personal greeting

Store a name and display a personalized message.

## Line 1: Remember the name

Assign the string `"Alex"` to `name`. The following line uses this value to build a greeting.

## Line 2: Display the greeting

The f-string inserts the current value of `name` into the message. `print` writes `Hello, Alex!` followed by a newline to standard output, usually your terminal.

### Good to know

The `f` before the opening quote enables value substitution inside braces.
```

## Validate before delivering

Re-read the source and the saved companion. Confirm the following:

- The output is UTF-8 Markdown beside the source with the exact `<source filename>.md` name.
- There is exactly one nonempty explanation for every source line, with no missing, duplicate, or out-of-range numbers.
- The explanation for each number matches that physical source line, including blank lines and multiline expressions.
- The title and introduction appear before the first line section; all fences are closed.
- The original source remains unchanged. If it changed during authoring, realign the guide with the current source before finishing.

When working in the CodeSeek repository, use its `sourceLines` and `parseGuide` exports from `lesson-format.mjs` if available to verify parsing and coverage. The parser rejects duplicate and out-of-range references but does not require complete coverage: also check that the annotation count equals the source-line count and that every annotation has a nonempty body.

Finish with the saved companion's path and a brief validation result. Do not claim the program was executed unless it actually was.
