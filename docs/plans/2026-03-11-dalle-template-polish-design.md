# DALL·E Template Polish Design

## Goal

Make the DALL·E preview visibly different from the SD preview by generating category-aware natural-language prompts.

## Approved Direction

- Keep SD output unchanged.
- Change DALL·E positive output into a full English sentence.
- Change DALL·E negative output into an English avoidance sentence.
- Use category-aware phrasing instead of a plain comma-joined tag list.

## Output Rules

- Character tags should lead the sentence as the subject.
- Appearance, clothing, and expression/action tags should describe the subject.
- Scene, style, lighting, and composition tags should appear later in the sentence.
- Quality tags should become natural descriptive modifiers rather than raw tag syntax.
- SD-style weights should be ignored in DALL·E mode.

## Scope

- Update formatter utilities.
- Update preview wiring for positive vs negative DALL·E text.
- Add regression tests for the new wording.

## Constraints

- No changes to tag selection or storage behavior.
- No new dictionaries beyond lightweight category-aware phrasing.
- Keep English output to match the current tag corpus.
