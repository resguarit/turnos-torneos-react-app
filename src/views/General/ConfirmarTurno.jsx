import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/axiosConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MapPin, Calendar, Clock, CreditCard, Eye, EyeOff } from 'lucide-react';
import Loading from '@/components/LoadingSinHF';

export default function ConfirmarTurno() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    dni: '', // Changed from email to dni
    telefono: '',
    password: '',
    password_confirmation: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Estado de carga
  const [reservationDetails, setReservationDetails] = useState({
    horario: null,
    cancha: null
  });
  const [loadingDetails, setLoadingDetails] = useState(true); // Estado de carga para los detalles de la reserva
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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
      } finally {
        setLoadingDetails(false); // Finalizar estado de carga para los detalles de la reserva
      }
    };

    if (selectedTime && selectedCourt) {
      fetchDetails();
    }
  }, [selectedTime, selectedCourt]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name) newErrors.name = 'El nombre es requerido';
    if (!formData.dni) newErrors.dni = 'El DNI es requerido';
    if (!formData.email) newErrors.email = 'El correo electrónico es requerido';
    if (!formData.telefono) newErrors.telefono = 'El teléfono es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (formData.password.length < 8) newErrors.password = 'La contraseña debe tener al menos 8 caracteres';
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Las contraseñas no coinciden';
    }

    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => toast.error(error));
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Registrar usuario
        const registerResponse = await api.post('/register', {
          name: formData.name,
          dni: formData.dni,
          email: formData.email,
          telefono: formData.telefono,
          password: formData.password,
          password_confirmation: formData.password_confirmation
        });

        if (registerResponse.status === 201) {
          // Login automático
          const loginResponse = await api.post('/login', {
            dni: formData.dni,
            password: formData.password
          });

          if (loginResponse.data.token) {
            // Guardar datos del usuario
            localStorage.setItem('user_id', loginResponse.data.user_id);
            localStorage.setItem('username', loginResponse.data.username);
            localStorage.setItem('token', loginResponse.data.token);
            localStorage.setItem('user_role', loginResponse.data.rol);

            // Configurar token
            api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;

            // Crear bloqueo temporal
            const reservaTemp = JSON.parse(localStorage.getItem('reservaTemp'));
            const bloqueoResponse = await api.post('/turnos/bloqueotemporal', {
              fecha: reservaTemp.fecha,
              horario_id: reservaTemp.horario_id,
              cancha_id: reservaTemp.cancha_id
            });

            if (bloqueoResponse.status === 201) {
              // Redireccionar al contador
              navigate('/bloqueo-reserva');
            }

            if (bloqueoResponse.status === 400 || bloqueoResponse.status === 401 || bloqueoResponse.status === 403 || bloqueoResponse.status === 404 || bloqueoResponse.status === 500) {
              toast.error(bloqueoResponse.data.message || 'Error en la creación del turno');
              navigate('/reserva-mobile');
            }
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error en el proceso de registro');
      } finally {
        setLoading(false);
      }
    }
  };

  const navigateToLogin = () => {
    navigate(`/confirmar-login?time=${selectedTime}&date=${selectedDate}&court=${selectedCourt}`);
  };
  
  const señaPercentage = reservationDetails.cancha ? (reservationDetails.cancha.seña / reservationDetails.cancha.precio_por_hora) * 100 : 0;

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const toggleShowConfirmPassword = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-gray-100 font-inter">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <h1 className="text-2xl font-semibold mb-2">Registro para Confirmar Reserva</h1>
        <p className="text-base text-gray-600 mb-4">
          Complete sus datos para confirmar la reserva. Si ya tiene una cuenta, puede iniciar sesión.
        </p>
        <Card className="max-w-7xl mx-auto border-0">
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <form onSubmit={handleSubmit} className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-2 md:gap-6 gap-2 mb-8">
                <div className="">
                  <Label htmlFor="name" className="text-sm font-semibold">Nombre completo</Label>
                  <input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 rounded-[8px] ${errors.name ? 'border-red-500' : ''}`}
                  />
                  
                </div>

                <div className="">
                  <Label htmlFor="dni" className="text-sm font-semibold">DNI</Label>
                  <input
                    id="dni"
                    value={formData.dni}
                    onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 rounded-[8px] ${errors.dni ? 'border-red-500' : ''}`}
                  />
                  {errors.dni && (
                    <p className="text-sm text-red-500">{errors.dni}</p>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="telefono" className="text-sm font-semibold">Teléfono</Label>
                  <input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 rounded-[8px] ${errors.telefono ? 'border-red-500' : ''}`}
                  />
                  {errors.telefono && (
                    <p className="text-sm text-red-500">{errors.telefono}</p>
                  )}
                </div>

                <div className="">
                  <Label htmlFor="email" className="text-sm font-semibold">Correo Electrónico</Label>
                  <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 rounded-[8px] ${errors.email ? 'border-red-500' : ''}`}
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 rounded-[8px] ${errors.password ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={toggleShowPassword}
                    className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showPassword ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                  </button>
                </div>

                <div className="relative">
                  <Label htmlFor="password_confirmation" className="text-sm font-semibold">Confirmar Contraseña</Label>
                  <input
                    id="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.password_confirmation}
                    onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    className={`w-full text-black text-lg border-2 border-gray-300 rounded-[8px] ${errors.password_confirmation ? 'border-red-500' : ''}`}
                  />
                  <button
                    type="button"
                    onClick={toggleShowConfirmPassword}
                    className="absolute right-3 top-10 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                  </button>
                </div>

                {errors.form && (
                  <div className="text-red-500 text-sm mb-4">
                    {errors.form}
                  </div>
                )}

                
                </div>
                <button type="submit" className="w-full  bg-naranja p-2 text-sm text-white rounded-[10px] hover:bg-white hover:text-naranja border border-naranja" disabled={loading}>
                  {loading ? 'Procesando...' : 'Registrarse y Confirmar Reserva'}
                </button>
              </form>
            
              <div className="bg-white p-4 rounded-[10px] shadow-lg flex flex-col justify-between md:ml-20">
                <h2 className="text-lg font-bold mb-2">Detalles de la Reserva</h2>
                {loadingDetails ? (
                  <div className="flex justify-center items-center">
                    <Loading />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center text-sm text-muted-foreground space-y-3 md:space-y-6 mb-4 ">
                      <MapPin className="w-4 h-4 mr-1" />
                      Rock & Gol 520 esq. 20
                    </div>
                    <div className="space-y-4 md:space-y-6 mb-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div className="w-full">
                            <p className="text-sm text-gray-500">Fecha y Hora</p>
                            <div className="flex full justify-between items-center">
                              <p className="font-medium text-xs md:text-sm">{selectedDate}</p>
                              <p className="font-medium text-xs md:text-sm">{reservationDetails.horario.hora_inicio} - {reservationDetails.horario.hora_fin} </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div className="w-full">
                            <p className="text-sm text-gray-500">Duración y Cancha</p>
                            <div className="flex w-full justify-between items-center">
                              <p className="font-medium text-xs md:text-sm">60 min </p>
                              <p className="font-medium text-xs md:text-sm">Cancha {reservationDetails.cancha.nro} - {reservationDetails.cancha.tipo_cancha} </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-3 md:pt-4 border-t">
                      <div className="flex items-center space-x-3">
                        <CreditCard className="w-5 h-5 text-gray-500" />
                        <div className="flex-1">
                          <p className="text-sm text-gray-500">Resumen de pago</p>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <p className="text-xs md:text-sm">Total</p>
                              <p className="font-medium text-xs md:text-sm">${reservationDetails.cancha.precio_por_hora} </p>
                            </div>
                            {console.log(reservationDetails)}
                            <div className="flex justify-between text-naranja">
                              <p className="text-xs md:text-sm">Seña ({señaPercentage.toFixed(0)}%)</p>
                              <p className="font-medium text-xs md:text-sm">${reservationDetails.cancha.seña}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-0">
            <div className="relative">
              <div className="relative flex justify-center text-xs uppercase">
                <span className="px-2 text-muted-foreground">
                  O si ya tienes una cuenta
                </span>
              </div>
            </div>
            <button 
              className="w-1/2 bg-white border border-naranja text-naranja text-sm p-2 rounded-[10px] hover:bg-naranja hover:text-white"
              onClick={navigateToLogin}
              disabled={loading}
            >
              Iniciar Sesión
            </button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}
