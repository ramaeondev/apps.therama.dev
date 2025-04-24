import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Header from '@/components/Header';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ExternalLink, Calendar, GitBranch, Clock } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from "@/lib/utils";

interface RepositoryStats {
  name: string;
  url: string;
  created_at: string;
  total_workflows: number;
  successful_deployments: number;
  failed_deployments: number;
  total_deployment_time: number;
}

interface ApiResponse {
  repositories: RepositoryStats[];
}

const formatTime = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  return `${minutes}m ${remainingSeconds}s`;
};

export default function Repos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof RepositoryStats>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const { data, isLoading } = useQuery<ApiResponse>({
    queryKey: ['repository-stats'],
    queryFn: async () => {
      const response = await fetch('https://api.therama.dev/functions/v1/github-get-all-logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          group_by_repository: true,
          is_logs_required: false
        })
      });
      return response.json();
    },
  });

  const repos = data?.repositories;

  const handleSort = (column: keyof RepositoryStats) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredRepos = repos?.filter(repo =>
    repo.name.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
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
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Skeleton className="h-8 w-48 mb-4" />
            <Skeleton className="h-10 w-[300px]" />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {["Repository", "Created At", "Total Workflows", "Successful", "Failed", "Total Time"].map((header) => (
                    <TableHead key={header}>
                      <Skeleton className="h-4 w-[100px]" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {[...Array(10)].map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-3.5 w-[200px]" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-3.5 w-[100px]" />
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5"><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell className="py-1.5"><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell className="py-1.5"><Skeleton className="h-4 w-[60px]" /></TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Skeleton className="h-3.5 w-3.5 rounded-full" />
                        <Skeleton className="h-3.5 w-[80px]" />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">Repository Statistics</h1>
          <Input
            placeholder="Search repositories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex-1 rounded-md border overflow-hidden">
          <div className="overflow-auto h-full">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('name')}>
                    Repository {sortColumn === 'name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('created_at')}>
                    Created At {sortColumn === 'created_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('total_workflows')}>
                    Total Workflows {sortColumn === 'total_workflows' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('successful_deployments')}>
                    Successful {sortColumn === 'successful_deployments' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('failed_deployments')}>
                    Failed {sortColumn === 'failed_deployments' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead className="cursor-pointer" onClick={() => handleSort('total_deployment_time')}>
                    Total Time {sortColumn === 'total_deployment_time' && (sortDirection === 'asc' ? '↑' : '↓')}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRepos?.map((repo) => (
                  <TableRow key={repo.name}>
                    <TableCell className={cn(
                      "py-1.5",
                      "whitespace-nowrap"
                    )}>
                      <div className="flex items-center gap-1.5">
                        <GitBranch className="w-3.5 h-3.5" />
                        <a 
                          href={repo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm"
                        >
                          {repo.name}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span className="text-sm">{format(new Date(repo.created_at), 'MMM dd, yyyy')}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-1.5 text-sm">{repo.total_workflows}</TableCell>
                    <TableCell className="py-1.5 text-sm text-green-600">{repo.successful_deployments}</TableCell>
                    <TableCell className="py-1.5 text-sm text-red-600">{repo.failed_deployments}</TableCell>
                    <TableCell className="py-1.5">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-sm">{formatTime(repo.total_deployment_time)}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>
    </>
  );
}