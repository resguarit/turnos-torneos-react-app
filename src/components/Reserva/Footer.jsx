import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-100 p-4 text-center">
      <p className="text-sm text-gray-600">© {new Date().getFullYear()} RG Turnos. Todos los derechos reservados.</p>
    </footer>
  );
};

export default Footer;