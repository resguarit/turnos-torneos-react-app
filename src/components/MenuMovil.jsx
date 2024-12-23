import React, { useState } from "react";
import { Link } from "react-router-dom";

const MenuMovil = ({ setMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
    setMenuOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Botón Hamburger */}
      <button 
        onClick={toggleMenu} 
        className="md:hidden z-30 absolute right-5"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth={1.5} 
          stroke="white" 
          className="h-6 w-6"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" 
          />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-naranja z-50 flex flex-col"
        >
          {/* Botón Cerrar */}
          <div className="flex justify-end p-6">
            <button 
              onClick={toggleMenu} 
              className="text-green"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24" 
                strokeWidth={1.5} 
                stroke="currentColor" 
                className="h-6 w-6"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  d="M6 18 18 6M6 6l12 12" 
                />
              </svg>
            </button>
          </div>

          {/* Enlaces de Navegación */}
          <div className="flex flex-col items-start px-8 py-8 space-y-6 text-green font-raleway">
            {[
              { label: "Torneos", path: "/torneos-admi" },
              { label: "Reservas", path: "/calendario-admi" },
              { label: "Partidos", path: "/partidos" },
              { label: "Reglamento", path: "/reglamento" },
              { label: "Premios", path: "/premios" },
            ].map((item) => (
              <div 
                key={item.path} 
                className="flex w-full items-center justify-between border-b border-green pb-4"
                onClick={closeMenu} // Cierra el menú al hacer clic
              >
                <Link
                  to={item.path}
                  className="text-lg font-medium text-left flex-grow hover:text-verde-oscuro transition-colors"
                >
                  {item.label}
                </Link>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  fill="none" 
                  viewBox="0 0 24 24" 
                  strokeWidth={2} 
                  stroke="currentColor" 
                  className="h-5 w-5 text-verde-oscuro"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    d="m8.25 4.5 7.5 7.5-7.5 7.5" 
                  />
                </svg>
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default MenuMovil;
