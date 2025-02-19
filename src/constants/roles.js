export const ROLES = {
    ADMIN: 'admin',
    USER: 'cliente',
    PUBLIC: 'public'
  };
  
export const ROUTES = {
    PUBLIC: [
      `${BASE_URL}/calendario-admi`,
      `${BASE_URL}/horariosReserva`,
      `${BASE_URL}/canchas-reserva`
    ],
    USER: [
      `${BASE_URL}/perfil`,
      `${BASE_URL}/mis-turnos`,
      `${BASE_URL}/user-profile`
    ],
    ADMIN: [
      `${BASE_URL}/ver-turnos`,
      `${BASE_URL}/grilla-turnos`,
      `${BASE_URL}/editar-turno`
    ]
  };