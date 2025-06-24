import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Button } from '@/components/ui/button'
import Hero from './components/Hero'
import { useConfiguration } from "@/context/ConfigurationContext"
import { useEffect } from 'react';

export default function App() {
  const { config } = useConfiguration();
  
  useEffect(() => {
    if (config && config.nombre_complejo) {
      document.title = `${config.nombre_complejo} - Turnos Resguar IT`;
    }
  }, [config]);

return (
    <div className="min-h-screen min-w-screen flex flex-col">
        <Header />
        <main className=" flex flex-grow   ">
          <Hero></Hero>
        </main>
        <Footer />
    </div>
)
}