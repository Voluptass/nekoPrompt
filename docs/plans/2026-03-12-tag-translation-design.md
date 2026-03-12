# Tag Translation Feature Design

## Overview

Add Chinese translation support for tags so the app can display Chinese helper text for built-in and custom tags while keeping English tag text as the canonical prompt output.

## Goals

- Show Chinese translations for built-in and custom tags in the UI.
- Allow users to add or edit Chinese translations for custom tags.
- Make tag search match Chinese translations in addition to English text and aliases.
- Keep SD and DALL·E prompt generation unchanged.

## Non-Goals

- Do not generate Chinese prompts in Preview.
- Do not replace `text` as the canonical prompt token.
- Do not reuse `description` as the translation field.
- Do not add a new persistence store or separate translation dictionary.

## Data Model

Extend `Tag` with an optional `translation?: string` field.

```ts
export interface Tag {
  id: string
  text: string
  category: string
  translation?: string
  aliases?: string[]
  description?: string
  platforms?: Platform[]
}
```

### Rationale

- `text` remains the prompt-safe English token used by formatters, copy, presets, and persistence.
- `translation` is presentation metadata and optional, so existing stored tags remain valid without a forced migration.
- `description` keeps its current meaning as free-form explanatory text instead of being overloaded as a localized label.

## Storage and Compatibility

Built-in tags will store translations inline in `src/data/tags.ts`.

Custom tags already persist through `useCustomTagStore`, so the new optional field will naturally serialize and hydrate with the existing persist middleware. Older localStorage payloads continue to work because missing `translation` values are acceptable.

## UI Behavior

### Tag Library

- Tag buttons continue showing English `text` as the primary label.
- When a translation exists, show the Chinese translation as secondary helper text in the button and include it in the tooltip.
- Custom tag visual styling remains unchanged.

### Create/Edit Tag Modal

- Add a dedicated `汉语翻译` input.
- Keep `描述` as a separate advanced field.
- Editing a custom tag preloads the saved translation value.

### Manage Modal

- In the custom tag list, show English `text` as the main line and Chinese translation as supporting metadata when present.
- Category management stays unchanged.

### Workspace

- Workspace chips stay English-first to preserve prompt clarity and avoid visual noise.
- Mobile action sheet shows the Chinese translation under the English tag name when available.

## Search Behavior

`filterTags` should match:

- `text`
- `aliases`
- `translation`

Matching remains case-insensitive. For Chinese text, the lowercase step is harmless and keeps the implementation uniform.

## Built-in Translation Coverage

This change should add translations for representative built-in tags that users are likely to browse first. Coverage can expand incrementally later, but the initial patch should include enough common tags to make the feature visible and testable across multiple categories.

## Testing Strategy

### Hook and Search Tests

- Verify `useAllTags` and `useFindTag` preserve `translation` on custom tags.
- Verify `filterTags` matches by translation.

### Tag Library and Modal Tests

- Verify custom tag creation saves `translation`.
- Verify searching by Chinese translation finds the tag.
- Verify the tag library renders the translation helper text.
- Verify the manage modal shows the translation for custom tags.

### Workspace Tests

- Verify custom tags with translations display the translation in the mobile action sheet.

### Built-in Data Regression

- Add a regression test that locks a small representative set of built-in translations so later data edits do not silently remove them.

## Risks and Constraints

- Adding too much secondary text in small chips can hurt readability, so translation display should be selective and compact.
- Accessibility queries in tests will need to account for richer button content.
- Built-in translations should stay concise and practical rather than becoming long descriptions.
