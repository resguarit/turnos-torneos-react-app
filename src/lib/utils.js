import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}


export function formatDate(dateString) {
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }

  return new Date(dateString).toLocaleDateString("es-ES", options)
}

export function formatTime(timeString) {
  // Parse the time string (format: "HH:MM:SS")
  const [hours, minutes] = timeString.split(":")

  // Create a date object and set the time
  const date = new Date()
  date.setHours(Number.parseInt(hours, 10))
  date.setMinutes(Number.parseInt(minutes, 10))

  // Format the time
  return date.toLocaleTimeString("es-ES", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
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