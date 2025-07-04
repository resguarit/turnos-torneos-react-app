import { useState, useEffect } from "react";
import api from "@/lib/axiosConfig";
import { format, parseISO } from "date-fns";

export default function AgregarPartidoModal({ fecha, equipos, onClose, onPartidoAgregado }) {
  const [equipoLocal, setEquipoLocal] = useState("");
  const [equipoVisitante, setEquipoVisitante] = useState("");
  const [horario, setHorario] = useState("");
  const [horarios, setHorarios] = useState([]);
  const [cancha, setCancha] = useState("");
  const [canchas, setCanchas] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [loadingCanchas, setLoadingCanchas] = useState(false);
  const [loadingConfirm, setLoadingConfirm] = useState(false);

  // Obtener horarios disponibles según la fecha
  useEffect(() => {
    const fetchHorariosDisponibles = async () => {
      try {
        setLoadingHorarios(true);
        const response = await api.get("/disponibilidad/fecha", {
          params: { fecha: fecha.fecha_inicio, deporte_id: fecha.zona.torneo.deporte_id },
        });

        if (response.status === 200) {
          setHorarios(response.data.horarios);
        }
      } catch (error) {
        console.error("Error al obtener los horarios disponibles:", error);
      } finally {
        setLoadingHorarios(false);
      }
    };

    fetchHorariosDisponibles();
  }, [fecha]);

  useEffect(() => {
    if (!horario) {
      setCanchas([]);
      return;
    }

    const fetchCanchasDisponibles = async () => {
      try {
        setLoadingCanchas(true);
        const response = await api.get("/disponibilidad/cancha", {
          params: { fecha: fecha.fecha_inicio, horario_id: horario, deporte_id: fecha.zona.torneo.deporte_id },
        });

        if (response.status === 200) {
          setCanchas(response.data.canchas.filter((c) => c.disponible));
        }
      } catch (error) {
        console.error("Error al obtener las canchas disponibles:", error);
      } finally {
        setLoadingCanchas(false);
      }
    };

    fetchCanchasDisponibles();
  }, [horario, fecha]);

  const agregarPartido = async () => {
    if (!equipoLocal || !equipoVisitante) {
      alert("Debes seleccionar ambos equipos.");
      return;
    }

    try {
      setLoadingConfirm(true)
      const response = await api.post("/partidos", {
        equipo_local_id: equipoLocal,
        equipo_visitante_id: equipoVisitante,
        fecha_id: fecha.id,
        fecha: fecha.fecha_inicio,
        estado: "Pendiente",
        horario_id: horario || null,
        cancha_id: cancha || null,
      });

      const nuevoPartido = response.data.partido;
      onPartidoAgregado(nuevoPartido);
      onClose();
    } catch (error) {
      console.error("Error al agregar el partido:", error);
    } finally{
      setLoadingConfirm(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-[8px] shadow-lg w-1/3">
        <h2 className="text-xl font-bold mb-4">Agregar Partido</h2>

        {/* Selector de equipos */}
        <div className="flex items-center space-x-2 mb-4">
          <select
            value={equipoLocal}
            onChange={(e) => setEquipoLocal(e.target.value)}
            className="border border-gray-300 rounded-[6px] p-2 flex-1"
          >
            <option value="" disabled>Equipo Local</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
          <p className=" font-semibold">vs</p>
          <select
            value={equipoVisitante}
            onChange={(e) => setEquipoVisitante(e.target.value)}
            className="border border-gray-300 rounded-[6px] p-2 flex-1"
          >
            <option value="" disabled>Equipo Visitante</option>
            {equipos.map((equipo) => (
              <option key={equipo.id} value={equipo.id}>
                {equipo.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Selector de horario */}
        <p className="text-sm text-red-500 mb-1">Opcional *</p>
        <div className="rounded-[8px] border border-gray-300 p-1 justify-center flex flex-col mb-4">
          <div className="mb-4">
            {loadingHorarios ? (
              <div className="border border-gray-300 rounded-[6px] text-sm p-2 w-full bg-gray-50 text-gray-500">
                Cargando horarios...
              </div>
            ) : (
              <select
                value={horario}
                onChange={(e) => setHorario(e.target.value)}
                className="border border-gray-300 rounded-[6px] text-sm p-1 w-full"
              >
                <option value="">Seleccionar Horario</option>
                {horarios.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hora_inicio} - {h.hora_fin}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selector de cancha */}
          <div>
            {loadingCanchas ? (
              <div className="border border-gray-300 rounded-[6px] text-sm p-2 w-full bg-gray-50 text-gray-500">
                Cargando canchas...
              </div>
            ) : (
              <select
                value={cancha}
                onChange={(e) => setCancha(e.target.value)}
                className="border border-gray-300 rounded-[6px] text-sm p-1 w-full"
                disabled={!horario}
              >
                <option value="">Seleccionar Cancha</option>
                {canchas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nro} - {c.tipo}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
        {/* Botones de acción */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            disabled={loadingConfirm}
            className="bg-gray-300 text-gray-700 px-4 py-2 rounded-[6px] hover:bg-gray-400"
          >
            Cancelar
          </button>
          <button
            onClick={agregarPartido}
            disabled={loadingConfirm}
            className="bg-green-500 text-white px-4 py-2 rounded-[6px] hover:bg-green-600"
          >
            {loadingConfirm ? 'Agregando Partido...' : 'Agregar Partido'}
          </button>
        </div>
      </div>
    </div>
  );
}