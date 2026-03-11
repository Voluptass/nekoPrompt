# Dual DALL·E Styles Design

## Goal

Support both illustration-commission phrasing and photography-description phrasing for DALL·E output, while keeping SD formatting unchanged.

## Approved Direction

- Keep the existing top-level `SD / DALL·E` toggle.
- When `DALL·E` is active, show a second toggle for `Illustration / Photo`.
- Apply the chosen DALL·E style to both positive and negative prompt text.

## UX

- `SD` mode keeps the current tag-string output.
- `DALL·E + Illustration` should read like an illustration commission brief.
- `DALL·E + Photo` should read like a photography prompt or shot description.
- The DALL·E sub-toggle should only be visible while DALL·E is selected.

## Formatter Behavior

### Illustration Style

- Prefer phrases like `Create a high-quality anime illustration of ...`
- Keep character, appearance, clothing, scene, and style phrasing aligned with illustrated/anime artwork.
- Negative guidance should avoid illustration artifacts and low-quality render language.

### Photo Style

- Prefer phrases like `Create a cinematic portrait photo of ...`
- Reframe style/composition/lighting into photographic language where possible.
- Negative guidance should sound like photography quality control rather than illustration tags.

## Scope

- Update preview state and controls.
- Update formatter utilities to support a DALL·E style variant.
- Add tests that prove the two DALL·E styles produce visibly different output.

## Constraints

- No changes to the store shape unless the UI truly needs persisted preference.
- No changes to tag selection behavior.
- No regression to SD output.
