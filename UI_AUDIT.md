# UI Audit

## Scope and baseline

- **Date:** 2026-11-17
- **Requested scope:** Complete frontend UI renovation, preserving all backend integrations, routes, data models, and user workflows.
- **Phase:** Phase 1 only. This document records the current system; design and implementation changes are intentionally not included.
- **Framework:** React 19 + TypeScript + Vite 7.
- **Styling:** Tailwind CSS 4, CSS variables, shadcn/ui and Radix primitives.
- **Data/query layer:** TanStack React Query plus local React state.
- **Baseline validation:** `npm run build` succeeds. `npm run lint` succeeds with 9 existing warnings and no errors. The documented Bun commands could not run because Bun is unavailable in the environment.
- **Worktree note:** The only pre-existing untracked path observed before this audit was `.agents/`; it was not modified.

## Product summary

`apps.therama.dev` is a public portfolio and deployment-observability application for showcasing projects and exposing deployment/repository metrics. It has two related product surfaces:

1. A portfolio surface with project cards, live status, social links, screenshots, README dialogs, and per-project deployment history.
2. An operational surface with AG Grid tables and Recharts visualizations for repository statistics and workflow deployment logs.

The strongest existing foundation is the breadth of reusable primitives and data-aware interactions already present: shared header, project card, status badges, dialogs, loading skeletons, tables, theme support, AG Grid, and chart components. The main UI weakness is inconsistent product hierarchy: the portfolio and operational views use different shells and visual systems, while route labels and page implementations are partially duplicated or dormant.

## Application structure

### Entry and shell

- `src/main.tsx` imports AG Grid light/dark theme CSS and global CSS, then mounts `App`.
- `src/App.tsx` composes `ThemeProvider`, `QueryClientProvider`, `TooltipProvider`, both toast systems, `BrowserRouter`, and the route tree.
- `src/components/Header.tsx` is the only shared navigation shell. It provides:
  - External `therama.dev` brand link and logo.
  - Home, Projects, and Deployment History icon-only links.
  - Light/dark toggle.
  - Active route highlighting based on `location.pathname`.
- `src/App.css` is legacy Vite starter CSS and is not imported by the current entry point.
- `src/styles/globals.css` contains only scrollbar styling for `.overflow-auto`.
- `src/index.css` defines the Tailwind entry point, light/dark semantic tokens, and legacy purple utility classes.

### Shared feature components

- `src/components/ProjectCard.tsx`: responsive project image selection, project metadata, status, technologies, deployment date, external links, README dialog trigger, and deployment-history dialog trigger.
- `src/components/DeploymentHistoryDialog.tsx`: per-project deployment-history fetch, status lookup, loading/empty states, deployment metadata, and external deployment links.
- `src/components/ReadmeDialog.tsx`: fetches and displays README text from public storage.
- `src/components/StatusBadge.tsx`: renders API-provided status classes and handles a known `g-` class typo.
- `src/components/ProjectBadge.tsx`: alternate status badge implementation; currently appears unused by active routes.
- `src/components/ui/*`: shadcn/Radix primitives. Important used primitives include Button, Card, Dialog, Input, Select, Skeleton, Table, Toast/Toaster, Tooltip, and related composition helpers.
- `src/hooks/use-mobile.tsx`: viewport/mobile detection used by project cards.
- `src/hooks/use-theme.tsx`: local-storage-backed `light`, `dark`, or `system` theme state.
- `src/hooks/useAssetUrl.ts`: memoized public storage URL resolution.
- `src/lib/utils.ts`: shared class-name utility.

## Route inventory

The router in `src/App.tsx` is the source of truth for reachable paths.

| Route | Current component | Reachability | Current responsibility | Data/integrations |
|---|---|---|---|---|
| `/` | `Projects` | Active | Portfolio landing page with hero, social links, project card grid, and footer | Supabase static `projects`, `project_statuses`, and `social_links` |
| `/projects` | `ProjectsAgGrid` | Active | Repository statistics table plus two charts | `https://api.therama.dev/functions/v1/github-get-all-logs` with `group_by_repository: true`, `is_logs_required: false` |
| `/deployments` | `DeploymentsAgGrid` | Active | Workflow deployment logs table plus two charts | Same edge function with `group_by_repository: true`, `is_logs_required: true` |
| `/raw-logs` | `RawLogs` | Dormant/commented route | Searchable, sortable, paginated raw workflow-log table | Same edge function with logs enabled |
| `/repo-stats` | `Repos` | Dormant/commented route | Searchable and sortable repository statistics table | Same edge function with logs disabled |
| `*` | `NotFound` | Active fallback | 404 message and home link | None |

### Route and naming observations

- `Index.tsx` exists but is not mounted; `/` renders `Projects`, not `Index`.
- `Projects.tsx` is the portfolio card surface, while `ProjectsAgGrid.tsx` is repository statistics. The `/projects` label therefore does not match the current page content.
- `Deployments.tsx`, `RawLogs.tsx`, and `Repos.tsx` are alternate table implementations that are not reachable from the active navigation.
- There are two implementations for several operational concepts (table-based and AG Grid-based), creating future maintenance and styling drift.
- No dynamic routes were found. Project detail is represented by dialogs rather than URL state.

## Page and interaction audit

### Portfolio (`/`)

**Current behavior**

- Loads projects, statuses, and social links in parallel on mount.
- Sorts projects by `order`.
- Shows a loading-only full-page state and a toast on aggregate fetch failure.
- Renders a hero section titled “Digital Innovation Lab”.
- Renders social links from API data, with platform-specific Lucide icons.
- Renders responsive project cards.
- Project cards switch between web/mobile image paths using the mobile hook.
- Project actions:
  - Open public GitHub repository, or show disabled private-repository control with tooltip.
  - Open preview URL.
  - Open live README dialog.
  - Open per-project deployment history dialog.
- Footer repeats social links and displays developer/license text.

**States to preserve**

- Loading.
- Failed aggregate fetch with toast.
- Empty project collection (currently no dedicated empty state).
- Missing image, version, technology, status, README URL, preview URL, or GitHub URL.
- README loading, unavailable URL, fetch failure, and empty content.
- Deployment history loading, empty, and populated states.
- Light/dark theme.
- Mobile image behavior and responsive card layout.

### Repository statistics (`/projects`)

**Current behavior**

- Fetches grouped repository metrics with TanStack Query.
- Shows a plain loading string and a plain error string before the shared header is rendered.
- Uses AG Grid with sortable/filterable columns, pagination, and external repository links.
- Shows bar charts for workflow/deployment counts and total deployment time.
- Formats durations as minutes and seconds.
- Selects AG Grid light/dark theme from the app theme.

**States to preserve**

- Loading and API error states.
- Empty repository data.
- Sort, filter, pagination, external links, chart tooltips, and dark mode.
- Wide-table horizontal usability on small screens.

### Workflow deployment logs (`/deployments`)

**Current behavior**

- Fetches grouped repositories and nested workflow logs.
- Flattens all workflow logs for AG Grid.
- Shows sortable/filterable/paginated columns for repository, workflow, status, conclusion, timestamps, duration, actor, branch, commit message, and workflow URL.
- Shows bar charts for deployment status and total deployment time.
- Formats durations as minutes and seconds.

**States to preserve**

- Loading and API error states.
- Empty logs.
- Table sort/filter/pagination and external workflow links.
- Chart tooltips/legends and dark mode.
- Wide-table horizontal usability on small screens.

### Dormant operational pages

- `RawLogs.tsx` has a more compact table implementation with search, page-size selection, pagination, sortable columns, success/failure indicators, and “View Run” links.
- `Repos.tsx` has a table implementation with search, sortable columns, skeleton loading, repository links, and metric formatting.
- `Deployments.tsx` has a deployment-history table with search, client-side sorting, pagination, skeleton loading, success/failure badges, and commit metadata.
- These pages should be treated as preserved product behavior if routes are re-enabled, not discarded as dead code without an explicit product decision.

## API and data contracts

### Supabase static API

Implemented in `src/services/staticApi.ts`.

- Base URL: `VITE_SUPABASE_URL`, defaulting to `https://api-v3.therama.dev`.
- Public publishable key: `VITE_SUPABASE_PUBLISHABLE_KEY`, with a repository fallback.
- Every request uses the REST endpoint with `Accept-Profile: static`.
- `getProjects()` reads `projects` with nested `project_statuses`, ordered by `sort_order`.
- `getProjectStatuses()` reads `project_statuses`.
- `getSocialLinks()` reads active `social_links`, ordered by `sort_order`.
- `assetUrl()` maps relative upload paths to the public `uploads` storage bucket.
- Errors are logged and rethrown by the service functions; the portfolio page converts aggregate failures to a toast.

### `api.therama.dev` edge functions

Used directly by pages and dialogs:

- `POST /functions/v1/github-get-all-logs`
  - `{ group_by_repository: true, is_logs_required: false }` for repository metrics.
  - `{ group_by_repository: true, is_logs_required: true }` for workflow logs.
- `GET /functions/v1/get-deployment-history`
  - Optional `?project_id=<id>` in `DeploymentHistoryDialog`.
- `GET /functions/v1/get-project-statuses`
  - Used alongside per-project deployment history.

The redesign must preserve endpoint URLs, HTTP methods, request bodies, response field names, and external-link behavior.

### Static/local assets

- `src/assets/projects.json` currently supplies only profile identity (`name`, `title`, `website`).
- `public/logo.png` is used by the shared header.
- `public/apps-therama-dev-large.png` and `public/apps-therama-dev-mobile.png` provide local public imagery/preview assets.
- Supabase storage provides project-specific images and README content at runtime.

## Authentication and authorization

- No login, session, token refresh, route guard, role check, or authorization flow exists in the frontend.
- The application is intentionally public/read-only.
- The Supabase publishable key and public storage URLs are client-visible by design; do not introduce a private credential or server-side auth assumption during UI work.
- External GitHub, preview, deployment, and social links open in new tabs with `noopener noreferrer` where implemented.

## State management and forms

- Global providers: React Query client, theme context, tooltip context, and two toast systems.
- Server state:
  - TanStack Query in operational pages and dormant table pages.
  - Manual `useEffect` + `useState` fetch orchestration in the portfolio page and dialogs.
- Local UI state:
  - Theme selection in local storage.
  - Search, sort column/direction, pagination, page size, dialog open state.
- No form library is currently used in application features despite `react-hook-form` and Zod being installed.
- No mutation flows are present. All observed API interactions are read-only.

## UI system and responsive/accessibility baseline

- shadcn/ui configuration uses CSS variables and the `slate` base color.
- Theme tokens support light and dark modes, but active pages also use many hard-coded gray, purple, blue, green, and red Tailwind classes.
- The shared header is icon-only navigation with `aria-label`s, but has no visible text navigation on desktop and no compact mobile navigation state.
- Project cards use buttons and external links, but some actions are hidden to text on smaller breakpoints, and disabled private actions rely on a tooltip for explanation.
- Tables are intentionally scrollable in several pages; the redesign must retain access to all columns and provide clear scroll affordance at phone widths.
- Dialogs use Radix primitives and should retain focus management, escape behavior, and accessible titles/descriptions.
- Existing status presentation relies on color classes from API data; preserve text labels and do not make color the only status signal.
- There is no automated test suite configured in `package.json`, and no explicit accessibility test script.

## Build and quality findings

### Verified

- `npm run build`: passed.
- `npm run lint`: passed with 9 warnings, no errors.

### Existing warnings (not introduced by this audit)

- Missing `useEffect` dependency warning in `ReadmeDialog.tsx`.
- Fast Refresh export warnings in several shadcn/ui files and `use-theme.tsx`.
- Vite reports a production bundle larger than 500 kB after minification.
- Browserslist data is stale by approximately 10 months.

These are baseline findings, not redesign requirements. They should only be addressed if directly coupled to a UI change.

## Functional preservation checklist

The implementation phase must verify:

- [ ] `/` still loads and displays live projects, statuses, social links, images, versions, technologies, and deployment dates.
- [ ] Project GitHub/preview links preserve target URLs and new-tab behavior.
- [ ] README dialog fetches and displays live public README content, including loading and failure states.
- [ ] Deployment history dialog preserves project ID requests, status lookup, deployment metadata, and external deployment links.
- [ ] `/projects` preserves repository metrics endpoint, AG Grid sorting/filtering/pagination, repository links, charts, and duration formatting.
- [ ] `/deployments` preserves workflow log flattening, endpoint payload, AG Grid controls, workflow links, charts, and duration formatting.
- [ ] Existing dormant route implementations are either intentionally retained or explicitly re-enabled with their behavior preserved.
- [ ] Theme toggle and persisted theme behavior remain functional.
- [ ] Light/dark states, keyboard navigation, dialog focus management, and responsive table/card layouts are verified.
- [ ] Wildcard routes still render a usable 404 with a working home link.

## Recommended redesign focus for Phase 2

1. **Unify the application shell:** establish one navigation model that clearly separates portfolio browsing from operational analytics, while retaining the current route URLs and external brand link.
2. **Restore hierarchy by page job:** make the portfolio landing page image/content-led, and make operational pages data-dense with clear page headers, filters, metrics, and chart/table relationships instead of treating all content as equal cards.
3. **Create shared responsive states:** standardize loading, error, empty, status, table, and dialog treatments across active and potentially re-enabled routes, with explicit phone layouts and visible accessible labels.

