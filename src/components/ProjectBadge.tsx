
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectBadgeProps {
  statusName?: string;
  statusClass?: string;
  statusDescription?: string;
}

const ProjectBadge: React.FC<ProjectBadgeProps> = ({ 
  statusName, 
  statusClass, 
  statusDescription 
}) => {
  if (!statusName) return null;
  
  // Use the statusClass directly from the API
  // This includes all necessary styling (bg color, text color, hover effects)
  return (
    <div 
      className={`absolute top-4 right-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusClass || 'bg-gray-500 text-white'}`}
      title={statusDescription || statusName}
    >
      {statusName}
    </div>
  );
};

export default ProjectBadge;
