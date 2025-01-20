import { useState } from 'react';
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

export default function ConfirmarLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Estado de carga
  const navigate = useNavigate();
  const location = useLocation();
  
  // Obtener parámetros de la URL
  const queryParams = new URLSearchParams(location.search);
  const selectedTime = queryParams.get("time");
  const selectedDate = queryParams.get("date");
  const selectedCourt = queryParams.get("court");

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) newErrors.email = 'El email es requerido';
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
      setLoading(true); // Iniciar estado de carga
      try {
        // Iniciar sesión
        const loginResponse = await api.post('/login', {
          email: formData.email,
          password: formData.password
        });

        if (loginResponse.data.token) {
          // Guardar datos del usuario y token
          localStorage.setItem('user_id', loginResponse.data.user_id);
          localStorage.setItem('username', loginResponse.data.username);
          localStorage.setItem('token', loginResponse.data.token);
          
          // Configurar token en headers
          api.defaults.headers.common['Authorization'] = `Bearer ${loginResponse.data.token}`;

          // Crear reserva con token
          const reservationResponse = await api.post('/turnos/turnounico', {
            fecha_turno: selectedDate,
            cancha_id: selectedCourt,
            horario_id: selectedTime,
            usuario_id: loginResponse.data.user_id,
            estado: 'Pendiente'
          });

          if (reservationResponse.status === 201) {
            toast.success('Turno confirmado exitosamente');
            setTimeout(() => {
              navigate('/user-profile');
            }, 2000); // Esperar 2 segundos antes de redirigir
          }
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error al procesar la solicitud');
      } finally {
        setLoading(false); // Finalizar estado de carga
      }
    }
  };

  const navigateToSignUp = () => {
    navigate(`/confirmar-turno?time=${selectedTime}&date=${selectedDate}&court=${selectedCourt}`);
  };

  return (
    <div className="min-h-screen flex flex-col justify-start bg-gray-100 font-inter">
      <Header />
      <main className="max-w-7xl lg:max-w-full p-6 grow">
        <h1 className="text-4xl font-semibold mb-2">Iniciar Sesión y Confirmar Turno</h1>
        <p className="text-xl text-gray-600 mb-8">
          Inicie sesión para confirmar su reserva.
        </p>
        <Card className="max-w-5xl mx-auto border-0">
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-4">
                <div className="space-y-1 flex flex-col">
                  <Label htmlFor="email" className="text-xl">Email</Label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full text-black text-lg border-2 border-gray-300 p-2 rounded-xl ${errors.email ? 'border-red-500' : ''}`}
                  />
                  {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                  )}
                </div>

                <div className="space-y-1 flex flex-col">
                  <Label htmlFor="password" className="text-xl">Contraseña</Label>
                  <input
                    id="password"
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full text-black text-lg border-2 border-gray-300 p-2 rounded-xl ${errors.password ? 'border-red-500' : ''}`}
                  />
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

              <button type="submit" className="w-full bg-naranja p-2 text-xl text-white rounded-[10px] hover:bg-white hover:text-naranja border border-naranja" disabled={loading}>
                {loading ? 'Iniciando Sesión y Confirmando Turno...' : 'Iniciar Sesión y Confirmar Turno'}
              </button>
            </form>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-lg uppercase">
                <span className="px-2 text-muted-foreground">
                  O si no tienes una cuenta
                </span>
              </div>
            </div>
            <button 
              className="w-1/2 bg-white border border-naranja text-naranja text-xl p-2 rounded-[10px] hover:bg-naranja hover:text-white"
              onClick={navigateToSignUp}
              disabled={loading}
            >
              Registrarse
            </button>
          </CardContent>
        </Card>
      </main>
      <Footer />
      <ToastContainer position="top-right" />
    </div>
  );
}
