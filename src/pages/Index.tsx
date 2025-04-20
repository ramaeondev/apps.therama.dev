
import { Link } from 'react-router-dom';
import { Laptop } from 'lucide-react';

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-soft-gray">
      <div className="text-center max-w-2xl p-8">
        <h1 className="text-5xl font-bold mb-4 text-dark-purple">
          Welcome to My Portfolio
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Explore my projects and see the magic of code in action
        </p>
        <div className="flex justify-center space-x-4">
          <Link 
            to="/projects" 
            className="bg-vivid-purple text-white px-6 py-3 rounded-lg hover:bg-opacity-90 transition-colors flex items-center"
          >
            <Laptop className="mr-2" />
            View Projects
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Index;
