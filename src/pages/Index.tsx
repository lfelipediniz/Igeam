
import React from 'react';
import ImageResizer from '../components/ImageResizer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-800">Igeam</h1>
          <p className="text-gray-600">Web Image Resizer Tool</p>
          <p className="text-sm text-gray-500 mt-2">Resize multiple images at once directly in your browser</p>
        </header>
        
        <ImageResizer />
        
        <footer className="mt-12 text-center text-gray-500 text-sm">
          <p>Igeam - Process your images privately in the browser. No upload required.</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
