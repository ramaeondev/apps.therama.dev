
import React from 'react';

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
  if (!statusName || !statusClass) return null;
  
  // Extract just the background color class from the API's class string
  // The API provides classes like "bg-purple-500 hover:bg-purple-600"
  const bgClass = statusClass.split(' ')[0];
  
  return (
    <div 
      className={`absolute top-4 right-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${bgClass} text-white`}
      title={statusDescription}
    >
      {statusName}
    </div>
  );
};

export default ProjectBadge;
