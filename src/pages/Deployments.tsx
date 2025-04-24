
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Header from '@/components/Header';
import { useState } from 'react';
import { Input } from '@/components/ui/input';

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
  project_name:string;
}

const Deployments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof Deployment>('deployment_time');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data: deployments = [], isLoading } = useQuery({
    queryKey: ['deployments'],
    queryFn: async () => {
      const response = await fetch('https://api.therama.dev/functions/v1/get-deployment-history');
      return response.json();
    },
  });

  const handleSort = (column: keyof Deployment) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredDeployments = deployments
    .filter((deployment: Deployment) => {
      const searchFields = [
        deployment.version,
        deployment.status,
        deployment.actor,
        deployment.source,
        deployment.commit_message
      ].map(field => field?.toLowerCase() || '');
      
      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    })
    .sort((a: Deployment, b: Deployment) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue 
          : bValue - aValue;
      }
      
      return 0;
    });

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="p-8 text-center">Loading deployments...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Deployment History</h1>
          <Input
            placeholder="Search deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <div className="rounded-md border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="cursor-pointer" onClick={() => handleSort('project_name')}>
                  Project Name {sortColumn === 'project_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('version')}>
                  Version {sortColumn === 'version' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('deployment_time')}>
                  Deployment Time {sortColumn === 'deployment_time' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('actor')}>
                  Actor {sortColumn === 'actor' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('source')}>
                  Source {sortColumn === 'source' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('duration_in_seconds')}>
                  Duration {sortColumn === 'duration_in_seconds' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('is_success')}>
                  Success {sortColumn === 'is_success' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead>Commit Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeployments.map((deployment: Deployment) => (
                <TableRow key={deployment.id}>
                  <TableCell>{deployment.project_name}</TableCell>
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
                  <TableCell className="max-w-xs truncate" title={deployment.commit_message}>
                    {deployment.commit_message}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Deployments;
