import React from 'react';

export const Pestanas = ({ pestanas, pestanaActiva, alCambiarPestana }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Pestañas">
        {pestanas.map((pestana) => (
          <button
            key={pestana.id}
            onClick={() => alCambiarPestana(pestana.id)}
            className={`
              group inline-flex items-center px-1 py-4 border-b-2 font-medium text-sm
              ${pestanaActiva === pestana.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
            aria-current={pestanaActiva === pestana.id ? 'page' : undefined}
          >
            {React.cloneElement(pestana.icono, {
              className: `
                mr-2 h-5 w-5
                ${pestanaActiva === pestana.id
                  ? 'text-blue-500'
                  : 'text-gray-400 group-hover:text-gray-500'
                }
              `,
            })}
            {pestana.etiqueta}
          </button>
        ))}
      </nav>
    </div>
  );
};