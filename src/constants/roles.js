export const ROLES = {
    ADMIN: 'admin',
    USER: 'cliente',
    PUBLIC: 'public'
  };
  
export const ROUTES = {
    PUBLIC: [
      '/calendario-admi',
      '/horariosReserva',
      '/canchas-reserva'
    ],
    USER: [
      '/perfil',
      '/mis-turnos',
      '/user-profile'
    ],
    ADMIN: [
      '/ver-turnos',
      '/grilla-turnos',
      '/editar-turno'
    ]
  };