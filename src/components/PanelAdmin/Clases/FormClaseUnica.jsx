import React from "react";

const FormClaseUnica = ({
  formClase,
  handleFormChange,
  handleSubmit,
  validationErrors,
  editando,
  isSaving,
  setShowForm,
  deporteId,
  setDeporteId,
  deportes = [],
  profesores = [],
  canchasFiltradas = [],
  horaInicio,
  setHoraInicio,
  horaFin,
  setHoraFin,
  getOpcionesHoraInicioUnica,
  getOpcionesHoraFinUnica
}) => (
<form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded-xl shadow"
        >
          <h2 className="text-xl font-semibold mb-1">
            {editando ? "Editar Clase" : "Crear Nueva Clase"}
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            {editando
              ? "Modifica los datos de la clase seleccionada."
              : "Completa todos los campos para crear una nueva clase."}
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={formClase.nombre}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.nombre ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.nombre && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.nombre[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <input
                type="text"
                name="descripcion"
                value={formClase.descripcion}
                onChange={handleFormChange}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
                maxLength={255}
              />
              {validationErrors.descripcion && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.descripcion[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Profesor
              </label>
              <select
                name="profesor_id"
                value={formClase.profesor_id}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.profesor_id ? "border-red-500 text-red-500" : ""
                }`}
                required
              >
                <option value="">Seleccionar profesor</option>
                {profesores.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.nombre} {prof.apellido}
                  </option>
                ))}
              </select>
              {validationErrors.profesor_id && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.profesor_id[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Fecha de inicio
              </label>
              <input
                type="date"
                name="fecha"
                value={formClase.fecha}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.fecha ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.fecha && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.fecha[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Deporte
              </label>
              <select
                name="deporte_id"
                value={deporteId}
                onChange={e => setDeporteId(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
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
                {canchasFiltradas.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    {deporteId ? 'No hay canchas disponibles para este deporte' : 'Selecciona un deporte primero'}
                  </p>
                ) : (
                  canchasFiltradas.map((cancha) => (
                    <label key={cancha.id} className="flex items-center">
                      <input
                        type="checkbox"
                        name="cancha_ids"
                        value={cancha.id}
                        checked={formClase.cancha_ids?.includes(cancha.id) || false}
                        onChange={handleFormChange}
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
              <label className="block text-sm font-medium text-gray-700">
                Hora de Inicio
              </label>
              <select
                value={horaInicio}
                onChange={(e) => {
                  setHoraInicio(e.target.value);
                  setHoraFin(''); // Reset hora fin cuando cambia inicio
                }}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
                required
                disabled={!deporteId || !formClase.fecha}
              >
                <option value="">Seleccionar hora inicio</option>
                {getOpcionesHoraInicioUnica().map((hora) => (
                  <option key={hora} value={hora}>
                    {hora?.slice(0, 5)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Hora de Fin
              </label>
              <select
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm"
                required
                disabled={!horaInicio}
              >
                <option value="">Seleccionar hora fin</option>
                {getOpcionesHoraFinUnica().map((hora) => (
                  <option key={hora} value={hora}>
                    {hora?.slice(0, 5)}
                  </option>
                ))}
              </select>
              {horaInicio && horaFin && (
                <p className="text-sm text-gray-500 mt-1">
                  Duración: {((new Date(`1970-01-01T${horaFin}`) - new Date(`1970-01-01T${horaInicio}`)) / (1000 * 60 * 60))} hora(s)
                </p>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cupo máximo
              </label>
              <input
                type="number"
                name="cupo_maximo"
                value={formClase.cupo_maximo}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.cupo_maximo ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.cupo_maximo && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.cupo_maximo[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Precio mensual
              </label>
              <input
                type="number"
                name="precio_mensual"
                value={formClase.precio_mensual}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.precio_mensual ? "border-red-500 text-red-500" : ""
                }`}
                required
              />
              {validationErrors.precio_mensual && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.precio_mensual[0]}
                </p>
              )}
            </div>
            <div className="flex items-center mt-2">
              <input
                type="checkbox"
                name="activa"
                checked={formClase.activa}
                onChange={handleFormChange}
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
              onClick={() => setShowForm(false)}
              className="mr-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-[6px] shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              disabled={isSaving}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-3 py-2 border border-transparent rounded-[6px] shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              disabled={isSaving}
            >
              {isSaving ? "Guardando..." : editando ? "Guardar Cambios" : "Guardar"}
            </button>
          </div>
        </form>
);

export default FormClaseUnica;