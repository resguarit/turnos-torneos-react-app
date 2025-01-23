import React from 'react';
import { Header } from '@/components/Header';

const Loading = () => {
  return (
    <div className="min-h-screen flex flex-col font-inter">
        <Header />
      <div className="flex items-center min-h-screen bg-gray-100 justify-center w-full space-x-2">
        <div className="w-4 bg-naranja rounded animate-wave"></div>
        <div className="w-4 bg-naranja rounded animate-wave delay-100"></div>
        <div className="w-4 bg-naranja rounded animate-wave delay-200"></div>
        <div className="w-4 bg-naranja rounded animate-wave delay-300"></div>
      </div>
    </div>
  );
};

export default Loading;
