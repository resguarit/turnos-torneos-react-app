import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TarjetaMetrica } from './TarjetaMetrica';

const datos = [
  { nombre: 'Ene', valor: 65 },
  { nombre: 'Feb', valor: 59 },
  { nombre: 'Mar', valor: 80 },
  { nombre: 'Abr', valor: 81 },
  { nombre: 'May', valor: 56 },
  { nombre: 'Jun', valor: 55 },
  { nombre: 'Jul', valor: 40 },
];

const metricas = [
  { etiqueta: 'Total Reservas', valor: '1.234', cambio: 12, tendencia: 'subida' },
  { etiqueta: 'Usuarios Activos', valor: '856', cambio: 5.3, tendencia: 'subida' },
  { etiqueta: 'Ingresos', valor: '12.345€', cambio: -2.1, tendencia: 'bajada' },
  { etiqueta: 'Tasa de Ocupación', valor: '78%', cambio: 3.2, tendencia: 'subida' },
];

const metricasSecundarias = [
  { etiqueta: 'Duración Media Reserva', valor: '1,5 horas' },
  { etiqueta: 'Pista Más Popular', valor: 'Pista de Tenis 1' },
  { etiqueta: 'Horas Punta', valor: '17:00 - 20:00' },
  { etiqueta: 'Satisfacción Cliente', valor: '4,8/5' },
];

const PestanaDashboard = () => {
  return (
    <div className="space-y-6 py-6">
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

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {metricasSecundarias.map((metrica) => (
          <TarjetaMetrica key={metrica.etiqueta} metrica={metrica} />
        ))}
      </div>
    </div>
  );
};

export default PestanaDashboard;