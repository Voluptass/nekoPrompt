# Default Tags Expansion Design

## Overview

Expand the built-in default tag library so the app ships with a more practical Standard Diffusion baseline. Keep the current category model and UI behavior unchanged, and limit this change to curated data, tests, and documentation.

## Goals

- Add a larger set of common built-in SD tags across the existing categories.
- Preserve the current click-to-compose, search, preset, and export flows without schema changes.
- Keep the built-in library opinionated and broadly useful instead of exhaustive.

## Non-Goals

- No new categories.
- No platform-specific filtering or tag recommendation logic.
- No changes to persisted user data or import/export format.
- No character/IP-specific preset bundles.

## Chosen Approach

Use a data-only expansion in [src/data/tags.ts](/D:/GitHub/nekoPrompt/src/data/tags.ts). The existing `useAllTags()` flow already consumes built-in tags, so adding more curated entries automatically updates the tag library, search results, prompt composition, and preset usage.

This is the smallest correct change:

- `src/data/tags.ts` remains the single source of truth for built-in tags.
- `src/data/__tests__/data.test.ts` gains a regression test for representative newly added common tags.
- `README.md` is updated to reflect the real built-in tag count after expansion.

## Data Rules

- Keep the current 10 categories unchanged.
- Continue using English tag text for `text`.
- Use stable snake_case ids derived from the tag meaning.
- Prefer high-frequency, generic SD tags that fit broad anime/illustration use cases.
- Avoid niche style packs, franchise names, or overly redundant near-duplicates.

## Expansion Focus

The main additions should concentrate on the categories that currently feel sparse:

- `character`: common multi-character variants and portrait framing helpers
- `appearance`: hair, eye, body, and accessory descriptors
- `clothing`: common outfits and clothing details
- `expression`: common poses and emotion descriptors
- `scene`: indoor/outdoor environment staples
- `style`: rendering/style descriptors that pair well with SD prompting
- `lighting`: common atmosphere and cinematic lighting tags
- `composition`: view angle, framing, and shot distance helpers
- `negative`: frequent cleanup tags for anatomy, quality, and artifact control

## Testing

Follow TDD:

1. Add a failing test that checks a representative set of new common tags exists.
2. Expand the built-in tag dataset until the test passes.
3. Re-run the existing built-in data tests to confirm ids stay unique and categories remain valid.

## Risks

- Over-expansion can make the default library noisy and harder to scan.
- Adding redundant synonyms would weaken search quality and visual density.
- README can drift again if the count is edited manually without checking the source.

## Mitigations

- Keep the list curated instead of exhaustive.
- Add only tags with clear practical value.
- Derive the final documented count from the updated data file before editing README.
