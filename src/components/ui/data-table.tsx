import { useMemo, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, ChevronLeft, ChevronRight, ChevronsUpDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface DataTableColumn<T> {
  /** Stable identifier, also used for the sort state. */
  id: string;
  header: string;
  /** Renders the cell content for one row. */
  cell: (row: T) => ReactNode;
  /** Providing this makes the column sortable. */
  sortValue?: (row: T) => string | number | null | undefined;
  align?: 'left' | 'right';
  /** Extra classes applied to both the header and body cells (width, truncation…). */
  className?: string;
}

interface DataTableProps<T> {
  rows: T[];
  columns: DataTableColumn<T>[];
  /** Stable row key. */
  getRowId: (row: T) => string;
  /** Accessible description of the table contents. */
  caption: string;
  emptyMessage: string;
  initialSort?: { columnId: string; direction: 'asc' | 'desc' };
  pageSizeOptions?: number[];
  initialPageSize?: number;
  /** Horizontal minimum width so columns stay readable on small screens. */
  minWidthClassName?: string;
  /** Caps the scroll area so long pages stay usable; the header sticks. */
  maxHeightClassName?: string;
}

type SortState = { columnId: string; direction: 'asc' | 'desc' } | null;

/**
 * Small, dependency-free table with the behaviours the operational pages need:
 * click-to-sort headers, paging and a sticky header. Everything is plain HTML
 * plus Tailwind, so it inherits the app's design tokens in both themes.
 */
export function DataTable<T>({
  rows,
  columns,
  getRowId,
  caption,
  emptyMessage,
  initialSort,
  pageSizeOptions = [10, 20, 50, 100],
  initialPageSize = 20,
  minWidthClassName = 'min-w-[860px]',
  maxHeightClassName = 'max-h-[520px]',
}: DataTableProps<T>) {
  const [sort, setSort] = useState<SortState>(initialSort ?? null);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [pageIndex, setPageIndex] = useState(0);

  // A new filter result should start on the first page. Adjusting during render
  // (rather than in an effect) avoids an extra paint with stale rows.
  const [lastRows, setLastRows] = useState(rows);
  if (lastRows !== rows) {
    setLastRows(rows);
    setPageIndex(0);
  }

  const sortedRows = useMemo(() => {
    if (!sort) return rows;
    const column = columns.find((candidate) => candidate.id === sort.columnId);
    const getValue = column?.sortValue;
    if (!getValue) return rows;

    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const left = getValue(a);
      const right = getValue(b);
      // Empty values always sink to the bottom, whichever direction is active.
      if (left === null || left === undefined) return right === null || right === undefined ? 0 : 1;
      if (right === null || right === undefined) return -1;
      if (typeof left === 'number' && typeof right === 'number') return (left - right) * factor;
      return (
        String(left).localeCompare(String(right), undefined, {
          numeric: true,
          sensitivity: 'base',
        }) * factor
      );
    });
  }, [columns, rows, sort]);

  const total = sortedRows.length;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const start = safePageIndex * pageSize;
  const pageRows = sortedRows.slice(start, start + pageSize);

  const toggleSort = (columnId: string) => {
    setPageIndex(0);
    setSort((current) => {
      if (current?.columnId !== columnId) return { columnId, direction: 'asc' };
      return current.direction === 'asc' ? { columnId, direction: 'desc' } : null;
    });
  };

  return (
    <div>
      <div
        className={cn('relative w-full overflow-auto', maxHeightClassName)}
        tabIndex={0}
        role="region"
        aria-label={`${caption}, scrollable`}
      >
        <table className={cn('w-full border-separate border-spacing-0 text-sm', minWidthClassName)}>
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr>
              {columns.map((column) => {
                const active = sort?.columnId === column.id;
                const ariaSort = active
                  ? sort?.direction === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none';
                const alignRight = column.align === 'right';
                return (
                  <th
                    key={column.id}
                    scope="col"
                    aria-sort={column.sortValue ? ariaSort : undefined}
                    className={cn(
                      'sticky top-0 z-10 border-b border-line bg-surface-2 px-3 py-2.5 text-left align-middle',
                      'text-[0.7rem] font-semibold uppercase tracking-[0.1em] text-ink-muted',
                      alignRight && 'text-right',
                      column.className,
                    )}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        onClick={() => toggleSort(column.id)}
                        className={cn(
                          'inline-flex w-full items-center gap-1 rounded-sm uppercase tracking-[0.1em] transition-colors duration-150',
                          'hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/40',
                          alignRight && 'justify-end',
                          active ? 'text-ink' : undefined,
                        )}
                      >
                        <span>{column.header}</span>
                        {active ? (
                          sort?.direction === 'asc' ? (
                            <ArrowUp className="h-3 w-3 shrink-0" aria-hidden="true" />
                          ) : (
                            <ArrowDown className="h-3 w-3 shrink-0" aria-hidden="true" />
                          )
                        ) : (
                          <ChevronsUpDown
                            className="h-3 w-3 shrink-0 text-ink-faint/70"
                            aria-hidden="true"
                          />
                        )}
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {pageRows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-3 py-10 text-center text-xs text-ink-muted"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              pageRows.map((row) => (
                <tr
                  key={getRowId(row)}
                  className="transition-colors duration-150 hover:bg-surface-2/70"
                >
                  {columns.map((column) => (
                    <td
                      key={column.id}
                      className={cn(
                        'border-b border-line px-3 py-2.5 align-middle text-ink',
                        column.align === 'right' && 'text-right',
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-2 border-t border-line px-3 py-2.5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="tabular">
            {total === 0 ? '0 rows' : `${start + 1}–${Math.min(start + pageSize, total)} of ${total}`}
          </span>
          <label className="flex items-center gap-1.5">
            <span className="sr-only">Rows per page</span>
            <select
              value={pageSize}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPageIndex(0);
              }}
              className="h-7 rounded-md border border-line-strong bg-surface px-1.5 text-xs text-ink transition-colors duration-150 hover:border-ink-faint focus-visible:border-action focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-action/25"
            >
              {pageSizeOptions.map((option) => (
                <option key={option} value={option}>
                  {option} / page
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="tabular mr-1">
            Page {safePageIndex + 1} of {pageCount}
          </span>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPageIndex(Math.max(0, safePageIndex - 1))}
            disabled={safePageIndex === 0}
            aria-label="Previous page"
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setPageIndex(Math.min(pageCount - 1, safePageIndex + 1))}
            disabled={safePageIndex >= pageCount - 1}
            aria-label="Next page"
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default DataTable;
