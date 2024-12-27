import Carrusel from './Carrusel';

function Hero(){
    return(
        <>
        <div className="flex flex-col justify-between space-y-8 lg:space-y-16 h-full ">
        <div className="lg:text-center z-30">
        <h1 className="font-inter tracking-wide font-bold text-3xl md:text-4xl lg:text-6xl"  style={{textShadow: "1px 2px 2px rgba(0, 0, 0, 0.4)"}}>VOS ELEGÍS DONDE JUGAR</h1>
        </div>
        <div className="z-30">
        <h2 className="font-inter tracking-wide font-medium text-sm md:text-xl lg:text-2xl">Descubrí las mejores canchas de fútbol y unite a la comunidad más grande de 
        jugadores</h2>
        </div>
        <div className='w-full flex justify-center'>
        <button className="bg-naranja rounded-xl text-white p-2 font-inter font-medium text-xs md:text-sm lg:text-lg tracking-wide w-full md:w-1/2">QUIERO RESERVAR UN TURNO</button>
        </div>
        <Carrusel></Carrusel>
        </div>
        </>
    )
}
export default Hero;