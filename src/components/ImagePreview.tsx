
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ImagePreviewProps {
  image: {
    name: string;
    preview: string;
  };
  onRemove: () => void;
  disabled?: boolean;
}

const ImagePreview = ({ image, onRemove, disabled }: ImagePreviewProps) => {
  return (
    <Card className="relative overflow-hidden group">
      <div className="aspect-square overflow-hidden bg-gray-100 flex items-center justify-center">
        <img 
          src={image.preview} 
          alt={image.name}
          className="object-cover w-full h-full"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIGZpbGw9IiNGM0YzRjMiLz48cGF0aCBkPSJNMTIgMTJDMTQuNzYxNCAxMiAxNyA5Ljc2MTQyIDE3IDdDMTcgNC4yMzg1OCAxNC43NjE0IDIgMTIgMkM5LjIzODU4IDIgNyA0LjIzODU4IDcgN0M3IDkuNzYxNDIgOS4yMzg1OCAxMiAxMiAxMloiIGZpbGw9IiNDNEM0QzQiLz48cGF0aCBkPSJNMTIgMTRDOC4xMzQwMSAxNCA1IDE1LjY1NyA1IDE5LjVWMjJIMTlWMTkuNUMxOSAxNS42NTcgMTUuODY2IDE0IDEyIDE0WiIgZmlsbD0iI0M0QzRDNCIvPjwvc3ZnPg==";
          }}
        />
      </div>
      <Button
        variant="destructive"
        size="icon"
        className="absolute top-2 right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={onRemove}
        disabled={disabled}
      >
        <X className="h-3 w-3" />
      </Button>
      <div className="p-2 text-xs text-center truncate">{image.name}</div>
    </Card>
  );
};

export default ImagePreview;
