import React from 'react';

const BtnLoading = () => {
  // Crear un array de 8 elementos para mapear los puntos
  const dots = Array.from({ length: 8 });
  
  return (
    <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
};

export default BtnLoading;