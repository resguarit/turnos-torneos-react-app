import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";
import { FaTrophy, FaMedal, FaFutbol, FaHandPaper } from "react-icons/fa";
export default function Premios() {
  const prizes = [
    {
      title: 'Campeón',
      subtitle: 'Copa',
      description: 'Pata para 10 personas de @livinlapataloca',
      subtext: 'Un turno gratis en complejo RNG para la semana',
      icon:  FaTrophy
    },
    {
      title: 'Subcampeón',
      subtitle: 'Copa',
      description: 'Opción para 6 personas de @livinlapataloca',
      subtext: '(ribs, carré o bondiola)',
      icon: FaMedal
    },
    {
      title: 'Goleador',
      subtitle: 'Trofeo',
      description: 'Una pelota de Eliggi',
      icon: FaFutbol
    },
    {
      title: 'Valla Menos Vencida',
      subtitle: 'Trofeo',
      description: 'Un par de guantes de arquero',
      icon: FaHandPaper
    }
  ]

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 bg-gray-100 p-6">
        <div className="max-w-6xl lg:max-w-full mx-auto">
          <h1 className="text-3xl font-bold  mb-12 lg:text-4xl">Premios</h1>
          
          <div className="lg:mx-60 grid grid-cols-1 md:grid-cols-2 gap-6">
            {prizes.map((prize, index) => (
              <div
                key={index}
                style={{ borderRadius: '12px' }}
                className="bg-white  p-6 shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="flex flex-col items-center text-center">
                  <prize.icon className="h-12 w-12 mb-4 text-naranja" />
                  <h3 className="text-xl font-semibold mb-2 lg:text-3xl">{prize.title}</h3>
                  <p className="text-sm text-gray-600 mb-1 lg:text-xl">{prize.subtitle}</p>
                  <p className="text-sm text-gray-600 lg:text-xl">{prize.description}</p>
                  {prize.subtext && (
                    <p className="text-sm text-gray-600 lg:text-xl">{prize.subtext}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

