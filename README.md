# nekoPrompt

A browser-based text-to-image prompt manager. Click tags to compose prompts, adjust weights, save presets, and export in multiple formats.

## Features

- **Tag Library** — 97 built-in tags across 10 categories (quality, character, appearance, clothing, expression, scene, style, lighting, composition, negative)
- **Click-to-Compose** — Click tags to add, right-click to move between positive/negative
- **Weight Control** — Adjust tag weight (0.1–2.0) with +/− buttons
- **Format Output** — Switch between SD `(tag:weight)` and DALL·E natural language formats
- **Presets** — Save and load tag combinations
- **Import/Export** — Backup and restore your data as JSON
- **Search** — Filter tags by name or alias
- **Offline** — All data stored in localStorage, no server needed

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:5173/nekoPrompt/` in your browser.

## Build & Deploy

```bash
npm run build    # Output to dist/
npm run preview  # Preview production build
```

Pushes to `main` auto-deploy to GitHub Pages via Actions.

## Tech Stack

React 19 · TypeScript · Vite · TailwindCSS 4 · Zustand · Vitest

## License

MIT
