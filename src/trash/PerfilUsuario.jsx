import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/axiosConfig';
import { LogOut } from 'lucide-react';

function PerfilUsuario() {
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

  const [error, setError] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
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
        return;
      }
      if (userPassword.password !== userPassword.password_confirmation) {
        setError('Las contraseñas no coinciden');
        return;
      }
      updatedData.password = userPassword.password;
      updatedData.current_password = userPassword.current_password;
      updatedData.password_confirmation = userPassword.password_confirmation;
    }

    try {
      await api.patch(`/usuarios/${userId}`, updatedData);
      alert('Usuario actualizado correctamente');
    } catch (error) {
      setError(error.response.data.message || error.message);
    }
  };

  const handleLogout = () => {
    localStorage.clear()

    // Redirigir al usuario a la página de inicio de sesión
    navigate('/login');
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
                value={userPassword.current_password}
                onChange={handlePasswordChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Nueva contraseña</label>
              <input
                type="password"
                name="password"
                value={userPassword.password}
                onChange={handlePasswordChange}
                className="mt-1 block w-1/3 lg:text-xl p-2 border border-gray-300 rounded-xl"
              />
            </div>
            <div>
              <label className="block text-sm lg:text-2xl font-medium text-gray-700">Confirmar nueva contraseña</label>
              <input
                type="password"
                name="password_confirmation"
                value={userPassword.password_confirmation}
                onChange={handlePasswordChange}
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
