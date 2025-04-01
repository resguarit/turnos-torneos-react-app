import React, { useState, useEffect } from 'react';
import { X, Edit, Calendar, Clock, User, CreditCard, DollarSign, Phone, Mail, CalendarDays } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import api from '@/lib/axiosConfig';
import BtnLoading from '@/components/BtnLoading';

const ModalTurno = ({ isOpen, onClose, turno: turnoInicial }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [turno, setTurno] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTurno = async () => {
      if (!isOpen || !turnoInicial) return;
      
      setLoading(true);
      try {
        const response = await api.get(`/turnos/${turnoInicial.id}`);
        if (response.data.status === 200) {
          setTurno(response.data.turno);
        }
      } catch (error) {
        console.error('Error al cargar el turno:', error);
        setError('Error al cargar los detalles del turno');
      } finally {
        setLoading(false);
      }
    };

    fetchTurno();
  }, [isOpen, turnoInicial]);

  if (!isOpen || !turnoInicial) return null;
  
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6">
          <BtnLoading />
        </div>
      </div>
    );
  }

  if (error || !turno) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
        <div className="bg-white rounded-xl p-6">
          <p className="text-red-500">{error || 'Error al cargar el turno'}</p>
          <button
            onClick={onClose}
            className="mt-4 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            Cerrar
          </button>
        </div>
      </div>
    );
  }

  const handleEditClick = () => {
    navigate(`/editar-turno/${turno.id}`);
  };

  const formatMonto = (value) => {
    if (!value) return '$ 0.00';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(value);
  };

  const getEstadoColor = (estado) => {
    switch (estado) {
      case 'Pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'Señado':
        return 'bg-blue-100 text-blue-800';
      case 'Pagado':
        return 'bg-green-100 text-green-800';
      case 'Cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Turno #{turno.id}
              </h2>
              <span className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor(turno.estado)}`}>
                {turno.estado}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleEditClick}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
              >
                <Edit className="h-5 w-5" />
                Editar Turno
              </button>
              <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Detalles del Turno */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Turno</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Fecha</span>
                    <span>{format(parseISO(turno.fecha_turno), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Horario</span>
                    <span>{turno.horario.hora_inicio.slice(0, 5)} - {turno.horario.hora_fin.slice(0, 5)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CalendarDays className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Cancha</span>
                    <span>Cancha {turno.cancha.nro} - {turno.cancha.tipo_cancha}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <DollarSign className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Monto Total</span>
                    <span>{formatMonto(turno.monto_total)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Monto Seña</span>
                    <span>{formatMonto(turno.monto_seña)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Información del Cliente */}
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Información del Cliente</h3>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Nombre</span>
                    <span>{turno.usuario?.nombre}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Teléfono</span>
                    <span>{turno.usuario?.telefono}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">Email</span>
                    <span>{turno.usuario?.email || 'Sin email'}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <span className="font-semibold block text-gray-700">DNI</span>
                    <span>{turno.usuario?.dni}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalTurno;
