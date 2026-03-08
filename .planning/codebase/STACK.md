# Technology Stack

**Analysis Date:** 2026-03-08

## Languages

**Primary:**
- TypeScript ~5.9.3 - All application code (`src/**/*.ts`, `src/**/*.tsx`)

**Secondary:**
- CSS - Tailwind imports and custom scrollbar styles (`src/index.css`)
- HTML - Single entry point (`index.html`)

## Runtime

**Environment:**
- Node.js 20 (pinned in CI: `.github/workflows/deploy.yml`)
- Browser (client-only SPA, no server runtime)

**Package Manager:**
- npm
- Lockfile: `package-lock.json` (present)

## Frameworks

**Core:**
- React ^19.2.4 - UI framework, uses `react-dom/client` createRoot API
- Zustand ^5.0.11 - State management with `persist` middleware (localStorage)
- TailwindCSS ^4.2.1 - Utility-first CSS via Vite plugin (`@tailwindcss/vite`)

**Testing:**
- Vitest ^4.0.18 - Test runner, configured in `vite.config.ts`
- Testing Library React ^16.3.2 - Component testing utilities
- Testing Library jest-dom ^6.9.1 - DOM assertion matchers
- Testing Library user-event ^14.6.1 - User interaction simulation
- jsdom ^28.1.0 - Browser environment for tests

**Build/Dev:**
- Vite ^7.3.1 - Build tool and dev server
- @vitejs/plugin-react ^5.1.4 - React Fast Refresh and JSX transform

## Key Dependencies

**Critical (runtime):**
- `react` ^19.2.4 - Core UI rendering
- `react-dom` ^19.2.4 - DOM binding for React
- `zustand` ^5.0.11 - Global state management; store at `src/stores/usePromptStore.ts` uses `persist` middleware writing to `localStorage` key `nekoPrompt:workspace`

**All devDependencies (no other runtime deps):**
- The application has exactly 3 production dependencies. Everything else is devDependencies.

## Configuration

**TypeScript:**
- `tsconfig.json` - Project references config (splits app/node)
- `tsconfig.app.json` - App code: target ES2020, strict mode enabled, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `noUncheckedSideEffectImports`
- `tsconfig.node.json` - Build tooling config: target ES2022

**Vite (`vite.config.ts`):**
- Base path: `/nekoPrompt/` (for GitHub Pages subdirectory deployment)
- Dev/preview server bound to `127.0.0.1`
- Plugins: `react()`, `tailwindcss()`
- Test config inline: jsdom environment, global test APIs, setup file at `src/test/setup.ts`

**TailwindCSS:**
- v4 with Vite plugin integration (no `tailwind.config.js` - uses CSS-first config)
- Imported via `@import "tailwindcss"` in `src/index.css`
- Custom scrollbar utility class `.scrollbar-thin` defined in `src/index.css`

**Environment:**
- No `.env` files present
- No environment variables required - pure client-side app
- No path aliases configured (uses relative imports throughout)

**Linting/Formatting:**
- No ESLint, Prettier, Biome, or EditorConfig detected
- TypeScript strict mode serves as the primary code quality gate

## Build & Output

**Build command:** `tsc -b && vite build`
- TypeScript type-checking via `tsc -b` (project references build)
- Vite production bundle output to `dist/`

**Scripts (from `package.json`):**
```bash
npm run dev          # Start Vite dev server
npm run build        # Type-check + production build
npm run preview      # Preview production build locally
npm test             # Run all tests once (vitest run)
npm run test:watch   # Run tests in watch mode (vitest)
```

## Platform Requirements

**Development:**
- Node.js 20+
- npm (with lockfile)
- No OS-specific dependencies

**Production:**
- Static file hosting only (SPA)
- Currently deployed to GitHub Pages at `/nekoPrompt/` subpath
- No server, no SSR, no API backend

---

*Stack analysis: 2026-03-08*
