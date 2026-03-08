# External Integrations

**Analysis Date:** 2026-03-08

## APIs & External Services

**None.** This is a fully self-contained client-side application. No external API calls are made.

## Data Storage

**Databases:**
- None. No database is used.

**Client-Side Persistence:**
- Browser `localStorage` - sole persistence mechanism
  - Key `nekoPrompt:workspace` - Zustand persisted store (selected tags, negative tags, presets)
    - Managed by: `src/stores/usePromptStore.ts` via `zustand/middleware` `persist`
  - Key `nekoPrompt:userData` - User data (custom tags, categories, settings)
    - Managed by: `src/hooks/useLocalStorage.ts` via direct `localStorage.getItem/setItem`

**File Storage:**
- None. No file uploads to remote storage.
- Local file I/O for import/export only: `src/utils/importExport.ts`
  - Export: Creates JSON blob, triggers browser download via `<a>` element
  - Import: Reads file via `FileReader` API, validates JSON structure

**Caching:**
- None beyond localStorage persistence.

## Authentication & Identity

**Auth Provider:**
- None. No authentication or user accounts. All data is local to the browser.

## Monitoring & Observability

**Error Tracking:**
- None. No error tracking service integrated.

**Logs:**
- No logging framework. No `console.log` statements observed in production code.

## CI/CD & Deployment

**Hosting:**
- GitHub Pages (static site)
- URL pattern: `https://<user>.github.io/nekoPrompt/`

**CI Pipeline:**
- GitHub Actions: `.github/workflows/deploy.yml`
- Trigger: push to `main` branch, or manual `workflow_dispatch`
- Steps: checkout -> setup Node 20 -> `npm ci` -> `npm run build` -> deploy `dist/` to GitHub Pages
- Uses: `actions/checkout@v4`, `actions/setup-node@v4`, `actions/configure-pages@v5`, `actions/upload-pages-artifact@v3`, `actions/deploy-pages@v4`
- Concurrency: group `pages`, cancels in-progress deployments

## Environment Configuration

**Required env vars:**
- None. The application requires no environment variables.

**Secrets location:**
- No application secrets. GitHub Pages deployment uses built-in `GITHUB_TOKEN` via `id-token: write` permission.

## Webhooks & Callbacks

**Incoming:**
- None.

**Outgoing:**
- None.

## Browser APIs Used

These are the browser APIs the application depends on (relevant for compatibility):

- `localStorage` - Data persistence (`src/hooks/useLocalStorage.ts`, `src/stores/usePromptStore.ts`)
- `crypto.randomUUID()` - Generating preset IDs (`src/stores/usePromptStore.ts`)
- `URL.createObjectURL` / `URL.revokeObjectURL` - File export (`src/utils/importExport.ts`)
- `FileReader` - File import (`src/utils/importExport.ts`)
- `navigator.clipboard.writeText` - Likely used for copy-to-clipboard (prompt preview)
- `document.createElement('a')` - Programmatic download trigger (`src/utils/importExport.ts`)

## Integration Summary

This is a **zero-integration** application. It runs entirely in the browser with no backend, no external APIs, no databases, and no third-party services. All data lives in `localStorage`. The only infrastructure dependency is GitHub Pages for static hosting and GitHub Actions for CI/CD deployment.

---

*Integration audit: 2026-03-08*
