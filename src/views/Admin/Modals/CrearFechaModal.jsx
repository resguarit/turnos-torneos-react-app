import { useState } from "react";
import api from "@/lib/axiosConfig";

export default function CrearFechaModal({ zonaId, equipos, onClose, onFechaCreada }) {
  const [nombre, setNombre] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [partidos, setPartidos] = useState([]);
  const [equipoLocal, setEquipoLocal] = useState("");
  const [equipoVisitante, setEquipoVisitante] = useState("");

  const agregarPartido = () => {
    if (equipoLocal && equipoVisitante) {
      setPartidos((prev) => [
        ...prev,
        { equipo_local_id: equipoLocal, equipo_visitante_id: equipoVisitante },
      ]);
      setEquipoLocal("");
      setEquipoVisitante("");
    }
  };

  const crearFecha = async () => {
    try {
      const response = await api.post("/fechas", {
        nombre,
        fecha_inicio: fechaInicio,
        fecha_fin: fechaFin,
        estado: "Pendiente",
        zona_id: zonaId,
      });

      const nuevaFecha = response.data.fecha;

      onFechaCreada(nuevaFecha);
      onClose();
    } catch (error) {
      console.error("Error al crear la fecha:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-1/2">
        <h2 className="text-xl font-sans font-bold mb-4">Crear Nueva Fecha</h2>
        <div className="mb-2">
          <label className="block font-semibold font-sans">Nombre</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full border border-gray-300 rounded-[6px] p-1"
          />
        </div>
        <div className="flex w-full justify-between mb-2 gap-4">
        <div className="flex-col w-full">
          <label className="block font-semibold font-sans">Fecha de Inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border border-gray-300 rounded-[6px] p-1"
          />
          </div>
          <div className="flex-col w-full">
          <label className="block font-semibold font-sans">Fecha de Fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border border-gray-300 rounded-[6px] p-1"
          />
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-[6px] hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={crearFecha}
            className="bg-green-500 text-white px-4 py-2 rounded-[6px] hover:bg-green-600"
          >
            Crear Fecha
          </button>
        </div>
      </div>
    </div>
  );
}