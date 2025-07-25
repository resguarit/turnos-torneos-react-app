import React, { useState, useEffect } from "react";
import api from "@/lib/axiosConfig";
import { toast } from "react-toastify";

export default function EditPartidoModal({ partido, onClose, onSave, equipos, deporteId }) {
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [formData, setFormData] = useState({
    fecha: partido.fecha || "",
    horario_id: partido.horario?.id || null,
    cancha_id: partido.cancha?.id || null,
    estado: partido.estado || "",
    equipo_local_id: partido.equipo_local_id || "",
    equipo_visitante_id: partido.equipo_visitante_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [canchaDisabled, setCanchaDisabled] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingCanchas, setLoadingCanchas] = useState(false);

  // Helper para obtener la cancha actual (aunque no esté disponible)
  const canchaActual =
    partido.cancha && partido.cancha.id
      ? {
          id: partido.cancha.id,
          nro: partido.cancha.nro,
          tipo: partido.cancha.tipo_cancha,
        }
      : null;

  useEffect(() => {
    const fetchHorarios = async () => {
      try {
        setLoadingHorarios(true);
        if (!formData.fecha) return;
        const response = await api.get(`/disponibilidad/fecha`, {
          params: { fecha: formData.fecha, deporte_id: deporteId },
        });
        const horariosDisponibles = response.data.horarios.filter((horario) => horario.disponible);
        setHorarios(horariosDisponibles);
      } catch (error) {
        console.error("Error fetching horarios:", error);
        toast.error("Error al cargar los horarios disponibles");
      } finally {
        setLoadingHorarios(false);
      }
    };

    fetchHorarios();
  }, [formData.fecha]);

  useEffect(() => {
    const fetchCanchas = async () => {
      try {
        setLoadingCanchas(true);
        if (!formData.fecha || !formData.horario_id) return;
        const response = await api.get(`/disponibilidad/cancha`, {
          params: { fecha: formData.fecha, horario_id: formData.horario_id, deporte_id: deporteId },
        });
        const canchasDisponibles = response.data.canchas.filter((cancha) => cancha.disponible);
        setCanchas(canchasDisponibles);
        setCanchaDisabled(false);
      } catch (error) {
        console.error("Error fetching canchas:", error);
        toast.error("Error al cargar las canchas disponibles");
      } finally {
        setLoadingCanchas(false);
      }
    };

    if (formData.horario_id) {
      fetchCanchas();
    }
  }, [formData.fecha, formData.horario_id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    if (name === "fecha") {
      setFormData((prev) => ({
        ...prev,
        horario_id: null,
        cancha_id: null,
      }));
      setCanchaDisabled(true);
    } else if (name === "horario_id") {
      setFormData((prev) => ({
        ...prev,
        cancha_id: null,
      }));
      setCanchaDisabled(true);
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
      <div className="bg-white p-6 rounded-[8px] shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Editar Partido</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Fecha</label>
          <input
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-[6px] p-1"
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Horario</label>
          {loadingHorarios ? (
            <div className="w-full border border-gray-300 rounded-[6px] p-2 bg-gray-50 text-gray-500">
              Cargando horarios...
            </div>
          ) : (
            <select
              name="horario_id"
              value={formData.horario_id || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-[6px] p-2"
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
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Cancha</label>
          {loadingCanchas ? (
            <div className="w-full border border-gray-300 rounded-[6px] p-2 bg-gray-50 text-gray-500">
              Cargando canchas...
            </div>
          ) : (
            <select
              name="cancha_id"
              value={formData.cancha_id || ""}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-[6px] p-2"
              disabled={canchaDisabled}
            >
              <option value="" disabled>
                Seleccionar cancha
              </option>
              {/* Mostrar primero la cancha actual si existe y no está en la lista de disponibles */}
              {canchaActual &&
                !canchas.some((c) => c.id === canchaActual.id) && (
                  <option value={canchaActual.id}>
                    {`Cancha ${canchaActual.nro} - ${canchaActual.tipo} (Actual)`}
                  </option>
                )}
              {/* Luego las canchas disponibles */}
              {canchas.map((cancha) => (
                <option key={cancha.id} value={cancha.id}>
                  {`Cancha ${cancha.nro} - ${cancha.tipo}`}
                </option>
              ))}
            </select>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Estado</label>
          <select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-[6px] p-2"
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
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700">Equipos</label>
          <div className="flex items-center space-x-2">
            <select
              name="equipo_local_id"
              value={formData.equipo_local_id || partido.equipo_local_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-[6px] p-2"
            >
              <option value="" disabled>
                Seleccionar equipo local
              </option>
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>

            <span className="font-bold">vs</span>

            <select
              name="equipo_visitante_id"
              value={formData.equipo_visitante_id || partido.equipo_visitante_id}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-[6px] p-2"
            >
              <option value="" disabled>
                Seleccionar equipo visitante
              </option>
              {equipos.map((equipo) => (
                <option key={equipo.id} value={equipo.id}>
                  {equipo.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-[6px] hover:bg-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className={`px-4 py-2 bg-blue-500 text-white rounded-[6px] hover:bg-blue-600 ${
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