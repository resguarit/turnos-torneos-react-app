import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ConfirmarTurno() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    telefono: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [reservationDetails, setReservationDetails] = useState({
    horario: null,
    cancha: null
  });
  
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedTime = queryParams.get("time");
  const selectedDate = queryParams.get("date");
  const selectedCourt = queryParams.get("court");

  // Obtener detalles del horario y la cancha
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        // Obtener detalles del horario
        const horarioResponse = await api.get(`/horarios/${selectedTime}`);
        // Obtener detalles de la cancha
        const canchaResponse = await api.get(`/canchas/${selectedCourt}`);
        
        setReservationDetails({
          horario: horarioResponse.data.horario,
          cancha: canchaResponse.data.cancha
        });
      } catch (error) {
        console.error('Error fetching details:', error);
      }
    };

    if (selectedTime && selectedCourt) {
      fetchDetails();
    }
  }, [selectedTime, selectedCourt]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.email) newErrors.email = 'El email es requerido';
    if (!formData.telefono) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Register user
        const registerResponse = await api.post('/register', {
          name: formData.name,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });

        if (registerResponse.status === 201) {
          // Login after registration
          const loginResponse = await api.post('/login', {
            email: formData.email,
            password: formData.password
          });

          if (loginResponse.data.token) {
            // Store user data
            localStorage.setItem('user_id', loginResponse.data.user_id);
            localStorage.setItem('username', loginResponse.data.username);
            localStorage.setItem('token', loginResponse.data.token);

            // Set Authorization header
            api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;

            // Create reservation
            const reservationResponse = await api.post('/turnos/turnounico', {
              fecha_turno: selectedDate,
              cancha_id: selectedCourt,
              horario_id: selectedTime,
              estado: 'Pendiente'
            });

            if (reservationResponse.status === 201) {
              console.log("Reserva creada:", reservationResponse.data);
              navigate('/calendario-admi');
            }
          }
        }
      } catch (error) {
        console.error('Error completo:', error);
        setErrors({
          form: error.response?.data?.message || 'Error al procesar la solicitud'
        });
      }
    }
  };

  const navigateToLogin = () => {
    navigate(`/confirmar-login?time=${selectedTime}&date=${selectedDate}&court=${selectedCourt}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-gray-100 font-inter">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <h1 className="text-4xl font-semibold mb-2">Registro para Confirmar Reserva</h1>
        <p className="text-xl text-gray-600 mb-8">
          Complete sus datos para confirmar la reserva. Si ya tiene una cuenta, puede iniciar sesión.
        </p>
        <Card className="max-w-5xl mx-auto border-0">
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1">
                  <Label htmlFor="name" className="text-xl font-semibold">Nombre completo</Label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 p-2 rounded-xl ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="email" className="text-xl font-semibold">Email</Label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 p-2 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="telefono" className="text-xl font-semibold">Teléfono</Label>
                  <input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 p-2 rounded-xl ${errors.telefono ? 'border-red-500' : ''}`}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-red-500">{errors.telefono}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password" className="text-xl font-semibold">Contraseña</Label>
                  <input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 p-2 rounded-xl ${errors.password ? 'border-red-500' : ''}`}
                  />
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <Label htmlFor="password_confirmation" className="text-xl font-semibold">Confirmar Contraseña</Label>
                  <input
                    id="password_confirmation"
                    type="password"
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 p-2 rounded-xl ${errors.password_confirmation ? 'border-red-500' : ''}`}
                  />
                  {errors.password_confirmation && (
                    <p className="text-sm text-red-500">{errors.password_confirmation}</p>
                  )}
                </div>

                {errors.form && (
                  <div className="text-red-500 text-sm mb-4">
                    {errors.form}
                  </div>
                )}

                <button type="submit" className="w-full  bg-naranja p-2 text-xl text-white rounded-[10px] hover:bg-white hover:text-naranja border border-naranja">
                  Registrarse y Confirmar Reserva
                </button>
              </form>

              <div className="bg-white p-4 rounded-[10px] shadow-lg">
                <h2 className="text-2xl font-bold mb-4">Detalles de la Reserva</h2>
                <div className="flex flex-col justify-around h-[90%]">
                  <p className="text-xl"><strong>Fecha:</strong> {selectedDate}</p>
                  <p className="text-xl">
                    <strong>Horario:</strong>{' '}
                    {reservationDetails.horario ? 
                      `${reservationDetails.horario.hora_inicio.slice(0, 5)} - ${reservationDetails.horario.hora_fin.slice(0, 5)}` : 
                      'Cargando...'
                    }
                  </p>
                  <p className="text-xl">
                    <strong>Cancha:</strong>{' '}
                    {reservationDetails.cancha ? 
                      `Cancha ${reservationDetails.cancha.nro} - ${reservationDetails.cancha.tipo_cancha}` : 
                      'Cargando...'
                    }
                  </p>

                  
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-lg uppercase">
                <span className="px-2 text-muted-foreground">
                  O si ya tienes una cuenta
                </span>
              </div>
            </div>
            <button 
              className="w-1/2 bg-white border border-naranja text-naranja text-xl p-2 rounded-[10px] hover:bg-naranja hover:text-white"
              onClick={navigateToLogin}
            >
              Iniciar Sesión
            </button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
