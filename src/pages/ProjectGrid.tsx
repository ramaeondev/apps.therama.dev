
import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Header from '@/components/Header';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ProjectAPI } from './Projects';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof ProjectAPI>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await fetch('https://api.therama.dev/functions/v1/get-projects');
      return response.json();
    },
  });

  const handleSort = (column: keyof ProjectAPI) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const filteredDeployments = projects
    .filter((projects: ProjectAPI) => {
      const searchFields = [
        projects.title,
        projects.readme_url,
        projects.description,
        projects.github_url,
        projects.preview_url
      ].map(field => field?.toLowerCase() || '');
      
      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    })
    .sort((a: ProjectAPI, b: ProjectAPI) => {
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
        <div className="p-8 text-center">Loading Projects...</div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-4">All Projects</h1>
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
                <TableHead className="cursor-pointer" onClick={() => handleSort('title')}>
                  Project Name {sortColumn === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('current_version')}>
                  Current Version {sortColumn === 'current_version' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('status')}>
                  Status {sortColumn === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('last_deployed_at')}>
                  Last Deployment Time {sortColumn === 'last_deployed_at' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('is_public')}>
                  PUblic Repo {sortColumn === 'is_public' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('preview_url')}>
                  Link {sortColumn === 'preview_url' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('github_url')}>
                  Repo Link {sortColumn === 'github_url' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
                <TableHead className="cursor-pointer" onClick={() => handleSort('technologies')}>
                  Technologies {sortColumn === 'technologies' && (sortDirection === 'asc' ? '↑' : '↓')}
                </TableHead>
              
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDeployments.map((deployment: ProjectAPI) => (
                <TableRow key={deployment.id}>
                  <TableCell>{deployment.title}</TableCell>
                  <TableCell>{deployment.current_version}</TableCell>
                  <TableCell>{deployment.status}</TableCell>
                  <TableCell>{format(new Date(deployment.last_deployed_at), 'MMM dd, yyyy HH:mm')}</TableCell>
                  <TableCell>{deployment.is_public}</TableCell>
                  <TableCell>{deployment.preview_url}</TableCell>
                  <TableCell>{deployment.github_url}s</TableCell>
                  <TableCell>{deployment.technologies}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Projects;
