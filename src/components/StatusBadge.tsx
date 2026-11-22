import React from 'react';
import { presentStatus } from '@/lib/status';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  statusName?: string;
  /**
   * Accepted for API compatibility but intentionally unused for styling:
   * Tailwind cannot generate classes that only exist in database rows, and the
   * API also contains a known "g-blue-500" typo.
   */
  statusClass?: string;
  statusDescription?: string;
  className?: string;
}

/**
 * Project status pill. The API's status name and description are the content;
 * the visual tone is resolved locally from the name so the colours always
 * render, in both themes, without relying on database-supplied CSS classes.
 */
const StatusBadge: React.FC<StatusBadgeProps> = ({
  statusName,
  statusDescription,
  className,
}) => {
  const status = presentStatus(statusName, statusDescription);
  if (!status) return null;

  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[0.7rem] font-semibold',
        status.pill,
        className,
      )}
      title={status.description || status.label}
    >
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', status.dot)} aria-hidden="true" />
      {status.label}
    </span>
  );
};

export default StatusBadge;

