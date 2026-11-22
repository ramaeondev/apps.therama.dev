import { useMemo } from 'react';
import {
  colorSchemeDark,
  colorSchemeLight,
  themeQuartz,
  type Theme,
} from 'ag-grid-community';
import { useTheme } from '@/hooks/use-theme-value';

/**
 * AG Grid 36 Theming API.
 *
 * This replaces the two vendored `ag-theme-alpine*.css` stylesheets (~1,200
 * lines) that had to be imported globally and toggled by swapping a class name.
 * Colours are derived from the app's own design tokens so the grid always
 * matches the surrounding surfaces in both themes.
 */
const baseTheme = themeQuartz.withParams({
  fontFamily: 'inherit',
  fontSize: '13px',
  borderRadius: '10px',
  headerHeight: 40,
  rowHeight: 44,
  wrapperBorderRadius: '12px',
  cellHorizontalPadding: 12,
  accentColor: 'var(--action)',
  headerFontWeight: 600,
  headerTextColor: 'var(--ink-muted)',
});

const lightTheme = baseTheme
  .withPart(colorSchemeLight)
  .withParams({
    backgroundColor: 'var(--surface)',
    foregroundColor: 'var(--ink)',
    borderColor: 'var(--line)',
    headerBackgroundColor: 'var(--surface-2)',
    oddRowBackgroundColor: 'var(--surface)',
    rowHoverColor: 'color-mix(in oklab, var(--action) 7%, transparent)',
    selectedRowBackgroundColor: 'color-mix(in oklab, var(--action) 12%, transparent)',
    chromeBackgroundColor: 'var(--surface-2)',
  });

const darkTheme = baseTheme
  .withPart(colorSchemeDark)
  .withParams({
    backgroundColor: 'var(--surface)',
    foregroundColor: 'var(--ink)',
    borderColor: 'var(--line)',
    headerBackgroundColor: 'var(--surface-2)',
    oddRowBackgroundColor: 'var(--surface)',
    rowHoverColor: 'color-mix(in oklab, var(--action) 12%, transparent)',
    selectedRowBackgroundColor: 'color-mix(in oklab, var(--action) 20%, transparent)',
    chromeBackgroundColor: 'var(--surface-2)',
  });

/** Returns the AG Grid theme matching the app's resolved theme. */
export function useAgGridTheme(): Theme {
  const { resolvedTheme } = useTheme();
  return useMemo(() => (resolvedTheme === 'dark' ? darkTheme : lightTheme), [resolvedTheme]);
}

/** Shared defaults for every grid in the app. */
export const defaultColDef = {
  flex: 1,
  minWidth: 110,
  sortable: true,
  filter: true,
  resizable: true,
} as const;

/** Pagination settings shared by the repository and deployment grids. */
export const gridPagination = {
  pagination: true,
  paginationPageSize: 20,
  paginationPageSizeSelector: [10, 20, 50, 100] as number[],
};
