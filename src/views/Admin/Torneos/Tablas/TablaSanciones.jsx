import React from 'react';

export function TablaSanciones({ sanciones }) {

    const sancionesActivas = sanciones.filter(item => item.sancion?.estado === 'activa');

  return (
    <div>
      <h3 className="text-lg font-semibold mb-3">Expulsados</h3>
      {sancionesActivas.length > 0 ? (
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-white bg-black ">
              <th className="py-2 px-3 text-left font-medium">Jugador</th>
              <th className="py-2 px-3 text-left font-medium">Equipo</th>
              <th className="py-2 px-3 text-left font-medium">Tipo</th>
              <th className="py-2 px-3 text-left font-medium">Motivo</th>
              <th className="py-2 px-3 text-center font-medium">Fechas</th>
            </tr>
          </thead>
          <tbody>
            {sancionesActivas.map((item, idx) => (
              <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="py-2 px-3 text-gray-700">{item.jugador?.nombre} {item.jugador?.apellido}</td>
                <td className="py-2 px-3 text-gray-700">{item.equipo?.nombre}</td>
                <td className="py-2 px-3 text-gray-700">{item.sancion?.tipo_sancion}</td>
                <td className="py-2 px-3 text-gray-700">{item.sancion?.motivo}</td>
                <td className="py-2 px-3 text-gray-700 text-center">{item.sancion?.cantidad_fechas || '-'}
                    {item.sancion?.fecha_inicio?.nombre && item.sancion?.fecha_fin?.nombre
                    ? item.sancion.cantidad_fechas === 1
                        ? ` (${item.sancion.fecha_inicio.nombre})`
                        : ` (${item.sancion.fecha_inicio.nombre} - ${item.sancion.fecha_fin.nombre})`
                    : ''}
                    
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p className="text-gray-600 text-center py-4 bg-white">No hay sanciones registradas.</p>
      )}
    </div>
  );
}