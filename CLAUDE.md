# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A [Slidev](https://sli.dev) slide deck for Year 12 General Maths (Heathmont College), covering graph theory / networks topics. Content lives in `pages/NN_slug.md` files, wired together by the top-level `slides.md`. Alongside the deck, `notes/` holds independent, non-Slidev printable A4 worksheets — one static HTML file per topic — for use in class.

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

**The `notes/` worksheet system is deliberately parallel to, not generated from, the slides.** Each `notes/NN_slug.html` corresponds by filename to a `pages/NN_slug.md`, is plain static HTML/CSS (no build step, no Slidev, opens directly in a browser and prints via Ctrl+P), and is authored/maintained by hand. `notes/TEMPLATE.html` documents the reusable block types (vocab blocks, diagram boxes vs. diagram images, worked examples, fill-in tables, matrix grids) inline in its own comments — read it before adding a new worksheet rather than reverse-engineering an existing one. Because content isn't auto-generated, substantially editing a topic's slides means checking whether the matching `notes/*.html` should be re-generated.

**Deployment**: on push to `main`, GitHub Actions builds the Slidev site and separately copies `notes/*.html` (excluding `TEMPLATE.html`) plus `notes/notes.css` into `dist/handouts/`, so the worksheets are published alongside the deck at `/handouts/` but stay outside Slidev's own `/notes` presenter route. Netlify and Vercel configs (`netlify.toml`, `vercel.json`) are also available as alternative deploy targets, but neither are in active use.

## Conventions from prior feedback

- When scaffolding a new slide page, wire it into `slides.md` and leave the actual explanatory content to the user rather than over-populating it.
- Where a slide has a diagram, the diagram should be the focus of the slide, with explanatory text kept to a minimum. The text should be in the form of bullet points or short paragraphs, not long blocks of prose.
- Simple graphs use Mermaid code fences, more complex diagrams need custom components like the `<FlowNetwork>` component. 
- The <FlowNetwork> component is used for network flow diagrams that need a "cut" drawn across specific edges, since node/edge/cut positions are explicit props rather than auto-laid-out. Read the doc comment at the top of that file before using it; it explains the coordinate system and cut-label positioning.
