
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Deployment {
  id: string;
  project_id: string;
  version: string;
  status: string; // This is the project status string from deployments
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
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title} - Deployment History</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          {loading ? (
            <p className="text-center text-gray-500">Loading deployments…</p>
          ) : deployments.length === 0 ? (
            <p className="text-center text-gray-500">No deployment history available</p>
          ) : (
            deployments.map((deployment) => {
              // Find project status by name
              const projectStatusObj = findStatusByName(deployment.status, statuses);
              
              // Deployment success/failure rendering
              const deploymentStatusColor = deployment.is_success ? 'text-green-600' : 'text-red-600';
              const deploymentStatusBg = deployment.is_success ? 'bg-green-100' : 'bg-red-100';

              return (
                <div
                  key={deployment.id}
                  className={`p-4 border rounded-md mb-2 ${deployment.is_success
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                    }`}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Version {deployment.version}</span>
                    <span className="text-sm text-gray-500">{new Date(deployment.deployment_time).toLocaleString()}</span>
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
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${projectStatusObj.class}`}
                              title={projectStatusObj.description}>
                          {projectStatusObj.name}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full font-semibold text-xs bg-gray-100 text-gray-600">
                          {deployment.status}
                        </span>
                      )}
                    </div>
                    {/* Deployment status - from is_success field */}
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">Deployment Status:</span>
                      <span className={`px-2 py-0.5 rounded-full font-semibold text-xs ${deploymentStatusBg} ${deploymentStatusColor}`}>
                        {deployment.is_success ? 'Success' : 'Failed'}
                      </span>
                    </div>
                    <p className="mt-2">
                      <span className="font-medium">Deployed URL:</span>{' '}
                      <a href={deployment.deployment_url} target="_blank" rel="noopener noreferrer" className="underline">{deployment.deployment_url}</a>
                    </p>
                    <p><span className="font-medium">Duration:</span> {deployment.duration_in_seconds}s</p>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentHistoryDialog;
