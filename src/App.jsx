import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Button } from '@/components/ui/button'
import Hero from './components/Hero'
export default function App() {
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