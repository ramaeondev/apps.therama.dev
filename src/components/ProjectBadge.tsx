
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface ProjectBadgeProps {
  statusName?: string;
  statusClass?: string;
  statusDescription?: string;
}

const ProjectBadge: React.FC<ProjectBadgeProps> = ({ statusName, statusClass, statusDescription }) => {
  if (!statusName) return null;
  return (
    <Badge
      className={`${statusClass || ''} absolute top-4 right-4`}
      title={statusDescription}
    >
      {statusName}
    </Badge>
  );
};

export default ProjectBadge;
