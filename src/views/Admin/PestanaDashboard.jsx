import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import TarjetaMetrica from './TarjetaMetrica';
import LoadingSinHF from '@/components/LoadingSinHF';
import { ResponsiveContainer, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts';

const PestanaDashboard = () => {
  const [metricas, setMetricas] = useState([]);
  const [metricasSecundarias, setMetricasSecundarias] = useState([]);
  const [datos, setDatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    const signal = controller.signal;

    const fetchMetricas = async () => {
      try {
        const [
          reservasPorMesRes,
          horasPuntaRes,
          canchaMasPopularRes,
          tasaOcupacionRes,
          ingresosRes,
          usuariosActivosRes,
          totalReservasRes
        ] = await Promise.all([
          api.get('/dashboard/reservas-por-mes', { signal }),
          api.get('/dashboard/horas-pico', { signal }),
          api.get('/dashboard/cancha-mas-popular', { signal }),
          api.get('/dashboard/tasa-ocupacion', { signal }),
          api.get('/dashboard/ingresos', { signal }),
          api.get('/dashboard/usuarios-activos', { signal }),
          api.get('/dashboard/total-reservas', { signal })
        ]);

        const reservasPorMes = Object.keys(reservasPorMesRes.data).map(mes => ({
          nombre: mes,
          valor: reservasPorMesRes.data[mes]
        }));

        setDatos(reservasPorMes);

        setMetricas([
          { etiqueta: 'Total Reservas', valor: totalReservasRes.data.total_reservas, cambio: totalReservasRes.data.cambio, tendencia: totalReservasRes.data.tendencia, descripcion: 'Total de reservas realizadas en el ultimo mes' },
          { etiqueta: 'Usuarios Activos', valor: usuariosActivosRes.data.usuarios_activos, cambio: usuariosActivosRes.data.cambio, tendencia: usuariosActivosRes.data.tendencia, descripcion: 'Número de usuarios activos que hicieron al menos una reserva en el ultimo mes' },
          { etiqueta: 'Ingresos', valor: `$${ingresosRes.data.ingresos.toLocaleString('es-AR')}`, cambio: ingresosRes.data.cambio, tendencia: ingresosRes.data.tendencia, descripcion: 'Ingresos totales en el ultimo mes' },
          { etiqueta: 'Tasa de Ocupación', valor: `${tasaOcupacionRes.data.tasa_ocupacion}%`, cambio: tasaOcupacionRes.data.cambio, tendencia: tasaOcupacionRes.data.tendencia, descripcion: 'Porcentaje de ocupación de las canchas para el dia actual' }
        ]);

        setMetricasSecundarias([
          { etiqueta: 'Pista Más Popular', valor: `${canchaMasPopularRes.data.tipo} ${canchaMasPopularRes.data.nro}`, descripcion: 'La cancha con más reservas' },
          { etiqueta: 'Horas Punta', valor: horasPuntaRes.data.hora_pico, descripcion: 'Hora del día con más reservas' }
        ]);

        setLoading(false);
      } catch (error) {
        if (error.name === 'AbortError' || error.name === 'CanceledError'){
          console.log('Fetch abortado')
        } else {
          console.error('Error fetching dasboard metrics:', error)
          setLoading(false);
        }
      }
    };

    fetchMetricas();

    return () => {
      controller.abort();
    };
  }, []);

  if (loading) {
    return <LoadingSinHF />;
  }

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-xl">Metricas del mes actual respecto al mes anterior</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricas.map((metrica) => (
          <TarjetaMetrica key={metrica.etiqueta} metrica={metrica} />
        ))}
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reservas Mensuales</h3>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={datos}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="nombre" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="valor" stroke="#3b82f6" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div>
        <h1 className="text-xl">Metricas historicas</h1>
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricasSecundarias.map((metrica) => (
          <TarjetaMetrica key={metrica.etiqueta} metrica={metrica} />
        ))}
      </div>
    </div>
  );
};

export default PestanaDashboard;