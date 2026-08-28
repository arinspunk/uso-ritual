# Backlog: Baseline Token Refactor
> Source: 20260828-01-solution-baseline-tokens.md
> Date: 2026-08-28
> Context: .ariadne/project-context.md

## Summary
- **Objective:** Replace `em`-based `--baseline` and the opaque `--baseline-small` with three explicit `rem`-based fraction tokens for a predictable, readable baseline grid.
- **Total tasks:** 3
- **Phases:** 2

---

## Phase 1: Token and Usage Updates

**[1.1]** ✅ Replace baseline tokens in `_tokens.css`
> **What to do:** Remove the two existing baseline tokens and add three `rem`-based replacements in the same position within the `:root` block.
> **Spec:**
> - **Files:** `src/assets/css/_tokens.css`
> - **How:**
>   - Remove line 81: `--baseline: calc(var(--line-height) * 1em);`
>   - Remove line 82: `--baseline-small: calc(var(--line-height-small));`
>   - Add in their place (same position, preserve surrounding blank lines and comments):
>     ```css
>     --baseline:         calc(var(--line-height) * 1rem); /* 24px at 16px root — 1 grid unit  */
>     --baseline-half:    calc(var(--baseline) / 2);        /* 12px — ½ grid unit                */
>     --baseline-quarter: calc(var(--baseline) / 4);         /*  6px — ¼ grid unit                */
>     ```
>   - Do NOT touch any other token. Do NOT reorder the `:root` block.
> - **Do NOT:** Modify any file other than `_tokens.css`. Do not change `--line-height`, `--line-height-small`, or any other token.
> **Done when:** `_tokens.css` contains `--baseline-quarter` and no longer contains `--baseline-small`. Verify with a search for `--baseline-small` → zero results.
> **Date completed:** 2026-08-28
> **Work done:** Replaced lines 81–82 in `_tokens.css`. Removed `--baseline` (em-based) and `--baseline-small` (dimensionless). Added `--baseline`, `--baseline-half`, `--baseline-quarter` using `rem`. Zero occurrences of `--baseline-small` remain in the file.

---

**[1.2]** ✅ Update `.post-card__date` margins in `_post-list.css`
> **What to do:** Replace the two margin declarations on `.post-card__date` to use the new fraction tokens.
> **Spec:**
> - **Files:** `src/assets/css/_post-list.css`
> - **How:** In the `.post-card__date` rule (currently lines 39–45), replace:
>   - `margin-top: calc(var(--baseline-small) * 0.5em);` → `margin-top: var(--baseline-quarter);`
>   - `margin-bottom: var(--baseline);` → `margin-bottom: calc(var(--baseline-half) + var(--baseline-quarter));`
>   - Keep `display: block`, `font-size`, and `line-height` unchanged.
> - **Do NOT:** Modify any other rule in `_post-list.css`. Do not touch `.post-card__media`, `.post-card__excerpt`, or any other selector.
> **Done when:** `.post-card__date` rule contains `var(--baseline-quarter)` in both `margin-top` and `margin-bottom`, and the string `--baseline-small` no longer appears in `_post-list.css`.
> **Date completed:** 2026-08-28
> **Work done:** Replaced `margin-top: calc(var(--baseline-small) * 0.5em)` → `var(--baseline-quarter)` and `margin-bottom: var(--baseline)` → `calc(var(--baseline-half) + var(--baseline-quarter))` in `_post-list.css`. Zero occurrences of `--baseline-small` remain.

---

## Phase 2: Visual Verification

**[2.1]** ⏳ Verify spacing at all breakpoints
> **What to do:** Open the running dev server and visually confirm that post card date spacing is unchanged at all four defined breakpoints.
> **Spec:**
> - **Files:** No file changes — read-only verification step.
> - **How:**
>   - Dev server must be running (`deno task lume -s`).
>   - Open `http://localhost:3000/` (home — post list).
>   - In DevTools, inspect `.post-card__date` computed styles and confirm:
>     - `margin-top` computed value = `var(--baseline-quarter)` resolved value (`font-size-base / 4 * line-height`)
>     - `margin-bottom` computed value = `var(--baseline-half) + var(--baseline-quarter)` (= 18px at 16px root)
>   - Resize to the four breakpoints defined in `_tokens.css`: 320px, 768px, 1024px, 1280px, 1440px.
>   - Confirm no layout shift or collapsed spacing at any width.
> - **Do NOT:** Make any code changes during this step. If a visual issue is found, open a new task or revert task 1.2.
> **Done when:** Computed `margin-top` and `margin-bottom` on `.post-card__date` match expected pixel values at all five viewport widths, with no visible regression in post card layout.
> **Date completed:** -
> **Work done:** -

---

## Progress
- ⏳ Pending: 1 | 🔄 In Progress: 0 | ✅ Done: 2 | ⚠️ Blocked: 0
- **Completion:** 67%

## Dependencies & Critical Path
- [1.1] blocks [1.2] — `_post-list.css` references `--baseline-quarter` and `--baseline-half`, which must exist in `_tokens.css` first.
- [1.2] blocks [2.1] — visual verification only makes sense after both file changes are applied.

## Decisions Log
*Empty — populated during execution.*

## Deviations Log
*Empty — populated during execution.*
