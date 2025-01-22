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
import { Footer } from '@/components/Footer';
import { Header } from '@/components/Header';
import Loading from '@/components/Loading';

export default function EditProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
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
  const [isLoading, setIsLoading] = useState(false); // Estado de carga

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
      } finally {
        setLoading(false);
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
    setIsLoading(true); // Iniciar estado de carga
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
        setIsLoading(false); // Finalizar estado de carga
        return;
      }
      if (userPassword.password !== userPassword.password_confirmation) {
        setError('Las contraseñas no coinciden');
        setIsLoading(false); // Finalizar estado de carga
        return;
      }
      updatedData.password = userPassword.password;
      updatedData.current_password = userPassword.current_password;
      updatedData.password_confirmation = userPassword.password_confirmation;
    }

    try {
      await api.patch(`/usuarios/${userId}`, updatedData);
      toast.success('Usuario actualizado correctamente');
      // Actualizar el nombre de usuario en el localStorage
      if (updatedData.name) {
        localStorage.setItem('username', updatedData.name);
        window.dispatchEvent(new Event('storage')); // Disparar evento de almacenamiento
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message);
    } finally {
      setIsLoading(false); // Finalizar estado de carga
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

  if(loading){
    return <Loading />
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100 p-6">
        <h1 className='text-2xl font-bold'>Editar Perfil</h1>
        <Card className="w-full max-w-7xl mx-auto  shadow-none border-0 ">
          <CardContent className="pt-6">
            <ToastContainer position="bottom-right" />
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Información Personal */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Información Personal</h2>
                  <p className="text-lg text-muted-foreground">
                    Actualiza tu información personal y de contacto.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 flex flex-col">
                    <Label htmlFor="name" className="text-lg">Nombre</Label>
                    <input
                      id="name"
                      name="name"
                      value={userData.name}
                      onChange={handleChange}
                      className="bg-white p-1 border border-gray-400"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <Label htmlFor="email" className="text-lg">Email</Label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={userData.email}
                      onChange={handleChange}
                      className="bg-white p-1 border border-gray-400"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                  <div className="space-y-1 flex flex-col">
                    <Label htmlFor="telefono" className="text-lg">Teléfono</Label>
                    <input
                      id="telefono"
                      name="telefono"
                      type="tel"
                      value={userData.telefono}
                      onChange={handleChange}
                      className="bg-white p-1 border border-gray-400"
                      style={{ borderRadius: '12px' }}
                    />
                  </div>
                </div>
              </div>

              {/* Cambiar Contraseña */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
                  <p className="text-lg text-muted-foreground">
                    Asegúrate de usar una contraseña segura.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1 flex flex-col relative">
                    <Label htmlFor="current_password" className="text-lg">Contraseña Actual</Label>
                    <input
                      id="current_password"
                      name="current_password"
                      type={showPassword.current_password ? "text" : "password"}
                      value={userPassword.current_password}
                      onChange={handlePasswordChange}
                      className="bg-white p-1 border border-gray-400"
                      style={{ borderRadius: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('current_password')}
                      className="absolute right-2 top-11 transform -translate-y-1/2"
                    >
                      {showPassword.current_password ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                    </button>
                  </div>
                  <div className="space-y-1 flex flex-col relative">
                    <Label htmlFor="password" className="text-lg">Nueva Contraseña</Label>
                    <input
                      id="password"
                      name="password"
                      type={showPassword.password ? "text" : "password"}
                      value={userPassword.password}
                      onChange={handlePasswordChange}
                      className="bg-white p-1 border border-gray-400"
                      style={{ borderRadius: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('password')}
                      className="absolute right-2 top-11 transform -translate-y-1/2"
                    >
                      {showPassword.password ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                    </button>
                  </div>
                  <div className="space-y-1 flex flex-col relative">
                    <Label htmlFor="password_confirmation" className="text-lg">Confirmar Contraseña</Label>
                    <input
                      id="password_confirmation"
                      name="password_confirmation"
                      type={showPassword.password_confirmation ? "text" : "password"}
                      value={userPassword.password_confirmation}
                      onChange={handlePasswordChange}
                      className="bg-white p-1 border border-gray-400"
                      style={{ borderRadius: '12px' }}
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowPassword('password_confirmation')}
                      className="absolute right-2 top-11 transform -translate-y-1/2"
                    >
                      {showPassword.password_confirmation ? <EyeOff className='h-5 w-5'/> : <Eye className='h-5 w-5'/>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Acciones del Formulario */}
              <div className="flex justify-between">
                <button type="button" className='bg-red-500 h-10 p-2 items-center flex text-white text-base md:text-lg rounded-[10px]' onClick={handleCancelarClick}>
                  Cancelar
                </button>
                <button type="submit" className='bg-naranja h-10 text-white items-center flex p-2 text-base md:text-lg rounded-[10px]' disabled={isLoading}>
              {isLoading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
