import React from 'react';

const LoadingSinHF = () => {
  return (
    <div className=" flex h-[50vh] font-inter">
      <div className="flex items-center grow bg-gray-100 justify-center w-full space-x-2">
        <div className="w-4 bg-naranja rounded animate-wave"></div>
        <div className="w-4 bg-naranja rounded animate-wave delay-100"></div>
        <div className="w-4 bg-naranja rounded animate-wave delay-200"></div>
        <div className="w-4 bg-naranja rounded animate-wave delay-300"></div>
      </div>
    </div>
  );
};

export default LoadingSinHF;