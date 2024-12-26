'use client'

import { useState } from 'react'
import { Header } from '@/components/header'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users2, PenSquare } from 'lucide-react'
import { JugadorModal } from '@/components/JugadorModal'
import { Footer } from '@/components/Footer'
import { Liga } from '@/components/Liga'

const matches = [
  {
    team1: "DEP. ALFILERES",
    score1: 1,
    team2: "EL PELIGRO",
    score2: 1,
    time: "18:00",
    field: "2",
    warnings: 2,
    expulsions: 0
  },
  {
    team1: "CHICAGO",
    score1: 9,
    team2: "CUCHARA FC",
    score2: 4,
    time: "19:00",
    field: "5",
    warnings: 0,
    expulsions: 0
  },
  {
    team1: "E.E.N",
    score1: 5,
    team2: "COCOS FC",
    score2: 7,
    time: "19:00",
    field: "2",
    warnings: 1,
    expulsions: 1
  }
]

export default function CargaPartido() {
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState(null)

  const handleShowPlayers = (team1, team2) => {
    setSelectedTeams({ team1, team2 })
    setShowPlayerModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl mx-auto p-6 ">
        <h1 className="text-2xl font-bold mb-6">Partidos</h1>
        
        <div className="space-y-4 mb-6">
        <div>
            <label className="block font-medium mb-1" >
                Selecciona el Torneo:
            </label>
            <select className="w-full border border-gray-300 p-1" style={{borderRadius: '6px'}}>
                <option value="" disabled selected>
                Seleccionar torneo...
                </option>
                <option value="domingo">Domingo</option>
                <option value="sabado">Sábado</option>
                <option value="senior">Senior</option>
            </select>
        </div>
        <div>
            <label className="block  font-medium mb-1">
                Selecciona la Zona:
            </label>
            <select className="w-full border border-gray-300  p-1" style={{borderRadius: '6px'}}>
                <option value="" disabled selected>
                Seleccionar zona...
                </option>
                <option value="a">Zona A</option>
                <option value="b">Zona B</option>
                <option value="c">Zona C</option>
            </select>
            </div>
        </div>

        <Liga matches={matches} onShowPlayers={handleShowPlayers} />
      </main>
      <Footer />
    </div>
  )
}

