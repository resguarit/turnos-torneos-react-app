import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { Calendar, Clock, User, FileText, Activity, AlertCircle, Eye, MoreHorizontal } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BtnLoading from '@/components/BtnLoading';

// Definimos componentes de tabla básicos si no están disponibles
const Table = ({ children, className, ...props }) => (
  <table className={`min-w-full divide-y divide-gray-200 ${className || ''}`} {...props}>{children}</table>
);

const TableHeader = ({ children, ...props }) => (
  <thead className="bg-gray-50" {...props}>{children}</thead>
);

const TableBody = ({ children, ...props }) => (
  <tbody className="bg-white divide-y divide-gray-200" {...props}>{children}</tbody>
);

const TableRow = ({ children, ...props }) => (
  <tr {...props}>{children}</tr>
);

const TableHead = ({ children, className, ...props }) => (
  <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className || ''}`} {...props}>{children}</th>
);

const TableCell = ({ children, className, ...props }) => (
  <td className={`px-6 py-4 whitespace-nowrap ${className || ''}`} {...props}>{children}</td>
);

// Componente Badge simple
const Badge = ({ children, variant, ...props }) => {
  const getVariantStyles = (variant) => {
    switch (variant) {
      case 'default': return 'bg-blue-100 text-blue-800';
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'destructive': return 'bg-red-100 text-red-800';
      case 'secondary': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <span 
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getVariantStyles(variant)}`} 
      {...props}
    >
      {children}
    </span>
  );
};

// Componentes simplificados para Dialog y DropdownMenu
const Button = ({ children, variant, size, className, ...props }) => {
  const getVariantStyles = () => {
    if (variant === 'ghost') return 'bg-transparent hover:bg-gray-100';
    return 'bg-blue-600 text-white hover:bg-blue-700';
  };
  
  const getSizeStyles = () => {
    if (size === 'sm') return 'py-1 px-2 text-sm';
    return 'py-2 px-4';
  };
  
  return (
    <button 
      className={`rounded-md font-medium ${getVariantStyles()} ${getSizeStyles()} ${className || ''}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Simples versiones de los componentes de diálogo
const Dialog = ({ children }) => {
  return <div>{children}</div>;
};

const DialogTrigger = ({ children, asChild }) => {
  return <div>{children}</div>;
};

// Actualizar la versión simplificada del componente DialogContent para cerrar cuando se hace clic fuera
const DialogContent = ({ children, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose && onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md mx-auto">
        {children}
      </div>
    </div>
  );
};

const DialogHeader = ({ children }) => {
  return <div className="mb-4">{children}</div>;
};

const DialogTitle = ({ children }) => {
  return <h2 className="text-lg font-semibold">{children}</h2>;
};

// Simples versiones de los componentes de menú desplegable
const DropdownMenu = ({ children }) => {
  return <div className="relative">{children}</div>;
};

const DropdownMenuTrigger = ({ children }) => {
  return <div>{children}</div>;
};

const DropdownMenuContent = ({ children, align }) => {
  const alignClass = align === 'end' ? 'right-0' : 'left-0';
  
  return (
    <div className={`absolute z-10 mt-1 ${alignClass} w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5`}>
      <div className="py-1">{children}</div>
    </div>
  );
};

const DropdownMenuItem = ({ children, ...props }) => {
  return (
    <button
      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
      {...props}
    >
      {children}
    </button>
  );
};

const PestanaAuditoria = () => {
  const [auditorias, setAuditorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroUsuario, setFiltroUsuario] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [paginacion, setPaginacion] = useState({
    currentPage: 1,
    lastPage: 1,
    total: 0
  });
  const [dialogOpen, setDialogOpen] = useState(null);

  useEffect(() => {
    fetchAuditorias();
  }, []);

  const fetchAuditorias = async () => {
    setLoading(true);
    try {
      const params = {};
      
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroUsuario) params.usuario = filtroUsuario;
      if (fechaInicio) params.fecha_inicio = fechaInicio;
      if (fechaFin) params.fecha_fin = fechaFin;
      
      const response = await api.get('/auditorias', { params });
      console.log('Respuesta de auditorías:', response.data);
      
      // Verificar si la respuesta tiene la estructura esperada
      if (response.data && response.data.auditorias) {
        setAuditorias(response.data.auditorias.data || []);
        setPaginacion({
          currentPage: response.data.auditorias.current_page,
          lastPage: response.data.auditorias.last_page,
          total: response.data.auditorias.total
        });
      } else {
        console.error('Estructura de respuesta inesperada:', response.data);
        toast.error('Error en el formato de datos recibidos');
        setAuditorias([]);
      }
    } catch (error) {
      console.error('Error al cargar auditorías:', error);
      toast.error('Error al cargar las auditorías');
      setAuditorias([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltrar = () => {
    fetchAuditorias();
  };

  const handleLimpiarFiltros = () => {
    setFiltroTipo('');
    setFiltroUsuario('');
    setFechaInicio('');
    setFechaFin('');
    fetchAuditorias();
  };

  const getBadgeVariant = (accion) => {
    switch (accion) {
      case 'login':
        return 'default';
      case 'crear':
        return 'success';
      case 'actualizar':
      case 'modificar':
        return 'warning';
      case 'cancelar':
        return 'destructive';
      case 'turno':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  // Función para abrir el diálogo con la auditoría seleccionada
  const openDialog = (auditoria) => {
    setDialogOpen(auditoria);
  };

  // Función para cerrar el diálogo
  const closeDialog = () => {
    setDialogOpen(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Auditorías del Sistema</h1>
      
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Acción</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="">Todos</option>
              <option value="login">Login</option>
              <option value="crear">Crear</option>
              <option value="actualizar">Actualizar</option>
              <option value="cancelar">Cancelar</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              placeholder="Nombre o ID"
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full p-2 border rounded-md"
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={handleFiltrar}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleLimpiarFiltros}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
          >
            Limpiar Filtros
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <BtnLoading/>
        </div>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Acción</TableHead>
                  <TableHead className="hidden md:table-cell">Entidad</TableHead>
                  {/* Columna de IP eliminada */}
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditorias.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center">
                      No se encontraron registros de auditoría.
                    </TableCell>
                  </TableRow>
                ) : (
                  auditorias.map((auditoria) => (
                    <TableRow key={auditoria.id}>
                      <TableCell className="font-medium">
                        {format(new Date(auditoria.created_at), "dd/MM/yyyy HH:mm", {locale: es})}
                      </TableCell>
                      <TableCell>
                        {auditoria.usuario ? auditoria.usuario.name : 'Sistema'}
                      </TableCell>
                      <TableCell>
                        <Badge variant={getBadgeVariant(auditoria.accion)}>{auditoria.accion}</Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {auditoria.entidad} {auditoria.entidad_id ? `#${auditoria.entidad_id}` : ''}
                      </TableCell>
                      {/* Celda de IP eliminada */}
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0"
                          onClick={() => openDialog(auditoria)}
                        >
                          <span className="sr-only">Ver detalles</span>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Diálogo de detalles */}
          {dialogOpen && (
            <DialogContent onClose={closeDialog}>
              <DialogHeader>
                <DialogTitle>Detalles de la auditoría</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="col-span-2">{dialogOpen.id}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Fecha:</span>
                  <span className="col-span-2">
                    {format(new Date(dialogOpen.created_at), "dd/MM/yyyy HH:mm", {locale: es})}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Usuario:</span>
                  <span className="col-span-2">
                    {dialogOpen.usuario ? dialogOpen.usuario.name : 'Sistema'}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Acción:</span>
                  <span className="col-span-2">
                    <Badge variant={getBadgeVariant(dialogOpen.accion)}>{dialogOpen.accion}</Badge>
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Entidad:</span>
                  <span className="col-span-2">
                    {dialogOpen.entidad} {dialogOpen.entidad_id ? `#${dialogOpen.entidad_id}` : ''}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">IP:</span>
                  <span className="col-span-2">{dialogOpen.ip}</span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Datos Antiguos:</span>
                  <span className="col-span-2">
                    {dialogOpen.datos_antiguos ? (
                      <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-2 rounded">
                        {dialogOpen.datos_antiguos}
                      </pre>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">Datos Nuevos:</span>
                  <span className="col-span-2">
                    {dialogOpen.datos_nuevos ? (
                      <pre className="text-sm whitespace-pre-wrap bg-gray-100 p-2 rounded">
                        {dialogOpen.datos_nuevos}
                      </pre>
                    ) : 'N/A'}
                  </span>
                </div>
                <div className="grid grid-cols-3 items-center gap-4">
                  <span className="text-sm font-medium">User Agent:</span>
                  <span className="col-span-2">
                    {dialogOpen.user_agent}
                  </span>
                </div>
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={closeDialog}>
                  Cerrar
                </Button>
              </div>
            </DialogContent>
          )}
          
          <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
            <div>
              Total de registros: {paginacion.total}
            </div>
            {paginacion.lastPage > 1 && (
              <div className="flex items-center gap-2">
                <span>
                  Página {paginacion.currentPage} de {paginacion.lastPage}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PestanaAuditoria;