import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from 'lucide-react';
import api from '@/lib/axiosConfig';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function EditProfile() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    telefono: ''
  });

  const [originalUserData, setOriginalUserData] = useState({
    name: '',
    email: '',
    telefono: ''
  });

  const [userPassword, setUserPassword] = useState({
    password: '',
    current_password: '',
    password_confirmation: ''
  });

  const [showPassword, setShowPassword] = useState({
    current_password: false,
    password: false,
    password_confirmation: false
  });

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false); // Estado de carga

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await api.get(`/usuarios/${userId}`);
        const user = response.data.user;
        setUserData({
          name: user.name,
          email: user.email,
          telefono: user.telefono,
        });
        setOriginalUserData({
          name: user.name,
          email: user.email,
          telefono: user.telefono,
        });
      } catch (error) {
        setError(error.message);
      }
    };

    fetchUserData();
  }, []);

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value
    });
  };

  const handlePasswordChange = (e) => {
    setUserPassword({
      ...userPassword,
      [e.target.name]: e.target.value
    });
  };

  const toggleShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field]
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Iniciar estado de carga
    const userId = localStorage.getItem('user_id');
    const updatedData = {};

    // Comparar los valores actuales con los originales y agregar solo los campos modificados y no vacíos
    for (const key in userData) {
      if (userData[key] !== originalUserData[key] && userData[key].trim() !== '') {
        updatedData[key] = userData[key];
      }
    }

    // Validar contraseñas
    if (userPassword.current_password) {
      if (!userPassword.password || !userPassword.password_confirmation) {
        setError('Debe ingresar la nueva contraseña y la confirmación de la contraseña.');
        setLoading(false); // Finalizar estado de carga
        return;
      }
      if (userPassword.password !== userPassword.password_confirmation) {
        setError('Las contraseñas no coinciden');
        setLoading(false); // Finalizar estado de carga
        return;
      }
      updatedData.password = userPassword.password;
      updatedData.current_password = userPassword.current_password;
      updatedData.password_confirmation = userPassword.password_confirmation;
    }

    try {
      await api.patch(`/usuarios/${userId}`, updatedData);
      toast.success('Usuario actualizado correctamente');
    } catch (error) {
      toast.error(error.response.data.message || error.message);
    } finally {
      setLoading(false); // Finalizar estado de carga
    }
  };

  const handleCancelarClick = () => {
    // Restaurar los datos del usuario al estado original
    setUserData({ ...originalUserData });
  
    // Limpiar los campos de contraseña
    setUserPassword({
      password: '',
      current_password: '',
      password_confirmation: ''
    });
  
    // Limpiar posibles errores
    setError(null);
  };

  return (
    <Card className="w-full max-w-7xl mx-auto border-0">
      <CardContent className="pt-6">
        <ToastContainer position="bottom-right" />
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Información Personal */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Información Personal</h2>
              <p className="text-xl text-muted-foreground">
                Actualiza tu información personal y de contacto.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 flex flex-col">
                <Label htmlFor="name" className="text-xl">Nombre</Label>
                <input
                  id="name"
                  name="name"
                  value={userData.name}
                  onChange={handleChange}
                  className="bg-white p-2 border border-gray-400"
                  style={{ borderRadius: '12px' }}
                />
              </div>
              <div className="space-y-1 flex flex-col">
                <Label htmlFor="email" className="text-xl">Email</Label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={userData.email}
                  onChange={handleChange}
                  className="bg-white p-2 border border-gray-400"
                  style={{ borderRadius: '12px' }}
                />
              </div>
              <div className="space-y-1 flex flex-col">
                <Label htmlFor="telefono" className="text-xl">Teléfono</Label>
                <input
                  id="telefono"
                  name="telefono"
                  type="tel"
                  value={userData.telefono}
                  onChange={handleChange}
                  className="bg-white p-2 border border-gray-400"
                  style={{ borderRadius: '12px' }}
                />
              </div>
            </div>
          </div>

          {/* Cambiar Contraseña */}
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-semibold">Cambiar Contraseña</h2>
              <p className="text-xl text-muted-foreground">
                Asegúrate de usar una contraseña segura.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1 flex flex-col relative">
                <Label htmlFor="current_password" className="text-xl">Contraseña Actual</Label>
                <input
                  id="current_password"
                  name="current_password"
                  type={showPassword.current_password ? "text" : "password"}
                  value={userPassword.current_password}
                  onChange={handlePasswordChange}
                  className="bg-white p-2 border border-gray-400"
                  style={{ borderRadius: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('current_password')}
                  className="absolute right-2 top-12 transform -translate-y-1/2"
                >
                  {showPassword.current_password ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="space-y-1 flex flex-col relative">
                <Label htmlFor="password" className="text-xl">Nueva Contraseña</Label>
                <input
                  id="password"
                  name="password"
                  type={showPassword.password ? "text" : "password"}
                  value={userPassword.password}
                  onChange={handlePasswordChange}
                  className="bg-white p-2 border border-gray-400"
                  style={{ borderRadius: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('password')}
                  className="absolute right-2 top-12 transform -translate-y-1/2"
                >
                  {showPassword.password ? <EyeOff /> : <Eye />}
                </button>
              </div>
              <div className="space-y-1 flex flex-col relative">
                <Label htmlFor="password_confirmation" className="text-xl">Confirmar Contraseña</Label>
                <input
                  id="password_confirmation"
                  name="password_confirmation"
                  type={showPassword.password_confirmation ? "text" : "password"}
                  value={userPassword.password_confirmation}
                  onChange={handlePasswordChange}
                  className="bg-white p-2 border border-gray-400"
                  style={{ borderRadius: '12px' }}
                />
                <button
                  type="button"
                  onClick={() => toggleShowPassword('password_confirmation')}
                  className="absolute right-2 top-12 transform -translate-y-1/2"
                >
                  {showPassword.password_confirmation ? <EyeOff /> : <Eye />}
                </button>
              </div>
            </div>
          </div>

          {/* Acciones del Formulario */}
          <div className="flex justify-between">
            <button type="button" className='bg-red-500 p-3 text-white text-xl rounded-[10px]' onClick={handleCancelarClick}>
              Cancelar
            </button>
            <button type="submit" className='bg-naranja text-white p-3 text-xl rounded-[10px]' disabled={loading}>
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
