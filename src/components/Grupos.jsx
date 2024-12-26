import { PenSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Grupos({ teams }) {
  // Divide teams into 4 groups
  const groupSize = Math.ceil(teams.length / 4)
  const groups = {
    A: teams.slice(0, groupSize),
    B: teams.slice(groupSize, groupSize * 2),
    C: teams.slice(groupSize * 2, groupSize * 3),
    D: teams.slice(groupSize * 3, groupSize * 4)
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(groups).map(([groupName, groupTeams]) => (
          <div key={groupName} className="bg-white rounded-lg p-4">
            <h3 className="font-medium mb-3">Grupo {groupName}</h3>
            <div className="space-y-2">
              {groupTeams.map((team) => (
                <div
                  key={team.id}
                  className="flex items-center gap-2 p-2 bg-gray-50 rounded"
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: team.color }}
                  />
                  <span className="text-sm">{team.name}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button variant="outline" size="sm" className="text-[#FF5533]">
          <PenSquare className="w-4 h-4 mr-2" />
          Editar
        </Button>
      </div>
    </div>
  )
}
