# Mobile Workspace Actions Design

## Goal

Expose tag weight controls and positive/negative move actions on mobile devices without changing the existing desktop hover workflow.

## Approved Direction

- Keep the current desktop hover controls for workspace tags.
- Add a mobile-only bottom action sheet when a workspace tag is tapped.
- Reuse the existing store actions for weight changes and positive/negative moves.

## Interaction

### Positive Tags

- Tap a positive tag on mobile to open a bottom sheet.
- Show:
  - current weight
  - `-0.1`
  - `+0.1`
  - `Move to Negative`
  - `Remove`

### Negative Tags

- Tap a negative tag on mobile to open a bottom sheet.
- Show:
  - `Move to Positive`
  - `Remove`

## Desktop Behavior

- Keep the current hover-only action cluster.
- Do not replace or redesign the desktop workspace interaction.

## Implementation Notes

- No store schema changes are required.
- The existing `setWeight`, `moveToNegative`, `moveToPositive`, `removeTag`, and `removeNegativeTag` actions already support the needed behavior.
- The main work is in the workspace presentation layer.

## Testing Focus

- Mobile tag tap opens the action sheet.
- Weight buttons update the selected tag weight.
- Move buttons correctly move tags between positive and negative sections.
- Desktop hover UI remains available.
