# Design Direction

## Chosen direction: Portfolio Control Room

The redesign is a **reframe** of the presentation layer, not a rewrite of the product. The app keeps its existing routes, live APIs, project content, logo, purple/indigo brand cues, dialogs, tables, charts, and theme behavior.

### Concepts considered

1. **Editorial studio**
   - Leads with a large featured project and a quieter archive grid.
   - Best for understanding the creator and browsing work.
   - Downside: operational analytics could feel secondary or bolted on.
2. **Portfolio Control Room — chosen**
   - Uses one explicit global shell, with “Work” and “Operations” as clear destinations.
   - The home page is editorial and image-led; analytics pages are compact, data-dense workspaces with summary metrics above their tables/charts.
   - Best matches the product’s two real jobs without inventing content or changing routes.
3. **Analytics-first command center**
   - Leads with metrics and a persistent sidebar across every route.
   - Best for deployment monitoring.
   - Downside: overweights internal observability and hides the portfolio identity that currently defines the product.

## Composition decisions

- **Home job:** understand the creator, scan the strongest work, then inspect individual projects.
- **Home focal region:** a compact editorial hero followed by one featured project and a responsive archive grid.
- **Operational job:** scan current deployment/repository health, then filter and inspect dense records.
- **Operational focal region:** page header and KPI strip, followed by the primary AG Grid and supporting charts.
- **Navigation:** replace icon-only navigation with named links and a compact mobile menu. Keep the external `therama.dev` brand link and existing URL paths.
- **Phone order:** brand and menu first, page context second, primary content third, secondary metrics/charts after the main table or project content.
- **Signature treatment:** a small uppercase “signal” label and a vertical accent rule shared by page introductions; status and metric colors remain semantic and text-labeled.

## Type and spacing

- Preserve the existing system stack rather than introducing a new font dependency.
- Use a clear three-level hierarchy:
  - Display/page title: fluid 2.5–4rem, tight leading.
  - Content/control: 0.875–1rem, comfortable leading.
  - Metadata: 0.6875–0.75rem, uppercase or tabular where useful.
- Use a compact spacing scale based on 4/8/12/16/24/32/48px.
- Use rounded 16–24px surfaces for primary panels, with restrained shadows and borders.

## Color and interaction

- Canvas: warm light gray with a deep indigo shell; dark mode uses ink surfaces and violet-blue accents.
- Action: vivid violet/indigo.
- Status: green, amber, red, and blue paired with visible labels/icons; never color alone.
- Every interactive control retains a visible focus ring and minimum touch-friendly dimensions.
- Existing Radix dialogs retain focus management and keyboard dismissal.

## Responsive acceptance conditions

- At 390px, the global nav must be reachable through a labeled menu, with no horizontal overflow.
- The featured project must remain visually dominant before the archive list.
- Tables must remain keyboard-scrollable and preserve every existing column/action.
- Charts should follow the table on phone rather than competing with the page header.
- Long project titles and page headings must wrap without clipping.

