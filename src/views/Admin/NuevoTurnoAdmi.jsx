import React, { useState, useEffect } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useDeportes } from '@/context/DeportesContext'; // Importa el contexto

function NuevoTurnoAdmi() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    persona_id: '', // Cambiado de usuario_id a persona_id
    persona_nombre: '', // Cambiado de usuario_nombre a persona_nombre
    fecha_turno: '',
    cancha_id: '',
    horario_id: '',
    estado: 'Pendiente',
    deporte_id: '', // Agregado deporte_id
  });
  
  // Cambiado de users a personas
  const [personas, setPersonas] = useState([]);
  const [filteredPersonas, setFilteredPersonas] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const [fetchingHorarios, setFetchingHorarios] = useState(false);
  const [fetchingCanchas, setFetchingCanchas] = useState(false);
  const navigate = useNavigate();
  const [isTurnoFijo, setIsTurnoFijo] = useState(false);

  // Usa el contexto de deportes
  const { deportes } = useDeportes();

  // Elimina estos estados y la función fetchDeportes:
  // const [deportes, setDeportes] = useState([]);
  // const [loadingDeportes, setLoadingDeportes] = useState(false);
  
  // Estados para el modal de nueva persona
  const [showModal, setShowModal] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: '',
    dni: '',
    telefono: ''
  });
  // Agregar estado para errores de validación
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        setLoading(true);
        const response = await api.get('/personas');
        
        // La estructura correcta es response.data.data
        if (response.data && Array.isArray(response.data.data)) {
          const validPersonas = response.data.data.filter(persona => persona.dni);
          setPersonas(validPersonas);
        } else {
          setPersonas([]);
          console.error('Estructura de respuesta inesperada:', response.data);
        }
      } catch (error) {
        console.error('Error al cargar personas:', error);
        setError('Error al cargar personas');
      } finally {
        setLoading(false);
      }
    };

    fetchPersonas();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = personas.filter(persona =>
        persona.dni && persona.dni.includes(searchTerm.trim()) || persona.name && persona.name.includes(searchTerm.trim())
      );
      setFilteredPersonas(filtered);
    } else {
      setFilteredPersonas([]);
    }
  }, [searchTerm, personas]);

  // useEffect para cargar los horarios cuando cambia la fecha
  useEffect(() => {
    const fetchHorarios = async () => {
      if (!formData.fecha_turno || !formData.deporte_id) return;
      
      setFetchingHorarios(true);
      setHorarios([]);
      setCanchas([]);
      setFormData(prev => ({
        ...prev,
        horario_id: '',
        cancha_id: ''
      }));
      
      try {
        const endpoint = isTurnoFijo ? '/disponibilidad/turnos-fijos' : '/disponibilidad/fecha';
        const params = isTurnoFijo 
          ? { fecha_inicio: formData.fecha_turno, deporte_id: formData.deporte_id } 
          : { fecha: formData.fecha_turno, deporte_id: formData.deporte_id };
        
        const response = await api.get(endpoint, { params });
        
        if (response.data && response.data.horarios) {
          // Filtrar solo horarios disponibles
          const horariosDisponibles = response.data.horarios.filter(h => h.disponible);
          setHorarios(horariosDisponibles);
          
          if (horariosDisponibles.length === 0) {
            setError('No hay horarios disponibles para la fecha seleccionada');
          } else {
            setError(null);
          }
        } else {
          setError('Error al cargar horarios disponibles');
        }
      } catch (error) {
        console.error('Error al cargar horarios:', error);
        setError('Error al cargar horarios disponibles');
      } finally {
        setFetchingHorarios(false);
      }
    };

    if (formData.fecha_turno && formData.deporte_id) {
      fetchHorarios();
    }
  }, [formData.fecha_turno, formData.deporte_id, isTurnoFijo]);

  // useEffect para cargar canchas cuando cambia el horario
  useEffect(() => {
    const fetchCanchas = async () => {
      if (!formData.fecha_turno || !formData.horario_id || !formData.deporte_id) return;
      
      // En caso de turno fijo, no necesitamos cargar canchas específicas
      if (isTurnoFijo) return;
      
      setFetchingCanchas(true);
      setCanchas([]);
      setFormData(prev => ({
        ...prev,
        cancha_id: ''
      }));
      
      try {
        const response = await api.get('/disponibilidad/cancha', {
          params: {
            fecha: formData.fecha_turno,
            horario_id: formData.horario_id,
            deporte_id: formData.deporte_id
          }
        });
        
        if (response.data && response.data.canchas) {
          setCanchas(response.data.canchas);
        } else {
          console.error('Estructura de respuesta inesperada:', response.data);
        }
      } catch (error) {
        console.error('Error al cargar canchas:', error);
        setError('Error al cargar canchas disponibles');
      } finally {
        setFetchingCanchas(false);
      }
    };

    if (formData.horario_id) {
      fetchCanchas();
    }
  }, [formData.horario_id, formData.fecha_turno, formData.deporte_id, isTurnoFijo]);

  // Función para verificar si el formulario es válido
  const isFormValid = () => {
    if (!formData.persona_id || !formData.fecha_turno || !formData.horario_id || !formData.deporte_id) {
      return false;
    }
    
    // Para turno fijo no necesitamos cancha_id
    if (!isTurnoFijo && !formData.cancha_id) {
      return false;
    }
    
    return true;
  };

  const handlePersonaSelect = (persona) => {
    setFormData(prev => ({
      ...prev,
      persona_id: persona.id,
      persona_nombre: persona.name,
    }));
    setSearchTerm(persona.dni);
  };

  // Función para manejar el cambio de deporte
  const handleDeporteChange = (e) => {
    setError(null);
    setFormData({
      ...formData,
      deporte_id: e.target.value,
      fecha_turno: '',
      horario_id: '',
      cancha_id: ''
    });
    setHorarios([]);
    setCanchas([]);
  };

  // Función para abrir el modal
  const openModal = () => {
    setShowModal(true);
    setNewPersona({
      name: '',
      dni: '',
      telefono: ''
    });
  };

  // Función para cerrar el modal
  const closeModal = () => {
    setShowModal(false);
  };

  // Manejar cambios en el formulario de nueva persona
  const handleNewPersonaChange = (e) => {
    // Limpiar el error del campo que se está editando
    setValidationErrors({
      ...validationErrors,
      [e.target.name]: null
    });
    
    setNewPersona({
      ...newPersona,
      [e.target.name]: e.target.value
    });
  };

  // Crear nueva persona
  const handleCreatePersona = async (e) => {
    e.preventDefault();
    
    if (!newPersona.name || !newPersona.dni || !newPersona.telefono) {
      toast.error('Todos los campos son requeridos');
      return;
    }
    
    try {
      setLoading(true);
      // Limpiar errores de validación previos
      setValidationErrors({});
      
      const response = await api.post('/personas', newPersona);
      
      // Verificar si la respuesta contiene errores de validación
      if (response.data.status === 400 || (response.data.errors && response.data.message === "Error de validación")) {
        // Manejar errores de validación dentro del bloque try
        console.error('Error de validación:', response.data);
        setValidationErrors(response.data.errors || {});
        
        if (response.data.message) {
          toast.error(response.data.message);
        }
        
        return; // Detener ejecución
      }
      
      // La respuesta exitosa siempre tiene la estructura { persona: {...} }
      if (response.data && response.data.persona) {
        // Añadir la nueva persona a la lista
        setPersonas([...personas, response.data.persona]);
        
        // Seleccionar automáticamente la persona creada
        handlePersonaSelect(response.data.persona);
        
        toast.success('Persona creada correctamente');
        closeModal();
      } else {
        console.error('Estructura de respuesta inesperada:', response.data);
        toast.error('Error al procesar la respuesta del servidor');
      }
    } catch (error) {
      console.error('Error al crear persona:', error);
      
      // Manejar errores de validación (por si acaso entra en el catch)
      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
        
        // Mostrar un toast con el mensaje general de error
        if (error.response.data.message) {
          toast.error(error.response.data.message);
        }
      } else {
        toast.error(error.response?.data?.message || 'Error al crear persona');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFechaChange = (e) => {
    setError(null);
    setFormData({ 
      ...formData, 
      fecha_turno: e.target.value,
      horario_id: '',
      cancha_id: ''
    });
  };

  const handleToggleChange = () => {
    setIsTurnoFijo(!isTurnoFijo);
    setFormData({
      ...formData,
      fecha_turno: '',
      horario_id: '',
      cancha_id: ''
    });
    setHorarios([]);
    setCanchas([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isFormValid()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }
    
    if (!formData.persona_id) {
      toast.error('No se ha seleccionado una persona válida');
      return;
    }

    setLoading(true);
    try {
      const disponibilidadEndpoint = isTurnoFijo ? '/disponibilidad/turnos-fijos' : '/disponibilidad/fecha';
      const params = isTurnoFijo 
        ? { fecha_inicio: formData.fecha_turno, deporte_id: formData.deporte_id } 
        : { fecha: formData.fecha_turno, deporte_id: formData.deporte_id };
        
      const disponibilidadResponse = await api.get(disponibilidadEndpoint, { params });

      const canchaDisponible = disponibilidadResponse.data.horarios.some(
        horario => horario.id === parseInt(formData.horario_id) && horario.disponible
      );

      if (!canchaDisponible) {
        toast.error('La cancha no está disponible en ese horario');
        setLoading(false);
        return;
      }

      // Crear el objeto con los datos del turno
      const turnoData = {
        persona_id: parseInt(formData.persona_id),
        fecha_turno: formData.fecha_turno,
        horario_id: parseInt(formData.horario_id),
        cancha_id: parseInt(formData.cancha_id),
        estado: formData.estado,
        deporte_id: parseInt(formData.deporte_id)
      };

      const storeEndpoint = isTurnoFijo ? '/turnos/turnofijo' : '/turnos/turnounico';
      const response = await api.post(storeEndpoint, turnoData);
      if (response.status === 201) {
        toast.success(`Turno ${isTurnoFijo ? 'fijo' : 'único'} creado correctamente`);
        navigate('/panel-admin?tab=turnos');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al crear el turno');
    } finally {
      setLoading(false);
    }
  };

  const formatDeporteName = (deporte) => {
    if (deporte.nombre.toLowerCase().includes("futbol") || deporte.nombre.toLowerCase().includes("fútbol")) {
      return `${deporte.nombre} ${deporte.jugadores_por_equipo}`
    }
    return deporte.nombre
  }
          
  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <ToastContainer position="top-right" />
      <div className="flex items-center px-4 py-2">
        <Button 
          onClick={() => navigate('/panel-admin?tab=turnos')} 
          variant="ghost" 
          className="flex items-center gap-2 hover:bg-naranja hover:text-white rounded-xl"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>Volver a Turnos</span>
        </Button>
      </div>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Crear Nuevo Turno
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
            <label className="flex items-center gap-2">
              <span className="text-sm">Turno Fijo</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={isTurnoFijo}
                onChange={handleToggleChange}
              />
            </label>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Buscar Persona por DNI</label>
                <div className="flex">
                  <input
                    type="text"
                    className="w-full border rounded-l p-2"
                    placeholder="Buscar persona..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={openModal}
                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-r flex items-center justify-center"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
                {filteredPersonas.length > 0 ? (
                  <div className="bg-white border rounded mt-2 max-h-40 overflow-auto">
                    {filteredPersonas.map(persona => (
                      <div
                        key={persona.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handlePersonaSelect(persona)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{persona.name}</span>
                          <span className="text-sm text-gray-600">DNI: {persona.dni}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  searchTerm && (
                    <div className="bg-white border rounded mt-2 p-2 text-gray-500">
                      Persona no encontrada
                    </div>
                  )
                )}
              </div>

              {/* Selector de deportes */}
              <div>
                <label className="block text-sm font-medium">Deporte</label>
                <select
                  className="w-full border rounded p-2 border-gray-300"
                  value={formData.deporte_id}
                  onChange={handleDeporteChange}
                >
                  <option value="">Seleccionar deporte</option>
                  {deportes.map(deporte => (
                    <option key={deporte.id} value={deporte.id}>
                      {formatDeporteName(deporte)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={formData.fecha_turno}
                  onChange={handleFechaChange}
                  disabled={!formData.deporte_id}
                />
                {!formData.deporte_id && (
                  <p className="text-red-500 text-sm mt-1">
                    Primero seleccione un deporte
                  </p>
                )}
              </div>

              {/* El resto de los campos (horario, cancha, estado) sin cambios */}
              <div>
                <label className="block text-sm font-medium">Horario</label>
                {fetchingHorarios ? (
                  <div className="w-full border rounded p-2 border-gray-300 bg-gray-50 cursor-not-allowed text-gray-500">
                    Horarios cargando...
                  </div>
                ) : (
                  <select
                    className={`w-full border rounded p-2 ${
                      formData.fecha_turno && horarios.length === 0 && !fetchingHorarios
                        ? 'border-red-500 bg-red-50 cursor-not-allowed' 
                        : 'border-gray-300'
                    }`}
                    value={formData.horario_id}
                    onChange={(e) => setFormData({ ...formData, horario_id: e.target.value, cancha_id: '' })}
                    disabled={!formData.fecha_turno || horarios.length === 0 || fetchingHorarios || fetchingCanchas || !formData.deporte_id}
                  >
                    <option value="">
                      {formData.fecha_turno && horarios.length === 0 
                        ? 'No hay horarios disponibles' 
                        : 'Seleccionar horario'
                      }
                    </option>
                    {horarios.map(horario => (
                      <option key={horario.id} value={horario.id}>
                        {`${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`}
                      </option>
                    ))}
                  </select>
                )}
                {formData.fecha_turno && horarios.length === 0 && !fetchingHorarios && (
                  <p className="text-red-500 text-sm mt-1">
                    No hay horarios disponibles para esta fecha
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Cancha</label>
                {fetchingCanchas ? (
                  <div className="w-full border rounded p-2 border-gray-300 bg-gray-50 cursor-not-allowed text-gray-500">
                    Canchas cargando...
                  </div>
                ) : (
                  <select
                    className={`w-full border rounded p-2 ${
                      !isTurnoFijo && formData.horario_id && canchas.length === 0 && !fetchingCanchas
                        ? 'border-red-500 bg-red-50 cursor-not-allowed'
                        : 'border-gray-300'
                    } ${isTurnoFijo ? 'opacity-50 cursor-not-allowed' : ''}`}
                    value={formData.cancha_id}
                    onChange={(e) => setFormData({ ...formData, cancha_id: e.target.value })}
                    disabled={!formData.horario_id || canchas.length === 0 || fetchingHorarios || fetchingCanchas || isTurnoFijo}
                  >
                    <option value="">
                      {isTurnoFijo
                        ? 'Las canchas se seleccionarán automáticamente'
                        : formData.horario_id && canchas.length === 0 && !fetchingCanchas
                        ? 'No hay canchas disponibles'
                        : 'Seleccionar cancha'
                      }
                    </option>
                    {!isTurnoFijo && canchas.filter(cancha => cancha.disponible).map(cancha => (
                      <option
                        key={cancha.id}
                        value={cancha.id}
                      >{`Cancha ${cancha.nro} - ${cancha.tipo}`}</option>
                    ))}
                  </select>
                )}
                {!isTurnoFijo && formData.horario_id && canchas.length === 0 && !fetchingCanchas && (
                  <p className="text-red-500 text-sm mt-1">
                    No hay canchas disponibles para este horario
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Estado</label>
                <select
                  className="w-full border rounded p-2"
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                >
                  <option value="Pendiente">Pendiente</option>
                  <option value="Señado">Señado</option>
                  <option value="Pagado">Pagado</option>
                </select>
              </div>

              <div className="flex flex-col justify-center">
                {formData.cancha_id && (
                  <div className="border rounded p-2 border-gray-300 bg-gray-50 text-gray-600">
                    <p>Precio por Hora: ${canchas.find(cancha => cancha.id === parseInt(formData.cancha_id))?.precio_por_hora}</p>
                    <p>Seña: ${canchas.find(cancha => cancha.id === parseInt(formData.cancha_id))?.seña}</p>
                  </div>
                )}
              </div>
            </div>

            <button
              type="submit"
              className={`w-full py-2 rounded ${
                !isFormValid()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-black hover:bg-black text-white'
              }`}
              disabled={loading || !isFormValid()}
            >
              {loading ? 'Cargando...' : 'Crear Turno'}
            </button>
          </form>
        </div>
      </main>
      <Footer />

      {/* Modal para crear nueva persona */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Crear Nueva Persona</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreatePersona} className="space-y-4">
              <div>
                <label className="block text-sm font-medium">Nombre</label>
                <input
                  type="text"
                  name="name"
                  value={newPersona.name}
                  onChange={handleNewPersonaChange}
                  className={`w-full border rounded p-2 ${
                    validationErrors.name ? 'border-red-500 text-red-500' : ''
                  }`}
                  required
                />
                {validationErrors.name && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.name[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">DNI</label>
                <input
                  type="text"
                  name="dni"
                  value={newPersona.dni}
                  onChange={handleNewPersonaChange}
                  className={`w-full border rounded p-2 ${
                    validationErrors.dni ? 'border-red-500 text-red-500' : ''
                  }`}
                  required
                />
                {validationErrors.dni && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.dni[0]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={newPersona.telefono}
                  onChange={handleNewPersonaChange}
                  className={`w-full border rounded p-2 ${
                    validationErrors.telefono ? 'border-red-500 text-red-500' : ''
                  }`}
                  required
                />
                {validationErrors.telefono && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.telefono[0]}</p>
                )}
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                  disabled={loading}
                >
                  {loading ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default NuevoTurnoAdmi;