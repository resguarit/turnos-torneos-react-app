"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight } from "lucide-react"
import { useTorneos } from "@/context/TorneosContext"

export default function TorneosDropdown({ anchorRef, closeMenuTorneos }) {
  const [style, setStyle] = useState({})
  const navigate = useNavigate()
  const { torneos } = useTorneos()
  const [openSubmenu, setOpenSubmenu] = useState(null) // 'torneos' o null
  const [openTorneoSubmenu, setOpenTorneoSubmenu] = useState(null) // torneoId o null
  const dropdownRef = useRef(null)

  useEffect(() => {
    if (anchorRef?.current) {
      const rect = anchorRef.current.getBoundingClientRect()
      setStyle({
        position: "absolute",
        top: rect.bottom + window.scrollY + 6,
        left: rect.left + window.scrollX - 20,
        zIndex: 50,
        minWidth: 100,
      })
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        anchorRef.current &&
        !anchorRef.current.contains(event.target)
      ) {
        closeMenuTorneos()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [anchorRef, closeMenuTorneos])

  const handleTorneosClick = () => {
    if (openSubmenu === "torneos") {
      setOpenSubmenu(null)
      setOpenTorneoSubmenu(null)
    } else {
      setOpenSubmenu("torneos")
      setOpenTorneoSubmenu(null)
    }
  }

  const handleTorneoClick = (torneoId) => {
    if (openTorneoSubmenu === torneoId) {
      setOpenTorneoSubmenu(null)
    } else {
      setOpenTorneoSubmenu(torneoId)
    }
  }

  return (
    <>
      <div
        ref={dropdownRef}
        style={style}
        className="font-inter bg-black text-white  rounded-[4px] shadow-lg flex relative   animate-in fade-in duration-200"
      >
        <div className="flex flex-col w-full items-start p-2 space-y-1 min-w-fit">
          {/* Torneos - Con submenu */}
          <div className="w-full relative">
            <button
              onClick={handleTorneosClick}
              className={`w-full flex justify-between rounded-[4px] items-center gap-2 text-left px-3 py-2 transition-colors ${openSubmenu === "torneos" ? "bg-gray-700" : "hover:bg-gray-700  "}`}
            >
              <span className="">Torneos</span>
              <ChevronRight
                className={`w-4 h-4 transition-transform duration-200 ${openSubmenu === "torneos" ? "rotate-90" : ""}`}
              />
            </button>

            {/* Submenu de Torneos */}
            {openSubmenu === "torneos" && (
              <div className="absolute -top-2  left-full ml-2 bg-black rounded-r-[4px] border-l-white border-l-[1px] shadow-lg py-2 px-2 min-w-fit z-50 animate-in fade-in slide-in-from-left-5 duration-200">
                <button
                  className="w-full text-left  px-3 py-2 rounded-[4px] hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    navigate("/torneos-admi")
                    closeMenuTorneos()
                  }}
                >
                  Ver Torneos
                </button>

                <div className="w-full h-[1px] bg-gray-200 my-1"></div>

                {torneos
                  .filter((torneo) => torneo.activo === 1)
                  .map((torneo) => (
                    <div key={torneo.id} className="w-full relative">
                      <button
                        onClick={() => handleTorneoClick(torneo.id)}
                        className={`w-full flex whitespace-nowrap justify-between gap-4 items-center text-left px-3 py-2 rounded-[4px] transition-colors ${openTorneoSubmenu === torneo.id ? "bg-gray-700" : "hover:bg-gray-700"}`}
                      >
                        <span>{torneo.nombre}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 ${openTorneoSubmenu === torneo.id ? "rotate-90" : ""}`}
                        />
                      </button>

                      {/* Submenu de Zonas del Torneo */}
                      {openTorneoSubmenu === torneo.id && (
                        <div className="absolute -top-2 left-full ml-2 bg-black rounded-r-[4px] shadow-lg py-2 px-2 min-w-fit z-50 border-l-white border-l-[1px] animate-in fade-in slide-in-from-left-5 duration-200">
                          <button
                            className="w-full text-left whitespace-nowrap px-3 py-2 rounded-[4px] hover:bg-gray-700 transition-colors"
                            onClick={() => {
                              navigate(`/zonas-admi/${torneo.id}`)
                              closeMenuTorneos()
                            }}
                          >
                            Ver Zonas
                          </button>

                          {torneo.zonas && torneo.zonas.filter((zona) => zona.activo === 1).length > 0 && (
                            <>
                              <div className="w-full h-[1px] bg-gray-200 my-1"></div>
                              {torneo.zonas
                                .filter((zona) => zona.activo === 1)
                                .map((zona) => (
                                  <button
                                    key={zona.id}
                                    className="w-full text-left px-3 py-2 rounded-[4px] hover:bg-gray-700 transition-colors"
                                    onClick={() => {
                                      navigate(`/detalle-zona/${zona.id}`)
                                      closeMenuTorneos()
                                    }}
                                  >
                                    {zona.nombre}
                                  </button>
                                ))}
                            </>
                          )}

                          {(!torneo.zonas || torneo.zonas.filter((zona) => zona.activo === 1).length === 0) && (
                            <>
                              <div className="w-full h-[1px] bg-gray-200 my-1"></div>
                              <span className="text-gray-400 text-sm px-3 py-2 block">Sin zonas</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="w-full h-[1px] bg-gray-200 my-1"></div>

          {/* Partidos - Solo click */}
          <button
            onClick={() => {
              navigate("/partidos")
              closeMenuTorneos()
            }}
            className="w-full flex justify-between rounded-[4px] items-center text-left hover:bg-gray-700 px-3 py-2 transition-colors"
          >
            <span className="">Partidos</span>
          </button>

          <div className="w-full h-[1px] bg-gray-200 my-1"></div>

          {/* Jugadores - Solo click */}
          <button
            onClick={() => {
              navigate("/ver-jugadores")
              closeMenuTorneos()
            }}
            className="w-full flex justify-between items-center text-left hover:bg-gray-700 px-3 py-2 rounded-[4px] transition-colors"
          >
            <span className="">Jugadores</span>
          </button>
        </div>
      </div>
    </>
  )
}
