
import React from 'react';
import { ExternalLink, Github, EyeOff, Clock } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import ProjectBadge from './ProjectBadge';
import ReadmeDialog from './ReadmeDialog';
import DeploymentHistoryDialog from './DeploymentHistoryDialog';
import { useIsMobile } from '@/hooks/use-mobile';

interface Deployment {
  id: number;
  date: string;
  version: string;
  environment: string;
  status: string;
  commitId: string;
  changes: string;
}

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  githubUrl: string;
  previewUrl: string;
  images: {
    web: string;
    mobile: string;
  };
  isPublic: boolean;
  readmeUrl: string;
  version: string;
  status: 'ready' | 'beta' | 'archived' | 'poc' | 'in development';
  deployments: Deployment[];
}

const ProjectCard: React.FC<Project> = ({
  title,
  description,
  technologies,
  githubUrl,
  previewUrl,
  images,
  isPublic,
  readmeUrl,
  version,
  status,
  deployments
}) => {
  const isMobile = useIsMobile();
  const imageUrl = isMobile ? images.mobile : images.web;

  return (
    <Card className="flex flex-col h-full relative">
      <ProjectBadge status={status} />
      
      <CardHeader>
        <div className="aspect-video w-full overflow-hidden rounded-lg mb-4">
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-dark-purple">{title}</h3>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-500">v{version}</span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-grow">
        <p className="text-gray-600 mb-4">{description}</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {technologies.map((tech) => (
            <span
              key={tech}
              className="bg-soft-purple text-vivid-purple px-2 py-1 rounded-full text-sm"
            >
              {tech}
            </span>
          ))}
        </div>

        <div className="flex gap-2 mt-4">
          <ReadmeDialog title={title} readmeUrl={readmeUrl} />
          <DeploymentHistoryDialog title={title} deployments={deployments} />
        </div>
      </CardContent>
      
      <CardFooter className="flex gap-4">
        {isPublic ? (
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => window.open(githubUrl, '_blank')}
          >
            <Github className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        ) : (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  className="flex-1 opacity-60"
                  disabled
                >
                  <EyeOff className="w-4 h-4 mr-2" />
                  Private
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>This is a private repository</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <Button
          variant="default"
          className="flex-1"
          onClick={() => window.open(previewUrl, '_blank')}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Preview
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;
