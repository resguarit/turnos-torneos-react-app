import React, { useEffect, useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import api from '@/lib/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft, ArrowRight } from 'lucide-react';
import BtnLoading from '@/components/BtnLoading';

export default function VerTablas() {
  const { zonaId } = useParams();
  const [tablaPuntaje, setTablaPuntaje] = useState([]);
  const [goleadores, setGoleadores] = useState([]);
  const [amonestados, setAmonestados] = useState([]);
  const [expulsados, setExpulsados] = useState([]);
  const [proximaFecha, setProximaFecha] = useState(null);
  const [partidosProximaFecha, setPartidosProximaFecha] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Traer todos los equipos de la zona
        const equiposResponse = await api.get(`/zonas/${zonaId}/equipos`);
        const equipos = equiposResponse.data;

        // Crear un mapa para inicializar los datos de los equipos
        const equiposMap = {};
        equipos.forEach((equipo) => {
          equiposMap[equipo.id] = {
            nombre: equipo.nombre,
            puntos: 0,
            partidos_jugados: 0,
            partidos_ganados: 0,
            partidos_perdidos: 0,
            partidos_empatados: 0,
            goles_a_favor: 0,
            goles_en_contra: 0,
            diferencia_goles: 0,
          };
        });

        // Traer los partidos de la zona
        const partidosResponse = await api.get(`/partidos/zona/${zonaId}`);
        const partidosFinalizados = partidosResponse.data.filter(
          (partido) => partido.estado === 'Finalizado'
        );

        // Procesar los partidos finalizados
        partidosFinalizados.forEach((partido) => {
          const {
            equipo_local,
            equipo_visitante,
            marcador_local,
            marcador_visitante,
          } = partido;

          // Actualizar estadísticas del equipo local
          equiposMap[equipo_local.id].partidos_jugados += 1;
          equiposMap[equipo_local.id].goles_a_favor += marcador_local;
          equiposMap[equipo_local.id].goles_en_contra += marcador_visitante;
          equiposMap[equipo_local.id].diferencia_goles += marcador_local - marcador_visitante;

          // Actualizar estadísticas del equipo visitante
          equiposMap[equipo_visitante.id].partidos_jugados += 1;
          equiposMap[equipo_visitante.id].goles_a_favor += marcador_visitante;
          equiposMap[equipo_visitante.id].goles_en_contra += marcador_local;
          equiposMap[equipo_visitante.id].diferencia_goles += marcador_visitante - marcador_local;

          // Determinar el resultado del partido
          if (marcador_local > marcador_visitante) {
            // Equipo local gana
            equiposMap[equipo_local.id].puntos += 3;
            equiposMap[equipo_local.id].partidos_ganados += 1;
            equiposMap[equipo_visitante.id].partidos_perdidos += 1;
          } else if (marcador_local < marcador_visitante) {
            // Equipo visitante gana
            equiposMap[equipo_visitante.id].puntos += 3;
            equiposMap[equipo_visitante.id].partidos_ganados += 1;
            equiposMap[equipo_local.id].partidos_perdidos += 1;
          } else {
            // Empate
            equiposMap[equipo_local.id].puntos += 1;
            equiposMap[equipo_visitante.id].puntos += 1;
            equiposMap[equipo_local.id].partidos_empatados += 1;
            equiposMap[equipo_visitante.id].partidos_empatados += 1;
          }
        });

        // Convertir el mapa en un array y ordenar por puntos, diferencia de goles y partidos jugados
        const tabla = Object.values(equiposMap).sort((a, b) => {
          if (a.partidos_jugados === 0 && b.partidos_jugados > 0) {
            return 1; // Mover equipos sin partidos al final
          }
          if (b.partidos_jugados === 0 && a.partidos_jugados > 0) {
            return -1; // Mantener equipos con partidos al principio
          }
          if (b.puntos === a.puntos) {
            return b.diferencia_goles - a.diferencia_goles;
          }
          return b.puntos - a.puntos;
        });

        setTablaPuntaje(tabla);

        // Traer todos los jugadores de la zona
        const jugadoresResponse = await api.get(`/jugadores/zona/${zonaId}`);
        const jugadores = jugadoresResponse.data;

        // Crear un mapa para relacionar IDs de jugadores con sus nombres y equipos
        const jugadoresMap = {};
        jugadores.forEach((jugador) => {
          jugadoresMap[jugador.id] = {
            nombre: jugador.nombre,
            apellido: jugador.apellido,
            equipo: jugador.equipo.nombre,
          };
        });

        // Traer las estadísticas de la zona
        const estadisticasResponse = await api.get(`/zonas/${zonaId}/estadisticas`);
        const estadisticas = estadisticasResponse.data;

        // Crear mapas para goleadores, amonestados y expulsados
        const goleadoresMap = {};
        const amonestadosMap = {};
        const expulsadosMap = {};

        estadisticas.forEach((estadistica) => {
          const { jugador_id, goles, amarillas, rojas } = estadistica;

          // Obtener el jugador del mapa
          const jugador = jugadoresMap[jugador_id];
          if (!jugador) return; // Si no se encuentra el jugador, ignorar

          // Inicializar jugador en los mapas si no existe
          if (!goleadoresMap[jugador_id]) {
            goleadoresMap[jugador_id] = {
              nombre: jugador.nombre,
              apellido: jugador.apellido,
              equipo: jugador.equipo,
              cantidad: 0,
            };
          }
          if (!amonestadosMap[jugador_id]) {
            amonestadosMap[jugador_id] = {
              nombre: jugador.nombre,
              apellido: jugador.apellido,
              equipo: jugador.equipo,
              cantidad: 0,
            };
          }
          if (!expulsadosMap[jugador_id]) {
            expulsadosMap[jugador_id] = {
              nombre: jugador.nombre,
              apellido: jugador.apellido,
              equipo: jugador.equipo,
              cantidad: 0,
            };
          }

          // Sumar estadísticas
          goleadoresMap[jugador_id].cantidad += goles || 0;
          amonestadosMap[jugador_id].cantidad += amarillas || 0;
          expulsadosMap[jugador_id].cantidad += rojas || 0;
        });

        // Convertir los mapas en arrays, filtrar jugadores con estadísticas y limitar a 10 jugadores
        const goleadoresArray = Object.values(goleadoresMap)
          .filter((jugador) => jugador.cantidad > 0) // Solo jugadores con goles
          .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
          .slice(0, 10); // Limitar a 10 jugadores

        const amonestadosArray = Object.values(amonestadosMap)
          .filter((jugador) => jugador.cantidad > 0) // Solo jugadores con amarillas
          .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
          .slice(0, 10); // Limitar a 10 jugadores

        const expulsadosArray = Object.values(expulsadosMap)
          .filter((jugador) => jugador.cantidad > 0) // Solo jugadores con rojas
          .sort((a, b) => b.cantidad - a.cantidad) // Ordenar por cantidad descendente
          .slice(0, 10); // Limitar a 10 jugadores

        setGoleadores(goleadoresArray);
        setAmonestados(amonestadosArray);
        setExpulsados(expulsadosArray);

        // Traer las fechas de la zona
        const fechasResponse = await api.get(`/zonas/${zonaId}/fechas`);
        const fechas = fechasResponse.data;

        // Filtrar la próxima fecha (por estado o fecha de inicio)
        const fechaProxima = fechas.find((fecha) => fecha.estado === 'Pendiente');
        setProximaFecha(fechaProxima);

        if (fechaProxima) {
          // Traer los partidos de la próxima fecha
          const partidosResponse = await api.get(`/fechas/${fechaProxima.id}/partidos`);
          setPartidosProximaFecha(partidosResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zonaId]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col font-inter">
        <Header />
        <main className="flex-1 p-6 bg-gray-100">
          <div className="flex justify-center items-center h-full">
            <BtnLoading />
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col font-inter">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
      <div className="w-full flex mb-2">
          <button onClick={() => navigate(-1)} className="bg-black rounded-xl text-white p-2 text-sm flex items-center justify-center">
            <ChevronLeft className="w-5" /> Atrás
          </button>
        </div>
        <div className="flex flex-col justify-center items-center h-full">
          <h1 className="text-center text-2xl font-sans font-semibold">Tablas</h1>


          <div className="flex flex-col w-3/4 mt-4">
            <table className="table-auto w-full ">
              <thead>
                <tr className="bg-black text-white font-sans">
                  <th className="border border-gray-300 px-4 py-2">Posición</th>
                  <th className="border border-gray-300 px-4 py-2">Equipo</th>
                  <th className="border border-gray-300 px-4 py-2">Puntos</th>
                  <th className="border border-gray-300 px-4 py-2">PJ</th>
                  <th className="border border-gray-300 px-4 py-2">PG</th>
                  <th className="border border-gray-300 px-4 py-2">PP</th>
                  <th className="border border-gray-300 px-4 py-2">PE</th>
                  <th className="border border-gray-300 px-4 py-2">GF</th>
                  <th className="border border-gray-300 px-4 py-2">GC</th>
                  <th className="border border-gray-300 px-4 py-2">DG</th>
                </tr>
              </thead>
              <tbody>
                {tablaPuntaje.map((equipo, index) => (
                  <tr key={index} className="text-center bg-white">
                    <td className="border border-gray-300 px-4 py-2">{index + 1}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.nombre}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.puntos}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.partidos_jugados}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.partidos_ganados}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.partidos_perdidos}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.partidos_empatados}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.goles_a_favor}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.goles_en_contra}</td>
                    <td className="border border-gray-300 px-4 py-2">{equipo.diferencia_goles}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

{/* Tabla de la próxima fecha */}
{proximaFecha && (
            <div className="flex flex-col w-3/4 mt-4">
              <h2 className="text-xl font-bold mb-2">Próxima Fecha: {proximaFecha.nombre}</h2>
              <table className="table-auto w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-black text-white font-sans">
                    <th className="border border-gray-300 px-4 py-2">Local</th>
                    <th className="border border-gray-300 px-4 py-2">vs</th>
                    <th className="border border-gray-300 px-4 py-2">Visitante</th>
                    <th className="border border-gray-300 px-4 py-2">Cancha</th>
                    <th className="border border-gray-300 px-4 py-2">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {partidosProximaFecha.map((partido, index) => (
                    <tr key={index} className="text-center bg-white">
                      <td className="border border-gray-300 px-4 py-2">{partido.equipo_local.nombre}</td>
                      <td className="border border-gray-300 px-4 py-2">vs</td>
                      <td className="border border-gray-300 px-4 py-2">{partido.equipo_visitante.nombre}</td>
                      <td className="border border-gray-300 px-4 py-2">{partido.cancha?.nro || 'No Definido'}</td>
                      <td className="border border-gray-300 px-4 py-2">{partido.horario?.hora || 'No Definido'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {proximaFecha && (
                <button onClick={() => navigate(`/ver-fixture/${zonaId}`)}
                className='justify-start w-3/4 text-sm items-center text-gray-400 flex'
                >Ver Fixture Completo <ArrowRight size={16}></ArrowRight></button>
          )}
          {/* Tabla de Goleadores */}
          <div className="flex flex-col w-3/4 mt-4">
            <h2 className="text-xl font-bold mb-2">Goleadores</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-black text-white font-sans">
                  <th className="border border-gray-300 px-4 py-2">Jugador</th>
                  <th className="border border-gray-300 px-4 py-2">Equipo</th>
                  <th className="border border-gray-300 px-4 py-2">Goles</th>
                </tr>
              </thead>
              <tbody>
                {goleadores.map((jugador, index) => (
                  <tr key={index} className="text-center bg-white">
                    <td className="border border-gray-300 px-4 py-2">{jugador.nombre} {jugador.apellido}</td>
                    <td className="border border-gray-300 px-4 py-2">{jugador.equipo}</td>
                    <td className="border border-gray-300 px-4 py-2">{jugador.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>


          </div>
          {/* Tabla de Amonestados */}
          <div className=' flex w-3/4 gap-40 justify-between'>
          <div className="flex flex-col w-3/4 mt-4">
            <h2 className="text-xl font-bold mb-2">Amonestados</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-black text-white font-sans">
                  <th className="border border-gray-300 px-4 py-2">Jugador</th>
                  <th className="border border-gray-300 px-4 py-2">Equipo</th>
                  <th className="border border-gray-300 px-4 py-2">Amarillas</th>
                </tr>
              </thead>
              <tbody>
                {amonestados.map((jugador, index) => (
                  <tr key={index} className="text-center bg-white">
                    <td className="border border-gray-300 px-4 py-2">{jugador.nombre} {jugador.apellido}</td>
                    <td className="border border-gray-300 px-4 py-2">{jugador.equipo}</td>
                    <td className="border border-gray-300 px-4 py-2">{jugador.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tabla de Expulsados */}
          <div className="flex flex-col w-3/4 mt-4">
            <h2 className="text-xl font-bold mb-2">Expulsados</h2>
            <table className="table-auto w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-black text-white font-sans">
                  <th className="border border-gray-300 px-4 py-2">Jugador</th>
                  <th className="border border-gray-300 px-4 py-2">Equipo</th>
                  <th className="border border-gray-300 px-4 py-2">Rojas</th>
                </tr>
              </thead>
              <tbody>
                {expulsados.map((jugador, index) => (
                  <tr key={index} className="text-center bg-white">
                    <td className="border border-gray-300 px-4 py-2">{jugador.nombre}{jugador.apellido}</td>
                    <td className="border border-gray-300 px-4 py-2">{jugador.equipo}</td>
                    <td className="border border-gray-300 px-4 py-2">{jugador.cantidad}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}