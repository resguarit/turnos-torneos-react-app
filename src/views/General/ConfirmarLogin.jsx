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

export default function ConfirmarLogin() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
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
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        // Iniciar sesión
        const loginResponse = await api.post('/login', {
          email: formData.email,
          password: formData.password
        });

        console.log('Respuesta login:', loginResponse);

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
            monto_total: 100,
            monto_seña: 50,
            estado: 'Pendiente'
          });

          if (reservationResponse.status === 201) {
            console.log("Reserva creada:", reservationResponse.data);
            navigate('/calendario-admi');
          }
        }
      } catch (error) {
        console.error('Error:', error);
        setErrors({ 
          form: error.response?.data?.message || 'Error al procesar la solicitud'
        });
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
      <Card className="max-w-5xl mx-auto border-0">
        <CardHeader>
          <CardTitle className="text-4xl font-semibold">Iniciar Sesión</CardTitle>
          <CardDescription className="text-xl text-gray-600">
            Ingrese sus datos para iniciar sesión.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1 flex flex-col">
                <Label htmlFor="email" className="text-2xl font-semibold">Email</Label>
                <input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className={`${errors.email ? 'border-red-500' : ''} border-gray-300 border p-2`}
                    style={{ borderRadius: '8px'}}
                />
                {errors.email && (
                    <p className="text-sm text-red-500">{errors.email}</p>
                )}
                </div>
            <div className="space-y-1 flex flex-col">
              <Label htmlFor="password" className="text-2xl font-semibold">Contraseña</Label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className={`${errors.password ? 'border-red-500' : ''} border-gray-300 border p-2`}
                    style={{ borderRadius: '8px'}}
              />
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
              <div className='w-full justify-center flex '>
            <button type="submit" className="w-1/2 text-white p-2 rounded-[0.60rem] mt-6 text-xl bg-naranja hover:bg-naranja/90">
              Iniciar Sesión y Confirmar Turno
            </button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xl">
              <span className=" px-2 text-muted-foreground">
                Si no tenés una cuenta
              </span>
              <a onClick={navigateToSignUp} >
              <span className="text-naranja underline cursor-pointer  text-muted-foreground">
                Registrate
              </span>
              </a>
            </div>
          </div>
          
        </CardFooter>
      </Card>
      </main>
      <Footer />
    </div>
  );
}
