"use client"

import { useState, useEffect } from "react"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, User, MapPin, Shield } from "lucide-react"
import api from "@/lib/axiosConfig"
import { useNavigate } from "react-router-dom"
import { toast, ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import { Footer } from "@/components/Footer"
import { Header } from "@/components/Header"
import BtnLoading from "@/components/BtnLoading"

export default function EditProfile() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [userData, setUserData] = useState({
    name: "",
    email: "",
    telefono: "",
  })

  const [originalUserData, setOriginalUserData] = useState({
    name: "",
    email: "",
    telefono: "",
  })

  const [userPassword, setUserPassword] = useState({
    password: "",
    current_password: "",
    password_confirmation: "",
  })

  const [showPassword, setShowPassword] = useState({
    current_password: false,
    password: false,
    password_confirmation: false,
  })

  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false) // Estado de carga

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("user_id")
        const response = await api.get(`/usuarios/${userId}`)
        const user = response.data.user

        // Adaptamos la estructura a la nueva respuesta
        setUserData({
          name: user.persona?.name || "",
          email: user.email || "",
          telefono: user.persona?.telefono || "",
        })
        setOriginalUserData({
          name: user.persona?.name || "",
          email: user.email || "",
          telefono: user.persona?.telefono || "",
        })
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    })
  }

  const handlePasswordChange = (e) => {
    setUserPassword({
      ...userPassword,
      [e.target.name]: e.target.value,
    })
  }

  const toggleShowPassword = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true) // Iniciar estado de carga
    const userId = localStorage.getItem("user_id")
    const updatedData = {}

    // Comparar los valores actuales con los originales y agregar solo los campos modificados y no vacíos
    if (userData.name !== originalUserData.name && userData.name.trim() !== "") {
      updatedData.name = userData.name // Debería ser plano, no updatedData.persona.name
    }

    if (userData.email !== originalUserData.email && userData.email.trim() !== "") {
      updatedData.email = userData.email
    }

    if (userData.telefono !== originalUserData.telefono && userData.telefono.trim() !== "") {
      updatedData.telefono = userData.telefono // Debería ser plano, no updatedData.persona.telefono
    }

    // Validar contraseñas
    if (userPassword.current_password) {
      if (!userPassword.password || !userPassword.password_confirmation) {
        setError("Debe ingresar la nueva contraseña y la confirmación de la contraseña.")
        setIsLoading(false) // Finalizar estado de carga
        return
      }
      if (userPassword.password !== userPassword.password_confirmation) {
        setError("Las contraseñas no coinciden")
        setIsLoading(false) // Finalizar estado de carga
        return
      }
      updatedData.password = userPassword.password
      updatedData.current_password = userPassword.current_password
      updatedData.password_confirmation = userPassword.password_confirmation
    }

    try {
      await api.patch(`/usuarios/${userId}`, updatedData)
      toast.success("Usuario actualizado correctamente")
      // Actualizar el nombre de usuario en el localStorage
      if (updatedData.name) {
        localStorage.setItem("username", updatedData.name)
        window.dispatchEvent(new Event("storage")) // Disparar evento de almacenamiento
      }
    } catch (error) {
      toast.error(error.response.data.message || error.message)
    } finally {
      setIsLoading(false) // Finalizar estado de carga
    }
  }

  const handleCancelarClick = () => {
    // Restaurar los datos del usuario al estado original
    setUserData({ ...originalUserData })

    // Limpiar los campos de contraseña
    setUserPassword({
      password: "",
      current_password: "",
      password_confirmation: "",
    })

    // Limpiar posibles errores
    setError(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-grow bg-gray-100 p-6">
          <div className="w-full flex justify-center items-center">
            <BtnLoading />
          </div>
          ;
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow bg-gray-100 p-6">
        <h1 className="text-2xl font-bold mb-6">Editar Perfil</h1>
        <div className="max-w-4xl mx-auto space-y-6">
          <ToastContainer position="bottom-right" />
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tarjeta de Información Básica */}
            <div className="bg-white rounded-[8px] p-6 shadow-sm">
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  <User className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Información Básica</h2>
                </div>
                <p className="text-gray-700">Actualiza tu información personal y de contacto.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className=" flex flex-col">
                  <label htmlFor="name" className="text-sm text-gray-700 font-medium">
                    Nombre
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className="bg-white p-1 px-2 rounded-[6px] border border-gray-300"
                  />
                </div>
                <div className=" flex flex-col">
                  <label htmlFor="email" className="text-sm text-gray-700 font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleChange}
                    className="bg-white p-1 px-2 border rounded-[6px] border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="telefono" className="text-sm text-gray-700 font-medium">
                    Teléfono
                  </label>
                  <input
                    id="telefono"
                    name="telefono"
                    type="tel"
                    value={userData.telefono}
                    onChange={handleChange}
                    className="bg-white p-1 px-2 border rounded-[6px] border-gray-300"
                  />
                </div>
              </div>
              <div className="mb-6 mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Dirección</h2>
                </div>
                <p className="text-gray-700">Información de ubicación y dirección.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col md:col-span-2">
                  <label htmlFor="direccion" className="text-sm text-gray-700 font-medium">
                    Dirección
                  </label>
                  <input
                    id="direccion"
                    name="direccion"
                    placeholder="Calle, número, piso, departamento"
                    className="bg-white p-1 px-2 rounded-[6px] border border-gray-300"
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="ciudad" className="text-sm text-gray-700 font-medium">
                    Ciudad
                  </label>
                  <input
                    id="ciudad"
                    name="ciudad"
                    placeholder="Buenos Aires"
                    className="bg-white p-1 px-2 rounded-[6px] border border-gray-300"
                  />
                </div>
                <div className=" flex flex-col">
                  <label htmlFor="provincia" className="text-sm text-gray-700 font-medium">
                    Provincia
                  </label>
                  <input
                    id="provincia"
                    name="provincia"
                    placeholder="Buenos Aires"
                    className="bg-white p-1 px-2 rounded-[6px] border border-gray-300"
                  />
                </div>
              </div>
              <div className="mb-6 mt-8">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
                </div>
                <p className="text-gray-700">Asegúrate de usar una contraseña segura.</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col relative md:col-span-2">
                  <label htmlFor="current_password" className="text-sm text-gray-700 font-medium">
                    Contraseña Actual
                  </label>
                  <input
                    id="current_password"
                    name="current_password"
                    type={showPassword.current_password ? "text" : "password"}
                    value={userPassword.current_password}
                    onChange={handlePasswordChange}
                    className="bg-white p-1 px-2 rounded-[6px] border border-gray-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("current_password")}
                    className="absolute right-3 top-[37px] transform -translate-y-1/2"
                  >
                    {showPassword.current_password ? <EyeOff className="h-5 w-5 text-gray-700" /> : <Eye className="h-5 w-5 text-gray-700" />}
                  </button>
                </div>
                <div className="flex flex-col relative">
                  <label htmlFor="password" className="text-sm text-gray-700 font-medium">
                    Nueva Contraseña
                  </label>
                  <input
                    id="password"
                    name="password"
                    type={showPassword.password ? "text" : "password"}
                    value={userPassword.password}
                    onChange={handlePasswordChange}
                    className="bg-white p-1 px-2 rounded-[6px] border border-gray-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("password")}
                    className="absolute right-3 top-[37px] transform -translate-y-1/2"
                  >
                    {showPassword.password ? <EyeOff className="h-5 w-5 text-gray-700" /> : <Eye className="h-5 w-5 text-gray-700" />}
                  </button>
                </div>
                <div className="flex flex-col relative">
                  <label htmlFor="password_confirmation" className="text-sm text-gray-700 font-medium">
                    Confirmar Contraseña
                  </label>
                  <input
                    id="password_confirmation"
                    name="password_confirmation"
                    type={showPassword.password_confirmation ? "text" : "password"}
                    value={userPassword.password_confirmation}
                    onChange={handlePasswordChange}
                    className="bg-white p-1 px-2 rounded-[6px] border border-gray-300 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("password_confirmation")}
                    className="absolute right-3 top-[37px] transform -translate-y-1/2"
                  >
                    {showPassword.password_confirmation ? <EyeOff className="h-5 w-5 text-gray-700" /> : <Eye className="h-5 w-5 text-gray-700" />}
                  </button>
                </div>
              </div>
            </div>

            

            {/* Error message display */}
            {error && <div className="text-red-500 bg-red-100 border border-red-200 p-3 rounded-md">{error}</div>}

            {/* Acciones del Formulario */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="bg-red-500 px-3 py-2 items-center flex text-white  rounded-[6px] hover:bg-red-600 transition-colors"
                onClick={handleCancelarClick}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="bg-naranja px-3 py-2 text-white items-center flex rounded-[6px] hover:opacity-90 transition-opacity"
                disabled={isLoading}
              >
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
