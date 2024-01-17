import React from 'react';
import { FiPlus } from 'react-icons/fi'; 

function Index() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-4xl font-bold mb-4">Igeam</h1>
      <div className="rounded-full bg-blue-400 p-3">
        <FiPlus className="text-white text-2xl" />
      </div>
    </div>
  );
}

export default Index;
