import { useState } from 'react'
import { Header } from '@/components/header'

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Users2, PenSquare } from 'lucide-react'
import { JugadorModal } from '@/components/JugadorModal'
import { Footer } from '@/components/Footer'

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

export default function MatchesPage() {
  const [showPlayerModal, setShowPlayerModal] = useState(false)
  const [selectedTeams, setSelectedTeams] = useState(null)

  const handleShowPlayers = (team1, team2) => {
    setSelectedTeams({ team1, team2 })
    setShowPlayerModal(true)
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-7xl lg:max-w-full grow mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 lg:text-4xl">Partidos</h1>
        
        <div className="space-y-4 mb-6">
        <div>
            <label className="block font-medium mb-1 lg:text-xl" >
                Selecciona el Torneo:
            </label>
            <select className="w-full border lg:w-1/2 border-gray-300 p-1 lg:text-xl" style={{borderRadius: '6px'}}>
                <option value="" disabled selected>
                Seleccionar torneo...
                </option>
                <option value="domingo">Domingo</option>
                <option value="sabado">Sábado</option>
                <option value="senior">Senior</option>
            </select>
        </div>
        <div>
            <label className="block  font-medium mb-1 lg:text-xl">
                Selecciona la Zona:
            </label>
            <select className="w-full border border-gray-300 lg:text-xl lg:w-1/2 p-1" style={{borderRadius: '6px'}}>
                <option value="" disabled selected>
                Seleccionar zona...
                </option>
                <option value="a">Zona A</option>
                <option value="b">Zona B</option>
                <option value="c">Zona C</option>
            </select>
            </div>
        </div>

        <div className="bg-white shadow-sm overflow-x-auto" style={{borderRadius: '6px'}}>
          <div className="p-4 border-b flex items-center justify-between">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h2 className="font-medium lg:text-xl">Fecha 1 - 18/12/2024</h2>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <table className="w-full">
            <thead>
              <tr className="border-b bg-naranja text-white lg:text-xl"> 
                <th className="px-4 py-2 text-center font-medium">Resultado</th>
                <th className="px-4 py-2 text-center font-medium">Horario</th>
                <th className="px-4 py-2 text-center font-medium">Cancha</th>
                <th className="px-4 py-2 text-center font-medium">Amonestaciones</th>
                <th className="px-4 py-2 text-center font-medium">Expulsiones</th>
                <th className="px-4 py-2 text-center font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {matches.map((match, index) => (
                <tr key={index} className="border-b">
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-col items-center lg:text-lg">
                        <span>{match.team1}</span>
                        <span>{match.score1} - {match.score2}</span>
                        <span>{match.team2}</span>
                    </div>
                    </td>
                  <td className="px-4 py-2 text-center ">{match.time}</td>
                  <td className="px-4 py-2 text-center">{match.field}</td>
                  <td className="px-4 py-2 text-center">{match.warnings}</td>
                  <td className="px-4 py-2 text-center">{match.expulsions}</td>
                  <td className="px-4 py-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => handleShowPlayers(match.team1, match.team2)}
                        className="bg-naranja hover:bg-naranja/90 text-white"
                        style={{ borderRadius: '8px' }}
                      >
                        <Users2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="bg-naranja hover:bg-naranja/90 text-white"
                        style={{ borderRadius: '8px' }}
                      >
                        <PenSquare className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showPlayerModal && selectedTeams && (
          <JugadorModal
            team1={selectedTeams.team1}
            team2={selectedTeams.team2}
            onClose={() => setShowPlayerModal(false)}
          />
        )}
      </main>
      <Footer />
    </div>
  )
}

