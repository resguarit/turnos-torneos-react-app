import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import BtnLoading from '@/components/BtnLoading';

export default function VerFixture() {
  const { zonaId } = useParams();
  const navigate = useNavigate();
  const [fechas, setFechas] = useState([]);
  const [horarios, setHorarios] = useState({});
  const [currentFechaIndex, setCurrentFechaIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFechasYHorarios = async () => {
      try {
        setLoading(true);

        // Traer las fechas de la zona
        const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`);
        const fechas = fechasResponse.data;

        // Traer los horarios
        const horariosResponse = await api.get(`/horarios`);
        const horariosData = horariosResponse.data.horarios;

        // Crear un mapa de horarios por ID
        const horariosMap = {};
        horariosData.forEach((horario) => {
          horariosMap[horario.id] = horario;
        });

        setFechas(fechas);
        setHorarios(horariosMap);
      } catch (error) {
        console.error('Error fetching fechas or horarios:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFechasYHorarios();
  }, [zonaId]);

  const goToPrevious = () => {
    setCurrentFechaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  };

  const goToNext = () => {
    setCurrentFechaIndex((prev) => (prev < fechas.length - 1 ? prev + 1 : prev));
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

  if (!fechas || fechas.length === 0) {
    return <div className="text-center p-4">No hay fechas disponibles</div>;
  }

  const currentFecha = fechas[currentFechaIndex];

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="w-full flex mb-2">
          <button
            onClick={() => navigate(-1)}
            className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center"
          >
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="flex flex-col justify-center items-center h-full">
          <div className="flex items-center justify-between w-1/2 p-3 bg-white border-b rounded-t-[8px]">
            <button
              onClick={goToPrevious}
              disabled={currentFechaIndex === 0}
              className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex gap-2 items-center">
              <h2 className="text-lg font-medium">{currentFecha.nombre}</h2>
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
                {currentFecha.estado}
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

          <div className="divide-y divide-gray-200 w-1/2 mt-4">
            {currentFecha.partidos && currentFecha.partidos.length > 0 ? (
              currentFecha.partidos.map((partido, index) => {
                const horario = horarios[partido.horario_id] || {};
                return (
                  <div key={index} className="p-3 bg-gray-200 rounded-lg my-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 flex-1">
                        <span className="font-medium">{partido.equipos[0].nombre}</span>
                        <span className="font-bold">({partido.marcador_local ?? '-'})</span>
                      </div>
                      <span className="mx-2 font-bold">vs</span>
                      <div className="flex items-center space-x-2 flex-1 justify-end">
                        <span className="font-bold">({partido.marcador_visitante ?? '-'})</span>
                        <span className="font-medium">{partido.equipos[1].nombre}</span>
                      </div>
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-600">
                      <span>Cancha: {partido.cancha?.nro || 'No Definido'}</span>
                      <span>
                        Hora: {horario.hora_inicio || 'No Definido'} - {horario.hora_fin || 'No Definido'}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-4 text-center text-gray-500">No hay partidos para esta fecha</div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}