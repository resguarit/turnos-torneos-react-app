"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"
import api from '@/lib/axiosConfig'

export default function FechaCarousel({ zonaId, equipos }) {
  const [fechas, setFechas] = useState([]);
  const [currentFechaIndex, setCurrentFechaIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFechas = async () => {
      try {
        const response = await api.get(`/zonas/${zonaId}/fechas`);
        setFechas(response.data);
      } catch (error) {
        console.error('Error fetching dates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFechas();
  }, [zonaId]);

  // Handle navigation
  const goToPrevious = () => {
    setCurrentFechaIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }

  const goToNext = () => {
    setCurrentFechaIndex((prev) => (prev < fechas.length - 1 ? prev + 1 : prev));
  }

  // If no fechas data, show a message
  if (loading) {
    return <div className="text-center p-4">Cargando fechas...</div>
  }

  if (!fechas || fechas.length === 0) {
    return <div className="text-center p-4">No hay fechas disponibles</div>
  }

  const currentFecha = fechas[currentFechaIndex]

  // Format the date for display
  const formattedDate = currentFecha.fecha_inicio
    ? format(parseISO(currentFecha.fecha_inicio), "dd/MM/yyyy", { locale: es })
    : ""

  return (
    <div className="mt-10 w-full  mx-auto bg-gray-100 rounded-[8px] overflow-hidden">
      {/* Header with navigation */}
      <div className="flex items-center justify-between p-3 bg-white border-b">
        <button
          onClick={goToPrevious}
          disabled={currentFechaIndex === 0}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-medium">
          {currentFecha.nombre} - {formattedDate}
        </h2>

        <button
          onClick={goToNext}
          disabled={currentFechaIndex === fechas.length - 1}
          className="p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Matches list */}
      <div className="divide-y divide-gray-200">
        {currentFecha.partidos && currentFecha.partidos.length > 0 ? (
          currentFecha.partidos.map((partido) => (
            <div key={partido.id} className="p-3 bg-gray-200 rounded-lg my-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: equipos.find(e => e.id === partido.equipo_local_id)?.color || "#ccc" }}
                  />
                  <span className="font-medium">
                    {equipos.find(e => e.id === partido.equipo_local_id)?.nombre || `Equipo ${partido.equipo_local_id}`}
                  </span>
                </div>

                <span className="mx-2 font-bold">vs</span>

                <div className="flex items-center space-x-2 flex-1 justify-end">
                  <span className="font-medium">
                    {equipos.find(e => e.id === partido.equipo_visitante_id)?.nombre || `Equipo ${partido.equipo_visitante_id}`}
                  </span>
                  <div
                    className="w-6 h-6 rounded-full"
                    style={{ backgroundColor: equipos.find(e => e.id === partido.equipo_visitante_id)?.color || "#ccc" }}
                  />
                </div>

                <div className="ml-4 text-right min-w-[60px]">
                  <span className="font-medium">18:00</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-4 text-center text-gray-500">No hay partidos para esta fecha</div>
        )}
      </div>
    </div>
  )
}

