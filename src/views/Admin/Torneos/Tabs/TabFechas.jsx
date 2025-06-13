import { Calendar, Shuffle } from 'lucide-react';
import CarruselFechas from '../CarruselFechas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';
import api from '@/lib/axiosConfig'
import { toast } from 'react-toastify'
import { useState, useEffect } from 'react'
import CrearPlayoffModal from '../../Modals/CrearPlayoffModal';
import { format as formatDate } from 'date-fns';
import { useTorneos } from '@/context/TorneosContext';

export function TabFechas({ 
  zona, 
  fechas, 
  fechaInicial, 
  setFechaInicial, 
  calendarOpen, 
  setCalendarOpen, 
  calendarRef, 
  handleSortearFechas, 
  loading, 
  zonaId,
  setFechasSorteadas, 
  setFechas, 
  fechasSorteadas,
  abortController,
  onFechasDeleted
}) {
  const [loadingPlayoff, setLoadingPlayoff] = useState(false);
  const [showPlayoffModal, setShowPlayoffModal] = useState(false);
  const { torneos, setTorneos } = useTorneos();

  const puedeCrearPlayoff = zona?.formato === 'Liga + Playoff';
  console.log("Puede crear playoff:", puedeCrearPlayoff);
  console.log("Fechas", fechas);
  console.log("Fechas sorteadas", fechasSorteadas)
  const handleCrearPlayoff = async () => {
    if (!fechaInicial) {
      toast.error("Selecciona una fecha inicial para el playoff");
      return;
    }
    setLoadingPlayoff(true);
    try {
      const res = await api.post(`/zonas/${zonaId}/crear-playoff-en-liga`, {
        fecha_inicial: fechaInicial
      });
      toast.success("Playoff creado correctamente");
      // Opcional: recargar zonas o fechas si es necesario
      if (onFechasDeleted) onFechasDeleted(); // O refresca la vista
    } catch (err) {
      toast.error(err.response?.data?.message || "Error al crear playoff");
    } finally {
      setLoadingPlayoff(false);
    }
  };

  return(
      <div>
        

        {!fechasSorteadas && fechas.length === 0 && (
          <div className="mt-6 justify-between flex w-full items-center">
          <div className=" flex gap-2 items-center">
              {/* Datepicker */}
              <div className="relative" ref={calendarRef}>
                <button
                  onClick={() => setCalendarOpen(!calendarOpen)}
                  className="py-2 px-3 flex items-center gap-2 rounded-[6px] text-sm bg-blue-500 hover:bg-blue-600 text-white"
                >
                  {fechaInicial
                    ? format(fechaInicial, "d 'de' MMMM yyyy", { locale: es })
                    : 'Inicio de Fecha'}{' '}
                  <Calendar size={18} />
                </button>

                {calendarOpen && (
                  <div
                    className="absolute z-50 bg-white shadow-lg rounded-md p-2 border"
                    style={{
                      top: '',
                      right: '-185px',
                    }}
                  >
                    <DayPicker
                      mode="single"
                      selected={fechaInicial}
                      onSelect={(date) => {
                        setFechaInicial(date);
                        setCalendarOpen(false);
                      }}
                      locale={es}
                      className="rounded-md"
                    />
                  </div>
                )}
              </div>

              {/* Botón de sortear fechas */}
              <button
                onClick={handleSortearFechas}
                className={`py-2 px-3 flex items-center gap-2 rounded-[6px] text-sm ${
                  !fechaInicial || loading
                    ? 'bg-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
                disabled={!fechaInicial || loading}
              >
                {loading ? 'Sorteando...' : 'Sortear Fechas'} <Shuffle size={18} />
              </button>
          </div>
          <div>
            {/* Botón para crear playoff en liga */}
            {puedeCrearPlayoff && (
              <div className="flex items-center gap-4 ">
                <button
                  onClick={() => setShowPlayoffModal(true)}
                  className="bg-secundario text-white text-sm px-3 py-2 rounded-[6px] hover:bg-secundario/80"
                  disabled={loadingPlayoff}
                >
                  Crear Playoffs
                </button>

              </div>
            )}
            </div>
          </div>
        )}
          <CarruselFechas 
            zonaId={zonaId} 
            equipos={zona.equipos} 
            fechas={fechas} 
            onFechasDeleted={onFechasDeleted}
            abortController={abortController}
            deporteId={zona.torneo.deporte_id}
          />
          <CrearPlayoffModal
          open={showPlayoffModal}
          onClose={() => setShowPlayoffModal(false)}
          loading={loadingPlayoff}
          onConfirm={async (fecha) => {
            setLoadingPlayoff(true);
            try {
              // Formatea la fecha a 'yyyy-MM-dd'
              const fechaFormateada = formatDate(fecha, 'yyyy-MM-dd');
              const res = await api.post(`/zonas/${zonaId}/crear-playoff-en-liga`, {
                fecha_inicial: fechaFormateada
              });
              toast.success("Playoff creado correctamente");
              setShowPlayoffModal(false);
              
              // Actualizar el contexto de torneos después de crear el playoff
              const torneosResponse = await api.get('/torneos');
              setTorneos(torneosResponse.data);
              
              if (onFechasDeleted) onFechasDeleted();
            } catch (err) {
              toast.error(err.response?.data?.message || "Error al crear playoff");
            } finally {
              setLoadingPlayoff(false);
            }
          }}
        />
      </div>
  )
}