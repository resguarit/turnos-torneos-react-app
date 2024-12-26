import { ChevronLeft, ChevronRight, PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Liga({ matches, date }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 font-inter">
      <div className="flex items-center justify-between mb-4">
        <button className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium">Fecha 1 - {date}</h3>
        <button className="p-2">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2">
        {matches.map((match, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:justify-between text-xs items-center p-3 bg-gray-50 rounded-lg"
          >
            {/* Primer equipo */}
            <div className="flex items-center gap-2 justify-center md:justify-start w-full">
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: match.team1.color }}
              />
              <span className="text-sm">{match.team1.name}</span>
            </div>
            
            {/* Separador */}
            <span className="text-sm font-medium">vs</span>

            {/* Segundo equipo */}
            <div className="flex items-center gap-2 justify-center md:justify-end w-full">
              <span className="text-sm">{match.team2.name}</span>
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: match.team2.color }}
              />
            </div>

            {/* Hora del partido */}
            <span className="text-sm text-gray-500">{match.time}</span>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-4">
        <button style={{ borderRadius: '8px' }} size="sm" className=" text-white bg-naranja p-2 w-[40%] flex items-center justify-between">
          Editar
          <PenSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
