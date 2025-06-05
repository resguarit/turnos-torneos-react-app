import Resguarit from "@/assets/logoresguarit.png"
import MenuMovil from "./MenuMovil"
import { CircleUserRound } from "lucide-react"
import { useNavigate, Link, useLocation } from "react-router-dom"
import { useEffect, useState, useRef } from "react"
import { UserCog } from "lucide-react"
import { LogOut } from "lucide-react"
import ModalConfirmation from "./ModalConfirmation"
import { Pencil } from "lucide-react"
import { decryptRole } from "@/lib/getRole"
import TorneosDropdown from "./TorneosDropdown"


export function Header() {
  const navigate = useNavigate()
  const location = useLocation()
  const [username, setUserName] = useState(null)
  const [isOpen, setIsOpen] = useState(false)
  const [MenuTorneos, setMenuTorneos] = useState(false)
  const torneosBtnRef = useRef(null);
  const [showModal, setShowModal] = useState(false)
  const [userRole, setUserRole] = useState(null);
  const [hasActiveReservation, setHasActiveReservation] = useState(false)
  const isReservationPage = location.pathname === "/contador-bloqueo" || location.pathname === "/bloqueo-reserva" || location.pathname === "/confirmar-turno" || location.pathname === "/confirmar-login"

  const toggleMenu = () => {
    setIsOpen(!isOpen)
    setMenuTorneos(false)
  }

  const toggleMenuTorneos = () => {
    setMenuTorneos(!MenuTorneos)
    setIsOpen(false)
  }

  const closeMenu = () => {
    setIsOpen(false)
  }

  const closeMenuTorneos = () => {
    setMenuTorneos(false)
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

  useEffect(() => {
    const userRoleEncrypted = localStorage.getItem("user_role");
    setUserRole(userRoleEncrypted ? decryptRole(userRoleEncrypted) : null);
  }, []);

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
    const token = localStorage.getItem('token')
    const reservaTemp = JSON.parse(localStorage.getItem('reservaTemp'))
    
    if (!token) {
      navigate(`/confirmar-turno?time=${reservaTemp.horario_id}&date=${reservaTemp.fecha}&court=${reservaTemp.cancha_id}`)
    } else {
      navigate("/bloqueo-reserva")
    }
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
          <div className="flex gap-8 lg:gap-20 font-inter text-sm xl:text-lg">
            <Link
              to={
                userRole === "admin" || userRole === "moderador"
                  ? "/panel-admin"
                  : "/"
              }
              className="hover:opacity-80"
            >
              {userRole === "admin" || userRole === "moderador" ? "Panel Admin" : "Inicio"}
            </Link>
            {(userRole === "admin" || userRole === "moderador") && (
              <button 
              onClick={toggleMenuTorneos}
              ref={torneosBtnRef}
              className="hover:opacity-80">
                Torneos
            </button>
            )}
            {(userRole !== "admin" && userRole !== "moderador") && (
            <Link to="/torneos-user" className="hover:opacity-80">
              Torneos
            </Link>
            )}
            {/* Reemplazar "Reservar" por "Continuar Reserva" cuando hay una reserva activa */}
            {hasActiveReservation && !isReservationPage ? (
              <button onClick={handleReturnToReservation} className="hover:opacity-80 bg-green-600 px-2 rounded-xl">
                Continuar Reserva
              </button>
            ) : (
              <Link to="/select-deporte" className="hover:opacity-80">
                Reservar
              </Link>
            )}
            {/* <Link to="/reglamento" className="hover:opacity-80">
            <Link to="/reglamento" className="hover:opacity-80">
              Reglamento
            </Link>
            
            <Link to="/premios" className="hover:opacity-80">
              Premios
            </Link>
            */}

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
      {MenuTorneos && (
        <TorneosDropdown anchorRef={torneosBtnRef} closeMenuTorneos={closeMenuTorneos}/>
      )}
    </header>
  )
}

