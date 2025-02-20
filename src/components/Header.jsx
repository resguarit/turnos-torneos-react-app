import Logo from '../assets/logo.png';
import MenuMovil from './MenuMovil';
import { CircleUserRound } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserCog, MonitorCog } from 'lucide-react';
import { LogOut } from 'lucide-react';
import ModalConfirmation from './ModalConfirmation';
import { Pencil } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const [username, setUserName] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const userRole = localStorage.getItem('user_role');	

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  useEffect(() => {
    const name = localStorage.getItem('username');
    if (name) {
      setUserName(name);
    }

    const handleStorageChange = () => {
      const updatedName = localStorage.getItem('username');
      setUserName(updatedName);
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const handleModal = () => {
    setShowModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowModal(false);
    localStorage.clear()
    setUserName(null);
    navigate('/');
  };

  const closeConfirmModal = () => {
    setShowModal(false);
  };

  return (
    <header className="bg-naranja  max-w-full text-white px-6 py-4">
      <nav className=" mx-auto flex items-center justify-between">
        <Link to="/" >
          <img src={Logo} alt="Logo" className="h-7 lg:h-8 xl:h-9" />
        </Link>
        <div className="hidden md:flex items-center">
          <div className="flex gap-8 lg:gap-12  font-inter text-sm xl:text-lg">
            <Link to="/" className="hover:opacity-80">Inicio</Link>
            {userRole === 'admin' && (
              <Link to="/panel-admin" className="hover:opacity-80 flex items-center gap-1">
                Administrador 
              </Link>
            )}
            {/* se agrega cuando este termianda la seccion de torneos */}
            {/* <Link to="/torneos-admi" className="hover:opacity-80">Torneos</Link> */}
            <Link to="/nueva-reserva" className="hover:opacity-80">Reservas</Link>
            {/* <Link to="/partidos" className="hover:opacity-80">Partidos</Link> */}
            <Link to="/reglamento" className="hover:opacity-80">Reglamento</Link>
            <Link to="/premios" className="hover:opacity-80">Premios</Link>
            
            {username ? (
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <span>{username}</span>
                  <CircleUserRound className="h-5 w-5" />
                </button>
                {isOpen && (
                  <div className="absolute font-inter text-base right-0 mt-2 w-48 bg-white text-zinc-800 rounded-xl shadow-lg z-50">
                    <div className="flex flex-col items-start px-4 py-4 space-y-2">
                    <button
                        onClick={() => {
                          navigate('/editar-perfil');
                          closeMenu();
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1  rounded-xl"
                      >
                        Editar Perfil <Pencil className='w-5'/>
                      </button>
                      <span className="w-full h-[1px] bg-gray-300 my-2"></span>
                      <button
                        onClick={() => {
                          navigate('/user-profile');
                          closeMenu();
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
                      >
                        Mi Panel <UserCog className='w-5'/>
                      </button>
                      <span className="w-full h-[1px] bg-gray-300 my-2"></span>
                      <button
                        onClick={() => {
                          handleModal();
                          closeMenu();
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
                      >
                        Cerrar Sesión <LogOut className='w-5'/>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:opacity-80 flex flex-row items-center gap-2">
                Iniciar Sesión <CircleUserRound className="h-7 w-7" />
              </Link>
            )}
          </div>
        </div>
        <MenuMovil />
      </nav>
      {showModal && <ModalConfirmation onConfirm={handleConfirmSubmit} onCancel={closeConfirmModal} title="Cerrar Sesión" subtitle={"¿Desea cerrar la sesión?"} botonText1={"Cancelar"} botonText2={"Cerrar Sesión"} />}
    </header>
  );
}
