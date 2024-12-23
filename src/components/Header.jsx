import Logo from '../assets/logo.png';
import MenuMovil from './MenuMovil';

export function Header() {
  return (
    <header className="bg-naranja max-w-full text-white px-6 py-5">
      <nav className=" mx-auto flex items-center justify-between">
        <a href="/" >
          <img src={Logo} alt="Logo" className="h-7" />
        </a>
        <div className="hidden md:block">
        <div className="flex gap-8 font-inter text-lg tracking-wide">
          <a href="/torneos-admi" className="hover:opacity-80">Torneos</a>
          <a href="/calendario-admi" className="hover:opacity-80">Reservas</a>
          <a href="/partidos" className="hover:opacity-80">Partidos</a>
          <a href="/reglamento" className="hover:opacity-80">Reglamento</a>
          <a href="/premios" className="hover:opacity-80">Premios</a>
        </div>
        </div>
        <MenuMovil />
      </nav>
    </header>
  )
}

