import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import BackButton from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';
import { formatearFechaCorta, formatearRangoHorario } from '@/utils/dateUtils';
import { useNavigate } from 'react-router-dom';

export default function CargaPartido() {
  const [torneos, setTorneos] = useState([]);
  const [zonas, setZonas] = useState([]);
  const [fechas, setFechas] = useState([]);
  const [selectedTorneo, setSelectedTorneo] = useState('');
  const [selectedZona, setSelectedZona] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentFechaIndex, setCurrentFechaIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTorneos = async () => {
      try {
        const response = await api.get('/torneos');
        setTorneos(response.data);
      } catch (error) {
        console.error('Error fetching torneos:', error);
      }
    };

    fetchTorneos();
  }, []);

  useEffect(() => {
    if (selectedTorneo) {
      const fetchZonas = async () => {
        try {
          const response = await api.get(`/torneos/${selectedTorneo}/zonas`);
          setZonas(response.data);
        } catch (error) {
          console.error('Error fetching zonas:', error);
        }
      };

      fetchZonas();
    }
  }, [selectedTorneo]);

  useEffect(() => {
    if (selectedZona) {
      const fetchFechas = async () => {
        try {
          setLoading(true);
          const response = await api.get(`/zonas/${selectedZona}/fechas`);
          setFechas(response.data);
        } catch (error) {
          console.error('Error fetching fechas:', error);
        } finally {
          setLoading(false);
        }
      };

      fetchFechas();
    }
  }, [selectedZona]);

  const handleTorneoChange = (e) => {
    setSelectedTorneo(e.target.value);
    setSelectedZona('');
    setFechas([]);
  };

  const handleZonaChange = (e) => {
    setSelectedZona(e.target.value);
    setFechas([]);
  };

  const goToPrevious = () => {
    setCurrentFechaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentFechaIndex((prev) => (prev < fechas.length - 1 ? prev + 1 : prev));
  };

  const handlePartidoClick = (partidoId) => {
    navigate(`/cargar-datos-partido/${partidoId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-center items-center h-full">
            <BtnLoading />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const currentFecha = fechas[currentFechaIndex];

  const formattedDate = currentFecha?.fecha_inicio
    ? formatearFechaCorta(currentFecha.fecha_inicio)
    : "";

  return (
    <div className="min-h-screen flex flex-col justify-start bg-gray-100 font-inter">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <BackButton />
        <h1 className="text-xl font-bold mb-4 lg:text-2xl">Cargar Partido</h1>

        <div className="space-y-4 mb-6">
          <div>
            <label className="block font-semibold font-sans mb-1 lg:text-xl">
              Torneo:
            </label>
            <select
              className="w-1/2 border border-gray-300 p-1 lg:text-lg"
              style={{ borderRadius: '6px' }}
              value={selectedTorneo}
              onChange={handleTorneoChange}
            >
              <option value="" disabled>
                Seleccionar torneo...
              </option>
              {torneos.map((torneo) => (
                <option key={torneo.id} value={torneo.id}>
                  {torneo.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold font-sans mb-1 lg:text-xl">
              Zona:
            </label>
            <select
              className="w-1/2 border border-gray-300 p-1 lg:text-lg"
              style={{ borderRadius: '6px' }}
              value={selectedZona}
              onChange={handleZonaChange}
            >
              <option value="" disabled>
                Seleccionar zona...
              </option>
              {zonas.map((zona) => (
                <option key={zona.id} value={zona.id}>
                  {zona.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {fechas.length > 0 && (
          <div className="mt-10 w-full mx-auto bg-gray-100 overflow-hidden">
            <div className="flex items-center justify-between p-3 bg-white border-b rounded-t-[8px]">
              <button
                onClick={goToPrevious}
                disabled={currentFechaIndex === 0}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div className="gap-2 flex items-center">
                <h2 className="text-lg font-medium">
                  {currentFecha.nombre} - {formattedDate}
                </h2>
                <span
                  className={`text-xs p-1 rounded-xl ${
                    currentFecha.estado === 'Pendiente'
                      ? 'bg-yellow-300 text-yellow-700'
                      : currentFecha.estado === 'En Curso'
                      ? 'bg-blue-300 text-blue-700'
                      : currentFecha.estado === 'Finalizada'
                      ? 'bg-green-300 text-green-700'
                      : currentFecha.estado === 'Suspendida'
                      ? 'bg-gray-300 text-gray-700'
                      : 'bg-red-300 text-red-700'
                  }`}
                >
                  {`${currentFecha.estado}`}
                </span>
              </div>
              <button
                onClick={goToNext}
                disabled={currentFechaIndex === fechas.length - 1}
                className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="divide-y divide-gray-200">
              {currentFecha.partidos && currentFecha.partidos.length > 0 ? (
                currentFecha.partidos.map((partido) => {
                  const cancha = partido.cancha ? `${partido.cancha.nro} - ${partido.cancha.tipo_cancha}` : "No Definido";
                  const horario = partido.horario ? formatearRangoHorario(partido.horario.hora_inicio, partido.horario.hora_fin) : "No Definido";
                  const marcadorLocal = partido.marcador_local ?? "-";
                  const marcadorVisitante = partido.marcador_visitante ?? "-";

                  return (
                    <div
                      key={partido.id}
                      className="p-3 bg-gray-200 rounded-lg my-2 cursor-pointer"
                      onClick={() => navigate(`/resultado-partido/${selectedZona}/${partido.id}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 flex-1">
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: "#ccc" }}
                          />
                          <span className="font-medium">
                            {partido.equipos[0]?.nombre || "Equipo no definido"}
                          </span>
                        </div>

                        <span className="mx-2 font-bold">
                          {marcadorLocal} - {marcadorVisitante}
                        </span>

                        <div className="flex items-center space-x-2 flex-1 justify-end">
                          <span className="font-medium">
                            {partido.equipos[1]?.nombre || "Equipo no definido"}
                          </span>
                          <div
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: "#ccc" }}
                          />
                        </div>
                      </div>
                      <div className="flex justify-between mt-2 text-sm text-gray-600">
                        <span>Cancha: {cancha}</span>
                        <span>Hora: {horario}</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500">No hay partidos para esta fecha</div>
              )}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
