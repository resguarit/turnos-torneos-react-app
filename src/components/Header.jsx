import Logo from '../assets/logo.png';
import MenuMovil from './MenuMovil';
import { CircleUserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { UserCog } from 'lucide-react';
import { LogOut } from 'lucide-react';

export function Header() {
  const navigate = useNavigate();
  const [username, setUserName] = useState(null);
  const [isOpen, setIsOpen] = useState(false);

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
  }, []);

  const handleLogout = () => {
    localStorage.clear()
    setUserName(null);
    navigate('/');
  };

  return (
    <header className="bg-naranja max-w-full text-white px-6 py-5">
      <nav className=" mx-auto flex items-center justify-between">
        <a href="/" >
          <img src={Logo} alt="Logo" className="h-7 lg:h-10 xl:h-12" />
        </a>
        <div className="hidden md:block">
          <div className="flex gap-8 lg:gap-12  font-inter text-lg lg:text-xl xl:text-2xl">
            <a href="/" className="hover:opacity-80">Inicio</a>
            <a href="/torneos-admi" className="hover:opacity-80">Torneos</a>
            <a href="/calendario-admi" className="hover:opacity-80">Reservas</a>
            <a href="/partidos" className="hover:opacity-80">Partidos</a>
            <a href="/reglamento" className="hover:opacity-80">Reglamento</a>
            <a href="/premios" className="hover:opacity-80">Premios</a>
            {username ? (
              <div className="relative">
                <button
                  onClick={toggleMenu}
                  className="flex items-center gap-2 hover:opacity-80"
                >
                  <span>{username}</span>
                  <CircleUserRound className="h-7 w-7" />
                </button>
                {isOpen && (
                  <div className="absolute font-inter text-xl right-0 mt-2 w-52 bg-white text-zinc-800 rounded-xl shadow-lg z-50">
                    <div className="flex flex-col items-start px-4 py-4 space-y-2">
                      <button
                        onClick={() => {
                          navigate('/user-profile');
                          closeMenu();
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
                      >
                        Mi Panel <UserCog />
                      </button>
                      <span className="w-full h-[1px] bg-gray-300 my-2"></span>
                      <button
                        onClick={() => {
                          handleLogout();
                          closeMenu();
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
                      >
                        Cerrar Sesión <LogOut />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <a href="/login" className="hover:opacity-80 flex flex-row items-center gap-2">
                Iniciar Sesión <CircleUserRound className="h-7 w-7" />
              </a>
            )}
          </div>
        </div>
        <MenuMovil />
      </nav>
    </header>
  );
}
