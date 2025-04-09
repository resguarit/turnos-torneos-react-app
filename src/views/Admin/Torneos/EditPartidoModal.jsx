import React, { useState, useEffect } from "react";
import api from "@/lib/axiosConfig";
import { toast } from "react-toastify";

export default function EditPartidoModal({ partido, onClose, onSave }) {
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [formData, setFormData] = useState({
    fecha: partido.fecha || "", // Agregar el campo fecha
    horario_id: partido.horario?.id || "",
    cancha_id: partido.cancha?.id || "",
    estado: partido.estado || "",
  });
  const [loading, setLoading] = useState(false);
  console.log("Partido:", partido);

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        if (!formData.fecha) return; // No cargar si no hay fecha seleccionada

        const response = await api.get(`/disponibilidad/fecha`, {
          params: { fecha: formData.fecha },
        });
        const horariosDisponibles = response.data.horarios.filter((horario) => horario.disponible);
        setHorarios(horariosDisponibles);
      } catch (error) {
        console.error("Error fetching horarios:", error);
        toast.error("Error al cargar los horarios disponibles");
      }
    };

    fetchHorarios();
  }, [formData.fecha]);

  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        if (!formData.fecha || !formData.horario_id) return; // No cargar si no hay fecha u horario seleccionado

        const response = await api.get(`/disponibilidad/cancha`, {
          params: { fecha: formData.fecha, horario_id: formData.horario_id },
        });
        const canchasDisponibles = response.data.canchas.filter((cancha) => cancha.disponible);
        setCanchas(canchasDisponibles);
      } catch (error) {
        console.error("Error fetching canchas:", error);
        toast.error("Error al cargar las canchas disponibles");
      }
    };

    fetchCanchas();
  }, [formData.fecha, formData.horario_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Reset dependent fields
    if (name === "fecha") {
      setFormData((prev) => ({ ...prev, horario_id: "", cancha_id: "" }));
    } else if (name === "horario_id") {
      setFormData((prev) => ({ ...prev, cancha_id: "" }));
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await api.put(`/partidos/${partido.id}`, formData);
      if (response.status === 200) {
        toast.success("Partido actualizado correctamente");
        onSave(response.data.partido);
        onClose();
      }
    } catch (error) {
      console.error("Error updating partido:", error);
      toast.error("Error al actualizar el partido");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Partido</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Horario</label>
          <select
            name="horario_id"
            value={formData.horario_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="" disabled>
              Seleccionar horario
            </option>
            {horarios.map((horario) => (
              <option key={horario.id} value={horario.id}>
                {horario.hora_inicio} - {horario.hora_fin}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Cancha</label>
          <select
            name="cancha_id"
            value={formData.cancha_id}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="" disabled>
              Seleccionar cancha
            </option>
            {canchas.map((cancha) => (
              <option key={cancha.id} value={cancha.id}>
                {`Cancha ${cancha.nro} - ${cancha.tipo_cancha}`}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2"
          >
            <option value="" disabled>
              Seleccionar estado
            </option>
            <option value="Pendiente">Pendiente</option>
            <option value="Finalizado">Finalizado</option>
            <option value="Suspendido">Suspendido</option>
            <option value="En Curso">En Curso</option>
            <option value="Cancelado">Cancelado</option>
          </select>
        </div>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}