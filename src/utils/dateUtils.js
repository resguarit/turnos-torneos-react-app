import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * CRITERIOS PARA FORMATEO DE FECHAS:
 * 
 * formatearFechaCompleta() - Para información principal/destacada:
 * - Fechas de turnos en modales de información
 * - Fechas de reserva en detalles de turno
 * - Fechas importantes en formularios de edición
 * Formato: "lunes, 3 de junio, 2025"
 * 
 * formatearFechaCorta() - Para listas, tablas, transacciones:
 * - Historial de transacciones
 * - Listas de turnos
 * - Tablas de datos
 * - Fechas en cards/tarjetas
 * Formato: "03/06/2025"
 * 
 * formatearFechaSinDia() - Para fechas intermedias:
 * - Información secundaria en modales
 * - Fechas en formularios
 * Formato: "3 de junio, 2025"
 */

/**
 * Formatea fecha completa con día de la semana
 * Uso: Información principal, fechas destacadas
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} - "lunes, 3 de junio, 2025"
 */
export const formatearFechaCompleta = (fecha) => {
  try {
    return format(parseISO(fecha), "EEEE, d 'de' MMMM, yyyy", { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha completa:', error);
    return fecha;
  }
};

/**
 * Formatea fecha sin día de la semana
 * Uso: Información secundaria, formularios
 * @param {string} fecha - Fecha en formato ISO
 * @returns {string} - "3 de junio, 2025"
 */
export const formatearFechaSinDia = (fecha) => {
  try {
    return format(parseISO(fecha), "d 'de' MMMM, yyyy", { locale: es });
  } catch (error) {
    console.error('Error al formatear fecha sin día:', error);
    return fecha;
  }
};

/**
 * Formatea fecha corta para listas y tablas
 * Uso: Transacciones, listas, tablas, cards
 * @param {string|Date} fecha - Fecha en formato ISO o Date object
 * @returns {string} - "03/06/2025"
 */
export const formatearFechaCorta = (fecha) => {
  try {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  } catch (error) {
    console.error('Error al formatear fecha corta:', error);
    return fecha;
  }
};

/**
 * Formatea hora desde fecha
 * @param {string|Date} fecha - Fecha con hora
 * @returns {string} - "14:30"
 */
export const formatearHora = (fecha) => {
  try {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    console.error('Error al formatear hora:', error);
    return fecha;
  }
};

/**
 * Formatea monto con separadores de miles
 * @param {number|string} monto - Monto a formatear
 * @returns {string} - "1.234,56"
 */
export const formatearMonto = (monto) => {
  try {
    return Math.abs(parseFloat(monto)).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  } catch (error) {
    console.error('Error al formatear monto:', error);
    return monto;
  }
};

/**
 * Calcula la duración en minutos entre dos horarios
 * Maneja el caso especial cuando la hora de fin es 00:00:00 (medianoche)
 * @param {string} horaInicio - Hora de inicio en formato HH:MM:SS
 * @param {string} horaFin - Hora de fin en formato HH:MM:SS
 * @returns {string} - Duración formateada como "X min"
 */
export const calcularDuracion = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return '0 min';
  
  // Convertir HH:MM:SS a minutos
  const horaInicioMinutos = horaInicio.split(':')[0] * 60 + parseInt(horaInicio.split(':')[1]);
  
  let horaFinMinutos;
  if (horaFin.split(':')[0] === '00') {
    // Si la hora de fin es 00:00:00, significa medianoche (24:00)
    horaFinMinutos = 24 * 60;
  } else {
    horaFinMinutos = horaFin.split(':')[0] * 60 + parseInt(horaFin.split(':')[1]);
  }
  
  const duracionMinutos = horaFinMinutos - horaInicioMinutos;
  
  return `${duracionMinutos} min`;
};

/**
 * Formatea un rango de horarios
 * @param {string} horaInicio - Hora de inicio en formato HH:MM:SS
 * @param {string} horaFin - Hora de fin en formato HH:MM:SS
 * @returns {string} - Rango formateado como "HH:MM - HH:MM"
 */
export const formatearRangoHorario = (horaInicio, horaFin) => {
  if (!horaInicio || !horaFin) return 'Horario no definido';
  
  return `${horaInicio.slice(0, 5)} - ${horaFin.slice(0, 5)}`;
}; 