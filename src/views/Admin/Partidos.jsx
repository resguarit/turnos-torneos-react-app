import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import { Button } from "@/components/ui/button"
import { useNavigate } from "react-router-dom"

const recentMatches = [
  {
    team1: "KIRICOCHO",
    score1: 3,
    team2: "LA 95 FC",
    score2: 2,
    time: "18:00",
    field: 3,
    tournament: "DOMINGO",
    zone: "Liga A"
  },
  {
    team1: "CUCHARA FC",
    score1: 0,
    team2: "E.E.N",
    score2: 1,
    time: "20:00",
    field: 2,
    tournament: "SENIOR",
    zone: "Zona C"
  },
  {
    team1: "ATLETICO",
    score1: 3,
    team2: "1800 FC",
    score2: 2,
    time: "19:00",
    field: 5,
    tournament: "SABADO",
    zone: "Zona B"
  }
]

function Partidos() {
    const navigate = useNavigate();

    const handleVerMasClick = () => {
        navigate('/ver-partidos');
        }

        const handleCargarClick = () => {
            navigate('/cargar-partido');
            }

  return (
    <div className="min-h-screen flex flex-col font-inter">
    <Header></Header>
    <div className="p-6 grow bg-gray-100">
      <div className="max-w-7xl lg:max-w-full mx-auto">
        <h1 className="text-2xl font-bold mb-4 lg:text-4xl">Partidos</h1>
        <h2 className="font-semibold text-sm mb-4 lg:text-2xl">Últimos Partidos:</h2>
        
        <div className="bg-white shadow overflow-x-auto mb-1 lg:text-xl" style={{ borderRadius: '8px' }}>
          <table className="w-full ">
            <thead className="bg-naranja text-white  ">
              <tr >
                <th className="px-10 py-2 text-center font-medium" >Resultado</th>
                <th className="px-4 py-2 text-center font-medium">Horario</th>
                <th className="px-4 py-2 text-center font-medium">Cancha</th>
                <th className="px-6 py-2 text-center font-medium">Torneo</th>
                <th className="px-6 py-2 text-center font-medium">Zona</th>
              </tr>
            </thead>
            <tbody>
              {recentMatches.map((match, index) => (
                <tr key={index} className="border-b text-sm lg:text-lg">
                  <td className="px-4 py-2 text-center">
                    <div className="flex flex-col items-center lg:flex-row lg:justify-around">
                        <span>{match.team1}</span>
                        <span>{match.score1} - {match.score2}</span>
                        <span>{match.team2}</span>
                    </div>
                    </td>
                  <td className="px-4 py-2 text-center">{match.time}</td>
                  <td className="px-4 py-2 text-center">{match.field}</td>
                  <td className="px-4 py-2 text-center">{match.tournament}</td>
                  <td className="px-4 py-2 text-center">{match.zone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-start space-y-5">
          <Button onClick={handleVerMasClick} variant="link" className="text-gray-600 lg:text-base">
            Ver más →
          </Button>
          <button onClick={handleCargarClick} className="bg-black text-white hover:bg-black/90 text-sm p-2 lg:text-lg" style={{borderRadius: '8px'}}>
            Cargar Partido +
          </button>
        </div>
      </div>
    </div>
    <Footer></Footer>
    </div>
  )
}
export default Partidos

