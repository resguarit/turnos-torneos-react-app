import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { UserCog, MonitorIcon as MonitorCog, LogOut, Pencil } from "lucide-react"
import ModalConfirmation from "./ModalConfirmation"
import { BASE_URL } from '@/constants/config'

const MenuMovil = ({ setMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [username, setUserName] = useState(null)
  const userRole = localStorage.getItem("user_role")
  const navigate = useNavigate()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setMenuOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
    setMenuOpen(false)
  }

  const toggleProfileMenu = () => {
    setIsProfileOpen(!isProfileOpen)
  }

  const handleModal = () => {
    setShowModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowModal(false)
    localStorage.clear()
    setUserName(null)
    closeMenu()
    navigate("/")
  }

  const closeConfirmModal = () => {
    setShowModal(false)
  }

  useEffect(() => {
    const name = localStorage.getItem("username")
    if (name) {
      setUserName(name)
    }

    const handleStorageChange = () => {
      const updatedName = localStorage.getItem("username")
      setUserName(updatedName)
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return (
    <>
      {/* Botón Hamburger */}
      <button onClick={toggleMenu} className="md:hidden z-30 absolute right-5">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="white"
          className="h-6 w-6"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-naranja z-50 flex flex-col overflow-y-auto">
          {/* Botón Cerrar */}
          <div className="flex justify-end p-6">
            <button onClick={toggleMenu} className="text-green">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div className="flex flex-col items-start px-8 py-8 space-y-6 text-white">
            {[
              { label: "Inicio", path: `${BASE_URL}/` },
              /* { label: "Torneos", path: "/torneos-admi" }, */
              { label: "Reservas", path: `${BASE_URL}/nueva-reserva` },
              /* { label: "Partidos", path: "/partidos" }, */
              { label: "Reglamento", path: `${BASE_URL}/reglamento` },
              { label: "Premios", path: `${BASE_URL}/premios` },
              ...(userRole === 'admin' ? [{ label: "Administrador", path: `${BASE_URL}/panel-admin` }] : []),
            ].map((item) => (
              <div
                key={item.path}
                className="flex w-full items-center justify-between border-b border-white pb-4"
                onClick={closeMenu} // Cierra el menú al hacer clic
              >
                <Link
                  to={item.path}
                  className="text-lg font-medium text-left flex-grow hover:text-white transition-colors"
                >
                  {item.label}
                </Link>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2}
                  stroke="currentColor"
                  className="h-5 w-5 text-white"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </div>
            ))}

            <div
              className="flex w-full items-center justify-between border-b border-green pb-4"
              onClick={username ? toggleProfileMenu : () => navigate("/login")}
            >
              <div className="text-lg font-medium text-left flex-grow hover:text-white transition-colors flex items-center gap-2">
                {username ? "Perfil de Usuario" : "Iniciar Sesión"}
              </div>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
            </div>
            {isProfileOpen && username && (
              <div className="flex flex-col items-start px-3 bg-naranja text-white rounded-lg text-lg  overflow-hidden">
                <button
                  onClick={() => {
                    navigate("/editar-perfil")
                    closeMenu()
                  }}
                  className="w-full flex items-center justify-between text-left hover:bg-gray-100 px-4 py-3 text-white transition duration-150 ease-in-out"
                >
                  <span className="flex items-center">
                    Editar Perfil
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    navigate("/user-profile")
                    closeMenu()
                  }}
                  className="w-full flex items-center justify-between text-left hover:bg-gray-100 px-4 py-3 text-white transition duration-150 ease-in-out"
                >
                  <span className="flex items-center">
                    Mi Panel
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-white"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
                
                
              </div>
            )}

              
              
            <div
              className="flex w-full items-center justify-between border-b border-green pb-4"
            >
            <button
                  onClick={() => {
                    handleModal()
                  }}
                  className="text-lg font-medium justify-between text-left flex-grow hover:text-white transition-colors flex items-center gap-2"
                >
                  <span className="flex items-center">
                    Cerrar Sesión
                  </span>
                  <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="h-5 w-5 text-white"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
                </button>
                </div>
          </div>
        </div>
      )}
      {showModal && (
        <ModalConfirmation
          onConfirm={handleConfirmSubmit}
          onCancel={closeConfirmModal}
          title="Cerrar Sesión"
          subtitle={"¿Desea cerrar la sesión?"}
          botonText1={"Cancelar"}
          botonText2={"Cerrar Sesión"}
        />
      )}
    </>
  )
}

export default MenuMovil

