import { useQuery } from '@tanstack/react-query';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { format } from 'date-fns';
import Header from '@/components/Header';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ProjectAPI } from './Projects';
import { ExternalLink, Github } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { ProjectStatus } from '@/types/status';
import { getProjects } from '@/services/appwrite';

const Projects = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<keyof ProjectAPI>('order');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      return getProjects();
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
    .filter((project: ProjectAPI) => {
      const searchFields = [
        project.title,
        project.readme_url,
        project.description,
        project.github_url,
        project.preview_url
      ].map(field => field?.toLowerCase() || '');
      
      return searchFields.some(field => field.includes(searchTerm.toLowerCase()));
    })
    .sort((a: ProjectAPI, b: ProjectAPI) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];

      // Handle order specifically since it's a number
      if (sortColumn === 'order') {
        const orderA = typeof aValue === 'number' ? aValue : Number.MAX_SAFE_INTEGER;
        const orderB = typeof bValue === 'number' ? bValue : Number.MAX_SAFE_INTEGER;
        return sortDirection === 'asc' ? orderA - orderB : orderB - orderA;
      }
      
      // Handle string comparisons
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      // Handle number comparisons
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
            <Skeleton className="h-10 w-72" />
          </div>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {Array(8).fill(0).map((_, i) => (
                    <TableHead key={i}>
                      <Skeleton className="h-4 w-full" />
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {Array(5).fill(0).map((_, i) => (
                  <TableRow key={i}>
                    {Array(8).fill(0).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </>
    );
  }

  if (!projects.length) {
    return (
      <>
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h2 className="text-xl font-semibold mb-2">No projects found</h2>
          <p className="text-gray-600">Try adjusting your search criteria</p>
        </div>
      </>
    );
  }

  const getStatusClass = (statusClass: string) => {
    // Convert to lowercase and remove any extra spaces
    const status = statusClass.toLowerCase().trim();
    
    switch (status) {
      case 'under development':
      case 'development':
        return 'bg-purple-500 text-white';
      case 'production':
        return 'bg-green-500 text-white';
      case 'beta':
        return 'bg-blue-500 text-white';
      case 'maintenance':
        return 'bg-amber-500 text-white';
      case 'archived':
        return 'bg-gray-500 text-white';
      default:
        console.log('Unknown status:', statusClass); // For debugging
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Add this helper function for technology colors
  const getTechColor = (tech: string): string => {
    const colorMap: { [key: string]: string } = {
      react: 'bg-blue-100 text-blue-800',
      typescript: 'bg-blue-100 text-blue-800',
      vite: 'bg-purple-100 text-purple-800',
      tailwindcss: 'bg-teal-100 text-teal-800',
      nodejs: 'bg-green-100 text-green-800',
      nextjs: 'bg-gray-900 text-white',
      supabase: 'bg-emerald-100 text-emerald-800',
      'shadcn/ui': 'bg-gray-100 text-gray-800'
    };

    const key = tech.toLowerCase().replace(/[^a-z]/g, '');
    return colorMap[key] || 'bg-gray-100 text-gray-800';
  };

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
                <TableHead 
                  className="cursor-pointer relative group" 
                  onClick={() => handleSort('status_name')}
                >
                  Status {sortColumn === 'status_name' && (sortDirection === 'asc' ? '↑' : '↓')}
                  <div className="absolute hidden group-hover:block bg-white dark:bg-gray-800 p-2 rounded shadow-lg z-10 w-48 text-xs mt-1">
                    <div className="space-y-1">
                      <div className="font-semibold">Status Types:</div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-green-500"></span>
                          <span>Production</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                          <span>Beta</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                          <span>Maintenance</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                          <span>Under Development</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-gray-500"></span>
                          <span>Archived</span>
                        </div>
                      </div>
                    </div>
                  </div>
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
              {filteredDeployments.map((deployment: ProjectAPI) => {
                // Add this debug logging
                console.log('Deployment status:', {
                  name: deployment.status_name,
                  class: deployment.status_class,
                  appliedClass: getStatusClass(deployment.status_name)
                });

                return (
                  <TableRow key={deployment.id}>
                    <TableCell className="font-medium">{deployment.title}</TableCell>
                    <TableCell>{deployment.current_version || 'N/A'}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      <span 
                        className={`px-3 py-1.5 rounded-full text-sm font-medium inline-flex items-center gap-2 truncate max-w-[200px] ${
                          getStatusClass(deployment.status_name)
                        }`}
                        title={deployment.status_description}
                      >
                        <span 
                          className={`w-2 h-2 rounded-full ${
                            deployment.status_name.toLowerCase().includes('production') ? 'bg-green-200' :
                            deployment.status_name.toLowerCase().includes('beta') ? 'bg-blue-200' :
                            deployment.status_name.toLowerCase().includes('maintenance') ? 'bg-amber-200' :
                            deployment.status_name.toLowerCase().includes('development') ? 'bg-purple-200' :
                            deployment.status_name.toLowerCase().includes('archived') ? 'bg-gray-200' :
                            'bg-gray-200'
                          }`} 
                        />
                        {deployment.status_name}
                      </span>
                    </TableCell>
                    <TableCell>
                      {deployment.last_deployed_at 
                        ? format(new Date(deployment.last_deployed_at), 'MMM dd, yyyy HH:mm')
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-sm ${
                        deployment.is_public ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {deployment.is_public ? 'Public' : 'Private'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {deployment.preview_url && (
                        <a
                          href={deployment.preview_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <ExternalLink size={16} />
                          Preview
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      {deployment.github_url && (
                        <a
                          href={deployment.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:text-blue-800"
                        >
                          <Github size={16} />
                          Repository
                        </a>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[300px]">
                        {deployment.technologies.map((tech, index) => (
                          <span
                            key={index}
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getTechColor(tech)}`}
                          >
                            {tech}
                          </span>
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  );
};

export default Projects;
