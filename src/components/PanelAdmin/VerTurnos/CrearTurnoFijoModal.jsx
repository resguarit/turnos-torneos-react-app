import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "react-toastify";
import api from '@/lib/axiosConfig';
import { formatearRangoHorario } from '@/utils/dateUtils';

const CrearTurnoFijoModal = ({ isOpen, onClose, courts, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [searchType, setSearchType] = useState('dni');
  const [searchTerm, setSearchTerm] = useState('');
  const [userFound, setUserFound] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [newUserData, setNewUserData] = useState({
    name: '',
    email: '',
    dni: '',
    telefono: '',
    password: 'RockAndGol2024',
    password_confirmation: 'RockAndGol2024',
    rol: 'cliente' // Añadido el campo rol
  });
  
  const [formData, setFormData] = useState({
    fecha_turno: '',
    cancha_id: '',
    horario_id: '',
    estado: 'Pendiente'
  });

  // Obtener horarios disponibles cuando se selecciona una fecha
  useEffect(() => {
    const fetchHorarios = async () => {
      if (formData.fecha_turno) {
        try {
          const response = await api.get(`/disponibilidad/fecha?fecha=${formData.fecha_turno}`);
          setHorarios(response.data.horarios);
        } catch (error) {
          console.error('Error al cargar horarios:', error);
          toast.error('Error al cargar los horarios disponibles');
        }
      }
    };

    fetchHorarios();
  }, [formData.fecha_turno]);

  const resetForm = () => {
    setStep(1);
    setSearchType('dni');
    setSearchTerm('');
    setUserFound(null);
    setHorarios([]);
    setLoading(false);
    setNewUserData({
      name: '',
      email: '',
      dni: '',
      telefono: '',
      password: 'RockAndGol2024',
      password_confirmation: 'RockAndGol2024',
      rol: 'cliente' // Añadido el campo rol
    });
    setFormData({
      fecha_turno: '',
      cancha_id: '',
      horario_id: '',
      estado: 'Pendiente'
    });
  };

  const searchUser = async () => {
    try {
      const response = await api.get(`/usuarios?searchType=${searchType}&searchTerm=${searchTerm}`);
      if (response.data.usuarios.length > 0) {
        setUserFound(response.data.usuarios[0]);
        console.log(response.data.usuarios[0]);
        setStep(2);
      } else {
        setNewUserData(prev => ({
          ...prev,
          [searchType]: searchTerm
        }));
        setStep(3);
      }
    } catch (error) {
      toast.error('Error al buscar usuario');
    }
  };

  const createUser = async () => {
    try {
      const response = await api.post('/create-user', newUserData);
      if (response.status === 201) {
        setUserFound(response.data.user);
        setStep(2);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error al crear usuario');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!userFound || !userFound.id) {
      toast.error('No se ha seleccionado un usuario válido');
      return;
    }

    setLoading(true);
    try {
      // Verificar disponibilidad
      const disponibilidadResponse = await api.get(
        `/disponibilidad/cancha?fecha=${formData.fecha_turno}&horario_id=${formData.horario_id}`
      );

      const canchaDisponible = disponibilidadResponse.data.canchas.some(
        cancha => cancha.id === parseInt(formData.cancha_id) && cancha.disponible
      );

      if (!canchaDisponible) {
        toast.error('La cancha no está disponible en ese horario');
        setLoading(false);
        return;
      }

      const turnoData = {
        ...formData,
        user_id: userFound.id,
        estado: 'Pendiente'
      };
      
      const response = await api.post('/turnos/turnofijo', turnoData);
      if (response.status === 201) {
        toast.success('Turnos fijos creados correctamente');
        onSuccess();
        onClose();
        resetForm(); // Reset form after successful submission
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al crear los turnos fijos');
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Buscar por</label>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value)}
                className="w-full text-sm p-1 border rounded-[8px] "
              >
                <option value="dni">DNI</option>
                <option value="email">Email</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">
                {searchType === 'dni' ? 'DNI' : 'Email'} del usuario
              </label>
              <input
                type={searchType === 'email' ? 'email' : 'text'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full p-1 text-sm border rounded-[8px]"
              />
            </div>
            <button
              type="button"
              onClick={searchUser}
              className="w-full p-1 bg-naranja text-white rounded-[8px] hover:bg-naranja/90"
            >
              Buscar Usuario
            </button>
          </div>
        );

      case 2:
        return (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="bg-gray-100 p-3 text-sm rounded-[8px]">
              <p className="font-medium">Usuario seleccionado:</p>
              <p>{userFound.name}</p>
              <p>{userFound.email}</p>
              <p>DNI: {userFound.dni}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Fecha Inicial</label>
              <input
                type="date"
                value={formData.fecha_turno}
                onChange={(e) => setFormData({...formData, fecha_turno: e.target.value})}
                className="w-full p-1 text-sm border rounded-[8px]"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Horario</label>
              <select
                value={formData.horario_id}
                onChange={(e) => setFormData({...formData, horario_id: e.target.value})}
                className="w-full p-1 text-sm border rounded-[8px]"
                required
                disabled={!formData.fecha_turno}
              >
                <option value="">Seleccionar horario</option>
                {horarios.map(horario => (
                  <option key={horario.id} value={horario.id}>
                    {`${horario.hora_inicio.slice(0, 5)} - ${horario.hora_fin.slice(0, 5)}`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Cancha</label>
              <select
                value={formData.cancha_id}
                onChange={(e) => setFormData({...formData, cancha_id: e.target.value})}
                className="w-full p-1 text-sm border rounded-[8px]"
                required
                disabled={!formData.horario_id}
              >
                <option value="">Seleccione una cancha</option>
                {courts.map(court => (
                  <option key={court.id} value={court.id}>
                    Cancha {court.nro} - {court.tipo_cancha}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded-md"
                disabled={loading}
              >
                Volver
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90"
                disabled={loading}
              >
                {loading ? 'Creando...' : 'Crear Turnos Fijos'}
              </button>
            </div>
          </form>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm">Usuario no encontrado. Complete los datos para crear uno nuevo:</p>
            <div>
              <label className="text-sm font-medium">Nombre completo</label>
              <input
                type="text"
                value={newUserData.name}
                onChange={(e) => setNewUserData({...newUserData, name: e.target.value})}
                className="w-full p-2 border rounded-md mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <input
                type="email"
                value={newUserData.email}
                onChange={(e) => setNewUserData({...newUserData, email: e.target.value})}
                className="w-full p-2 border rounded-md mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">DNI</label>
              <input
                type="text"
                value={newUserData.dni}
                onChange={(e) => setNewUserData({...newUserData, dni: e.target.value})}
                className="w-full p-2 border rounded-md mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Teléfono</label>
              <input
                type="tel"
                value={newUserData.telefono}
                onChange={(e) => setNewUserData({...newUserData, telefono: e.target.value})}
                className="w-full p-2 border rounded-md mt-1"
                required
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 border rounded-md"
              >
                Volver
              </button>
              <button
                type="button"
                onClick={createUser}
                className="px-4 py-2 bg-naranja text-white rounded-md hover:bg-naranja/90"
              >
                Crear Usuario
              </button>
            </div>
          </div>
        );
    }
  };

  return (
    <div open={isOpen} onOpenChange={() => { onClose(); resetForm(); }} className="fixed inset-0 z-50 flex items-center justify-center agregale un fondo del tamanio de pantalla bg-black/50">
      <div className="bg-white rounded-[8px] shadow-lg p-6 w-full mx-4 sm:mx-0 sm:w-1/2 md:w-1/3">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Crear Turno Fijo</h2>
        </div>
        {renderStep()}
      </div>
    </div>
  );
};

export default CrearTurnoFijoModal;