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
import Loading from '@/components/LoadingSinHF';

export default function ConfirmarLogin() {
  const [formData, setFormData] = useState({
    dni: '', // Cambiado de email a dni
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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.dni) newErrors.dni = 'El DNI es requerido';
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
        // Iniciar sesión
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
          
          api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;
  
          // Obtener datos de reserva del localStorage
          const reservaTemp = JSON.parse(localStorage.getItem('reservaTemp'));
          
          // Crear bloqueo temporal
          const bloqueoResponse = await api.post('/turnos/bloqueotemporal', {
            fecha: reservaTemp.fecha,
            horario_id: reservaTemp.horario_id,
            cancha_id: reservaTemp.cancha_id
          });
  
          if (bloqueoResponse.status === 201) {
            localStorage.setItem('bloqueoTemp', JSON.stringify({
              id: bloqueoResponse.data.bloqueo.id,
              fecha: bloqueoResponse.data.bloqueo.fecha,
              horario_id: bloqueoResponse.data.bloqueo.horario_id,
              cancha_id: bloqueoResponse.data.bloqueo.cancha_id,
              expira_en: bloqueoResponse.data.bloqueo.expira_en
            }));
  
            navigate('/bloqueo-reserva'); // Changed from '/bloqueo-reserva' to '/contador-bloqueo'
          }
        }
      } catch (error) {
        console.error('Error completo:', error);
        toast.error(error.response?.data?.message || 'Error al iniciar sesión');
      } finally {
        setLoading(false);
      }
    }
  };

  const navigateToSignUp = () => {
    navigate(`/confirmar-turno?time=${selectedTime}&date=${selectedDate}&court=${selectedCourt}`);
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
        <Card className="max-w-5xl mx-auto border-0">
          <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <form onSubmit={handleSubmit} className="space-y-8 h-full  flex flex-col">
              <div className="space-y-4">
                <div className="space-y-1 flex flex-col">
                  <Label htmlFor="dni" className="text-base font-semibold">DNI</Label>
                  <input
                    id="dni"
                    type="text"
                    name="dni"
                    value={formData.dni}
                    onChange={handleChange}
                    className={`w-full text-black text-lg border-2 border-gray-300  rounded-xl ${errors.dni ? 'border-red-500' : ''}`}
                  />
                  {errors.dni && (
                    <p className="text-sm text-red-500">{errors.dni}</p>
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
                  O si no tienes una cuenta
                </span>
              </div>
            </div>
            <button 
              className="w-1/2 bg-white border border-naranja text-naranja text-sm p-2 rounded-[10px] hover:bg-naranja hover:text-white"
              onClick={navigateToSignUp}
              disabled={loading}
            >
              Registrarse
            </button>
          </CardFooter>
        </Card>
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}
