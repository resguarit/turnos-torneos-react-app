import React from 'react';

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, loading, accionTitulo, accion, pronombre, entidad, accionando, nombreElemento, advertencia }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-[8px] shadow-lg w-[90%] max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Confirmar {accionTitulo}</h2>
        <p className="text-gray-600 mb-2 ">¿Estás seguro de que deseas {accion} {pronombre} {entidad}{nombreElemento !== undefined ? ':' : '?'}</p>
        {nombreElemento !== undefined && (
         <div className="font-semibold mb-2 text-center text-gray-900 bg-gray-50 px-3 py-2 rounded-[8px] border">"{nombreElemento}"</div>
         )}
        <p className=' text-red-600'>Esta acción no se puede deshacer.</p>
         {advertencia !== undefined && ( 
          <div className="mt-2 w-full bg-red-100 border-l-red-500 border-l-2 p-2 rounded-md mb-4 flex items-center">
            <p className="text-sm text-red-700">{advertencia}</p>
          </div>
         )} 
        <div className="flex mt-6 justify-end gap-3">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-3 py-2 capitalize text-white rounded ${
              loading ? 'bg-red-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
            }`}
          >
            {loading ? `${accionando}... `: `${accion}`}
          </button>
        </div>
      </div>
    </div>
  );
}