import React from "react";

const FormClasesFijas = ({
  formClasesFijas,
  handleClasesFijasChange,
  handleSubmitClasesFijas,
  validationErrors,
  isSaving,
  setShowClasesFijas,
  deporteIdFijas,
  setDeporteIdFijas,
  profesores = [],
  deportes = [],
  canchasFiltradasFijas = [],
  diasSemana = [],
  horariosSeleccionados,
  handleHorarioChange,
  getOpcionesHoraInicioPorDia,
  getOpcionesHoraFinPorDia,
  validarRangoCompleto,
  getHorariosDisponiblesPorDia
}) => (
<form
          onSubmit={handleSubmitClasesFijas}
          className="mb-6 bg-white p-4 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-1">Crear Clases Fijas</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formClasesFijas.nombre}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Descripción</label>
              <input
                type="text"
                name="descripcion"
                value={formClasesFijas.descripcion}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Profesor</label>
              <select
                name="profesor_id"
                value={formClasesFijas.profesor_id}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              >
                <option value="">Seleccionar profesor</option>
                {profesores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre} {prof.apellido}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deporte
              </label>
              <select
                name="deporte_id"
                value={deporteIdFijas}
                onChange={e => setDeporteIdFijas(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              >
                <option value="">Seleccionar deporte</option>
                {deportes.map(d => (
                  <option key={d.id} value={d.id}>{d.nombre} {d.jugadores_por_equipo}</option>
                ))}
              </select>
            </div>
            {/* Campo de Canchas */}
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Canchas <span className="text-red-500">*</span>
              </label>
              <div className="mt-1 space-y-2 max-h-32 overflow-y-auto border border-gray-300 rounded-[6px] p-2">
                {canchasFiltradasFijas.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {deporteIdFijas ? 'No hay canchas disponibles para este deporte' : 'Selecciona un deporte primero'}
                  </p>
                ) : (
                  canchasFiltradasFijas.map((cancha) => (
                    <label key={cancha.id} className="flex items-center">
                      <input
                        type="checkbox"
                        name="cancha_ids"
                        value={cancha.id}
                        checked={formClasesFijas.cancha_ids?.includes(cancha.id) || false}
                        onChange={handleClasesFijasChange}
                        className="mr-2"
                      />
                      <span className="text-sm">
                        Cancha {cancha.nro} - {cancha.tipo_cancha}
                      </span>
                    </label>
                  ))
                )}
              </div>
              {validationErrors.cancha_ids && (
                <p className="mt-1 text-sm text-red-600">{validationErrors.cancha_ids[0]}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cupo máximo</label>
              <input
                type="number"
                name="cupo_maximo"
                value={formClasesFijas.cupo_maximo}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Precio mensual</label>
              <input
                type="number"
                name="precio_mensual"
                value={formClasesFijas.precio_mensual}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
              <input
                type="date"
                name="fecha_inicio"
                value={formClasesFijas.fecha_inicio}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Duración (meses)</label>
              <input
                type="number"
                name="duracion_meses"
                value={formClasesFijas.duracion_meses}
                onChange={handleClasesFijasChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                min={1}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Días de la semana</label>
              <div className="flex flex-wrap gap-2 mt-1">
                {diasSemana.map((d) => (
                  <label key={d.value} className="flex items-center gap-1">
                    <input
                      type="checkbox"
                      name="dias_semana"
                      value={d.value}
                      checked={formClasesFijas.dias_semana.includes(d.value)}
                      onChange={handleClasesFijasChange}
                    />
                    {d.label}
                  </label>
                ))}
              </div>
            </div>
            {/* Horarios por día */}
            {formClasesFijas.dias_semana.length > 0 && (
              <div className="sm:col-span-2 space-y-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Horarios por día 
                  <span className="text-red-500 text-xs ml-1">
                    (Selecciona horarios para todos los días)
                  </span>
                </h3>
                {formClasesFijas.dias_semana.map((dia) => {
                  const tieneHorarios = horariosSeleccionados[dia]?.hora_inicio && horariosSeleccionados[dia]?.hora_fin;
                  const rangoValido = tieneHorarios ? validarRangoCompleto(
                    dia, 
                    horariosSeleccionados[dia].hora_inicio.slice(0,5), 
                    horariosSeleccionados[dia].hora_fin.slice(0,5)
                  ) : true;
                  const horariosDisponibles = getHorariosDisponiblesPorDia(dia);
                  return (
                    <div key={dia} className={`border rounded-lg p-3 ${
                      tieneHorarios 
                        ? (rangoValido ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200')
                        : 'bg-gray-50'
                    }`}>
                      <h4 className="text-sm font-medium text-gray-800 mb-2 capitalize flex items-center">
                        {diasSemana.find(d => d.value === dia)?.label}
                        {tieneHorarios && (
                          rangoValido ? (
                            <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">
                              ✓ Válido
                            </span>
                          ) : (
                            <span className="ml-2 text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">
                              ⚠ No disponible
                            </span>
                          )
                        )}
                      </h4>
                      {horariosDisponibles && (
                        <div className="mb-2 p-2 bg-blue-50 rounded text-xs">
                          <span className="font-medium text-blue-700">Horarios disponibles:</span>
                          <div className="text-blue-600 ml-1 mt-1">{horariosDisponibles}</div>
                        </div>
                      )}
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Hora Inicio</label>
                          <select
                            value={horariosSeleccionados[dia]?.hora_inicio || ''}
                            onChange={(e) => handleHorarioChange(dia, 'hora_inicio', e.target.value)}
                            className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            required
                            disabled={!deporteIdFijas}
                          >
                            <option value="">Seleccionar</option>
                            {getOpcionesHoraInicioPorDia(dia).map((hora) => (
                              <option key={hora} value={hora}>
                                {hora?.slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600">Hora Fin</label>
                          <select
                            value={horariosSeleccionados[dia]?.hora_fin || ''}
                            onChange={(e) => handleHorarioChange(dia, 'hora_fin', e.target.value)}
                            className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                            required
                            disabled={!horariosSeleccionados[dia]?.hora_inicio}
                          >
                            <option value="">Seleccionar</option>
                            {getOpcionesHoraFinPorDia(dia).map((hora) => (
                              <option key={hora} value={hora}>
                                {hora?.slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                      {horariosSeleccionados[dia]?.hora_inicio && horariosSeleccionados[dia]?.hora_fin && (
                        <div className="mt-2 space-y-1">
                          <p className="text-xs text-gray-500">
                            Duración: {((new Date(`1970-01-01T${horariosSeleccionados[dia].hora_fin}`) - 
                                        new Date(`1970-01-01T${horariosSeleccionados[dia].hora_inicio}`)) / 
                                       (1000 * 60 * 60))} hora(s)
                          </p>
                          {!rangoValido && (
                            <p className="text-xs text-red-600 bg-red-100 p-1 rounded">
                              ⚠ Este horario no está disponible para {dia}. 
                              Selecciona un horario de los disponibles arriba.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
            <div className="flex items-center mt-2 sm:col-span-2">
              <input
                type="checkbox"
                name="activa"
                checked={formClasesFijas.activa}
                onChange={handleClasesFijasChange}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm font-medium text-gray-700">
                Activa
              </label>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="button"
              onClick={() => setShowClasesFijas(false)}
              className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-[6px] shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancelar
            </button>
            {/* Botón de crear */}
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-[6px] shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              disabled={isSaving || 
                !deporteIdFijas || 
                !formClasesFijas.cancha_ids?.length || // Cambio: verificar que hay canchas seleccionadas
                formClasesFijas.dias_semana.length === 0 ||
                !formClasesFijas.dias_semana.every(dia => {
                  const horarios = horariosSeleccionados[dia];
                  return horarios?.hora_inicio && horarios?.hora_fin;
                })
              }
            >
              {isSaving ? "Creando..." : "Crear Clases Fijas"}
            </button>
          </div>
        </form>
);

export default FormClasesFijas;