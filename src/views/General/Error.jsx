import React from 'react';
import { Link } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { Button } from '../../components/ui/button';

function Error() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center bg-gray-100 px-4">
        <div className="max-w-2xl w-full text-center">
          <div className="mb-8">
            <svg
              className="mx-auto  w-40 h-40"
              viewBox="0 0 200 200"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="100" cy="100" r="96" fill="#000000" fillOpacity="0.1" />
              <path
                d="M100 20C55.8172 20 20 55.8172 20 100C20 144.183 55.8172 180 100 180C144.183 180 180 144.183 180 100C180 55.8172 144.183 20 100 20ZM100 170C61.3401 170 30 138.66 30 100C30 61.3401 61.3401 30 100 30C138.66 30 170 61.3401 170 100C170 138.66 138.66 170 100 170Z"
                fill="#000000"
              />
              <path
                d="M100 90C105.523 90 110 85.5228 110 80C110 74.4772 105.523 70 100 70C94.4772 70 90 74.4772 90 80C90 85.5228 94.4772 90 100 90Z"
                fill="#000000"
              />
              <path
                d="M100 100C94.4772 100 90 104.477 90 110V130C90 135.523 94.4772 140 100 140C105.523 140 110 135.523 110 130V110C110 104.477 105.523 100 100 100Z"
                fill="#000000"
              />
            </svg>
          </div>
          <h1 className="text-lg sm:text-xl md:text-2xl lg:text-4xl font-bold text-gray-800 mb-4">¡Oops! Página no encontrada</h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-600 mb-8">
            Parece que has pateado la pelota fuera del campo. La página que buscas no existe o ha sido movida.
          </p>
          <Button className="bg-naranja hover:bg-naranja/90 text-white font-bold py-3 px-6 rounded-full  text-sm sm:text-base md:text-lg lg:text-xl">
            <Link to="/">
              Volver al inicio
            </Link>
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default Error;
