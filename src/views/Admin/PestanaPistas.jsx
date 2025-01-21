import React, { useState } from 'react';
import { Edit2, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const pistasIniciales = [
  {
    id: '1',
    nombre: 'Pista de Tenis 1',
    tipo: 'tenis',
    precio: 30,
    deposito: 50,
    disponible: true,
    descripcion: 'Pista de tenis profesional con iluminación nocturna',
  },
  {
    id: '2',
    nombre: 'Pista de Baloncesto A',
    tipo: 'baloncesto',
    precio: 25,
    deposito: 40,
    disponible: true,
    descripcion: 'Pista de baloncesto cubierta con suelo de madera',
  },
];

const PestanaPistas = () => {
  const [pistas, setPistas] = useState(pistasIniciales);
  const [agregando, setAgregando] = useState(false);

  return (
    <div className="py-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium text-gray-900">Gestión de Pistas</h2>
        <button
          onClick={() => setAgregando(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Pista
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {pistas.map((pista) => (
            <li key={pista.id}>
              <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <p className="text-sm font-medium text-blue-600 truncate">{pista.nombre}</p>
                    <span className={`ml-2 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      pista.disponible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {pista.disponible ? 'Disponible' : 'No Disponible'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <button className="text-gray-400 hover:text-gray-500">
                      {pista.disponible ? (
                        <ToggleRight className="h-5 w-5" />
                      ) : (
                        <ToggleLeft className="h-5 w-5" />
                      )}
                    </button>
                    <button className="text-gray-400 hover:text-gray-500">
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button className="text-gray-400 hover:text-red-500">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div className="mt-2 sm:flex sm:justify-between">
                  <div className="sm:flex">
                    <p className="flex items-center text-sm text-gray-500">
                      Tipo: {pista.tipo}
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Precio: {pista.precio}€/hora
                    </p>
                    <p className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0 sm:ml-6">
                      Fianza: {pista.deposito}€
                    </p>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PestanaPistas;