
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectBadgeProps {
  statusName?: string;
  statusClass?: string;
  statusDescription?: string;
}

const ProjectBadge: React.FC<ProjectBadgeProps> = ({ statusName, statusClass, statusDescription }) => {
  if (!statusName) return null;
  
  // Apply the statusClass directly to the Badge, making sure we have it
  return (
    <Badge
      className={`absolute top-4 right-4 ${statusClass || ''}`}
      title={statusDescription}
    >
      {statusName}
    </Badge>
  );
};

export default ProjectBadge;
