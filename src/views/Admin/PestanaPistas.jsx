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

  const toggleDisponibilidad = (id) => {
    setPistas((prevPistas) =>
      prevPistas.map((pista) =>
        pista.id === id ? { ...pista, disponible: !pista.disponible } : pista
      )
    );
  };

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

      {/* Tabla con estilo similar a PestanaHorario */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tipo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Seña
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pistas.map((pista) => (
              <tr key={pista.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm font-medium text-blue-600 truncate">
                    {pista.nombre}
                  </p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-500">{pista.tipo}</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-500">{pista.precio} €/hora</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <p className="text-sm text-gray-500">{pista.deposito} €</p>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`ml-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                      pista.disponible
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {pista.disponible ? 'Disponible' : 'No Disponible'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => toggleDisponibilidad(pista.id)}
                      className="text-gray-400 hover:text-gray-500"
                    >
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Aquí podrías gestionar el modal para "agregar" una pista, etc. */}
    </div>
  );
};

export default PestanaPistas;