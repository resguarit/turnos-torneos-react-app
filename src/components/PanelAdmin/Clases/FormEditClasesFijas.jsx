import React from "react";

const FormEditClasesFijas = ({
  formEditClasesFijas,
  setFormEditClasesFijas,
  handleEditClasesFijasChange,
  handleSubmitEditClasesFijas,
  validationErrors,
  isSaving,
  setShowEditClasesFijas,
  deporteIdEditFijas,
  setDeporteIdEditFijas,
  profesores = [],
  deportes = [],
  canchasFiltradasEditFijas = [],
  diasSemana = [],
  horariosSeleccionadosEdit,
  handleHorarioChangeEdit,
  getOpcionesHoraInicioPorDiaEdit,
  getOpcionesHoraFinPorDiaEdit,
  validarRangoCompletoEdit,
  getHorariosDisponiblesPorDiaEdit,
  grupoEditando
}) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-white p-6 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Editar Grupo de Clases Fijas</h2>
        <button 
          onClick={() => setShowEditClasesFijas(false)}
          className="text-gray-500 hover:text-gray-700"
        >
          ×
        </button>
      </div>
      
      <form onSubmit={handleSubmitEditClasesFijas} className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              name="nombre"
              value={formEditClasesFijas.nombre}
              onChange={handleEditClasesFijasChange}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Descripción</label>
            <input
              type="text"
              name="descripcion"
              value={formEditClasesFijas.descripcion}
              onChange={handleEditClasesFijasChange}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Profesor</label>
            <select
              name="profesor_id"
              value={formEditClasesFijas.profesor_id}
              onChange={handleEditClasesFijasChange}
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
            <label className="block text-sm font-medium text-gray-700">Deporte</label>
            <select
              name="deporte_id"
              value={deporteIdEditFijas}
              onChange={e => setDeporteIdEditFijas(e.target.value)}
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
              {canchasFiltradasEditFijas.length === 0 ? (
                <p className="text-sm text-gray-500">
                  {deporteIdEditFijas ? 'No hay canchas disponibles para este deporte' : 'Selecciona un deporte primero'}
                </p>
              ) : (
                canchasFiltradasEditFijas.map((cancha) => (
                  <label key={cancha.id} className="flex items-center">
                    <input
                      type="checkbox"
                      name="cancha_ids"
                      value={cancha.id}
                      checked={formEditClasesFijas.cancha_ids?.includes(cancha.id) || false}
                      onChange={handleEditClasesFijasChange}
                      className="mr-2"
                    />
                    <span className="text-sm">
                      Cancha {cancha.nro} - {cancha.tipo_cancha}
                    </span>
                  </label>
                ))
              )}
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Cupo máximo</label>
            <input
              type="number"
              name="cupo_maximo"
              value={formEditClasesFijas.cupo_maximo}
              onChange={handleEditClasesFijasChange}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Precio mensual</label>
            <input
              type="number"
              name="precio_mensual"
              value={formEditClasesFijas.precio_mensual}
              onChange={handleEditClasesFijasChange}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Fecha de inicio</label>
            <input
              type="date"
              name="fecha_inicio"
              value={formEditClasesFijas.fecha_inicio}
              onChange={handleEditClasesFijasChange}
              className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">Duración (meses)</label>
            <input
              type="number"
              name="duracion_meses"
              value={formEditClasesFijas.duracion_meses}
              onChange={handleEditClasesFijasChange}
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
                    checked={formEditClasesFijas.dias_semana.includes(d.value)}
                    onChange={handleEditClasesFijasChange}
                  />
                  {d.label}
                </label>
              ))}
            </div>
          </div>
          
          {/* Horarios por día */}
          {formEditClasesFijas.dias_semana.length > 0 && (
            <div className="sm:col-span-2 space-y-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Horarios por día 
                <span className="text-red-500 text-xs ml-1">
                  (Selecciona horarios para todos los días)
                </span>
              </h3>
              {formEditClasesFijas.dias_semana.map((dia) => {
                const tieneHorarios = horariosSeleccionadosEdit[dia]?.hora_inicio && horariosSeleccionadosEdit[dia]?.hora_fin;
                const rangoValido = tieneHorarios ? validarRangoCompletoEdit(
                  dia, 
                  horariosSeleccionadosEdit[dia].hora_inicio.slice(0,5), 
                  horariosSeleccionadosEdit[dia].hora_fin.slice(0,5)
                ) : true;
                const horariosDisponibles = getHorariosDisponiblesPorDiaEdit(dia);
                
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
                          value={horariosSeleccionadosEdit[dia]?.hora_inicio || ''}
                          onChange={(e) => handleHorarioChangeEdit(dia, 'hora_inicio', e.target.value)}
                          className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          required
                          disabled={!deporteIdEditFijas}
                        >
                          <option value="">Seleccionar</option>
                          {getOpcionesHoraInicioPorDiaEdit(dia).map((hora) => (
                            <option key={hora} value={hora}>
                              {hora?.slice(0, 5)}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600">Hora Fin</label>
                        <select
                          value={horariosSeleccionadosEdit[dia]?.hora_fin || ''}
                          onChange={(e) => handleHorarioChangeEdit(dia, 'hora_fin', e.target.value)}
                          className="mt-1 block w-full px-2 py-1 text-sm border border-gray-300 rounded"
                          required
                          disabled={!horariosSeleccionadosEdit[dia]?.hora_inicio}
                        >
                          <option value="">Seleccionar</option>
                          {getOpcionesHoraFinPorDiaEdit(dia).map((hora) => (
                            <option key={hora} value={hora}>
                              {hora?.slice(0, 5)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    
                    {horariosSeleccionadosEdit[dia]?.hora_inicio && horariosSeleccionadosEdit[dia]?.hora_fin && (
                      <div className="mt-2 space-y-1">
                        <p className="text-xs text-gray-500">
                          Duración: {((new Date(`1970-01-01T${horariosSeleccionadosEdit[dia].hora_fin}`) - 
                                      new Date(`1970-01-01T${horariosSeleccionadosEdit[dia].hora_inicio}`)) / 
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
              checked={formEditClasesFijas.activa}
              onChange={handleEditClasesFijasChange}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm font-medium text-gray-700">
              Activa
            </label>
          </div>
        </div>
        
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowEditClasesFijas(false)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 border border-gray-300 rounded-md hover:bg-gray-300"
            disabled={isSaving}
          >
            Cancelar
          </button>
          
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSaving || 
              !deporteIdEditFijas || 
              !formEditClasesFijas.cancha_ids?.length ||
              formEditClasesFijas.dias_semana.length === 0 ||
              !formEditClasesFijas.dias_semana.every(dia => {
                const horarios = horariosSeleccionadosEdit[dia];
                return horarios?.hora_inicio && horarios?.hora_fin;
              })
            }
          >
            {isSaving ? "Actualizando..." : "Actualizar Clases Fijas"}
          </button>
        </div>
      </form>
    </div>
  </div>
);

export default FormEditClasesFijas;