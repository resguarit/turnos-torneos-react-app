import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { useNavigate } from 'react-router-dom';


function PerfilUsuario(){

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-7xl lg:max-w-full mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl lg:text-4xl font-bold">Perfil Usuario</h1>
            
            </div>
            </div>
            <button 
              onClick={handleLogout} 
              className="mt-4 p-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cerrar sesión
            </button>
      </main>
      <Footer />
    </div>
  )
}
export default PerfilUsuario;




