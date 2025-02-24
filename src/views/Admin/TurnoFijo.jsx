import React, { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';

const CreateFixedReservation = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    usuario_id: '', 
    usuario_nombre: '',
    fecha_inicio: '', 
    cancha_id: '',
    horario_id: '',
    estado: 'Pendiente',
  });
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [error, setError] = useState(null);
  const [horarios, setHorarios] = useState([]);
  const [canchas, setCanchas] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const response = await api.get('/usuarios');
        const validUsers = response.data.usuarios.filter(user => user.dni);
        setUsers(validUsers);
      } catch (error) {
        console.error('Error al cargar usuarios:', error);
        setError('Error al cargar usuarios');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  useEffect(() => {
    if (searchTerm.trim()) {
      const filtered = users.filter(user =>
        user.dni && user.dni.includes(searchTerm.trim())
      );
      setFilteredUsers(filtered);
    } else {
      setFilteredUsers([]);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    if (formData.fecha_inicio) {
      const fetchHorarios = async () => {
        try {
          const response = await api.get(`/disponibilidad/turnos-fijos`, {
            params: {
              fecha_inicio: formData.fecha_inicio,
            }
          });

          // Debug logs
          console.log('Response horarios:', response.data);
          
          // Make sure we're using the correct data structure
          if (response.data.horarios && Array.isArray(response.data.horarios)) {
            const horariosDisponibles = response.data.horarios.filter(
              horario => horario.disponible
            );
            setHorarios(horariosDisponibles);
          } else {
            setHorarios([]);
            setError('No se encontraron horarios disponibles');
          }
        } catch (error) {
          console.error('Error al cargar horarios:', error);
          setHorarios([]);
          setError(error.response?.data?.message || 'Error al cargar horarios');
        }
      };

      fetchHorarios();
    } else {
      setHorarios([]);
    }
  }, [formData.fecha_inicio]);

  useEffect(() => {
    if (formData.fecha_inicio && formData.horario_id) { 
      const fetchCanchas = async () => {
        try {
          const response = await api.get(`/disponibilidad/cancha?fecha=${formData.fecha_inicio}&horario_id=${formData.horario_id}`);
          setCanchas(response.data.canchas);
        } catch (error) {
          console.error('Error al cargar canchas:', error);
          setError('Error al cargar canchas');
        }
      };

      fetchCanchas();
    }
  }, [formData.fecha_inicio, formData.horario_id]);

  const handleUserSelect = (user) => {
    setFormData(prev => ({
      ...prev,
      usuario_id: user.id,
      usuario_nombre: user.nombre,
    }));
    setSearchTerm(user.dni);
  };

  const handleFechaChange = (e) => {
    setError(null); // Limpiar errores
    setFormData({ 
      ...formData, 
      fecha_inicio: e.target.value,
      horario_id: '', // Reset horario
      cancha_id: '' // Reset cancha
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.usuario_id) {
      toast.error('No se ha seleccionado un usuario válido');
      return;
    }

    setLoading(true);
    try {
      // Verificar disponibilidad
      const disponibilidadResponse = await api.get('/disponibilidad/turnos-fijos', {
        params: {
          fecha_inicio: formData.fecha_inicio,
          horario_id: formData.horario_id,
          cancha_id: formData.cancha_id
        }
      });

      const canchaDisponible = disponibilidadResponse.data.horarios.some(
        horario => horario.id === parseInt(formData.horario_id) && horario.disponible
      );

      if (!canchaDisponible) {
        toast.error('La cancha no está disponible para turnos fijos en ese horario');
        setLoading(false);
        return;
      }

      // Crear el objeto con los datos del turno fijo
      const turnoFijoData = {
        user_id: parseInt(formData.usuario_id), // Cambiado de usuario_id a user_id
        fecha_inicio: formData.fecha_inicio,
        horario_id: parseInt(formData.horario_id),
        cancha_id: parseInt(formData.cancha_id),
        estado: formData.estado
      };

      console.log('Datos a enviar:', turnoFijoData); // Para debug

      const response = await api.post('/turnos/turnofijo', turnoFijoData);
      if (response.status === 201) {
        toast.success('Turnos fijos creados correctamente');
        navigate('/ver-turnos');
      }
    } catch (error) {
      console.error('Error details:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error al crear los turnos fijos');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="bg-white shadow rounded-lg p-6 w-full max-w-2xl">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Calendar className="w-5 h-5" /> Crear Turnos Fijos
          </h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium">Buscar Usuario por DNI</label>
                <input
                  type="text"
                  className="w-full border rounded p-2"
                  placeholder="Buscar usuario..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  disabled={loading}
                />
                {filteredUsers.length > 0 ? (
                  <div className="bg-white border rounded mt-2 max-h-40 overflow-auto">
                    {filteredUsers.map(user => (
                      <div
                        key={user.id}
                        className="p-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleUserSelect(user)}
                      >
                        <div className="flex flex-col">
                          <span className="font-medium">{user.name}</span>
                          <span className="text-sm text-gray-600">DNI: {user.dni}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  searchTerm && (
                    <div className="bg-white border rounded mt-2 p-2 text-gray-500">
                      Usuario no encontrado
                    </div>
                  )
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Fecha Inicio</label>
                <input
                  type="date"
                  className="w-full border rounded p-2"
                  value={formData.fecha_inicio}
                  onChange={handleFechaChange}
                />
              </div>

              <div>
                <label className="block text-sm font-medium">Horario</label>
                <select
                  className={`w-full border rounded p-2 ${
                    formData.fecha_inicio && horarios.length === 0 
                      ? 'border-red-500 bg-red-50 cursor-not-allowed' 
                      : 'border-gray-300'
                  }`}
                  value={formData.horario_id}
                  onChange={(e) => setFormData({ ...formData, horario_id: e.target.value, cancha_id: '' })} // Reset cancha on horario change
                  disabled={!formData.fecha_inicio || horarios.length === 0}
                >
                  <option value="">
                    {formData.fecha_inicio && horarios.length === 0 
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
                {formData.fecha_inicio && horarios.length === 0 && (
                  <p className="text-red-500 text-sm mt-1">
                    No hay horarios disponibles para esta fecha
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium">Cancha</label>
                <select
                  className={`w-full border rounded p-2 ${
                    (formData.horario_id && canchas.length === 0) || (formData.fecha_inicio && horarios.length === 0 )
                      ? 'border-red-500 bg-red-50 cursor-not-allowed'
                      : 'border-gray-300'
                  }`}
                  value={formData.cancha_id}
                  onChange={(e) => setFormData({ ...formData, cancha_id: e.target.value })}
                  disabled={!formData.horario_id || canchas.length === 0}
                >
                  <option value="">
                    {formData.horario_id && canchas.length === 0
                      ? 'No hay canchas disponibles'
                      : 'Seleccionar cancha'
                    }
                  </option>
                  {canchas.map(cancha => (
                    <option
                      key={cancha.id}
                      value={cancha.id}
                      style={{ color: !cancha.disponible ? 'red' : 'inherit' }}
                    >{`Cancha ${cancha.nro} - ${cancha.tipo}`}</option>
                  ))}
                </select>
                {formData.horario_id && canchas.length === 0 && (
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
            </div>

            <button
              type="submit"
              className="w-full bg-orange-500 text-white py-2 rounded hover:bg-orange-600"
              disabled={loading || !formData.usuario_id}
            >
              {loading ? 'Cargando...' : 'Crear Turnos Fijos'}
            </button>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CreateFixedReservation;