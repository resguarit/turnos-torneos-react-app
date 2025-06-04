"use client"

import { Menu } from "@headlessui/react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { useTorneos } from "@/context/TorneosContext"

export default function TorneosDropdownMenu() {
  const navigate = useNavigate()
  const { torneos } = useTorneos()

  return (
    <Menu as="div" className="relative inline-block text-left">
      <Menu.Button className="hover:opacity-80 px-2 py-1 rounded flex items-center gap-1">
        Torneos <ChevronDown className="w-4 h-4" />
      </Menu.Button>
      <Menu.Items className="absolute left-0 mt-2 w-64 origin-top-left bg-white text-black rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
        <div className="py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                className={`w-full text-left px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                onClick={() => navigate("/torneos-admi")}
              >
                Ver Torneos
              </button>
            )}
          </Menu.Item>
          <div className="border-t my-1" />
          {torneos
            .filter((torneo) => torneo.activo === 1)
            .map((torneo) => (
              <Menu as="div" className="relative" key={torneo.id}>
                <Menu.Button className="w-full flex justify-between items-center px-4 py-2 hover:bg-gray-100">
                  <span>{torneo.nombre}</span>
                  <ChevronRight className="w-4 h-4" />
                </Menu.Button>
                <Menu.Items className="absolute left-full top-0 mt-0 ml-1 w-56 bg-white text-black rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                  <div className="py-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          className={`w-full text-left px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                          onClick={() => navigate(`/zonas-admi/${torneo.id}`)}
                        >
                          Ver Zonas
                        </button>
                      )}
                    </Menu.Item>
                    <div className="border-t my-1" />
                    {torneo.zonas && torneo.zonas.filter((z) => z.activo === 1).length > 0 ? (
                      torneo.zonas
                        .filter((z) => z.activo === 1)
                        .map((zona) => (
                          <Menu.Item key={zona.id}>
                            {({ active }) => (
                              <button
                                className={`w-full text-left px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                                onClick={() => navigate(`/detalle-zona/${zona.id}`)}
                              >
                                {zona.nombre}
                              </button>
                            )}
                          </Menu.Item>
                        ))
                    ) : (
                      <span className="block px-4 py-2 text-gray-400 text-sm">Sin zonas</span>
                    )}
                  </div>
                </Menu.Items>
              </Menu>
            ))}
          <div className="border-t my-1" />
          <Menu.Item>
            {({ active }) => (
              <button
                className={`w-full text-left px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                onClick={() => navigate("/partidos")}
              >
                Partidos
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
                className={`w-full text-left px-4 py-2 ${active ? "bg-gray-100" : ""}`}
                onClick={() => navigate("/ver-jugadores")}
              >
                Jugadores
              </button>
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  )
}
