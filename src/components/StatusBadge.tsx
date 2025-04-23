
import React from 'react';

interface StatusBadgeProps {
  statusName?: string;
  statusClass?: string;
  statusDescription?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  statusName, 
  statusClass, 
  statusDescription 
}) => {
  if (!statusName || !statusClass) return null;
  
  // Remove "g-blue-500" typo in the API response for Beta status
  const fixedStatusClass = statusClass.startsWith('g-') 
    ? `b${statusClass}` 
    : statusClass;
  
  return (
    <span
      className={`text-white text-xs px-2 py-0.5 rounded-full inline-block max-w-fit font-semibold ${fixedStatusClass}`}
      title={statusDescription || statusName}
    >
      {statusName}
    </span>
  );
};

export default StatusBadge;
