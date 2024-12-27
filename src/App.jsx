import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { Button } from '@/components/ui/button'
import Hero from './components/Hero'
export default function App() {
return (
    <div className="min-h-screen w-screen flex flex-col">
        <Header />
        <main className=" justify-content-center justify-center items-center flex flex-grow bg-gradient-to-r from-[rgba(21,21,21,0.6)] to-[rgba(165,165,165,0.7)] p-4 font-inter font-semibold tracking-wide text-white">
          <Hero></Hero>
        </main>
        <Footer />
    </div>
)
}