
import React from 'react';

interface ProjectBadgeProps {
  statusName?: string;
  statusClass?: string;
  statusDescription?: string;
}

const ProjectBadge: React.FC<ProjectBadgeProps> = ({ statusName, statusClass, statusDescription }) => {
  if (!statusName) return null;
  
  // Extract the background class from statusClass if it exists
  const backgroundClass = statusClass?.split(' ')[0] || '';
  
  return (
    <div 
      className={`absolute top-4 right-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${backgroundClass} text-white`}
      title={statusDescription}
    >
      {statusName}
    </div>
  );
};

export default ProjectBadge;
