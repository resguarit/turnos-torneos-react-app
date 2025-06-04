import React, { useState, useEffect } from 'react';
import { Shield, FileWarning, Calendar, X } from 'lucide-react';
import api from '@/lib/axiosConfig'; // Asegúrate de importar tu instancia de Axios
import { toast } from 'react-toastify';

export default function SancionesModal({
  isOpen,
  onClose,
  onConfirm,
  partidoId,
  equipoLocalId,
  equipoVisitanteId,
  jugadores,
  equipoLocal,
  equipoVisitante,
  zonaId
}) {
  const [activeTab, setActiveTab] = useState('local');
  const [selectedJugador, setSelectedJugador] = useState(null);
  const [showSancionForm, setShowSancionForm] = useState(false);
  const [fechas, setFechas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sancion, setSancion] = useState({
    motivo: '',
    tipo: '',
    cantidadFechas: 1,
    fechaDesde: '',
    fechaHasta: '',
    estado: 'Activa',
  });
  const [sancionesAplicadas, setSancionesAplicadas] = useState({});

  useEffect(() => {
    const fetchJugadores = async () => {
      try {
        /* const response = await api.get(`/equipos/${equipoLocalId}/jugadores`);
        setEquipoLocal((prev) => ({
          ...prev,
          jugadores: response.data,
        }));

        const responseVisitante = await api.get(`/equipos/${equipoVisitanteId}/jugadores`);
        setEquipoVisitante((prev) => ({
          ...prev,
          jugadores: responseVisitante.data,
        })); */

        const responseFechas = await api.get(`/zonas/${zonaId}/fechas`);
        setFechas(responseFechas.data);
      } catch (error) {
        console.error('Error al obtener los jugadores:', error);
      }
    };

    fetchJugadores();
  }, [/* equipoLocalId, equipoVisitanteId */ zonaId]);

  const handleSelectJugador = (jugador) => {
    setSelectedJugador(jugador);
    setShowSancionForm(true);
  };

  const handleSancionChange = (field, value) => {
    setSancion((prev) => ({ ...prev, [field]: value }));
  };

  const handleGuardarSancion = () => {
    if (selectedJugador) {
      setSancionesAplicadas((prev) => ({
        ...prev,
        [selectedJugador.id]: { ...sancion },
      }));
      setShowSancionForm(false);
      setSelectedJugador(null);
      setSancion({
        motivo: '',
        tipo: '',
        cantidadFechas: 1,
        fechaDesde: '',
        fechaHasta: '',
        estado: 'Activa',
      });
    }
  };

  

  const handleEnviarSancion = async () => {
    try {
      setLoading(true);
      for (const jugadorId in sancionesAplicadas) {
        const sancion = sancionesAplicadas[jugadorId];
  
        // Buscar en qué equipo está el jugador
        let equipoId = null;
        if (equipoLocal?.jugadores?.some(j => j.id === Number(jugadorId))) {
          equipoId = equipoLocalId;
        } else if (equipoVisitante?.jugadores?.some(j => j.id === Number(jugadorId))) {
          equipoId = equipoVisitanteId;
        }
  
        if (!equipoId) {
          toast.error(`No se pudo determinar el equipo para el jugador ${jugadorId}.`);
          continue;
        }
  
        // Obtener el equipo_jugador_id usando api.get
        const responseEquipoJugador = await api.get(
          `/equipos/${equipoId}/jugadores/${jugadorId}/equipo-jugador-id`
        );
        const equipoJugadorId = responseEquipoJugador.data.equipo_jugador_id;
  
        if (!equipoJugadorId) {
          toast.error(`No se pudo obtener el ID de la tabla pivote para el jugador ${jugadorId}.`);
          continue;
        }
  
        // Preparar los datos para enviar la sanción
        const data = {
          equipo_jugador_id: equipoJugadorId,
          motivo: sancion.motivo,
          tipo_sancion: sancion.tipo,
          cantidad_fechas: sancion.cantidadFechas,
          fecha_inicio: sancion.fechaDesde,
          fecha_fin: sancion.fechaHasta,
          partido_id: partidoId,
          estado: sancion.estado.toLowerCase(),
        };
  
        // Enviar la sanción al backend usando api.post
        await api.post('/sanciones', data);

        onClose();
      }
  
      toast.success('Sanciones creadas correctamente');
      setSancionesAplicadas({});
      setShowSancionForm(false);
      setSelectedJugador(null);
      setSancion({
        motivo: '',
        tipo: '',
        cantidadFechas: 1,
        fechaDesde: '',
        fechaHasta: '',
        estado: 'Activa',
      });
    } catch (error) {
      console.error('Error al enviar la sanción:', error);
      toast.error('Error al conectar con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 ${
        isOpen ? 'visible' : 'invisible'
      }`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white p-6 rounded-[8px] shadow-lg  w-[40%] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl  font-semibold flex items-center ">
            Cargar Sanciones
          </h1>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 ">
          {showSancionForm ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">
                  Sanción para: {selectedJugador?.nombre} {selectedJugador?.apellido}
                </h3>
                <button onClick={() => setShowSancionForm(false)} className="text-gray-500 hover:text-gray-700">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                    Tipo de Sanción
                  </label>
                  <select
                    id="tipo"
                    value={sancion.tipo}
                    onChange={(e) => handleSancionChange('tipo', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>
                        Seleccionar Tipo
                    </option>
                    <option value="expulsión">Expulsión</option>
                    <option value="advertencia">Advertencia</option>
                    <option value="suspensión">Suspensión</option>
                    <option value="expulsión permanente">Expulsión Permanente</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="estado" className="block text-sm font-medium text-gray-700">
                    Estado
                  </label>
                  <select
                    id="estado"
                    value={sancion.estado}
                    onChange={(e) => handleSancionChange('estado', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="" disabled>
                        Seleccionar Estado
                    </option>
                    <option value="activa">Activa</option>
                    <option value="cumplida">Cumplida</option>
                    <option value="apelada">Apelada</option>
                    <option value="anulada">Anulada</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="motivo" className="block text-sm font-medium text-gray-700">
                  Motivo
                </label>
                <input
                  id="motivo"
                  type="text"
                  value={sancion.motivo}
                  onChange={(e) => handleSancionChange('motivo', e.target.value)}
                  className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describa el motivo de la sanción"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label htmlFor="cantidadFechas" className="block text-sm font-medium text-gray-700">
                    Cantidad de Fechas
                  </label>
                  <input
                    id="cantidadFechas"
                    type="number"
                    min="1"
                    value={sancion.cantidadFechas}
                    onChange={(e) => handleSancionChange('cantidadFechas', Number(e.target.value))}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="fechaDesde" className="block text-sm font-medium text-gray-700">
                    Desde Fecha
                  </label>
                  <select
                    id="fechaDesde"
                    value={sancion.fechaDesde}
                    onChange={(e) => handleSancionChange('fechaDesde', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar fecha</option>
                    {fechas.map((fecha) => (
                      <option key={fecha.id} value={fecha.id}>
                        {fecha.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="fechaHasta" className="block text-sm font-medium text-gray-700">
                    Hasta Fecha
                  </label>
                  <select
                    id="fechaHasta"
                    value={sancion.fechaHasta}
                    onChange={(e) => handleSancionChange('fechaHasta', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Seleccionar fecha</option>
                    {fechas.map((fecha) => (
                      <option key={fecha.id} value={fecha.id}>
                        {fecha.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex justify-end  ">
                <button
                  onClick={handleGuardarSancion}
                  disabled={!sancion.tipo || !sancion.motivo || !sancion.fechaDesde || !sancion.fechaHasta}
                  className="px-4 py-2 mb-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
                >
                  Guardar Sanción
                </button>
              </div>
            </div>
          ) : (
            <div>
              <div className="flex gap-2 mb-4">
                <button
                  onClick={() => setActiveTab('local')}
                  className={`px-3 py-2 rounded text-sm ${
                    activeTab === 'local' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {equipoLocal?.nombre || 'Equipo Local'}
                </button>
                <button
                  onClick={() => setActiveTab('visitante')}
                  className={`px-3 py-2 rounded text-sm ${
                    activeTab === 'visitante' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
                  }`}
                >
                  {equipoVisitante?.nombre || 'Equipo Visitante'}
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                {(activeTab === 'local' ? equipoLocal.jugadores : equipoVisitante.jugadores)?.map((jugador) => (
                  <div key={jugador.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="text-sm font-medium">
                        {jugador.nombre} {jugador.apellido}
                      </p>
                      <p className="text-xs text-gray-500">DNI: {jugador.dni}</p>
                    </div>
                    <button
                      onClick={() => handleSelectJugador(jugador)}
                      className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                    >
                      {sancionesAplicadas[jugador.id] ? 'Editar' : 'Sancionar'}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-gray-500 flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            {Object.keys(sancionesAplicadas).length} sanciones para aplicar
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
            >
              Cancelar
            </button>
            <button
              onClick={handleEnviarSancion}
              disabled={Object.keys(sancionesAplicadas).length === 0 || loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Confirmando...' : 'Confirmar Sanciones'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
