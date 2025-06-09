import React from "react";

export default function CrearGruposModal({
  isOpen,
  numGrupos,
  setNumGrupos,
  onClose,
  onCrearGrupos,
  loading
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-[8px] shadow-lg w-1/3">
        <h2 className="text-xl font-semibold mb-4">Crear Grupos</h2>
        <div className='w-full bg-blue-200 border-l-blue-500 border-l-2 p-2 rounded-md mb-4 flex items-center'>
  <p className="text-sm text-blue-700">
    Esta función permite crear grupos dentro de la zona de manera automática. Debes seleccionar la cantidad de grupos que deseas y, al confirmar, los equipos serán distribuidos aleatoriamente entre los grupos generados.
  </p>
</div>
        <label className="block mb-4">
          Cantidad de Grupos:
          <input
            type="number"
            min="1"
            value={numGrupos}
            onChange={(e) => setNumGrupos(e.target.value)}
            className="border border-gray-300 rounded-[6px] p-1 px-2 w-full"
          />
        </label>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-3 py-2 bg-gray-200 text-gray-800 rounded-[6px] hover:bg-gray-300"
            disabled={loading}
          >
            Cancelar
          </button>
          <button
            onClick={onCrearGrupos}
            className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-[6px]"
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear"}
          </button>
        </div>
      </div>
    </div>
  );
}

