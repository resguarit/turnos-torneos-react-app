import React from "react";
import { Trash2, Users, MapPin, User, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const TarjetaGrupoClasesFijas = ({
  grupo,
  handleDeleteGrupoClasesFijas,
  isSaving
}) => {
  const clase = grupo[0];
  // Calcular diasHorariosUnicos aquí
  const diasHorariosUnicos = [];
  const diasSet = new Set();
  grupo.forEach(c => {
    if (c.horarios && c.horarios.length > 0) {
      const horariosOrdenados = [...c.horarios].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
      const primerHorario = horariosOrdenados[0];
      const ultimoHorario = horariosOrdenados[horariosOrdenados.length - 1];
      const dia = format(parseISO(c.fecha_inicio), "EEEE", { locale: es });
      const key = `${dia}-${primerHorario.hora_inicio}-${ultimoHorario.hora_fin}`;
      if (!diasSet.has(key)) {
        diasSet.add(key);
        diasHorariosUnicos.push({
          dia,
          hora_inicio: primerHorario.hora_inicio.slice(0,5),
          hora_fin: ultimoHorario.hora_fin.slice(0,5)
        });
      }
    }
  });
  return (
<li className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-2">
                        <div className="flex items-center gap-3 mb-1">
                          <div className="bg-blue-100 rounded-full p-3">
                            <Users className="h-7 w-7 text-blue-600" />
                          </div>
                          <div>
                            <span className="text-lg capitalize font-semibold text-gray-900">{clase.nombre}</span>
                            {clase.activa && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
                                Activa
                              </span>
                            )}
                            <div className="text-gray-600 text-sm mb-2">{clase.descripcion}</div>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 mt-4 md:grid-cols-4 gap-2 text-sm mb-6">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Cancha:</span>{" "}
                              <span className="font-medium">
                                {clase.cancha?.nro ? `Cancha ${clase.cancha.nro}` : clase.cancha?.nombre}
                              </span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Profesor:</span>{" "}
                              <span className="font-medium">{clase.profesor?.nombre} {clase.profesor?.apellido}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Users className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Cupo máximo:</span>{" "}
                              <span className="font-medium">{clase.cupo_maximo}</span>
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                            <span className="flex-col flex">
                              <span className=" text-gray-500">Precio mensual:</span>{" "}
                              <span className="font-medium">${clase.precio_mensual}</span>
                            </span>
                          </div>
                        </div>
                        {/* Horarios por día, solo una vez por combinación */}
                        <div className="mt-2">
                          <span className="font-medium text-gray-700">Días y horarios:</span>
                          <ul className="mt-1 space-y-1">
                            {diasHorariosUnicos.map((dh, i) => (
                              <li key={i} className="text-sm text-gray-700">
                                <span className="font-semibold capitalize">{dh.dia}:</span>{" "}
                                {`${dh.hora_inicio} - ${dh.hora_fin}`}
                              </li>
                            ))}
                          </ul>
                        </div>
                        {/* Botón eliminar grupo */}
                        <button
                          onClick={() => handleDeleteGrupoClasesFijas(grupo)}
                          className="ml-auto p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Eliminar grupo"
                          disabled={isSaving}
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </li>
  );
};

export default TarjetaGrupoClasesFijas;