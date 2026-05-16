# Clipboard Markdown Viewer

### Available at [markdown.syntaxworks.top](https://markdown.syntaxworks.top/)

Single file web app to render markdown from your clipboard.

## Usage

Open `index.html` in your browser. Copy some Markdown, then either:

- Press `Ctrl+V` (or `Cmd+V`) anywhere on the page, or
- Click **Live** to have the app poll the clipboard and re-render on change.

Live polling requires an `http(s)://` or `localhost` origin. On `file://`,
the browser cannot remember clipboard permission, so the app falls back to
manual paste only.

## Options

The toolbar (top of the page, auto-hides after 5 seconds of no mouse
movement or when the cursor leaves the window) provides:

- **Live / Paste** – monitor clipboard changes or paste once.
- **Width** – adjust width of the markdown rendering column.
- **Justify** – toggle justification of rendered text.
- **Theme** – select light, dark or auto (follows system).

All settings persist in `localStorage`.

## Dependencies

Loaded from a CDN at runtime:

- [marked](https://github.com/markedjs/marked) — Markdown parser
- [DOMPurify](https://github.com/cure53/DOMPurify) — HTML sanitizer
- [highlight.js](https://github.com/highlightjs/highlight.js) — code highlighting

No build step.