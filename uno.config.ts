import { defineConfig } from 'unocss'

// Slidev merges this with its own UnoCSS config (presetWind3, presetAttributify,
// presetTypography, presetIcons, transformerDirectives, transformerVariantGroup
// are all already set up by @slidev/cli) — so only declare what's specific to
// this deck here.

export default defineConfig({
  shortcuts: [
    // Slide surface. Slidev applies `bg-main` to the slide container itself,
    // so overriding it is how the deck sets its own background. Note this also
    // repaints Slidev's own chrome (nav bar, menus, presenter view).
    ['bg-main', 'bg-white text-[#181818] dark:(bg-navy text-[#ddd])'],

    // Callout boxes
    ['callout', 'bg-callout-light dark:bg-callout-dark rounded-lg p-6 text-gray-800 dark:text-gray-100'],
    ['callout-important', 'border-2 border-double border-accent-light dark:border-accent-dark rounded-lg p-6 text-gray-800 dark:text-gray-100'],

    // Text utilities.
    // `text-brand`, not `text-primary` — Slidev already defines `text-primary`
    // as `color-$slidev-theme-primary` and uses it in its own UI, alongside
    // `bg-primary` / `border-primary`. Redefining it made "primary" mean two
    // different colours.
    ['text-brand', 'text-navy dark:text-white'],
    ['text-secondary', 'text-gray-800 dark:text-gray-100'],
    ['text-tertiary', 'text-gray-500 dark:text-accent-dark'],
    ['text-accent', 'text-accent-light dark:text-accent-dark'],

    // Backgrounds
    ['bg-callout', 'bg-callout-light dark:bg-callout-dark'],

    // Buttons
    ['btn-primary', 'bg-navy text-white px-5 py-3 rounded-lg font-semibold transition-opacity hover:opacity-90'],
    ['btn-secondary', 'bg-callout-light dark:bg-callout-dark border-2 border-accent-light dark:border-accent-dark text-navy dark:text-white px-5 py-3 rounded-lg font-semibold transition-all hover:bg-accent-light dark:hover:bg-accent-dark hover:text-white'],
  ],

  theme: {
    colors: {
      navy: '#1e3a5f',
      'accent-light': '#64748b',
      'accent-dark': '#94a3b8',
      'callout-light': '#f1f5f9',
      'callout-dark': '#2d4570',
      'grey-neutral': '#9ca3af',
      'grey-dark': '#374151',
      'grey-light': '#e5e7eb',
    },
    fontFamily: {
      // Both are loaded by Slidev from the `fonts:` block in slides.md
      heading: '"Outfit", sans-serif',
      body: '"Public Sans", sans-serif',
    },
  },
})
