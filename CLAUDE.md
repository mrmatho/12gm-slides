# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A [Slidev](https://sli.dev) slide deck for Year 12 General Maths (Heathmont College), covering graph theory / networks topics. Content lives in `pages/NN_slug.md` files, wired together by the top-level `slides.md`. Alongside the deck, `handouts/` holds independent, non-Slidev printable A4 worksheets — one static HTML file per topic — for use in class. `generator/` is a third, similarly independent static page: a browser-side tool for building and exporting (SVG/PNG) the same diagram types as the slide components, for use outside the deck.

## Commands

- `pnpm install` — install dependencies (pnpm is the package manager of record; `pnpm-workspace.yaml` and `pnpm-lock.yaml` are present, though CI uses `npm install` — see below)
- `pnpm run dev` — start the Slidev dev server at http://localhost:3030
- `pnpm run build` — build the static site to `dist/`
- `pnpm run export` — export the deck to PDF/PNG/PPTX via `slidev export` (uses `playwright-chromium`, pre-approved to build in `pnpm-workspace.yaml`)

There is no test suite or linter script wired into `package.json`. `.markdownlint.jsonc` configures markdownlint for editors/CI-adjacent tooling, with several rules disabled because Slidev decks legitimately violate normal Markdown conventions (repeated `# Title` per slide, `---` slide separators, inline HTML, bare URLs).

Note: the GitHub Actions deploy workflow (`.github/workflows/deploy.yml`) uses `npm install` / `npm run build`, not pnpm, despite the pnpm lockfile — keep both working if you touch dependencies or build scripts.

## Architecture

**Slide composition**: `slides.md` is the deck entrypoint. It doesn't contain topic content directly — each topic is pulled in via a `src: pages/NN_slug.md` frontmatter block. To add a new topic, create `pages/NN_slug.md` and add a corresponding `src:` block to `slides.md`. Per-topic files use `NN_` numeric prefixes to keep ordering explicit in both `pages/` and `slides.md`.

**Layouts and diagrams**: slides mix Slidev's built-in layouts (`cover`, `center`, `two-cols`, `two-cols-header`) with Mermaid code fences for simple graphs and the custom `<FlowNetwork>` Vue component ([components/FlowNetwork.vue](components/FlowNetwork.vue)) for anything Mermaid's layout engine can't do — specifically diagrams that need a "cut" drawn across specific edges, since node/edge/cut positions there are explicit props rather than auto-laid-out. Read the doc comment at the top of that file before using it; it explains the coordinate system and cut-label positioning.

**Custom components** (`components/`): auto-registered by Slidev (no explicit import needed in slide markdown) — `FlowNetwork.vue` (network diagrams), `CountdownTimer.vue` (in-class timer), `Counter.vue` (Slidev starter template leftover).

**The `handouts/` worksheet system is deliberately parallel to, not generated from, the slides.** Each `handouts/NN_slug.html` corresponds by filename to a `pages/NN_slug.md`, is plain static HTML/CSS (no build step, no Slidev, opens directly in a browser and prints via Ctrl+P), and is authored/maintained by hand. `handouts/TEMPLATE.html` documents the reusable block types (vocab blocks, diagram boxes vs. diagram images, worked examples, fill-in tables, matrix grids) inline in its own comments — read it before adding a new worksheet rather than reverse-engineering an existing one. New worksheets must also be linked in `handouts/index.html`. Because content isn't auto-generated, substantially editing a topic's slides means checking whether the matching `handouts/*.html` should be re-generated.

**The `generator/` diagram generator is a hand-maintained, plain-JS port of the diagram components, not a build output.** `generator/diagrams.js` re-implements the layout/geometry logic of `FlowNetwork.vue`, `BipartiteGraph.vue`, `ActivityNetwork.vue` (+ `composables/useActivityNetworkLayout.js`), and a fourth "Simple Graph" type with no slide-component equivalent (nodes/edges with explicit x/y, no auto-layout — a non-Mermaid alternative to the `graph LR`/`TD` fences used in `pages/*.md`) as string-building functions with inline colors (no Vue, no Tailwind classes) — `generator/app.js` reads a JSON textarea, calls the matching renderer, and shows the resulting SVG live, with buttons to download it as SVG or rasterize to PNG via `<canvas>`. It deliberately depends on nothing but the browser (no Mermaid, no CDN, no build step) so it works offline as a static page. Because it's a hand-sync'd port, not a shared import, changing a diagram component's layout math means mirroring the change in `diagrams.js` if the generator should stay consistent with it.

**Deployment**: on push to `main`, GitHub Actions builds the Slidev site and separately copies `handouts/*.html` (excluding `TEMPLATE.html`) plus `handouts/notes.css` into `dist/handouts/`, and `generator/*.{html,css,js}` into `dist/generator/`, so both are published alongside the deck but stay outside Slidev's own routes. Netlify and Vercel configs (`netlify.toml`, `vercel.json`) are also available as alternative deploy targets, but neither are in active use.

## Conventions from prior feedback

- When scaffolding a new slide page, wire it into `slides.md` and leave the actual explanatory content to the user rather than over-populating it.
- Where a slide has a diagram, the diagram should be the focus of the slide, with explanatory text kept to a minimum. The text should be in the form of bullet points or short paragraphs, not long blocks of prose.
- Simple graphs use Mermaid code fences, more complex diagrams need custom components like the `<FlowNetwork>` component. 
- The <FlowNetwork> component is used for network flow diagrams that need a "cut" drawn across specific edges, since node/edge/cut positions are explicit props rather than auto-laid-out. Read the doc comment at the top of that file before using it; it explains the coordinate system and cut-label positioning.
