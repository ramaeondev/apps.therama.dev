import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Header from '@/components/Header';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

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

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDeployments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDeployments.length / itemsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-4" />
            <div className="h-10 w-72 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="rounded-md border">
            <div className="p-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="h-12 bg-gray-100 rounded mb-2 animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      </>
    );
  }

  if (filteredDeployments.length === 0) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Deployment History</h1>
          <Input
            placeholder="Search deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm mx-auto mb-8"
          />
          <div className="text-gray-500">
            No deployments found{searchTerm ? ' matching your search' : ''}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Deployment History</h1>
          <Input
            placeholder="Search deployments..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        {/* Scrollable Grid */}
        <div className="flex-1 min-h-0">
          <div className="rounded-md border h-full flex flex-col">
            <div className="overflow-auto flex-1">
              <Table>
                <TableHeader className="sticky top-0 bg-background z-10">
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
                  {currentItems.map((deployment: Deployment) => (
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

            {/* Pagination */}
            <div className="border-t p-4 bg-background">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredDeployments.length)} of {filteredDeployments.length} deployments
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter(page => {
                      const distance = Math.abs(page - currentPage);
                      return distance === 0 || distance === 1 || page === 1 || page === totalPages;
                    })
                    .map((page, index, array) => (
                      <React.Fragment key={page}>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span className="px-2">...</span>
                        )}
                        <Button
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(page)}
                        >
                          {page}
                        </Button>
                      </React.Fragment>
                    ))}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Deployments;
