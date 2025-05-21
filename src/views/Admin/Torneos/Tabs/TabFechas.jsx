import { Calendar, Shuffle } from 'lucide-react';
import CarruselFechas from '../CarruselFechas';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DayPicker } from 'react-day-picker';

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
      return(
          <div>
              {!fechasSorteadas && fechas.length === 0 && (
                  <div className="mt-6 flex gap-2 items-center">
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
              )}
                <CarruselFechas 
                  zonaId={zonaId} 
                  equipos={zona.equipos} 
                  fechas={fechas} 
                  onFechasDeleted={onFechasDeleted}
                  abortController={abortController}
                  deporteId={zona.torneo.deporte_id}
                />
          </div>
      )
}