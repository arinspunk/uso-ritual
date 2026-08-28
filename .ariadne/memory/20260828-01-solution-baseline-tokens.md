# Solution: Baseline Token Refactor
> Source: Simplify and clarify the baseline spacing token system in _tokens.css and fix context-dependent `em` resolution.
> Date: 2026-08-28
> Context: .ariadne/project-context.md

## Problem
`--baseline` is defined as `calc(var(--line-height) * 1em)`, which resolves to different pixel values depending on the element's own `font-size`. On elements with `font-size: 1rem` (paragraphs, headings) it gives 24px as expected, but on `.post-card__date` (font-size: 0.75rem) it silently gives 18px. `--baseline-small` is a dimensionless `1.0` multiplier used in exactly one place via an opaque `calc()` pattern — its intent is not readable at the usage site.

## Proposed Approach
Replace the two current baseline tokens with three `rem`-based tokens with explicit fraction names. Because `html { font-size: var(--font-size-base) }` is already set in `_reset.css`, `1rem` changes with every breakpoint, so `rem`-based spacing is fully responsive. No new mechanisms needed.

Following the existing pattern of CSS custom properties in `_tokens.css`:

```css
/* Replace in _tokens.css (:root block) */
--baseline:         calc(var(--line-height) * 1rem); /* 24px at 16px root — 1 grid unit  */
--baseline-half:    calc(var(--baseline) / 2);        /* 12px — ½ grid unit                */
--baseline-quarter: calc(var(--baseline) / 4);         /*  6px — ¼ grid unit                */
```

`--baseline-small` is removed entirely.

## Implementation Steps
1. **`_tokens.css`** — in the `:root` block, replace lines 81–82:
   - Remove `--baseline: calc(var(--line-height) * 1em);`
   - Remove `--baseline-small: calc(var(--line-height-small));`
   - Add the three new tokens above.
2. **`_post-list.css`** — `.post-card__date` (lines 43–44):
   - Replace `margin-top: calc(var(--baseline-small) * 0.5em)` → `margin-top: var(--baseline-quarter)`
   - Replace `margin-bottom: var(--baseline)` → `margin-bottom: calc(var(--baseline-half) + var(--baseline-quarter))`
   - Result: 6px top / 18px bottom — same visual rhythm, now semantically explicit.
3. **All other usages** — `_typography.css`, `_post.css`, `_post-media.css`, `_layout.css` use `var(--baseline)` on `1rem` elements; no change needed — the value is identical.
4. Verify visually at all breakpoints (320px, 768px, 1024px, 1440px).

## Trade-offs
- **Chosen because:** `rem` is already responsive (root font-size changes via media queries), requires no new architecture, removes the silent `em` inheritance bug, and makes every spacing value readable without mental arithmetic.
- **Rejected alternative(s):** Keeping `em`-based `--baseline` with better comments — still leaves the context-dependent behaviour as a latent bug for any future small-text element. Defining `--baseline-3q` (18px) as a named token — introduces a non-standard fraction that is unlikely to be reused.
- **Risks/limitations:** `margin-bottom` on `.post-card__date` changes from 18px → 18px (identical via `--baseline-half + --baseline-quarter`). The only real change is semantic clarity. If future elements use `--baseline` inside a non-`1rem` context, the new behaviour will differ from the old — this is intentional and correct.

## Constraints Applied
- CSS: ALWAYS use CSS custom properties — all spacing expressed via tokens, no hardcoded values.
- CSS: NEVER add external dependencies — pure CSS token reorganisation, no new files.
- No new libraries or CDN imports.
