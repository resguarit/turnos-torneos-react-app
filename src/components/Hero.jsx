import Carrusel from './Carrusel';

function Hero(){
    return(
        <>
        <div className="flex flex-col justify-between space-y-8 h-full ">
        <div className="z-30">
        <h1 className="font-inter tracking-wide font-bold text-3xl"  style={{textShadow: "1px 2px 2px rgba(0, 0, 0, 0.4)"}}>VOS ELEGÍS DONDE JUGAR</h1>
        </div>
        <div className="z-30">
        <h2 className="font-inter tracking-wide font-medium text-sm">Descubrí las mejores canchas de fútbol y unite a la comunidad más grande de 
        jugadores</h2>
        </div>
        <button className="bg-naranja rounded-md text-white p-2 font-inter font-medium text-xs tracking-wide w-full">QUIERO RESERVAR UN TURNO</button>
        <Carrusel></Carrusel>
        </div>
        </>
    )
}
export default Hero;