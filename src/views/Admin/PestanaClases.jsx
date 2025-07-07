import React, { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Eye, Search, Calendar, Clock, User, DollarSign, Users, MapPin } from "lucide-react";
import BtnLoading from "@/components/BtnLoading";
import api from "@/lib/axiosConfig";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useDeportes } from '@/context/DeportesContext';
import { parseISO, format } from "date-fns";
import { es } from "date-fns/locale";

const PestanaClases = () => {
  const { deportes } = useDeportes();
  const [clases, setClases] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [horarios, setHorarios] = useState([]);
  const [horariosFiltrados, setHorariosFiltrados] = useState([]); // <-- Agrega esta línea
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editando, setEditando] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [validationErrors, setValidationErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [claseToDelete, setClaseToDelete] = useState(null);
  const [deporteId, setDeporteId] = useState('');
  const [canchasDisponibles, setCanchasDisponibles] = useState([]); // <--- AGREGA ESTA LÍNEA

  // Formulario de clase
  const [formClase, setFormClase] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    profesor_id: "",
    cancha_id: "",
    horario_id: "",
    cupo_maximo: "",
    precio_mensual: "",
    activa: true,
  });

  // Nuevo estado para mostrar el modal de clases fijas
  const [showClasesFijas, setShowClasesFijas] = useState(false);

  // Nuevo estado para el formulario de clases fijas
  const [formClasesFijas, setFormClasesFijas] = useState({
    nombre: "",
    descripcion: "",
    profesor_id: "",
    cancha_id: "",
    horario_id: "",
    cupo_maximo: "",
    precio_mensual: "",
    activa: true,
    fecha_inicio: "",
    duracion_meses: 1,
    dias_semana: [],
  });

  // Días de la semana para el selector
  const diasSemana = [
    { value: "lunes", label: "Lunes" },
    { value: "martes", label: "Martes" },
    { value: "miércoles", label: "Miércoles" },
    { value: "jueves", label: "Jueves" },
    { value: "viernes", label: "Viernes" },
    { value: "sábado", label: "Sábado" },
    { value: "domingo", label: "Domingo" },
  ];

  useEffect(() => {
    fetchClases();
    fetchProfesores();
    fetchCanchas();
    fetchHorarios();
  }, []);

  const fetchClases = async () => {
    setLoading(true);
    try {
      const response = await api.get("/clases", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setClases(response.data.clases || response.data || []);
    } catch (error) {
      toast.error("Error al cargar las clases");
    } finally {
      setLoading(false);
    }
  };

  const fetchProfesores = async () => {
    try {
      const res = await api.get("/profesores");
      setProfesores(res.data.profesores || res.data || []);
    } catch {}
  };

  const fetchCanchas = async () => {
    try {
      const res = await api.get("/canchas");
      setCanchas(res.data.canchas || res.data || []);
    } catch {}
  };

  const fetchHorarios = async () => {
    try {
      const res = await api.get("/horarios");
      setHorarios(res.data.horarios || res.data || []);
    } catch {}
  };

  const handleSearch = () => {
    fetchClases();
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    fetchClases();
  };

  const handleAddClase = () => {
    setShowForm(true);
    setEditando(null);
    setFormClase({
      nombre: "",
      descripcion: "",
      fecha: "",
      profesor_id: "",
      cancha_id: "",
      horario_id: "",
      cupo_maximo: "",
      precio_mensual: "",
      activa: true,
    });
    setValidationErrors({});
  };

  const handleEditClase = (clase) => {
    setShowForm(true);
    setEditando(clase);
    setFormClase({
      nombre: clase.nombre || "",
      descripcion: clase.descripcion || "",
      fecha: clase.fecha || "",
      profesor_id: clase.profesor_id || "",
      cancha_id: clase.cancha_id || "",
      horario_id: clase.horario_id || "",
      cupo_maximo: clase.cupo_maximo || "",
      precio_mensual: clase.precio_mensual || "",
      activa: !!clase.activa,
    });
    setValidationErrors({});
  };

  const handleDeleteClase = (clase) => {
    setClaseToDelete(clase);
    setShowDeleteModal(true);
  };

  const confirmDeleteClase = async () => {
    setIsSaving(true);
    try {
      await api.delete(`/clases/${claseToDelete.id}`);
      setClases(clases.filter((c) => c.id !== claseToDelete.id));
      toast.success("Clase eliminada correctamente");
    } catch (error) {
      toast.error("Error al eliminar la clase");
    } finally {
      setIsSaving(false);
      setShowDeleteModal(false);
      setClaseToDelete(null);
    }
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormClase((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setValidationErrors({});
    try {
      if (editando) {
        // PUT para editar
        const response = await api.put(`/clases/${editando.id}`, formClase);
        setClases(
          clases.map((c) =>
            c.id === editando.id ? response.data.clase : c
          )
        );
        toast.success("Clase editada correctamente");
      } else {
        // POST para crear
        const response = await api.post("/clases", formClase);
        setClases([response.data.clase, ...clases]);
        toast.success("Clase creada correctamente");
      }
      setShowForm(false);
      setEditando(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        toast.error("Error al guardar la clase");
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Nuevo: obtener el día de la semana de la fecha seleccionada
  const getDiaSemana = (fecha) => {
    if (!fecha) return null;
    const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const d = new Date(fecha);
    return dias[d.getDay()];
  };

  // Traer horarios disponibles al seleccionar fecha y deporte
  useEffect(() => {
    setFormClase(f => ({ ...f, horario_id: '', cancha_id: '' }));
    setHorarios([]);
    setHorariosFiltrados([]);
    setCanchasDisponibles([]);
    if (formClase.fecha && deporteId) {
      api.get('/disponibilidad/fecha', {
        params: { fecha: formClase.fecha, deporte_id: deporteId }
      }).then(res => {
        // Únicos por rango y solo disponibles
        const seen = new Set();
        const unicos = [];
        (res.data.horarios || []).forEach(h => {
          const key = `${h.hora_inicio}-${h.hora_fin}-${h.deporte_id}`;
          if (!seen.has(key) && h.disponible) {
            seen.add(key);
            unicos.push(h);
          }
        });
        setHorarios(unicos);
        setHorariosFiltrados(unicos);
      }).catch(() => toast.error('Error al traer horarios'));
    }
  }, [formClase.fecha, deporteId]);

  // Traer canchas disponibles cuando hay horario seleccionado
  useEffect(() => {
    setFormClase(f => ({ ...f, cancha_id: '' }));
    setCanchasDisponibles([]);
    if (formClase.fecha && formClase.horario_id && deporteId) {
      api.get('/disponibilidad/cancha', {
        params: { fecha: formClase.fecha, horario_id: formClase.horario_id, deporte_id: deporteId }
      }).then(res => {
        setCanchasDisponibles((res.data.canchas || []).filter(c => c.disponible));
      }).catch(() => setCanchasDisponibles([]));
    }
  }, [formClase.fecha, formClase.horario_id, deporteId]);

  // Handler para el formulario de clases fijas
  const handleClasesFijasChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "dias_semana") {
      setFormClasesFijas((prev) => ({
        ...prev,
        dias_semana: checked
          ? [...prev.dias_semana, value]
          : prev.dias_semana.filter((d) => d !== value),
      }));
    } else if (type === "checkbox") {
      setFormClasesFijas((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormClasesFijas((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Enviar clases fijas
  const handleSubmitClasesFijas = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await api.post("/clases/crear-fijas", formClasesFijas);
      toast.success("Clases fijas creadas correctamente");
      setShowClasesFijas(false);
      fetchClases();
    } catch (error) {
      if (error.response?.data?.errors) {
        toast.error("Error en la validación");
      } else {
        toast.error("Error al crear clases fijas");
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto mt-4">
      <ToastContainer position="top-right" />
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 mb-4 justify-between items-center">
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Buscar por nombre"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-1 pl-8 text-sm border border-gray-300 rounded-[8px] shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Search className="absolute left-2 top-2 h-5 w-5 text-gray-400" />
          <button
            onClick={handleSearch}
            className="flex items-center px-4 py-2 text-white bg-green-600 rounded-[6px] shadow hover:bg-green-700"
          >
            <Search className="w-5 h-5 mr-1" />
            Buscar
          </button>
          <button
            onClick={handleClearSearch}
            className="flex items-center px-4 py-2 text-white bg-red-500 rounded-[6px] shadow hover:bg-red-600"
          >
            Limpiar
          </button>
        </div>
        <button
          onClick={handleAddClase}
          className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-[6px] shadow transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Añadir Clase
        </button>
      </div>

      {/* Formulario */}
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-6 bg-white p-4 rounded-xl shadow"
        >
          <h2 className="text-xl font-bold mb-1">
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
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Horario
              </label>
              <select
                name="horario_id"
                value={formClase.horario_id}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.horario_id ? "border-red-500 text-red-500" : ""
                }`}
                required
                disabled={!formClase.fecha}
              >
                <option value="">Seleccionar horario</option>
                {horariosFiltrados.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.hora_inicio} - {h.hora_fin} 
                  </option>
                ))}
              </select>
              {validationErrors.horario_id && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.horario_id[0]}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Cancha
              </label>
              <select
                name="cancha_id"
                value={formClase.cancha_id}
                onChange={handleFormChange}
                className={`mt-1 block w-full px-2 py-1 border border-gray-300 rounded-[6px] shadow-sm ${
                  validationErrors.cancha_id ? "border-red-500 text-red-500" : ""
                }`}
                required
                disabled={!formClase.horario_id}
              >
                <option value="">Seleccionar cancha</option>
                {canchasDisponibles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nro ? `Cancha ${c.nro}` : c.nombre}
                  </option>
                ))}
              </select>
              {validationErrors.cancha_id && (
                <p className="text-red-500 text-sm mt-1">
                  {validationErrors.cancha_id[0]}
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
      )}

      {/* Botón para crear clases fijas */}
      <button
        onClick={() => setShowClasesFijas(true)}
        className="mb-4 inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-[6px] shadow transition-colors duration-200"
      >
        <Plus className="h-4 w-4 mr-2" />
        Crear Clases Fijas
      </button>

      {/* Modal para crear clases fijas */}
      {showClasesFijas && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white p-6 rounded-xl shadow-lg w-full max-w-lg overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-2">Crear Clases Fijas</h2>
            <form onSubmit={handleSubmitClasesFijas} className="space-y-3">
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
                <label className="block text-sm font-medium text-gray-700">Horario</label>
                <select
                  name="horario_id"
                  value={formClasesFijas.horario_id}
                  onChange={handleClasesFijasChange}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                  required
                >
                  <option value="">Seleccionar horario</option>
                  {horariosFiltrados.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.hora_inicio} - {h.hora_fin}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Cancha</label>
                <select
                  name="cancha_id"
                  value={formClasesFijas.cancha_id}
                  onChange={handleClasesFijasChange}
                  className="mt-1 block w-full px-2 py-1 border border-gray-300 rounded"
                  required
                >
                  <option value="">Seleccionar cancha</option>
                  {canchasDisponibles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.nro ? `Cancha ${c.nro}` : c.nombre}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
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
              <div>
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
              <div className="flex items-center mt-2">
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
              <div className="flex justify-end gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setShowClasesFijas(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  disabled={isSaving}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                  disabled={isSaving}
                >
                  {isSaving ? "Creando..." : "Crear Clases Fijas"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Lista de Clases */}
      {loading ? (
        <div className="flex justify-center items-center h-[40vh]">
          <BtnLoading />
        </div>
      ) : (
        <div>
          {clases.length === 0 ? (
            <div className="text-center text-gray-500 py-8">No hay clases registradas.</div>
          ) : (
            <ul className="space-y-6">
              {clases.map((clase) => (
                <li
                  key={clase.id}
                  className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-2"
                >
                  <div className="w-full justify-between flex items-center">               
                  <div className="flex items-center gap-3 mb-1">
                    <div className="bg-blue-100 rounded-full p-3">
                      <Users className="h-7 w-7 text-blue-600" />
                    </div>
                    <div className="flex flex-col">
                    <div className="flex items-center">
                    <span className="text-lg capitalize font-semibold text-gray-900">
                      {clase.nombre}
                    </span>
                    {clase.activa && (
                      <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
                        Activa
                      </span>
                    )}
                    </div>
                    
                  <div className="text-gray-600 text-sm mb-2">{clase.descripcion}</div>
                   </div>
                   </div>
                   <div className="flex gap-2 items-center">
                    <button
                      onClick={() => handleEditClase(clase)}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                      title="Editar"
                    >
                      <Edit2 className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleDeleteClase(clase)}
                      className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                      title="Eliminar"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                    <button
                      className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                      title="Ver detalles"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  </div>
                   </div>
                  <div className="grid grid-cols-1 mt-4 md:grid-cols-4 gap-2 text-sm mb-6">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="flex-col flex">
                        <span className=" text-gray-500">Fecha inicio:</span>{" "}
                        <span className="font-medium capitalize">{clase.fecha && format(parseISO(clase.fecha), "EEEE, dd/MM/yyyy", { locale: es })}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-400" />
                      <span className="flex-col flex">
                        {console.log(clase)}
                        <span className=" text-gray-500">Horario:</span>{" "}
                        <span className="font-medium">
                          {clase.horario?.hora_inicio} - {clase.horario?.hora_fin}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      <span className="flex-col flex">
                        <span className=" text-gray-500">Cancha:</span>{" "}
                        <span className="font-medium">
                          {clase.cancha?.nro ? `Cancha ${clase.cancha.nro}` : clase.cancha?.nombre}
                        </span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="flex-col flex">
                        <span className=" text-gray-500">Profesor:</span>{" "}
                        <span className="font-medium">{clase.profesor?.nombre}</span>
                      </span>
                    </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm mb-2">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-gray-400" />
                      <span className="flex-col flex">
                        <span className=" text-gray-500">Cupo máximo:</span>{" "}
                        <span className="font-medium">{clase.cupo_maximo}</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-gray-400" />
                      <span className="flex-col flex">
                        <span className=" text-gray-500">Precio mensual:</span>{" "}
                        <span className="font-medium">${clase.precio_mensual}</span>
                      </span>
                    </div>
                  </div>
                  
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-[8px] shadow-lg w-[90%] max-w-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4">
              Confirmar Eliminación
            </h2>
            <p className="text-gray-600 mb-2">
              ¿Estás seguro de que deseas eliminar la clase?
            </p>
            <div className="font-semibold mb-2 text-center text-gray-900 bg-gray-50 px-3 py-2 rounded-[8px] border">
              "{claseToDelete?.nombre}"
            </div>
            <p className="text-red-600">Esta acción no se puede deshacer.</p>
            <div className="flex mt-6 justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-3 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDeleteClase}
                disabled={isSaving}
                className={`px-3 py-2 capitalize text-white rounded ${
                  isSaving
                    ? "bg-red-400 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
              >
                {isSaving ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PestanaClases;