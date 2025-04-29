import { useEffect, useState } from "react";
import api from "@/lib/axiosConfig";
import {format, parseISO} from "date-fns";
import { es } from "date-fns/locale";
import BtnLoading from "@/components/BtnLoading";

export default function MisTorneos() {
  const [tarjetas, setTarjetas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dni = localStorage.getItem("dni");
    if (!dni) {
      setLoading(false);
      return;
    }
    api.get(`/jugadores/info-por-dni/${dni}`)
      .then(res => {
        const equipos = res.data.equipos || [];
        const tarjetas = [];
        equipos.forEach(equipoObj => {
          const equipoNombre = equipoObj.equipo?.nombre || "Sin equipo";
          (equipoObj.competencias || []).forEach(comp => {
            const torneoNombre = comp.torneo?.nombre || "Sin torneo";
            const zonaNombre = comp.zona?.nombre || "Sin zona";
            let fecha = "Sin próximos partidos";
            let rival = null;
            let fechaPartido = "No definido";
            let cancha = "No definida";
            let horario = "No definido";
            if (comp.primera_fecha_pendiente && comp.primera_fecha_pendiente.partido) {
              const partido = comp.primera_fecha_pendiente.partido;
              fecha = comp.primera_fecha_pendiente.fecha?.nombre || "Sin fecha";
              fechaPartido = partido.fecha_partido || "No definido";
              cancha = partido.cancha || "No definida";
              horario = partido.horario || "No definido";
              // Determina el rival según si el equipo es local o visitante
              if (partido.equipo_local === equipoNombre) {
                rival = partido.equipo_visitante;
              } else if (partido.equipo_visitante === equipoNombre) {
                rival = partido.equipo_local;
              }
            }
            tarjetas.push({
              torneo: torneoNombre,
              zona: zonaNombre,
              equipo: equipoNombre,
              fecha,
              rival,
              fechaPartido,
              cancha,
              horario,
            });
          });
        });
        setTarjetas(tarjetas);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <BtnLoading />
      </div>
    );
  }

  return (
    <div>
      {tarjetas.length === 0 && (
        <div className="w-full flex justify-center text-center text-gray-500">
          No participás en ningún torneo.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {tarjetas.map((t, idx) => (
          <div key={idx} className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col gap-2">
            <div className="flex flex-col gap-1 mb-2">
              <span className="text-naranja text-lg font-bold">{t.torneo}</span>
              <span className="text-gray-700 font-semibold">Zona: <span className="font-normal">{t.zona}</span></span>
              <span className="text-gray-700 font-semibold">Equipo: <span className="font-normal">{t.equipo}</span></span>
            </div>
            <div className="bg-gray-50 rounded-lg p-3 flex flex-col gap-1">
              <span className="text-gray-600 font-medium">Próximo partido:</span>
              <span className="text-gray-800">
                {t.fecha}
                {t.rival && <> vs <span className="font-semibold">{t.rival}</span></>}
              </span>
              <div className="flex flex-col gap-2 mt-2 text-sm">
                <span className="bg-gray-200 px-2 py-1 rounded">
                  <span className="font-semibold">Fecha:</span> {t.fechaPartido !== "No definido" && t.fechaPartido !== "Sin próximos partidos" ? format(parseISO(t.fechaPartido), "EEE, dd 'de' MMMM',' yyyy", { locale: es }) : t.fechaPartido}
                </span>
                <span className="bg-gray-200 px-2 py-1 rounded">
                  <span className="font-semibold">Cancha:</span> {t.cancha.nro} - {t.cancha.tipo}
                </span>
                <span className="bg-gray-200 px-2 py-1 rounded">
                  <span className="font-semibold">Horario:</span> {t.horario.inicio} - {t.horario.fin}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}