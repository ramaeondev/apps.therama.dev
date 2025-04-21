
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { History } from 'lucide-react';

interface Deployment {
  id: number;
  date: string;
  version: string;
  environment: string;
  status: string;
  commitId: string;
  changes: string;
}

interface DeploymentHistoryDialogProps {
  title: string;
  deployments: Deployment[];
}

const DeploymentHistoryDialog: React.FC<DeploymentHistoryDialogProps> = ({ 
  title, 
  deployments 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title} - Deployment History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {deployments.length === 0 ? (
              <p className="text-center text-gray-500">No deployment history available</p>
            ) : (
              deployments.map((deployment) => (
                <div 
                  key={deployment.id} 
                  className={`p-4 border rounded-md ${
                    deployment.status === 'success' 
                      ? 'border-green-200 bg-green-50' 
                      : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between">
                    <span className="text-sm font-semibold">Version {deployment.version}</span>
                    <span className="text-sm text-gray-500">{deployment.date}</span>
                  </div>
                  <div className="mt-2 text-sm">
                    <p><span className="font-medium">Environment:</span> {deployment.environment}</p>
                    <p><span className="font-medium">Status:</span> {deployment.status}</p>
                    <p><span className="font-medium">Commit:</span> {deployment.commitId}</p>
                    <p><span className="font-medium">Changes:</span> {deployment.changes}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
      
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
      >
        <History className="w-4 h-4" />
        Deployments
      </button>
    </>
  );
};

export default DeploymentHistoryDialog;
