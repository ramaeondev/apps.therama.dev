/**
 * Display formatting helpers.
 *
 * Note: `formatDuration` keeps the original `Xm Ys` output used across the
 * operational pages so numbers stay comparable with earlier screenshots.
 */

/**
 * Milliseconds -> human-readable duration that adapts its unit scale.
 *
 * The API's `total_deployment_time` values are very large (billions of
 * milliseconds), so a fixed "Xm Ys" format produced unreadable strings such as
 * "1229175m 42s". The value is unchanged — only the unit it is expressed in
 * scales up (seconds -> minutes -> hours -> days).
 */
export function formatDuration(milliseconds: number | null | undefined): string {
  if (milliseconds === null || milliseconds === undefined || Number.isNaN(milliseconds)) {
    return '—';
  }

  const totalSeconds = Math.floor(Math.abs(milliseconds) / 1000);
  const sign = milliseconds < 0 ? '-' : '';

  if (totalSeconds < 60) return `${sign}${totalSeconds}s`;

  const totalMinutes = Math.floor(totalSeconds / 60);
  if (totalMinutes < 60) {
    const seconds = totalSeconds % 60;
    return `${sign}${totalMinutes}m ${seconds}s`;
  }

  const totalHours = Math.floor(totalMinutes / 60);
  if (totalHours < 24) {
    const minutes = totalMinutes % 60;
    return `${sign}${totalHours}h ${minutes}m`;
  }

  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  return `${sign}${days}d ${hours}h`;
}

/** Compact single-unit duration for KPI tiles ("45s", "12m", "3h", "284d"). */
export function formatDurationCompact(milliseconds: number | null | undefined): string {
  if (milliseconds === null || milliseconds === undefined || Number.isNaN(milliseconds)) {
    return '—';
  }

  const totalSeconds = Math.round(Math.abs(milliseconds) / 1000);
  const sign = milliseconds < 0 ? '-' : '';

  if (totalSeconds < 60) return `${sign}${totalSeconds}s`;
  const totalMinutes = Math.round(totalSeconds / 60);
  if (totalMinutes < 60) return `${sign}${totalMinutes}m`;
  const totalHours = Math.round(totalMinutes / 60);
  if (totalHours < 24) return `${sign}${totalHours}h`;
  return `${sign}${Math.round(totalHours / 24)}d`;
}

/**
 * Milliseconds -> the best whole-number unit for chart axes, so bars are not
 * plotted in millions of minutes.
 */
export function durationAxisUnit(milliseconds: number): { divisor: number; unit: string } {
  const totalMinutes = milliseconds / 60000;
  if (totalMinutes < 60) return { divisor: 60000, unit: 'minutes' };
  const totalHours = totalMinutes / 60;
  if (totalHours < 24) return { divisor: 3_600_000, unit: 'hours' };
  return { divisor: 86_400_000, unit: 'days' };
}


/** ISO timestamp -> "Nov 21, 2026" or a fallback label. */
export function formatDate(value?: string | null, fallback = 'Not deployed yet'): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
  });
}

/** ISO timestamp -> "Nov 21, 2026, 3:24 PM" */
export function formatDateTime(value?: string | null, fallback = '—'): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;
  return date.toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/** Short relative label ("3d ago") with a date fallback for old values. */
export function formatRelative(value?: string | null, fallback = '—'): string {
  if (!value) return fallback;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return fallback;

  const diffMs = Date.now() - date.getTime();
  const minutes = Math.round(diffMs / 60000);
  if (minutes < 1) return 'just now';
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 30) return `${days}d ago`;

  return formatDate(value, fallback);
}

/** 1234 -> "1,234" */
export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  return value.toLocaleString();
}

/** 1234 -> "1.2k" for tight KPI tiles. */
export function formatCompactNumber(value: number | null | undefined): string {
  if (value === null || value === undefined || Number.isNaN(value)) return '—';
  if (Math.abs(value) < 1000) return String(value);
  return new Intl.NumberFormat(undefined, {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);
}

/** Percentage helper that never divides by zero. */
export function formatRate(part: number, total: number): string {
  if (!total) return '—';
  return `${Math.round((part / total) * 100)}%`;
}

/** Truncate long repo/workflow names for chart axes. */
export function truncateLabel(value: string, max = 18): string {
  if (!value) return '';
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
