import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"
import { formatearFechaCompleta, formatearHora, formatearRangoHorario } from '@/utils/dateUtils';

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateString) {
  return formatearFechaCompleta(dateString);
}

export function formatTime(timeString) {
  return formatearHora(timeString);
}

export function formatTimeRange(startTime, endTime) {
  return formatearRangoHorario(startTime, endTime);
}

export function formatCurrency(value) {
  const amount = Number.parseFloat(value)
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}