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

function NuevoTurnoAdmi() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    persona_id: '', // Cambiado de usuario_id a persona_id
    persona_nombre: '', // Cambiado de usuario_nombre a persona_nombre
    fecha_turno: '',
    cancha_id: '',
    horario_id: '',
    estado: 'Pendiente',
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
  
  // Estados para el modal de nueva persona
  const [showModal, setShowModal] = useState(false);
  const [newPersona, setNewPersona] = useState({
    name: '',
    dni: '',
    telefono: ''
  });

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
        persona.dni && persona.dni.includes(searchTerm.trim())
      );
      setFilteredPersonas(filtered);
    } else {
      setFilteredPersonas([]);
    }
  }, [searchTerm, personas]);

  // El resto de los useEffect para horarios y canchas sin cambios

  const handlePersonaSelect = (persona) => {
    setFormData(prev => ({
      ...prev,
      persona_id: persona.id,
      persona_nombre: persona.name,
    }));
    setSearchTerm(persona.dni);
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
      const response = await api.post('/personas', newPersona);
      
      // Verificar la estructura de respuesta correcta
      let newPersonaData;
      if (response.data && response.data.data) {
        // Si devuelve { data: {...} }
        newPersonaData = response.data.data;
      } else if (response.data && response.data.persona) {
        // Si devuelve { persona: {...} }
        newPersonaData = response.data.persona;
      } else if (response.data && !response.data.status) {
        // Si devuelve directamente el objeto
        newPersonaData = response.data;
      } else {
        console.error('Estructura de respuesta no reconocida:', response.data);
        toast.error('Error al procesar la respuesta del servidor');
        setLoading(false);
        return;
      }
      
      // Añadir la nueva persona a la lista
      setPersonas([...personas, newPersonaData]);
      
      // Seleccionar automáticamente la persona creada
      handlePersonaSelect(newPersonaData);
      
      toast.success('Persona creada correctamente');
      closeModal();
    } catch (error) {
      console.error('Error al crear persona:', error);
      toast.error(error.response?.data?.message || 'Error al crear persona');
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
    
    if (!formData.persona_id) {  // Cambiado de usuario_id a persona_id
      toast.error('No se ha seleccionado una persona válida');
      return;
    }

    setLoading(true);
    try {
      const disponibilidadEndpoint = isTurnoFijo ? '/disponibilidad/turnos-fijos' : '/disponibilidad/fecha';
      const params = isTurnoFijo ? { fecha_inicio: formData.fecha_turno } : { fecha: formData.fecha_turno };
      const disponibilidadResponse = await api.get(disponibilidadEndpoint, { params });

      const canchaDisponible = disponibilidadResponse.data.horarios.some(
        horario => horario.id === parseInt(formData.horario_id) && horario.disponible
      );

      if (!canchaDisponible) {
        toast.error('La cancha no está disponible en ese horario');
        setLoading(false);
        return;
      }

      // Crear el objeto con los datos del turno - cambiado usuario_id a persona_id
      const turnoData = {
        persona_id: parseInt(formData.persona_id),
        fecha_turno: formData.fecha_turno,
        horario_id: parseInt(formData.horario_id),
        cancha_id: parseInt(formData.cancha_id),
        estado: formData.estado
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

              <div>
                <label className="block text-sm font-medium">Fecha</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={formData.fecha_turno}
                  onChange={handleFechaChange}
                />
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
                    disabled={!formData.fecha_turno || horarios.length === 0 || fetchingHorarios || fetchingCanchas}
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
              className="w-full bg-black text-white py-2 rounded hover:bg-black"
              disabled={loading || !formData.persona_id}
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
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">DNI</label>
                <input
                  type="text"
                  name="dni"
                  value={newPersona.dni}
                  onChange={handleNewPersonaChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={newPersona.telefono}
                  onChange={handleNewPersonaChange}
                  className="w-full border rounded p-2"
                  required
                />
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