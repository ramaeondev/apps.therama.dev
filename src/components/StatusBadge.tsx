
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
  
  return (
    <span
      className={`text-white text-xs px-3 py-1 rounded-full inline-block max-w-fit font-semibold ${statusClass}`}
      title={statusDescription || statusName}
    >
      {statusName}
    </span>
  );
};

export default StatusBadge;
