import React from "react";
import { Edit2, Trash2, Eye, Users, Calendar, Clock, MapPin, User, DollarSign } from "lucide-react";
import { format, parseISO } from "date-fns";
import { es } from "date-fns/locale";

const TarjetaClase = ({
  clase,
  handleEditClase,
  handleDeleteClase
}) => (
<li key={clase.id} className="bg-white rounded-xl shadow border border-gray-200 p-6 flex flex-col gap-2">
                    <div className="w-full justify-between flex items-center">               
                      <div className="flex items-center gap-3 mb-1">
                        <div className="bg-blue-100 rounded-full p-3">
                          <Users className="h-7 w-7 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center">
                            <span className="text-lg capitalize font-semibold text-gray-900">
                              {clase.nombre}
                            </span>
                            {clase.activa && (
                              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-700 text-xs rounded-full font-semibold">
                                Activa
                              </span>
                            )}
                          </div>
                          <div className="text-gray-600 text-sm mb-2">{clase.descripcion}</div>
                        </div>
                      </div>
                      <div className="flex gap-2 items-center">
                        <button
                          onClick={() => handleEditClase(clase)}
                          className="p-2 text-gray-400 hover:text-blue-600 rounded-lg hover:bg-blue-50 transition-colors duration-200"
                          title="Editar"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteClase(clase)}
                          className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors duration-200"
                          title="Eliminar"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                        <button
                          className="p-2 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200"
                          title="Ver detalles"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 mt-4 md:grid-cols-4 gap-2 text-sm mb-6">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Fecha inicio:</span>{" "}
                          <span className="font-medium capitalize">{clase.fecha_inicio && format(parseISO(clase.fecha_inicio), "EEEE, dd/MM/yyyy", { locale: es })}</span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="flex-col flex">
                          <span className=" text-gray-500">Horario:</span>{" "}
                          <span className="font-medium">
                            {clase.horarios && clase.horarios.length > 0
                              ? `${clase.horarios[0].hora_inicio.slice(0,5)} - ${clase.horarios[clase.horarios.length-1].hora_fin.slice(0,5)}`
                              : "-"}
                          </span>
                        </span>
                      </div>
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
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-2 text-sm mb-2">
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
                  </li>
                  
);

export default TarjetaClase;