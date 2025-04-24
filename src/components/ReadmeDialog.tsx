
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useS3Url } from '@/hooks/useS3Url';

interface ReadmeDialogProps {
  title: string;
  readmeUrl: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ReadmeDialog: React.FC<ReadmeDialogProps> = ({ title, readmeUrl, open, onOpenChange }) => {
  const [readme, setReadme] = useState<string>('Loading README...');
  const s3Url = useS3Url(readmeUrl);

  useEffect(() => {
    if (open && s3Url) {
      fetchReadme();
    } else if (open && !s3Url) {
      setReadme('Loading README...');
    }
  }, [open, s3Url]);

  const fetchReadme = async () => {
    if (!s3Url) {
      setReadme('Failed to load README. Please try again later.');
      return;
    }

    try {
      const response = await fetch(s3Url);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const text = await response.text();
      setReadme(text || 'No README content available.');
    } catch (error) {
      console.error('Error fetching README:', error);
      setReadme('Failed to load README. Please try again later.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto dark:bg-gray-800 dark:text-gray-100">
        <DialogHeader>
          <DialogTitle className="dark:text-gray-100">{title} - README</DialogTitle>
          <DialogDescription className="dark:text-gray-300">
            This content is fetched live from the project's repository.
          </DialogDescription>
        </DialogHeader>
        <div className="readme-content whitespace-pre-wrap font-mono text-sm dark:text-gray-200">
          {readme}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReadmeDialog;
