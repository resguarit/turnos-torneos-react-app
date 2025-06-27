import React, { useState, useEffect } from 'react';
import api from '@/lib/axiosConfig';
import { toast } from 'react-toastify';
import { Calendar, Clock, User, FileText, Activity, AlertCircle, Eye, MoreHorizontal, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import BtnLoading from '@/components/BtnLoading';
import { ScrollArea } from "@/components/ui/scroll-area";
// Renombra los componentes importados para evitar conflictos
import { DialogContent as UIDialogContent, DialogHeader as UIDialogHeader, DialogTitle as UIDialogTitle } from "@/components/ui/dialog";

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
const SimpleDialog = ({ children }) => {
  return <div>{children}</div>;
};

const SimpleDialogHeader = ({ children }) => {
  return <div className="mb-4 pb-2 border-b flex justify-between items-center">{children}</div>;
};

const SimpleDialogTitle = ({ children }) => {
  return <h2 className="text-xl font-semibold text-gray-800">{children}</h2>;
};

const SimpleDialogContent = ({ children, onClose }) => {
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose && onClose();
        }
      }}
    >
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-5xl mx-auto w-11/12">
        {children}
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100 focus:outline-none transition-colors"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5 text-gray-500" />
        </button>
      </div>
    </div>
  );
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

// Componente para formatear y mostrar JSON de forma bonita
const JSONFormatter = ({ data }) => {
  if (!data) return null;

  // Función para colorear diferentes partes del JSON
  const syntaxHighlight = (json) => {
    if (typeof json !== 'string') {
      json = JSON.stringify(json, null, 2);
    }
    
    // Reemplazar valores con clases de color
    return json.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cls = 'text-purple-600'; // number o boolean
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cls = 'text-red-600 font-medium'; // key
        } else {
          cls = 'text-green-600'; // string
        }
      } else if (/true|false/.test(match)) {
        cls = 'text-blue-600'; // boolean
      } else if (/null/.test(match)) {
        cls = 'text-gray-500'; // null
      }
      return `<span class="${cls}">${match}</span>`;
    })
    .replace(/\n/g, '<br/>')
    .replace(/\s{2}/g, '&nbsp;&nbsp;');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-md border border-gray-200 font-mono text-sm overflow-x-auto">
      <div 
        className="whitespace-pre" 
        dangerouslySetInnerHTML={{ __html: syntaxHighlight(data) }} 
      />
    </div>
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
  const [tiposAccion, setTiposAccion] = useState([]);

  useEffect(() => {
    fetchAuditorias();
    // Traer tipos de acción únicos para el filtro
    api.get('/auditoria/tipos-accion').then(res => {
      setTiposAccion(res.data || []);
    });
  }, []);

  const handlePageChange = (page) => {
    // Asegúrate de que la página está dentro del rango válido
    if (page >= 1 && page <= paginacion.lastPage) {
      setPaginacion(prev => ({...prev, currentPage: page}));
      fetchAuditorias(page); // Modifica tu función fetchAuditorias para aceptar el parámetro de página
    }
  };

  const fetchAuditorias = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page: page // Añade el parámetro de página a la solicitud
      };
      
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
      case 'crear':
        return 'success';
      case 'configurar':
        return 'secondary';
      case 'eliminar':
        return 'destructive';
      case 'deshabilitar':
        return 'warning';
      case 'habilitar':
        return 'success';
      case 'modificar':
        return 'warning';
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
      
      <div className="bg-white p-4 rounded-[8px] shadow mb-6">
        <h2 className="text-lg font-semibold mb-4">Filtros</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Acción</label>
            <select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              className="w-full border border-gray-300 rounded-[6px] px-2 py-1 "
            >
              <option value="">Todos</option>
              {tiposAccion.map(tipo => (
                <option key={tipo} value={tipo}>
                  {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario</label>
            <input
              type="text"
              value={filtroUsuario}
              onChange={(e) => setFiltroUsuario(e.target.value)}
              placeholder="Nombre o ID"
              className="w-full border border-gray-300 rounded-[6px] px-2 py-1 "
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Desde</label>
            <input
              type="date"
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              className="w-full border border-gray-300 rounded-[6px] px-2 py-1 "
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha Hasta</label>
            <input
              type="date"
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              className="w-full border border-gray-300 rounded-[6px] px-2 py-1 "
            />
          </div>
        </div>
        
        <div className="mt-4 flex w-full justify-end gap-2">
          <button
            onClick={handleFiltrar}
            className="px-3 py-2 text-sm bg-blue-500 text-white rounded-[6px] hover:bg-blue-600"
          >
            Aplicar Filtros
          </button>
          <button
            onClick={handleLimpiarFiltros}
            className="px-3 py-2 text-sm bg-gray-300 text-gray-700 rounded-[6px] hover:bg-gray-400"
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
                        {auditoria.usuario.persona.name ?? auditoria.usuario.dni}
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
            <SimpleDialogContent onClose={closeDialog}>
              <SimpleDialogHeader>
                <SimpleDialogTitle>Detalles de la auditoría</SimpleDialogTitle>
              </SimpleDialogHeader>
              
              {/* Usa solo clases de Tailwind para el contenedor principal */}
              <div 
                className="h-[70vh] rounded border border-gray-200 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100"
              >
                <div className="grid gap-4 py-4 px-2 pr-4">
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
                      {dialogOpen.usuario ? dialogOpen.usuario.persona.name : 'Sistema'}
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
                  
                  {/* IP */}
                  {dialogOpen.ip && (
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">IP:</span>
                      <span className="col-span-2">{dialogOpen.ip}</span>
                    </div>
                  )}
                  
                  {/* User Agent */}
                  {dialogOpen.user_agent && (
                    <div className="grid grid-cols-3 items-center gap-4">
                      <span className="text-sm font-medium">Navegador:</span>
                      <span className="col-span-2 text-xs">{dialogOpen.user_agent}</span>
                    </div>
                  )}

                  {/* Datos Antiguos */}
                  {dialogOpen.datos_antiguos && Object.keys(dialogOpen.datos_antiguos).length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      <span className="text-base font-medium">Datos Anteriores:</span>
                      <div className="bg-white rounded-md border border-gray-200 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <JSONFormatter data={dialogOpen.datos_antiguos} />
                      </div>
                    </div>
                  )}

                  {/* Datos Nuevos */}
                  {dialogOpen.datos_nuevos && Object.keys(dialogOpen.datos_nuevos).length > 0 && (
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      <span className="text-base font-medium">Datos Nuevos:</span>
                      <div className="bg-white rounded-md border border-gray-200 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <JSONFormatter data={dialogOpen.datos_nuevos} />
                      </div>
                    </div>
                  )}

                  {/* Detalles (mantiene el campo existente) */}
                  {dialogOpen.detalles && (
                    <div className="grid grid-cols-1 gap-2 mb-4">
                      <span className="text-base font-medium">Detalles:</span>
                      <div className="bg-white rounded-md border border-gray-200 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                        <JSONFormatter data={dialogOpen.detalles} />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </SimpleDialogContent>
          )}
          
          <div className="mt-4 flex flex-col items-center space-y-4">
            {/* Total de registros ahora centrado */}
            <div className="text-sm text-gray-500">
              Total de registros: {paginacion.total}
            </div>
            
            {/* Navegación de página también centrada */}
            {paginacion.lastPage > 1 && (
              <div className="flex items-center space-x-2">
                <button 
                  onClick={() => handlePageChange(paginacion.currentPage - 1)}
                  disabled={paginacion.currentPage === 1}
                  className={`p-1 rounded-md ${
                    paginacion.currentPage === 1 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                
                {/* Números de página */}
                <div className="flex space-x-1">
                  {Array.from({ length: paginacion.lastPage }).map((_, index) => {
                    const pageNumber = index + 1;
                    // Mostrar solo algunas páginas para no sobrecargar la UI
                    if (
                      pageNumber === 1 ||
                      pageNumber === paginacion.lastPage ||
                      (pageNumber >= paginacion.currentPage - 1 && pageNumber <= paginacion.currentPage + 1)
                    ) {
                      return (
                        <button
                          key={pageNumber}
                          onClick={() => handlePageChange(pageNumber)}
                          className={`px-3 py-1 rounded-md ${
                            paginacion.currentPage === pageNumber
                              ? 'bg-naranja text-white'
                              : 'hover:bg-gray-100'
                          }`}
                        >
                          {pageNumber}
                        </button>
                      );
                    } else if (
                      (pageNumber === paginacion.currentPage - 2 && pageNumber > 1) ||
                      (pageNumber === paginacion.currentPage + 2 && pageNumber < paginacion.lastPage)
                    ) {
                      // Mostrar puntos suspensivos para páginas omitidas
                      return <span key={pageNumber} className="px-1">...</span>;
                    }
                    return null;
                  })}
                </div>
                
                <button 
                  onClick={() => handlePageChange(paginacion.currentPage + 1)}
                  disabled={paginacion.currentPage === paginacion.lastPage}
                  className={`p-1 rounded-md ${
                    paginacion.currentPage === paginacion.lastPage 
                      ? 'text-gray-400 cursor-not-allowed' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default PestanaAuditoria;