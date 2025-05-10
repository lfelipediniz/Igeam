
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/components/ui/use-toast';
import { Image as ImageIcon, Check, Scaling, Package } from 'lucide-react';
import ImagePreview from './ImagePreview';
import JSZip from 'jszip';

const ImageResizer = () => {
  const [images, setImages] = useState<Array<{path: string; name: string; preview: string; file: File}>>([]);
  const [width, setWidth] = useState<number>(800);
  const [height, setHeight] = useState<number>(600);
  const [keepAspectRatio, setKeepAspectRatio] = useState<boolean>(true);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);
  const { toast } = useToast();

  const handleSelectFiles = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*';
    
    input.onchange = async (e: Event) => {
      const fileInput = e.target as HTMLInputElement;
      if (fileInput.files && fileInput.files.length > 0) {
        const selectedFiles = Array.from(fileInput.files);
        const newImages = await Promise.all(
          selectedFiles.map(async (file) => {
            const preview = URL.createObjectURL(file);
            return {
              path: preview,
              name: file.name,
              preview,
              file
            };
          })
        );
        
        setImages([...images, ...newImages]);
        toast({
          title: "Images Selected",
          description: `${newImages.length} images have been added.`,
        });
      }
    };
    
    input.click();
  };

  const handleRemoveImage = (index: number) => {
    // Revoke the object URL to prevent memory leaks
    URL.revokeObjectURL(images[index].preview);
    setImages(images.filter((_, i) => i !== index));
  };

  const resizeImage = (file: File, targetWidth: number, targetHeight: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        let finalWidth = targetWidth;
        let finalHeight = targetHeight;
        
        if (keepAspectRatio) {
          const aspectRatio = img.width / img.height;
          finalHeight = Math.round(targetWidth / aspectRatio);
        }
        
        const canvas = document.createElement('canvas');
        canvas.width = finalWidth;
        canvas.height = finalHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Could not get canvas context'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, finalWidth, finalHeight);
        
        canvas.toBlob((blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob from canvas'));
          }
        }, file.type);
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = URL.createObjectURL(file);
    });
  };

  const handleResizeImages = async () => {
    if (images.length === 0) {
      toast({
        variant: "destructive",
        title: "No Images",
        description: "Please select at least one image to resize.",
      });
      return;
    }

    if (!width || !height) {
      toast({
        variant: "destructive",
        title: "Invalid Dimensions",
        description: "Please enter valid width and height values.",
      });
      return;
    }

    try {
      setIsResizing(true);
      setProgress(0);
      
      const zip = new JSZip();
      const results = [];
      let processedCount = 0;
      
      for (const image of images) {
        try {
          const file = image.file;
          if (!file) continue;
          
          const resizedBlob = await resizeImage(file, width, keepAspectRatio ? width : height);
          
          // Add resized image to ZIP file
          const extension = file.name.split('.').pop();
          const fileName = `resized_${file.name.replace(`.${extension}`, '')}.${extension}`;
          zip.file(fileName, resizedBlob);
          
          results.push({
            name: file.name,
            success: true
          });
        } catch (error) {
          console.error(`Error resizing ${image.name}:`, error);
          results.push({
            name: image.name,
            success: false,
            error: (error as Error).message
          });
        }
        
        processedCount++;
        const progressPercentage = Math.round((processedCount / images.length) * 100);
        setProgress(progressPercentage);
      }
      
      const successCount = results.filter(r => r.success).length;
      
      if (successCount > 0) {
        // Generate the ZIP file
        const zipBlob = await zip.generateAsync({ type: "blob" });
        
        // Create and trigger download link
        const zipUrl = URL.createObjectURL(zipBlob);
        const downloadLink = document.createElement("a");
        downloadLink.href = zipUrl;
        downloadLink.download = `resized_images_${new Date().toISOString().slice(0,10)}.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        
        // Clean up the URL object
        setTimeout(() => {
          URL.revokeObjectURL(zipUrl);
        }, 100);
      }
      
      toast({
        title: "Resize Complete",
        description: `Successfully resized ${successCount} out of ${images.length} images. Downloaded as ZIP file.`,
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "An unexpected error occurred during resizing.",
      });
      console.error("Resize error:", error);
    } finally {
      setIsResizing(false);
      setTimeout(() => {
        setProgress(0);
      }, 3000);
    }
  };

  return (
    <Card className="p-6 shadow-lg">
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-semibold text-gray-800">Select Images</h2>
          <Button 
            onClick={handleSelectFiles}
            className="bg-purple-600 hover:bg-purple-700 flex items-center"
            disabled={isResizing}
          >
            <ImageIcon className="w-4 h-4 mr-2" />
            Select Images
          </Button>
        </div>

        {images.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-700">Selected Images ({images.length})</h3>
              <Button 
                variant="outline" 
                onClick={() => {
                  // Revoke all object URLs
                  images.forEach(img => URL.revokeObjectURL(img.preview));
                  setImages([]);
                }}
                disabled={isResizing}
              >
                Clear All
              </Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image, index) => (
                <ImagePreview 
                  key={`${image.path}-${index}`}
                  image={image}
                  onRemove={() => handleRemoveImage(index)}
                  disabled={isResizing}
                />
              ))}
            </div>
          </div>
        )}

        <Separator />
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">Resize Settings</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="width">Width (px)</Label>
              <Input 
                id="width"
                type="number" 
                value={width}
                onChange={(e) => setWidth(Number(e.target.value))}
                min={1}
                max={10000}
                disabled={isResizing}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="height">Height (px)</Label>
              <Input 
                id="height"
                type="number" 
                value={height}
                onChange={(e) => setHeight(Number(e.target.value))}
                min={1}
                max={10000}
                disabled={isResizing || keepAspectRatio}
              />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="keepAspect" 
              checked={keepAspectRatio}
              onCheckedChange={(checked) => setKeepAspectRatio(!!checked)}
              disabled={isResizing}
            />
            <Label htmlFor="keepAspect" className="flex items-center">
              <Scaling className="w-4 h-4 mr-2" />
              Maintain Aspect Ratio
            </Label>
          </div>
        </div>

        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Processing...</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        <div className="pt-4">
          <Button
            className="w-full bg-purple-600 hover:bg-purple-700"
            onClick={handleResizeImages}
            disabled={images.length === 0 || isResizing}
          >
            {isResizing ? (
              <span className="flex items-center">Processing...</span>
            ) : (
              <span className="flex items-center">
                <Package className="w-4 h-4 mr-2" />
                Resize & Download as ZIP
              </span>
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ImageResizer;
