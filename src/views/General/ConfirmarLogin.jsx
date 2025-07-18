import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { AlertCircle } from 'lucide-react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '@/lib/axiosConfig';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Clock, Calendar, MapPin, CreditCard, Eye, EyeOff } from 'lucide-react';
import Loading from '@/components/BtnLoading';
import { format, parseISO, isValid } from 'date-fns';
import { es } from 'date-fns/locale';
import { encryptRole } from '@/lib/getRole';
import { formatearFechaCompleta, formatearRangoHorario, calcularDuracion } from '@/utils/dateUtils';
import { useConfiguration } from '@/context/ConfigurationContext';

export default function ConfirmarLogin() {
  const [formData, setFormData] = useState({
    identifier: '', // This will hold either email or DNI
    password: ''
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Estado de carga
  const [reservationDetails, setReservationDetails] = useState({
    horario: null,
    cancha: null
  });
  const [loadingDetails, setLoadingDetails] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // Obtener parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const selectedTime = queryParams.get("time");
  const selectedDate = queryParams.get("date");
  const selectedCourt = queryParams.get("court");

  const { config, loading: loadingConfig } = useConfiguration();

  const validateForm = () => {
    const newErrors = {};
    if (!formData.identifier) newErrors.identifier = 'El DNI o Email es requerido';
    if (!formData.password) newErrors.password = 'La contraseña es requerida';
    if (Object.keys(newErrors).length > 0) {
      Object.values(newErrors).forEach(error => toast.error(error));
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        // Determinar si el identificador es un email o DNI
        const isEmail = formData.identifier.includes('@');
        const loginData = isEmail 
          ? { email: formData.identifier, password: formData.password }
          : { dni: formData.identifier, password: formData.password };

        const loginResponse = await api.post('/login', loginData);

        if (loginResponse.data.token) {
          // Guardar datos del usuario
          localStorage.setItem('user_id', loginResponse.data.user_id);
          localStorage.setItem('username', loginResponse.data.username);
          localStorage.setItem('token', loginResponse.data.token);
          const rolEncriptado = encryptRole(loginResponse.data.rol);
          localStorage.setItem('user_role', rolEncriptado);
          
          api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;

          try {
            // Obtener datos de reserva del localStorage
            const reservaTemp = JSON.parse(localStorage.getItem('reservaTemp'));
            if (!reservaTemp) {
              toast.error('No se encontraron datos de la reserva');
              setLoading(false);
              navigate('/select-deporte');
              return;
            }
            
            // Crear bloqueo temporal
            const bloqueoResponse = await api.post('/turnos/bloqueotemporal', {
              fecha: reservaTemp.fecha,
              horario_id: reservaTemp.horario_id,
              cancha_id: reservaTemp.cancha_id
            });

            if (bloqueoResponse.status === 201) {
              setLoading(false);
              navigate('/bloqueo-reserva');
            }
          } catch (bloqueoError) {
            console.error('Error completo:', bloqueoError);
            setLoading(false);
            
            if (bloqueoError.response && bloqueoError.response.status === 409) {
              toast.error('Otra persona está reservando este turno');
            } else {
              toast.error(bloqueoError.response?.data?.message || 'Error al crear el bloqueo temporal');
            }
            return;
          }
        }
      } catch (error) {
        console.error('Error completo:', error);
        if (error.response?.status === 422) {
          toast.error('Por favor ingrese un DNI o email válido');
        } else if (error.response?.status === 401) {
          toast.error('Credenciales incorrectas');
        } else {
          toast.error(error.response?.data?.message || 'Error al iniciar sesión');
        }
        setLoading(false);
      }
    }
  };

  const navigateToSignUp = () => {
    navigate(`/confirmar-turno?time=${selectedTime}&date=${selectedDate}&court=${selectedCourt}`);
  };

  const handleCancel = () => {
    localStorage.removeItem('reservaTemp');
    navigate('/select-deporte');
  };

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

  const señaPercentage = reservationDetails.cancha ? (reservationDetails.cancha.seña / reservationDetails.cancha.precio_por_hora) * 100 : 0;

  useEffect(() => {
    // Recuperar datos del localStorage
    const reservaTemp = localStorage.getItem('reservaTemp');
    if (!reservaTemp) {
      navigate('/nueva-reserva');
      return;
    }
  
    const fetchDetails = async () => {
      try {
        const reservaData = JSON.parse(reservaTemp);
        
        // Obtener detalles del horario
        const horarioResponse = await api.get(`/horarios/${reservaData.horario_id}`);
        // Obtener detalles de la cancha
        const canchaResponse = await api.get(`/canchas/${reservaData.cancha_id}`);
        
        setReservationDetails({
          horario: horarioResponse.data.horario,
          cancha: canchaResponse.data.cancha
        });
      } catch (error) {
        console.error('Error fetching details:', error);
        toast.error('Error al cargar los detalles de la reserva');
      } finally {
        setLoadingDetails(false);
      }
    };
  
    fetchDetails();
  }, [navigate]);
  
  return (
    <div className="min-h-screen flex flex-col justify-start bg-gray-100 font-inter">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <h1 className="text-2xl font-semibold mb-2">Iniciar Sesión y Confirmar Turno</h1>
        <p className="text-base text-gray-600 mb-8">
          Inicie sesión para confirmar su reserva.
        </p>
        <Card className="max-w-7xl mx-auto border-0">
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="space-y-8 h-full  flex flex-col">
              <div className="space-y-4">
                <div className="space-y-1 flex flex-col">
                  <Label htmlFor="identifier" className="text-base font-semibold">DNI o Email</Label>
                  <input
                    id="identifier"
                    type="text"
                    name="identifier"
                    value={formData.identifier}
                    onChange={handleChange}
                    className={`w-full text-black text-lg border-2 border-gray-300 rounded-xl ${errors.identifier ? 'border-red-500' : ''}`}
                  />
                  {errors.identifier && (
                    <p className="text-sm text-red-500">{errors.identifier}</p>
                  )}
                </div>

                <div className="space-y-1 flex flex-col">
                  <Label htmlFor="password" className="text-base font-semibold">Contraseña</Label>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      className={`w-full text-black text-lg border-2 border-gray-300 rounded-xl ${errors.password ? 'border-red-500' : ''}`}
                    />
                    <div
                      className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5 text-gray-500" /> : <Eye className="w-5 h-5 text-gray-500" />}
                    </div>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-500">{errors.password}</p>
                  )}
                </div>
              </div>

              {errors.form && (
                <div className="text-red-500 text-sm mb-4">
                  {errors.form}
                </div>
              )}

              <button type="submit" className="w-full bg-naranja p-2 text-sm text-white rounded-[10px] hover:bg-white hover:text-naranja border border-naranja" disabled={loading}>
                {loading ? 'Iniciando Sesión y Confirmando Turno...' : 'Iniciar Sesión y Confirmar Turno'}
              </button>
            </form>

            <div className="bg-white p-4 rounded-[10px] shadow-lg flex flex-col justify-between md:ml-20">
                <h2 className="text-lg font-bold mb-2">Detalles de la Reserva</h2>
                {loadingDetails ? (
                  <div className="flex justify-center items-center h-full">
                    <Loading />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center text-sm text-muted-foreground space-y-3 md:space-y-6 mb-4 ">
                      <MapPin className="w-4 h-4 mr-1" />
                      {loadingConfig
                        ? 'Cargando...'
                        : config?.direccion_complejo || 'Dirección no disponible'}
                    </div>
                    <div className="space-y-4 md:space-y-6 mb-4">
                      <div className="space-y-4">
                        <div className="flex items-center space-x-3">
                          <Calendar className="w-5 h-5 text-gray-500" />
                          <div className="w-full">
                            <p className="text-sm text-gray-500">Fecha y Hora</p>
                            <div className="flex full justify-between items-center">
                              <p className="font-medium text-xs md:text-sm">
                                {isValid(parseISO(selectedDate)) ? formatearFechaCompleta(selectedDate) : 'Fecha inválida'}
                              </p>
                              <p className="font-medium text-xs md:text-sm">{reservationDetails.horario.hora_inicio} - {reservationDetails.horario.hora_fin} </p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Clock className="w-5 h-5 text-gray-500" />
                          <div className="w-full">
                            <p className="text-sm text-gray-500">Duración y Cancha</p>
                            <div className="flex w-full justify-between items-center">
                              <p className="font-medium text-xs md:text-sm">{calcularDuracion(reservationDetails.horario.hora_inicio, reservationDetails.horario.hora_fin)}</p>
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
                  O si no tienes una cuenta
                </span>
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button 
                className="w-full bg-white border border-naranja text-naranja text-sm p-2 rounded-[10px] hover:bg-naranja hover:text-white"
                onClick={navigateToSignUp}
                disabled={loading}
              >
                Registrarse
              </button>
              <button 
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-[10px] text-sm w-full md:w-auto"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancelar Reserva
              </button>
            </div>
          </CardFooter>
        </Card>
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}
