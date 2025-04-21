
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { FileText } from 'lucide-react';

interface ReadmeDialogProps {
  title: string;
  readmeUrl: string;
}

const ReadmeDialog: React.FC<ReadmeDialogProps> = ({ title, readmeUrl }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [readme, setReadme] = useState<string>('Loading README...');

  const fetchReadme = async () => {
    try {
      const response = await fetch(readmeUrl);
      const text = await response.text();
      setReadme(text);
    } catch (error) {
      setReadme('Failed to load README. Please try again later.');
      console.error('Error fetching README:', error);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    fetchReadme();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{title} - README</DialogTitle>
            <DialogDescription>
              This content is fetched live from the project's repository.
            </DialogDescription>
          </DialogHeader>
          <div className="readme-content whitespace-pre-wrap font-mono text-sm">
            {readme}
          </div>
        </DialogContent>
      </Dialog>
      <button
        onClick={handleOpen}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-800 rounded-md hover:bg-gray-200 transition-colors"
      >
        <FileText className="w-4 h-4" />
        README
      </button>
    </>
  );
};

export default ReadmeDialog;
