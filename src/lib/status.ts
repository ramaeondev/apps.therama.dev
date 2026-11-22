/**
 * Status presentation.
 *
 * The static API returns a status `name`, `description` and a Tailwind `class`
 * string (for example "bg-blue-500"). Tailwind only generates classes that
 * appear literally in the source, so classes coming from the database are
 * unreliable — and the API also contains a known "g-blue-500" typo.
 *
 * We therefore keep the API's name/description (the real content) and resolve
 * the *visual* treatment locally from the status name. Unknown names fall back
 * to a neutral tone, and the badge always renders a text label so colour is
 * never the only signal.
 */

export type StatusTone = 'success' | 'info' | 'warn' | 'action' | 'neutral';

export interface StatusPresentation {
  tone: StatusTone;
  /** Dot/border/text classes for the pill. */
  pill: string;
  /** Small solid dot used next to a label in dense tables. */
  dot: string;
  label: string;
  description?: string;
}

const TONE_CLASSES: Record<StatusTone, { pill: string; dot: string }> = {
  success: {
    pill: 'bg-success-soft text-success-soft-ink ring-1 ring-inset ring-success/25',
    dot: 'bg-success',
  },
  info: {
    pill: 'bg-info-soft text-info-soft-ink ring-1 ring-inset ring-info/25',
    dot: 'bg-info',
  },
  warn: {
    pill: 'bg-warn-soft text-warn-soft-ink ring-1 ring-inset ring-warn/30',
    dot: 'bg-warn',
  },
  action: {
    pill: 'bg-action-soft text-action-soft-ink ring-1 ring-inset ring-action/25',
    dot: 'bg-action',
  },
  neutral: {
    pill: 'bg-surface-2 text-ink-muted ring-1 ring-inset ring-line-strong',
    dot: 'bg-ink-faint',
  },
};

/** Map an API status name to a semantic tone. */
export function statusTone(statusName?: string | null): StatusTone {
  const name = (statusName ?? '').trim().toLowerCase();
  if (!name) return 'neutral';

  if (/(production|live|stable|active|deployed)/.test(name)) return 'success';
  if (/(beta|preview|staging|testing|qa)/.test(name)) return 'info';
  if (/(maintenance|paused|on hold|deprecated)/.test(name)) return 'warn';
  if (/(development|progress|wip|planning|draft)/.test(name)) return 'action';
  if (/(archived|retired|inactive|offline)/.test(name)) return 'neutral';

  return 'neutral';
}

/**
 * Resolve everything a badge needs. `statusClass` is accepted for call-site
 * compatibility with the existing API shape but is intentionally not used for
 * styling, because DB-supplied Tailwind classes are not generated at build time.
 */
export function presentStatus(
  statusName?: string | null,
  statusDescription?: string | null,
): StatusPresentation | null {
  if (!statusName) return null;
  const tone = statusTone(statusName);
  return {
    tone,
    pill: TONE_CLASSES[tone].pill,
    dot: TONE_CLASSES[tone].dot,
    label: statusName,
    description: statusDescription ?? undefined,
  };
}

/** Deployment outcome (is_success) -> class pair. */
export function outcomeTone(isSuccess: boolean | null | undefined): 'success' | 'danger' | 'neutral' {
  if (isSuccess === true) return 'success';
  if (isSuccess === false) return 'danger';
  return 'neutral';
}

/** Semantic classes for success/failure text + background pairs. */
export const outcomeClasses = {
  success: {
    pill: 'bg-success-soft text-success-soft-ink ring-1 ring-inset ring-success/25',
    dot: 'bg-success',
    border: 'border-success/30',
  },
  danger: {
    pill: 'bg-danger-soft text-danger-soft-ink ring-1 ring-inset ring-danger/25',
    dot: 'bg-danger',
    border: 'border-danger/30',
  },
  neutral: {
    pill: 'bg-surface-2 text-ink-muted ring-1 ring-inset ring-line-strong',
    dot: 'bg-ink-faint',
    border: 'border-line',
  },
} as const;

/** GitHub Actions conclusion -> short label + tone. */
export function conclusionPresentation(conclusion?: string | null) {
  const value = (conclusion ?? '').toLowerCase();
  if (value === 'success') {
    return { label: 'Success', tone: 'success' as const, ...outcomeClasses.success };
  }
  if (value === 'failure' || value === 'timed_out' || value === 'startup_failure') {
    return { label: 'Failed', tone: 'danger' as const, ...outcomeClasses.danger };
  }
  if (value === 'cancelled' || value === 'skipped' || value === 'neutral') {
    return { label: conclusion ?? 'Skipped', tone: 'neutral' as const, ...outcomeClasses.neutral };
  }
  if (value === 'in_progress' || value === 'queued' || value === 'waiting') {
    return { label: conclusion ?? 'In progress', tone: 'neutral' as const, ...outcomeClasses.neutral };
  }
  return { label: conclusion || '—', tone: 'neutral' as const, ...outcomeClasses.neutral };
}

/**
 * Vercel deployment state -> short label + tone.
 *
 * `state` is the raw Vercel `readyState` and is deliberately separate from the
 * project `status` column, which still holds the project's own status name
 * (e.g. "Production") so the legacy badges keep working.
 */
export function deploymentStatePresentation(state?: string | null) {
  const value = (state ?? '').trim().toUpperCase();

  switch (value) {
    case 'READY':
      return { label: 'Ready', tone: 'success' as const, ...outcomeClasses.success };
    case 'ERROR':
      return { label: 'Error', tone: 'danger' as const, ...outcomeClasses.danger };
    case 'BUILDING':
      return { label: 'Building', tone: 'warn' as const, pill: 'bg-warn-soft text-warn-soft-ink ring-1 ring-inset ring-warn/30', dot: 'bg-warn', border: 'border-warn/30' };
    case 'INITIALIZING':
      return { label: 'Initializing', tone: 'warn' as const, pill: 'bg-warn-soft text-warn-soft-ink ring-1 ring-inset ring-warn/30', dot: 'bg-warn', border: 'border-warn/30' };
    case 'QUEUED':
      return { label: 'Queued', tone: 'neutral' as const, ...outcomeClasses.neutral };
    case 'CANCELED':
      return { label: 'Canceled', tone: 'neutral' as const, ...outcomeClasses.neutral };
    case 'DELETED':
      return { label: 'Deleted', tone: 'neutral' as const, ...outcomeClasses.neutral };
    default:
      return { label: state || '—', tone: 'neutral' as const, ...outcomeClasses.neutral };
  }
}
