import React from 'react';

const Loading = () => {
  return (
    <div className="flex items-center h-screen bg-gray-100 justify-center w-full space-x-2">
      <div className="w-5 bg-naranja rounded animate-wave"></div>
      <div className="w-5 bg-naranja rounded animate-wave delay-100"></div>
      <div className="w-5 bg-naranja rounded animate-wave delay-200"></div>
      <div className="w-5 bg-naranja rounded animate-wave delay-300"></div>
    </div>
  );
};

export default Loading;
