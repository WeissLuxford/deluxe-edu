// Two palettes, deliberately separate — mixing them is what made the site read
// as a scribble of colors. CSS variable references, so theme swaps still apply.

// ILLUSTRATION ONLY: logotype letters, confetti, stickers, decorative icons.
// Includes --brand (the rose hue), which is one color among six here and must
// never leak into interface chrome — text, borders, shadows, hovers, badges.
export const PLAYFUL_PALETTE = [
  'var(--brand)',
  'var(--accent-blue)',
  'var(--accent-green)',
  'var(--accent-violet)',
  'var(--accent-amber)',
  'var(--accent-cyan)'
]

// UI DECORATION: per-section and per-card accents (the .fmt-card pattern).
// Calmer, cooler, no rose — these sit next to body copy on real pages, so they
// have to stay quiet enough to read as structure rather than decoration.
export const SECTION_ACCENTS = [
  'var(--accent-blue)',
  'var(--accent-violet)',
  'var(--accent-green)',
  'var(--accent-cyan)',
  'var(--accent-amber)'
]
