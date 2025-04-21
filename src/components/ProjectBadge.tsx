
import React from 'react';
import { Badge } from '@/components/ui/badge';

type ProjectStatus = 'ready' | 'beta' | 'archived' | 'poc' | 'in development';

interface ProjectBadgeProps {
  status: ProjectStatus;
}

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  'ready': { 
    label: 'Ready for Production', 
    className: 'bg-green-500 hover:bg-green-600'
  },
  'beta': { 
    label: 'Beta', 
    className: 'bg-blue-500 hover:bg-blue-600'
  },
  'archived': { 
    label: 'Archived', 
    className: 'bg-gray-500 hover:bg-gray-600'
  },
  'poc': { 
    label: 'Proof of Concept', 
    className: 'bg-amber-500 hover:bg-amber-600'
  },
  'in development': { 
    label: 'In Development', 
    className: 'bg-purple-500 hover:bg-purple-600'
  }
};

const ProjectBadge: React.FC<ProjectBadgeProps> = ({ status }) => {
  const config = statusConfig[status] || statusConfig['in development'];
  
  return (
    <Badge className={`${config.className} absolute top-4 right-4`}>
      {config.label}
    </Badge>
  );
};

export default ProjectBadge;
