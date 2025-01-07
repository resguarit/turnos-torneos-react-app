import { Header } from '@/components/header';
import { Footer } from '@/components/footer';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { LogOut } from 'lucide-react';

function PerfilUsuario() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    telefono: '',
    password: '',
    current_password: '',
    password_confirmation: ''
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem('user_id');
        const response = await api.get(`/usuarios/${userId}`);
        const user = response.data.user;
        setUserData({
          ...userData,
          name: user.name,
          email: user.email,
          telefono: user.telefono
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('user_id');
      await api.patch(`/usuarios/${userId}`, userData);
      alert('Usuario actualizado correctamente');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 grow p-6 bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">Perfil Usuario</h1>
          </div>
          {error && <p className="text-red-500">{error}</p>}
          <form onSubmit={handleSubmit} className="space-y-4 mx-10">
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="name"
                value={userData.name}
                onChange={handleChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                name="email"
                value={userData.email}
                onChange={handleChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                name="telefono"
                value={userData.telefono}
                onChange={handleChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Contraseña actual</label>
              <input
                type="password"
                name="current_password"
                value={userData.current_password}
                onChange={handleChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                name="password"
                value={userData.password}
                onChange={handleChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Confirmar nueva contraseña</label>
              <input
                type="password"
                name="password_confirmation"
                value={userData.password_confirmation}
                onChange={handleChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div className="flex justify-end w-1/3">
            <button
              type="submit"
              className="mt-4 p-2 lg:text-xl bg-naranja text-white rounded-xl hover:bg-naranja/80"
            >
              Guardar cambios
            </button>
            </div>
          </form>
          <button
            onClick={handleLogout}
            className="flex gap-2 items-center mt-4 p-3 lg:text-2xl bg-red-600 text-white rounded-xl mx-10 hover:bg-red-400"
          >
            Cerrar sesión <LogOut />
          </button>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default PerfilUsuario;
