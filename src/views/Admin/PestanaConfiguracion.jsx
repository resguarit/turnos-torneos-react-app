import React, { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle, Info } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import api from '@/lib/axiosConfig';
import { Popover } from '@headlessui/react';
import BtnLoading from '@/components/BtnLoading';

const PestanaConfiguracion = () => {
  const [config, setConfig] = useState({
    colores: {
      primary: '#000000',
      secondary: '#000000'
    },
    habilitar_turnos: true,
    habilitar_mercado_pago: false,
    mercado_pago_access_token: '',
    mercado_pago_webhook_secret: '',
    mercado_pago_public_key: '',
    nombre_complejo: '',
    direccion_complejo: '',
    telefono_complejo: ''
  });
  
  // Almacenamos las credenciales enmascaradas originales
  const [maskedCredentials, setMaskedCredentials] = useState({
    access_token: '',
    webhook_secret: ''
  });
  
  const [originalConfig, setOriginalConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Estados para controlar si las credenciales han sido modificadas
  const [accessTokenModified, setAccessTokenModified] = useState(false);
  const [webhookSecretModified, setWebhookSecretModified] = useState(false);
  const [publicKeyModified, setPublicKeyModified] = useState(false);
  
  // Estados para controlar si el usuario está enfocado en los campos de credenciales
  const [accessTokenFocused, setAccessTokenFocused] = useState(false);
  const [webhookSecretFocused, setWebhookSecretFocused] = useState(false);
  const [publicKeyFocused, setPublicKeyFocused] = useState(false);

  // Estilos para los campos de credenciales
  const credentialInputStyle = {
    fontFamily: 'monospace',
    letterSpacing: '0.5px',
    fontSize: '14px'
  };

  const [logoPreview, setLogoPreview] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  useEffect(() => {
    fetchConfiguracion();
  }, []);

  const fetchConfiguracion = async () => {
    try {
      setLoading(true);
      const response = await api.get('/configuracion-usuario');
      
      const configData = {
        ...response.data
      };
      
      setLogoPreview(configData.logo_complejo_url || null);

      // Guardamos las credenciales enmascaradas para mostrarlas
      setMaskedCredentials({
        access_token: response.data.mercado_pago_access_token || '',
        webhook_secret: response.data.mercado_pago_webhook_secret || ''
      });
      
      // Inicializamos las credenciales en el estado config como vacías
      // para cuando el usuario comience a escribir
      configData.mercado_pago_access_token = '';
      configData.mercado_pago_webhook_secret = '';
      configData.mercado_pago_public_key = response.data.mercado_pago_public_key || '';
      
      setConfig(configData);
      setOriginalConfig(configData);
      
      // Resetear los estados de modificación después de cargar nuevos datos
      setAccessTokenModified(false);
      setWebhookSecretModified(false);
      setPublicKeyModified(false);
    } catch (error) {
      console.error('Error al obtener la configuración:', error);
      setErrorMessage('Error al cargar la configuración. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name === 'habilitar_mercado_pago' && !checked) {
      // Si desactiva Mercado Pago, no enviamos las credenciales aunque hayan sido modificadas
      setAccessTokenModified(false);
      setWebhookSecretModified(false);
      setPublicKeyModified(false);
    }
    
    setConfig(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  const handleCredentialChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'mercado_pago_access_token') {
      setAccessTokenModified(true);
    } else if (name === 'mercado_pago_webhook_secret') {
      setWebhookSecretModified(true);
    } else if (name === 'mercado_pago_public_key') {
      setPublicKeyModified(true);
    }
    
    setConfig(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCredentialFocus = (field) => {
    if (field === 'access_token') {
      setAccessTokenFocused(true);
      if (!accessTokenModified) {
        setConfig(prev => ({
          ...prev,
          mercado_pago_access_token: ''
        }));
      }
    } else if (field === 'webhook_secret') {
      setWebhookSecretFocused(true);
      if (!webhookSecretModified) {
        setConfig(prev => ({
          ...prev,
          mercado_pago_webhook_secret: ''
        }));
      }
    } else if (field === 'public_key') {
      setPublicKeyFocused(true);
      if (!publicKeyModified) {
        setConfig(prev => ({
          ...prev,
          mercado_pago_public_key: ''
        }));
      }
    }
  };
  
  const handleCredentialBlur = (field) => {
    if (field === 'access_token') {
      setAccessTokenFocused(false);
    } else if (field === 'webhook_secret') {
      setWebhookSecretFocused(false);
    } else if (field === 'public_key') {
      setPublicKeyFocused(false);
    }
  };

  // Función para manejar cambios desde el HexColorPicker
  const handleColorPickerChange = (color, type) => {
    setConfig(prev => ({
      ...prev,
      colores: {
        ...prev.colores,
        [type]: color
      }
    }));
  };

  // Función para manejar cambios desde el input de texto
  const handleColorInputChange = (e) => {
    const { name, value } = e.target;
    const colorType = name.replace('color_', '');
    
    setConfig(prev => ({
      ...prev,
      colores: {
        ...prev.colores,
        [colorType]: value
      }
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    setLogoFile(file);
    setLogoPreview(file ? URL.createObjectURL(file) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setErrorMessage('');
    
    try {
      const dataToSend = new FormData();
      
      dataToSend.append('colores[primary]', config.colores.primary);
      dataToSend.append('colores[secondary]', config.colores.secondary);
      dataToSend.append('habilitar_turnos', config.habilitar_turnos ? '1' : '0');
      dataToSend.append('habilitar_mercado_pago', config.habilitar_mercado_pago ? '1' : '0');
      dataToSend.append('nombre_complejo', config.nombre_complejo);
      dataToSend.append('direccion_complejo', config.direccion_complejo);
      dataToSend.append('telefono_complejo', config.telefono_complejo);

      if (logoFile) {
        dataToSend.append('logo_complejo', logoFile);
      }

      if (config.habilitar_mercado_pago) {
        if (publicKeyModified) {
          dataToSend.append('mercado_pago_public_key', config.mercado_pago_public_key);
        }
        if (accessTokenModified) {
          dataToSend.append('mercado_pago_access_token', config.mercado_pago_access_token);
        }
        if (webhookSecretModified) {
          dataToSend.append('mercado_pago_webhook_secret', config.mercado_pago_webhook_secret);
        }
      }
      
      await api.post('/configuracion-update', dataToSend, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMessage('Configuración actualizada correctamente');
      
      document.documentElement.style.setProperty('--color-primary', config.colores.primary);
      document.documentElement.style.setProperty('--color-secundario', config.colores.secondary);
      
      fetchConfiguracion();
      
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    } catch (error) {
      console.error('Error al guardar la configuración:', error);
      setErrorMessage('Error al guardar la configuración. Intente nuevamente.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <BtnLoading />
    );
  }

  // Determinamos qué valor mostrar para cada credencial
  const displayAccessToken = accessTokenFocused || accessTokenModified 
    ? config.mercado_pago_access_token 
    : maskedCredentials.access_token;
  
  const displayWebhookSecret = webhookSecretFocused || webhookSecretModified 
    ? config.mercado_pago_webhook_secret 
    : maskedCredentials.webhook_secret;

  const displayPublicKey = publicKeyFocused || publicKeyModified 
    ? config.mercado_pago_public_key 
    : config.mercado_pago_public_key;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center gap-2 mb-6">
        <Settings className="h-6 w-6 text-gray-600" />
        <h2 className="text-xl font-semibold">Configuración del Sistema</h2>
      </div>

      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
          <CheckCircle className="h-5 w-5" />
          <span>{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 flex items-center gap-2">
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Sección de colores */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Colores de la aplicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color primario
                </label>
                <div className="flex items-center gap-2">
                  <Popover className="relative">
                    <Popover.Button className="w-10 h-10 rounded-md shadow-sm border border-gray-300"
                      style={{ backgroundColor: config.colores.primary }}
                    />
                    
                    <Popover.Panel className="absolute z-10 mt-2">
                      <HexColorPicker 
                        color={config.colores.primary} 
                        onChange={(color) => handleColorPickerChange(color, 'primary')} 
                      />
                    </Popover.Panel>
                  </Popover>
                  <input
                    type="text"
                    name="color_primary"
                    className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 w-32"
                    value={config.colores.primary}
                    onChange={handleColorInputChange}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Color secundario
                </label>
                <div className="flex items-center gap-2">
                  <Popover className="relative">
                    <Popover.Button className="w-10 h-10 rounded-md shadow-sm border border-gray-300"
                      style={{ backgroundColor: config.colores.secondary }}
                    />
                    
                    <Popover.Panel className="absolute z-10 mt-2">
                      <HexColorPicker 
                        color={config.colores.secondary} 
                        onChange={(color) => handleColorPickerChange(color, 'secondary')} 
                      />
                    </Popover.Panel>
                  </Popover>
                  <input
                    type="text"
                    name="color_secondary"
                    className="border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 w-32"
                    value={config.colores.secondary}
                    onChange={handleColorInputChange}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sección de configuración general */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Configuración general</h3>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  id="habilitar_turnos"
                  name="habilitar_turnos"
                  type="checkbox"
                  checked={config.habilitar_turnos}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="habilitar_turnos" className="ml-2 block text-sm text-gray-700">
                  Habilitar sistema de turnos
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Si esta opción está deshabilitada, los usuarios no podrán reservar turnos.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del complejo
                </label>
                <input
                  type="text"
                  name="nombre_complejo"
                  value={config.nombre_complejo}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dirección del complejo
                </label>
                <input
                  type="text"
                  name="direccion_complejo"
                  value={config.direccion_complejo}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Teléfono del complejo
                </label>
                <input
                  type="text"
                  name="telefono_complejo"
                  value={config.telefono_complejo}
                  onChange={handleChange}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
            </div>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Logo del complejo
              </label>
              <div className="flex items-center gap-4">
                {logoPreview ? (
                  <img
                    src={logoPreview}
                    alt="Logo del complejo"
                    className="h-16 w-16 object-contain border rounded bg-white"
                  />
                ) : (
                  <span className="text-gray-400 text-xs">Sin logo</span>
                )}
                <label className="bg-gray-200 px-3 py-2 rounded text-sm cursor-pointer hover:bg-gray-300">
                  {logoPreview ? "Cambiar logo" : "Cargar logo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoChange}
                    disabled={saving}
                  />
                </label>
                {logoPreview && (
                  <button
                    type="button"
                    className="text-xs text-red-500 ml-2"
                    onClick={() => {
                      setLogoPreview(null);
                      setLogoFile(null);
                    }}
                    disabled={saving}
                  >
                    Quitar
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Formato recomendado: PNG/JPG. Máx 2MB.
              </p>
            </div>
          </div>

          {/* Sección de Mercado Pago */}
          <div className="col-span-2">
            <h3 className="text-lg font-medium mb-4 border-b pb-2">Configuración de Mercado Pago</h3>
            
            <div className="mb-4">
              <div className="flex items-center mb-2">
                <input
                  id="habilitar_mercado_pago"
                  name="habilitar_mercado_pago"
                  type="checkbox"
                  checked={config.habilitar_mercado_pago}
                  onChange={handleChange}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="habilitar_mercado_pago" className="ml-2 block text-sm text-gray-700">
                  Habilitar pagos con Mercado Pago
                </label>
              </div>
              <p className="text-sm text-gray-500">
                Si esta opción está habilitada, los usuarios podrán pagar con Mercado Pago.
              </p>
            </div>
            
            <div className="mb-4">
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span>Public Key de Mercado Pago</span>
                <Info className="w-4 h-4 ml-1 text-gray-400" title="Clave pública para inicializar el SDK de Mercado Pago" />
              </label>
              <input
                type="text"
                name="mercado_pago_public_key"
                value={displayPublicKey}
                onChange={handleCredentialChange}
                onFocus={() => handleCredentialFocus('public_key')}
                onBlur={() => handleCredentialBlur('public_key')}
                placeholder="Ingrese su Public Key de Mercado Pago"
                style={credentialInputStyle}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!config.habilitar_mercado_pago ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!config.habilitar_mercado_pago}
              />
              <p className="mt-1 text-sm text-gray-500">
                {publicKeyModified 
                  ? "Public Key modificada, se guardará al guardar la configuración" 
                  : "Haga clic para editar. Esta clave es pública y se usa en el frontend."}
              </p>
            </div>
            
            <div className="mb-4">
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span>Access Token de Mercado Pago</span>
                <Info className="w-4 h-4 ml-1 text-gray-400" title="Credencial privada necesaria para conectar con Mercado Pago" />
              </label>
              <input
                type="text"
                name="mercado_pago_access_token"
                value={displayAccessToken}
                onChange={handleCredentialChange}
                onFocus={() => handleCredentialFocus('access_token')}
                onBlur={() => handleCredentialBlur('access_token')}
                placeholder="Ingrese su Access Token de Mercado Pago"
                style={credentialInputStyle}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!config.habilitar_mercado_pago ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!config.habilitar_mercado_pago}
              />
              <p className="mt-1 text-sm text-gray-500">
                {accessTokenModified 
                  ? "Token modificado, se guardará al guardar la configuración" 
                  : "Haga clic para editar. Verá los primeros y últimos caracteres de su token actual."}
              </p>
            </div>
            
            <div className="mb-4">
              <label className=" text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span>Webhook Secret de Mercado Pago</span>
                <Info className="w-4 h-4 ml-1 text-gray-400" title="Clave secreta para validar notificaciones desde Mercado Pago" />
              </label>
              <input
                type="text"
                name="mercado_pago_webhook_secret"
                value={displayWebhookSecret}
                onChange={handleCredentialChange}
                onFocus={() => handleCredentialFocus('webhook_secret')}
                onBlur={() => handleCredentialBlur('webhook_secret')}
                placeholder="Ingrese su Webhook Secret de Mercado Pago"
                style={credentialInputStyle}
                className={`mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 ${!config.habilitar_mercado_pago ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!config.habilitar_mercado_pago}
              />
              <p className="mt-1 text-sm text-gray-500">
                {webhookSecretModified 
                  ? "Secret modificado, se guardará al guardar la configuración" 
                  : "Haga clic para editar. Verá los primeros y últimos caracteres de su secret actual."}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-[4px] shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Guardando...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Guardar configuración
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PestanaConfiguracion;