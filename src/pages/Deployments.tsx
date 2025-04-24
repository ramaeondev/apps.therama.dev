
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';

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

const Deployments = () => {
  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: async () => {
      const response = await fetch('https://api.therama.dev/functions/v1/get-deployment-history');
      return response.json();
    },
  });

  if (isLoading) {
    return <div className="p-8 text-center">Loading deployments...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Version</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Deployment Time</TableHead>
              <TableHead>Actor</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Success</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {deployments.map((deployment: Deployment) => (
              <TableRow key={deployment.id}>
                <TableCell>{deployment.version}</TableCell>
                <TableCell>{deployment.status}</TableCell>
                <TableCell>{format(new Date(deployment.deployment_time), 'MMM dd, yyyy HH:mm')}</TableCell>
                <TableCell>{deployment.actor}</TableCell>
                <TableCell>{deployment.source}</TableCell>
                <TableCell>{deployment.duration_in_seconds}s</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    deployment.is_success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {deployment.is_success ? 'Success' : 'Failed'}
                  </span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Deployments;
