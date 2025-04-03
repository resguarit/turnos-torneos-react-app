import { ChevronLeft, ChevronRight, PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Liga({ matches, date, onEditMatch }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 font-inter">
      <div className="flex items-center justify-between mb-4">
        <button className="p-2">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h3 className="font-medium lg:text-2xl">Fecha 1 - {date}</h3>
        <button className="p-2">
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-2 justify-center">
        {matches.map((match, index) => (
          <div
            key={index}
            className="flex flex-col md:flex-row md:justify-between text-xs items-center p-3 bg-gray-100 rounded-lg"
          >
            {/* Equipo 1 */}
            <div className="flex items-center gap-2 justify-center md:justify-start w-full">
              {match.team1 && (
                <>
                  <div
                    className="w-6 h-6 rounded-full"
                  />
                  <span className="text-sm lg:text-lg">{match.team1.name}</span>
                </>
              )}
            </div>
            <span className="text-sm font-medium lg:text-lg">vs</span>
            {/* Equipo 2 */}
            <div className="flex items-center gap-2 justify-center md:justify-end w-full">
              {match.team2 && (
                <>
                  <span className="text-sm lg:text-lg">{match.team2.name}</span>
                  <div
                    className="w-6 h-6 rounded-full"
                  />
                </>
              )}
            </div>
            {/* Hora */}
            <span className="text-sm text-gray-500 lg:ml-60">{match.time}</span>
            {/* Botón de edición */}
            <button
              className="ml-4 bg-naranja text-white px-2 py-1 rounded-md text-sm lg:text-lg"
              onClick={() => onEditMatch(match)}
            >
              Editar
            </button>
          </div>
        ))}
      </div>
      <BackButton onClick={() => navigate(`/zonas-admi/${torneoId}?zonaId=${zonaId}`)} />
    </div>
  );
}
