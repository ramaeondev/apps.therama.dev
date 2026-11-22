import { AlertCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import DeploymentRow from './DeploymentRow';
import {
  fetchDeploymentHistory,
  fetchEdgeProjectStatuses,
  queryKeys,
} from '@/services/operationsApi';

interface DeploymentHistoryDialogProps {
  projectId: string;
  title: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DeploymentHistoryDialog = ({
  projectId,
  title,
  open,
  onOpenChange,
}: DeploymentHistoryDialogProps) => {
  const deploymentsQuery = useQuery({
    queryKey: queryKeys.deploymentHistory(projectId),
    queryFn: () => fetchDeploymentHistory(projectId),
    enabled: open,
    staleTime: 60_000,
  });

  const statusesQuery = useQuery({
    queryKey: queryKeys.edgeStatuses,
    queryFn: fetchEdgeProjectStatuses,
    enabled: open,
    staleTime: 5 * 60_000,
  });

  const deployments = deploymentsQuery.data ?? [];
  const isLoading = deploymentsQuery.isLoading || statusesQuery.isLoading;

  /** The edge API returns a status list keyed by id; match by name. */
  const findStatusByName = (statusName: string) =>
    (statusesQuery.data ?? []).find((status) => status.name === statusName);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader className="pr-10">
          <DialogTitle className="text-pretty">{title} — Deployment history</DialogTitle>
          <DialogDescription>
            Every recorded deployment for this project, newest first.
          </DialogDescription>
        </DialogHeader>

        <div className="-mx-1 min-h-[12rem] overflow-y-auto pr-1">
          {isLoading ? (
            <div className="space-y-3" aria-busy="true" aria-live="polite">
              <span className="sr-only">Loading deployments…</span>
              {[0, 1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-line p-4">
                  <div className="flex items-center justify-between gap-4">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="mt-3 h-3 w-full" />
                  <Skeleton className="mt-2 h-3 w-3/4" />
                </div>
              ))}
            </div>
          ) : deploymentsQuery.isError ? (
            <div role="alert" className="flex flex-col items-center gap-3 py-10 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-danger/10 text-danger">
                <AlertCircle className="h-4 w-4" aria-hidden="true" />
              </span>
              <p className="text-sm font-medium text-ink">Could not load deployments</p>
              <Button variant="outline" size="sm" onClick={() => void deploymentsQuery.refetch()}>
                Try again
              </Button>
            </div>
          ) : deployments.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-10 text-center">
              <p className="text-sm font-medium text-ink">No deployments recorded yet</p>
              <p className="text-xs text-ink-muted">
                Deployment history appears here after the first successful release.
              </p>
            </div>
          ) : (
            <ol className="space-y-3">
              {deployments.map((deployment) => (
                <DeploymentRow
                  key={deployment.id}
                  deployment={deployment}
                  statusLookup={findStatusByName}
                />
              ))}
            </ol>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeploymentHistoryDialog;
