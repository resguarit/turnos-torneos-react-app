export function generarTorneo(teams, format) {
    switch (format) {
      case 'Liga':
        return generarLiga(teams)
      case 'Eliminacion Directa':
        return generarEliminacion(teams)
      case 'Fase de Grupos':
        return generarGrupos(teams)
      default:
        return null
    }
  }
  
  function generarLiga(teams) {
    const matches = []
    for (let i = 0; i < teams.length; i += 2) {
      matches.push({
        team1: teams[i],
        team2: teams[i + 1],
        time: i < 2 ? '18:00' : '19:00'
      })
    }
    return matches
  }
  
  function generarEliminacion(teams) {
    // Shuffle teams randomly
    return [...teams].sort(() => Math.random() - 0.5)
  }
  
  function generarGrupos(teams) {
    // Shuffle teams randomly before group assignment
    return [...teams].sort(() => Math.random() - 0.5)
  }