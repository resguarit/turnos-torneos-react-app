import React from 'react';

export default function ConfirmModal({ isOpen, onClose, onConfirm, loading, accionTitulo, accion, pronombre, entidad, accionando }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-[8px] shadow-lg w-[90%] max-w-md">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Confirmar {accionTitulo}</h2>
        <p className="text-gray-600 mb-6">¿Estás seguro de que deseas {accion} {pronombre} {entidad}?</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 capitalize text-white rounded ${
              loading ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {loading ? `${accionando}... `: `${accion}`}
          </button>
        </div>
      </div>
    </div>
  );
}