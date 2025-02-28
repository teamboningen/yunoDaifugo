import React from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

const AnnouncementBar = ({ message }) => {
  return (
    <Alert className="w-full bg-gray-100 border-b border-gray-300 py-2 px-4">
      <Info className="w-5 h-5 text-gray-600" />
      <AlertDescription className="ml-2 text-sm text-gray-700">{message}</AlertDescription>
    </Alert>
  );
};

export default AnnouncementBar;