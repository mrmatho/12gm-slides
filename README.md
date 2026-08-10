# Welcome to [Slidev](https://github.com/slidevjs/slidev)!

To start the slide show:

- `pnpm install`
- `pnpm run dev`
- visit <http://localhost:3030>

Edit the [slides.md](./slides.md) to see the changes.

Learn more about Slidev at the [documentation](https://sli.dev/).

## Printable Notes Templates

The [notes/](./notes) folder holds printable A4 fill-in-the-blank worksheets, one per topic, for use alongside the slides in class. These are plain static HTML + CSS files, fully independent of Slidev — no build step, no dev server. Just open a file directly in a browser and print (Ctrl+P) or save as PDF.

- Each worksheet mirrors a slide file: `notes/NN_slug.html` corresponds to `pages/NN_slug.md`.
- `notes/notes.css` is the shared stylesheet (A4 print rules, blank-line/diagram-box/matrix-grid styles).
- `notes/TEMPLATE.html` is the starting point for a new topic — it documents each reusable block type inline.

**To add a worksheet for a new topic:**

1. Copy `notes/TEMPLATE.html` to `notes/NN_slug.html`, matching the new `pages/NN_slug.md` filename.
2. Walk the new slide file top to bottom, adding one `.section` per slide/group of slides and filling it in using the block types documented in `TEMPLATE.html` (vocabulary blocks, diagram boxes, worked examples, callouts, fill-in tables, matrix grids).
3. Add a link to the new worksheet in `notes/index.html`.
4. Open the file in a browser to check it, then print.

On push to `main`, the GitHub Actions deploy workflow publishes these worksheets (and the index) alongside the Slidev site at `/handouts/` — kept separate from Slidev's own built-in `/notes` presenter route.

Worksheet content is authored by hand from the matching slide file and isn't auto-generated, so if you substantially edit a topic's slides, check the matching `notes/*.html` file for drift.
