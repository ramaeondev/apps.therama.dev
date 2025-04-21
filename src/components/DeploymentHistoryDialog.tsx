
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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch(`https://api.therama.dev/functions/v1/get-deployment-history?project_id=${projectId}`)
      .then(res => res.json())
      .then(data => {
        setDeployments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [open, projectId]);

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
            deployments.map((deployment) => (
              <div
                key={deployment.id}
                className={`p-4 border rounded-md ${
                  deployment.is_success
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
                  <p>
                    <span className="font-medium">Status:</span>{' '}
                    <span className={deployment.is_success ? "text-green-600" : "text-red-600"}>
                      {deployment.status}
                    </span>
                  </p>
                  <p><span className="font-medium">Deployed URL:</span> <a href={deployment.deployment_url} target="_blank" rel="noopener noreferrer" className="underline">{deployment.deployment_url}</a></p>
                  <p><span className="font-medium">Duration:</span> {deployment.duration_in_seconds}s</p>
                </div>
              </div>
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentHistoryDialog;
