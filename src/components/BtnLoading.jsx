import React from 'react';

const BtnLoading = () => {
  // Crear un array de 8 elementos para mapear los puntos
  const dots = Array.from({ length: 8 });
  
  return (
    <div className="relative flex justify-center items-center h-24 w-24">
      <div className="absolute flex items-center justify-center w-full h-full animate-spin">
        {dots.map((_, i) => {
          // Calculamos la opacidad y transformación para cada punto
          const opacity = 0.2 + (i * 0.1);
          const rotation = i * 45;
          
          return (
            <div 
              key={i} 
              className="absolute w-3 h-3 bg-naranja rounded-full"
              style={{ 
                opacity: opacity,
                transform: `rotate(${rotation}deg) translateY(-10px)`
              }}
            ></div>
          );
        })}
      </div>
      <div className="w-4 h-4 bg-naranja rounded-full"></div>
    </div>
  );
};

export default BtnLoading;