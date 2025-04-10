import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { UserCog, LogOut, Pencil, CircleUserRound, ArrowLeftCircle } from "lucide-react"
import ModalConfirmation from "./ModalConfirmation"

const MenuMovil = ({ setMenuOpen }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [username, setUserName] = useState(null)
  const [hasActiveReservation, setHasActiveReservation] = useState(false)
  const userRole = localStorage.getItem("user_role")
  const navigate = useNavigate()
  const location = useLocation()
  const isReservationPage = location.pathname === "/contador-bloqueo" || location.pathname === "/bloqueo-reserva"

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    if (typeof setMenuOpen === "function") {
      setMenuOpen(!isOpen)
    }
    setShowUserMenu(false) // Cerrar menú de usuario si está abierto
  }

  const closeMenu = () => {
    setIsOpen(false)
    if (typeof setMenuOpen === "function") {
      setMenuOpen(false)
    }
  }

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu)
    setIsOpen(false) // Cerrar menú principal si está abierto
  }

  const closeUserMenu = () => {
    setShowUserMenu(false)
  }

  const handleModal = () => {
    setShowModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowModal(false)
    localStorage.clear()
    setUserName(null)
    closeUserMenu()
    navigate("/")
  }

  const closeConfirmModal = () => {
    setShowModal(false)
  }

  const handleReturnToReservation = () => {
    closeMenu()
    closeUserMenu()
    navigate("/bloqueo-reserva")
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

  // Mejorar la detección de reserva activa
  useEffect(() => {
    const checkActiveReservation = () => {
      const reservaTemp = localStorage.getItem("reservaTemp")
      setHasActiveReservation(!!reservaTemp)
    }

    checkActiveReservation()

    window.addEventListener("storage", checkActiveReservation)

    const interval = setInterval(checkActiveReservation, 1000)

    return () => {
      window.removeEventListener("storage", checkActiveReservation)
      clearInterval(interval)
    }
  }, [])

  return (
    <>
      {/* Botón de reserva activa para móvil */}
      {hasActiveReservation && !isReservationPage && (
        <div className="md:hidden fixed top-20 left-0 right-0 z-40 flex justify-center">
          <button
            onClick={handleReturnToReservation}
            className="bg-green-600 text-white px-4 py-2 rounded-b-lg shadow-lg flex items-center gap-2"
          >
            <ArrowLeftCircle className="h-4 w-4" />
            Continuar Reserva
          </button>
        </div>
      )}

      {/* Botones de navegación móvil */}
      <div className="md:hidden z-30 absolute right-5 flex items-center gap-3">
        {/* Botón de perfil de usuario con texto */}
        <div className="flex items-center">
          {username ? (
            <button onClick={toggleUserMenu} className="text-white flex items-center gap-1">
              <span className="text-sm font-medium max-w-[80px] truncate">{username}</span>
              <CircleUserRound className="h-6 w-6" />
            </button>
          ) : (
            <Link to="/login" className="text-white flex items-center gap-1">
              <span className="text-sm font-medium">Iniciar Sesión</span>
              <CircleUserRound className="h-6 w-6" />
            </Link>
          )}
        </div>

        {/* Botón hamburguesa para menú principal */}
        <button onClick={toggleMenu}>
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
      </div>

      {/* Menú principal de navegación */}
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

          {/* Mostrar notificación de reserva activa */}
          {hasActiveReservation && !isReservationPage && (
            <div className="mx-8 mb-4 bg-green-600 text-white p-3 rounded-lg flex items-center justify-between">
              <span>Tienes una reserva en curso</span>
              <button
                onClick={handleReturnToReservation}
                className="flex items-center gap-1 bg-white text-green-600 px-2 py-1 rounded-md text-sm"
              >
                <ArrowLeftCircle className="h-4 w-4" />
                Continuar
              </button>
            </div>
          )}

          <div className="flex flex-col items-start px-8 py-8 space-y-6 text-white">
            {/* Crear un array de enlaces de navegación, reemplazando "Reservas" por "Continuar Reserva" cuando sea necesario */}
            {[
              { label: "Inicio", path: "/" },
              //{ label: "Torneos", path: "/torneos-admi" },
              // Reemplazar "Reservas" por "Continuar Reserva" cuando hay una reserva activa
              ...(hasActiveReservation && !isReservationPage
                ? [{ label: "Continuar Reserva", path: "/bloqueo-reserva", onClick: handleReturnToReservation }]
                : [{ label: "Reservas", path: "/reserva-mobile" }]),
              //{ label: "Partidos", path: "/partidos" },
              //{ label: "Reglamento", path: "/reglamento" },
              //{ label: "Premios", path: "/premios" },
              ...(userRole === "admin" || userRole === "moderador" 
                ? [{ label: userRole === "admin" ? "Administrador" : "Moderador", path: "/panel-admin" }] 
                : []),
            ].map((item) => (
              <div
                key={item.path}
                className="flex w-full items-center justify-between border-b border-white pb-4"
                onClick={() => {
                  if (item.onClick) {
                    item.onClick()
                  } else {
                    closeMenu()
                  }
                }}
              >
                {item.onClick ? (
                  <button className="text-lg font-medium text-left flex-grow hover:text-white transition-colors">
                    {item.label}
                  </button>
                ) : (
                  <Link
                    to={item.path}
                    className="text-lg font-medium text-left flex-grow hover:text-white transition-colors"
                  >
                    {item.label}
                  </Link>
                )}
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
          </div>
        </div>
      )}

      {/* Menú de perfil de usuario */}
      {showUserMenu && (
        <div className="fixed inset-0 bg-naranja z-50 flex flex-col overflow-y-auto">
          {/* Botón Cerrar */}
          <div className="flex justify-end p-6">
            <button onClick={closeUserMenu} className="text-green">
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

          {/* Mostrar notificación de reserva activa */}
          {hasActiveReservation && !isReservationPage && (
            <div className="mx-8 mb-4 bg-green-600 text-white p-3 rounded-lg flex items-center justify-between">
              <span>Tienes una reserva en curso</span>
              <button
                onClick={handleReturnToReservation}
                className="flex items-center gap-1 bg-white text-green-600 px-2 py-1 rounded-md text-sm"
              >
                <ArrowLeftCircle className="h-4 w-4" />
                Continuar
              </button>
            </div>
          )}

          <div className="flex flex-col items-center px-8 py-4 space-y-6 text-white">
            <CircleUserRound className="h-16 w-16 mb-2" />
            <h2 className="text-xl font-bold">{username}</h2>

            <div className="w-full space-y-4">
              <button
                onClick={() => {
                  navigate("/editar-perfil")
                  closeUserMenu()
                }}
                className="w-full flex items-center justify-between text-left hover:bg-naranja/80 px-4 py-3 text-white rounded-lg transition duration-150 ease-in-out"
              >
                <span className="flex items-center">Editar Perfil</span>
                <Pencil className="h-5 w-5" />
              </button>

              <button
                onClick={() => {
                  navigate("/user-profile")
                  closeUserMenu()
                }}
                className="w-full flex items-center justify-between text-left hover:bg-naranja/80 px-4 py-3 text-white rounded-lg transition duration-150 ease-in-out"
              >
                <span className="flex items-center">Mi Panel</span>
                <UserCog className="h-5 w-5" />
              </button>

              <button
                onClick={handleModal}
                className="w-full flex items-center justify-between text-left hover:bg-naranja/80 px-4 py-3 text-white rounded-lg transition duration-150 ease-in-out"
              >
                <span className="flex items-center">Cerrar Sesión</span>
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <ModalConfirmation
          onConfirm={handleConfirmSubmit}
          onCancel={closeConfirmModal}
          title="¿Desea cerrar la sesión?"
          botonText1={"Cancelar"}
          botonText2={"Cerrar Sesión"}
        />
      )}
    </>
  )
}

export default MenuMovil

