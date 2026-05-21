# Clipboard Markdown Viewer

### Available at [markdown.syntaxworks.top](https://markdown.syntaxworks.top/)

Single-file web app to render markdown from your clipboard, deployed on
AWS Amplify with an S3-backed share API.

## Usage

Open `index.html` in your browser. Copy some Markdown, then press `Ctrl+V`
(or `Cmd+V`) anywhere on the page to render it.

## Options

The toolbar (top of the page, auto-hides after 5 seconds of no mouse
movement or when the cursor leaves the window) provides:

- **Save** – keep the current note in the sidebar for later.
- **Share** – upload the current note and copy a short link.
- **Width** – adjust width of the markdown rendering column.
- **Justify** – toggle justification of rendered text.
- **Theme** – select light, dark or auto (follows system).

All settings and saved notes persist in `localStorage`.

## Sharing

Pressing **Share** uploads the note to an S3 bucket through a Lambda
function and produces a link of the form `https://.../#id=XXXXXXXXXXXXXXXX`
where the `id` is a 16-character random alphanumeric. Visiting the link
fetches and renders the stored note, then strips the id from the address
bar.

## Frontend dependencies

Loaded from a CDN at runtime:

- [marked](https://github.com/markedjs/marked) — Markdown parser
- [DOMPurify](https://github.com/cure53/DOMPurify) — HTML sanitizer
- [highlight.js](https://github.com/highlightjs/highlight.js) — code highlighting
- [KaTeX](https://github.com/KaTeX/KaTeX) — math rendering

No frontend build step.

## Backend (AWS Amplify Gen 2)

The `amplify/` directory defines the backend:

- `amplify/storage/resource.ts` — S3 bucket (`notes` resource) for note blobs.
- `amplify/functions/notes/` — Lambda handler exposing a public Function URL
  with `PUT /notes` (create, returns id) and `GET /notes/{id}` (fetch).
- `amplify/backend.ts` — wires the bucket to the Lambda (read/write grant,
  bucket name as env var) and exports the Function URL as a custom output.

### Local sandbox

```bash
npm install
npx ampx sandbox
```

This provisions a personal stack and writes `amplify_outputs.json`.

### Local frontend

After a sandbox or pipeline deploy, generate `config.js` from the outputs:

```bash
npm run generate-config
```

Then open `index.html` in a browser (or any static server). The script
reads `window.APP_CONFIG.notesApiUrl` to talk to the deployed Function URL.
Without `config.js`, the app still renders pasted markdown locally — only
sharing is disabled.

### Amplify Hosting deploy

The repository includes an `amplify.yml`. Connect the repo in the Amplify
console; the backend phase runs `ampx pipeline-deploy` and the frontend
phase regenerates `config.js` before publishing `index.html`.
