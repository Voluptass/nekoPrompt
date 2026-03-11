# Mobile UI Design

## Goal

Improve the phone experience without changing the existing desktop three-column workflow.

## Approved Direction

- Keep `Workspace` as the primary mobile view.
- Turn `TagLibrary` into a left slide-over drawer on small screens.
- Turn `Preview` into a right slide-over drawer on small screens.
- Preserve the current three-column layout on desktop widths.

## Layout

### Desktop

- Keep the current layout in `src/App.tsx`: left tag library, center workspace, right preview.
- Keep the status bar at the bottom.

### Mobile

- Header becomes denser and wraps cleanly.
- Add two explicit mobile actions in the header:
  - `Tags`: open the tag library drawer
  - `Preview`: open the preview drawer
- Keep the workspace visible behind the drawers so tag editing stays central.
- Hide the persistent desktop side panels on small screens.
- Make the status bar wrap instead of forcing a single horizontal row.

## Drawer Behavior

- Use full-height fixed drawers with a dimmed backdrop.
- Left drawer hosts `TagLibrary`.
- Right drawer hosts `Preview`.
- Drawers close when the backdrop is tapped or when the close button is pressed.
- Only one drawer should be open at a time.

## Header Behavior

- Keep branding, search, import, and export.
- On mobile, split the header into two rows:
  - top row: brand + drawer triggers
  - second row: search + import/export buttons
- On desktop, keep the existing single-row header feel.

## Constraints

- No routing.
- No new state library.
- No changes to core tag editing behavior.
- No desktop regression.

## Testing Focus

- Mobile view shows the workspace and drawer triggers instead of fixed side columns.
- Opening `Tags` reveals the library drawer.
- Opening `Preview` reveals the preview drawer.
- Desktop view still renders all three panels inline.
