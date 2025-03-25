import Resguarit from "@/assets/logoresguarit.png"
import MenuMovil from "./MenuMovil"
import { CircleUserRound } from "lucide-react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useEffect, useState } from "react"
import { UserCog } from "lucide-react"
import { LogOut } from "lucide-react"
import ModalConfirmation from "./ModalConfirmation"
import { Pencil } from "lucide-react"

export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUserName] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const userRole = localStorage.getItem("user_role")
  const [hasActiveReservation, setHasActiveReservation] = useState(false)
  const isReservationPage = location.pathname === "/contador-bloqueo" || location.pathname === "/bloqueo-reserva"

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  const closeMenu = () => {
    setIsOpen(false)
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

  const handleModal = () => {
    setShowModal(true)
  }

  const handleConfirmSubmit = () => {
    setShowModal(false)
    localStorage.clear()
    setUserName(null)
    navigate("/")
  }

  const closeConfirmModal = () => {
    setShowModal(false)
  }

  const handleReturnToReservation = () => {
    navigate("/bloqueo-reserva")
  }

  return (
    <header className="bg-naranja max-w-full text-white px-6 py-2">
      <nav className="mx-auto flex items-center justify-between">
        <Link to="/">
          <img src={Resguarit || "/placeholder.svg"} alt="Logo" className="h-10 lg:h-12 xl:h-14" />
        </Link>

        {/* Botón de reserva activa para desktop y tablet */}
        {hasActiveReservation && !isReservationPage && (
          <button
            onClick={handleReturnToReservation}
            className="hidden md:hidden absolute left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-3 py-1 rounded-lg hover:bg-green-700 items-center gap-1"
          >
            Continuar Reserva
          </button>
        )}

        <div className="hidden md:flex items-center">
          <div className="flex gap-8 lg:gap-12 font-inter text-sm xl:text-lg">
            <Link to="/" className="hover:opacity-80">
              Inicio
            </Link>
            {userRole === "admin" && (
              <Link to="/panel-admin" className="hover:opacity-80 flex items-center gap-1">
                Administrador
              </Link>
            )}
            <Link to="/torneos-admi" className="hover:opacity-80">
              Torneos
            </Link>

            {/* Reemplazar "Reservar" por "Continuar Reserva" cuando hay una reserva activa */}
            {hasActiveReservation && !isReservationPage ? (
              <button onClick={handleReturnToReservation} className="hover:opacity-80 bg-green-600 px-2 rounded-xl">
                Continuar Reserva
              </button>
            ) : (
              <Link to="/reserva-mobile" className="hover:opacity-80">
                Reservar
              </Link>
            )}

            <Link to="/partidos" className="hover:opacity-80">
              Partidos
            </Link>
            <Link to="/reglamento" className="hover:opacity-80">
              Reglamento
            </Link>
            <Link to="/premios" className="hover:opacity-80">
              Premios
            </Link>

            {username ? (
              <div className="relative">
                <button onClick={toggleMenu} className="flex items-center gap-2 hover:opacity-80">
                  <span>{username}</span>
                  <CircleUserRound className="h-5 w-5" />
                </button>
                {isOpen && (
                  <div className="absolute font-inter text-base right-0 mt-2 w-48 bg-white text-zinc-800 rounded-xl shadow-lg z-50">
                    <div className="flex flex-col items-start px-4 py-4 space-y-2">
                      <button
                        onClick={() => {
                          navigate("/editar-perfil")
                          closeMenu()
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1  rounded-xl"
                      >
                        Editar Perfil <Pencil className="w-5" />
                      </button>
                      <span className="w-full h-[1px] bg-gray-300 my-2"></span>
                      <button
                        onClick={() => {
                          navigate("/user-profile")
                          closeMenu()
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
                      >
                        Mi Panel <UserCog className="w-5" />
                      </button>
                      <span className="w-full h-[1px] bg-gray-300 my-2"></span>
                      <button
                        onClick={() => {
                          handleModal()
                          closeMenu()
                        }}
                        className="w-full flex justify-between text-left hover:bg-gray-200 px-2 py-1 rounded-xl"
                      >
                        Cerrar Sesión <LogOut className="w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="hover:opacity-80 flex flex-row gap-2">
                Iniciar Sesión <CircleUserRound className="h-7 w-7" />
              </Link>
            )}
          </div>
        </div>
        <MenuMovil />
      </nav>
      {showModal && (
        <ModalConfirmation
          onConfirm={handleConfirmSubmit}
          onCancel={closeConfirmModal}
          title="¿Desea cerrar la sesión?"
          botonText1={"Cancelar"}
          botonText2={"Cerrar Sesión"}
        />
      )}
    </header>
  )
}

