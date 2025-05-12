import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';

export function ModalEditarSancion({ open, onClose, sancionData, onUpdated, fechas = [] }) {
  const [form, setForm] = useState({
    motivo: sancionData?.sancion?.motivo || '',
    tipo_sancion: sancionData?.sancion?.tipo_sancion || '',
    cantidad_fechas: sancionData?.sancion?.cantidad_fechas || 1,
    estado: sancionData?.sancion?.estado || 'activa',
    fecha_inicio: sancionData?.sancion?.fecha_inicio?.id || '',
    fecha_fin: sancionData?.sancion?.fecha_fin?.id || '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm({
      motivo: sancionData?.sancion?.motivo || '',
      tipo_sancion: sancionData?.sancion?.tipo_sancion || '',
      cantidad_fechas: sancionData?.sancion?.cantidad_fechas || 1,
      estado: sancionData?.sancion?.estado || 'activa',
      fecha_inicio: sancionData?.sancion?.fecha_inicio?.id || '',
      fecha_fin: sancionData?.sancion?.fecha_fin?.id || '',
    });
  }, [sancionData, open]);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.put(`/sanciones/${sancionData.sancion.id}`, form);
      if (response.data?.status === 200) {
        toast.success('Sanción actualizada correctamente');
        onUpdated && onUpdated();
        onClose();
      } else {
        toast.error(response.data?.message || 'Error al actualizar la sanción');
      }
    } catch (error) {
      toast.error('Error al actualizar la sanción');
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-[8px] shadow-lg p-6 w-full max-w-md relative">
        <h2 className="text-xl font-semibold mb-4">Editar Sanción</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Motivo</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1"
              value={form.motivo}
              onChange={e => handleChange('motivo', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tipo de Sanción</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.tipo_sancion}
              onChange={e => handleChange('tipo_sancion', e.target.value)}
              required
            >
              <option value="">Seleccionar tipo</option>
              <option value="expulsión">Expulsión</option>
              <option value="advertencia">Advertencia</option>
              <option value="suspensión">Suspensión</option>
              <option value="multa">Multa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Cantidad de Fechas</label>
            <input
              type="number"
              min={1}
              className="w-full border rounded px-2 py-1"
              value={form.cantidad_fechas}
              onChange={e => handleChange('cantidad_fechas', e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Inicio</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.fecha_inicio}
              onChange={e => handleChange('fecha_inicio', e.target.value)}
              required
            >
              <option value="">Seleccionar fecha</option>
              {fechas.map(fecha => (
                <option key={fecha.id} value={fecha.id}>
                  {fecha.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Fecha Fin</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.fecha_fin}
              onChange={e => handleChange('fecha_fin', e.target.value)}
              required
            >
              <option value="">Seleccionar fecha</option>
              {fechas.map(fecha => (
                <option key={fecha.id} value={fecha.id}>
                  {fecha.nombre}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Estado</label>
            <select
              className="w-full border rounded px-2 py-1"
              value={form.estado}
              onChange={e => handleChange('estado', e.target.value)}
              required
            >
              <option value="activa">Activa</option>
              <option value="cumplida">Cumplida</option>
              <option value="apelada">Apelada</option>
              <option value="anulada">Anulada</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              disabled={loading}
            >
              Guardar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}