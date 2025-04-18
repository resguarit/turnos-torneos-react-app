import { PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Eliminacion({ teams }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <div className="flex justify-between items-start gap-4">
        <div className="space-y-2 w-1/4">
          {teams.slice(0, Math.ceil(teams.length / 2)).map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-2 p-2 bg-gray-100 rounded"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <span className="text-sm lg:text-lg">{team.name}</span>
            </div>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <div className="w-full h-px bg-gray-300" />
        </div>

        <div className="space-y-2 w-1/4">
          {teams.slice(Math.ceil(teams.length / 2)).map((team) => (
            <div
              key={team.id}
              className="flex items-center gap-2 p-2 bg-gray-100 rounded"
            >
              <div
                className="w-6 h-6 rounded-full"
                style={{ backgroundColor: team.color }}
              />
              <span className="text-sm lg:text-lg">{team.name}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center mt-4">
        <button style={{ borderRadius: '8px' }} size="sm" className=" text-white bg-naranja p-2 gap-2 w-fit flex items-center justify-between lg:text-lg">
          Editar
          <PenSquare className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
