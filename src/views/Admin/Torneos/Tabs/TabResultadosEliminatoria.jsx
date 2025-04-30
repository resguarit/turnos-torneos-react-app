import ArañaEliminacion from "../ArañaEliminacion";

export function TabEliminatoria({ equipos, etapa }) {
  return (
    <div>
      <ArañaEliminacion 
        equipos={equipos} 
        etapa={etapa}
        mostrarProgreso
      />
      
      <div className="mt-8">
        <h3 className="text-xl font-bold mb-4">Estadísticas del Torneo</h3>
        {/* Estadísticas específicas de eliminatoria */}
      </div>
    </div>
  );
}