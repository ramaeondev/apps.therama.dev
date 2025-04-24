
import { Grid2X2, History } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';

const NavigationBar = () => {
  const location = useLocation();
  
  return (
    <div className="w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-2 flex gap-4">
        <Button
          variant={location.pathname === '/projects' ? 'default' : 'outline'}
          asChild
        >
          <Link to="/projects" className="flex items-center gap-2">
            <Grid2X2 className="h-4 w-4" />
            <span>Projects</span>
          </Link>
        </Button>
        
        <Button
          variant={location.pathname === '/deployments' ? 'default' : 'outline'}
          asChild
        >
          <Link to="/deployments" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            <span>Deployment History</span>
          </Link>
        </Button>
      </div>
    </div>
  );
};

export default NavigationBar;
