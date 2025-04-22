
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Deployment {
  id: string;
  project_id: string;
  version: string;
  status: string;
  deployment_time: string;
  github_sha: string;
  github_ref: string;
  actor: string;
  commit_message: string;
  source: string;
  deployment_url: string;
  duration_in_seconds: number;
  is_success: boolean;
  created_at: string;
}

interface StatusAPI {
  id: string;
  name: string;
  description: string;
  class: string;
}

interface DeploymentHistoryDialogProps {
  projectId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeploymentHistoryDialog: React.FC<DeploymentHistoryDialogProps> = ({
  projectId,
  title,
  open,
  onOpenChange,
}) => {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [statuses, setStatuses] = useState<Record<string, StatusAPI>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    // Fetch deployments and project statuses in parallel
    Promise.all([
      fetch(`https://api.therama.dev/functions/v1/get-deployment-history?project_id=${projectId}`).then(res => res.json()),
      fetch('https://api.therama.dev/functions/v1/get-project-statuses').then(res => res.json()),
    ])
      .then(([deploymentsData, statusesData]) => {
        setDeployments(deploymentsData);
        const statusArr: StatusAPI[] = statusesData.statuses || [];
        const statusMap: Record<string, StatusAPI> = {};
        statusArr.forEach((s) => { statusMap[s.id] = s; });
        setStatuses(statusMap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, projectId]);

  const findStatusByName = (statusName: string, statuses: Record<string, StatusAPI>): StatusAPI | undefined => {
    return Object.values(statuses).find(status => status.name === statusName);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="text-gray-900 dark:text-white">{title} - Deployment History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {loading ? (
            <p className="text-center text-gray-500 dark:text-gray-400">Loading deployments…</p>
          ) : deployments.length === 0 ? (
            <p className="text-center text-gray-500 dark:text-gray-400">No deployment history available</p>
          ) : (
            deployments.map((deployment) => {
              // Find project status by name
              const projectStatusObj = findStatusByName(deployment.status, statuses);
              
              // Base colors for light/dark mode
              const successLight = 'border-green-200 bg-green-50 text-gray-900';
              const successDark = 'border-green-800 bg-green-900/30 text-white';
              const failureLight = 'border-red-200 bg-red-50 text-gray-900';
              const failureDark = 'border-red-800 bg-red-900/30 text-white';
              
              const cardClasses = deployment.is_success 
                ? `border rounded-md mb-2 p-4 ${successLight} dark:${successDark}`
                : `border rounded-md mb-2 p-4 ${failureLight} dark:${failureDark}`;

              return (
                <div key={deployment.id} className={cardClasses}>
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Version {deployment.version}</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">{new Date(deployment.deployment_time).toLocaleString()}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Actor:</span> {deployment.actor}</p>
                    <p><span className="font-medium">Source:</span> {deployment.source}</p>
                    <p><span className="font-medium">Git Ref:</span> {deployment.github_ref}</p>
                    <p><span className="font-medium">Commit SHA:</span> {deployment.github_sha}</p>
                    <p><span className="font-medium">Commit:</span> {deployment.commit_message}</p>
                    
                    {/* Project status - from the status field in deployment */}
                    <div className="flex items-center gap-2 mt-2">
                      <span className="font-medium">Project Status:</span>
                      {projectStatusObj ? (
                        <span 
                          className={`px-2 py-0.5 rounded-full font-semibold text-xs ${projectStatusObj.class.split(' ')[0]} text-white`}
                          title={projectStatusObj.description}
                        >
                          {projectStatusObj.name}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-semibold text-xs bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300">
                          {deployment.status}
                        </span>
                      )}
                    </div>
                    
                    {/* Deployment status - from is_success field */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">Deployment Status:</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${
                        deployment.is_success 
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' 
                          : 'bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-300'
                      }`}>
                        {deployment.is_success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    
                    <p className="mt-2">
                      <span className="font-medium">Deployed URL:</span>{' '}
                      <a 
                        href={deployment.deployment_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        {deployment.deployment_url}
                      </a>
                    </p>
                    <p><span className="font-medium">Duration:</span> {deployment.duration_in_seconds}s</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentHistoryDialog;
