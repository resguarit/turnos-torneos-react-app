"use client"

import { useState, useEffect } from "react"
import { Eye, EyeOff, User, MapPin, Shield, Pencil, SquarePen } from "lucide-react"
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

  const [isLoading, setIsLoading] = useState(false)
  const [editSection, setEditSection] = useState({
    basic: false,
    address: false,
    password: false,
  })
  const [hasChanges, setHasChanges] = useState(false)

  // Cambia el estado address para reflejar los nuevos campos
  const [address, setAddress] = useState({
    calle: "",
    numero: "",
    departamento: "",
    ciudad: "",
  })
  const [originalAddress, setOriginalAddress] = useState({
    calle: "",
    numero: "",
    departamento: "",
    ciudad: "",
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = localStorage.getItem("user_id")
        const response = await api.get(`/usuarios/${userId}`)
        const user = response.data.user

        // Parsear la dirección en partes (asumiendo formato: "Calle Numero [Depto] Ciudad")
        const direccion = user.persona?.direccion || ""
        const partes = direccion.split(" ")
        let calle = "", numero = "", departamento = "", ciudad = ""
        if (partes.length >= 2) {
          calle = partes[0]
          numero = partes[1]
          // Si hay más partes, buscar si hay "Depto" o similar
          if (partes.length === 3) {
            ciudad = partes[2]
          } else if (partes.length >= 4) {
            departamento = partes[2]
            ciudad = partes.slice(3).join(" ")
          }
        } else if (partes.length === 1) {
          calle = partes[0]
        }

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
        setAddress({
          calle,
          numero,
          departamento,
          ciudad,
        })
        setOriginalAddress({
          calle,
          numero,
          departamento,
          ciudad,
        })
      } catch (error) {
        setError(error.message)
      } finally {
        setLoading(false)
      }
    }

    fetchUserData()
  }, [])

  // Detectar cambios en los datos
  useEffect(() => {
    const basicChanged =
      userData.name !== originalUserData.name ||
      userData.email !== originalUserData.email ||
      userData.telefono !== originalUserData.telefono
    const addressChanged =
      address.direccion !== originalAddress.direccion ||
      address.ciudad !== originalAddress.ciudad ||
      address.provincia !== originalAddress.provincia
    const passwordChanged =
      userPassword.current_password ||
      userPassword.password ||
      userPassword.password_confirmation

    setHasChanges(basicChanged || addressChanged || passwordChanged)
  }, [userData, originalUserData, address, originalAddress, userPassword])

  const handleChange = (e) => {
    setUserData({
      ...userData,
      [e.target.name]: e.target.value,
    })
  }

  const handleAddressChange = (e) => {
    setAddress({
      ...address,
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

  const handleEditSection = (section) => {
    setEditSection((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
    setError(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    const userId = localStorage.getItem("user_id")
    const updatedData = {}

    // Validación: nombre, email y teléfono no pueden estar vacíos si se edita info básica
    if (editSection.basic) {
      if (
        !userData.name.trim() ||
        !userData.email.trim() ||
        !userData.telefono.trim()
      ) {
        toast.error("Nombre, email y teléfono deben estar completos.")
        setIsLoading(false)
        return
      }
      if (userData.name !== originalUserData.name) {
        updatedData.name = userData.name
      }
      if (userData.email !== originalUserData.email) {
        updatedData.email = userData.email
      }
      if (userData.telefono !== originalUserData.telefono) {
        updatedData.telefono = userData.telefono
      }
    }

    if (editSection.address) {
      // Unir los campos en un solo string para la dirección
      let direccion = `${address.calle || ""} ${address.numero || ""}`
      if (address.departamento) direccion += ` ${address.departamento}`
      if (address.ciudad) direccion += ` ${address.ciudad}`
      direccion = direccion.trim()

      let originalDireccion = `${originalAddress.calle || ""} ${originalAddress.numero || ""}`
      if (originalAddress.departamento) originalDireccion += ` ${originalAddress.departamento}`
      if (originalAddress.ciudad) originalDireccion += ` ${originalAddress.ciudad}`
      originalDireccion = originalDireccion.trim()

      if (direccion !== originalDireccion && direccion !== "") {
        updatedData.direccion = direccion
      }
    }

    if (editSection.password) {
      // Validaciones de contraseña
      if (!userPassword.current_password || !userPassword.password || !userPassword.password_confirmation) {
        toast.error("Debe ingresar la contraseña actual, la nueva y la confirmación.")
        setIsLoading(false)
        return
      }
      if (userPassword.password.length < 8) {
        toast.error("La nueva contraseña debe tener al menos 8 caracteres.")
        setIsLoading(false)
        return
      }
      if (userPassword.password !== userPassword.password_confirmation) {
        toast.error("La nueva contraseña y la confirmación deben coincidir.")
        setIsLoading(false)
        return
      }
      updatedData.password = userPassword.password
      updatedData.current_password = userPassword.current_password
      updatedData.password_confirmation = userPassword.password_confirmation
    }

    if (Object.keys(updatedData).length === 0) {
      setIsLoading(false)
      return
    }

    try {
      await api.patch(`/usuarios/${userId}`, updatedData)
      toast.success("Usuario actualizado correctamente")
      if (updatedData.name) {
        localStorage.setItem("username", updatedData.name)
        window.dispatchEvent(new Event("storage"))
      }
      setOriginalUserData({ ...userData })
      setOriginalAddress({ ...address })
      setUserPassword({
        password: "",
        current_password: "",
        password_confirmation: "",
      })
      setEditSection({ basic: false, address: false, password: false })
    } catch (error) {
      // Si el backend devuelve error de contraseña actual incorrecta
      if (error.response?.data?.message?.toLowerCase().includes("actual")) {
        toast.error("La contraseña actual no es correcta.")
      } else {
        toast.error(error.response?.data?.message || error.message)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelarClick = () => {
    setUserData({ ...originalUserData })
    setAddress({ ...originalAddress })
    setUserPassword({
      password: "",
      current_password: "",
      password_confirmation: "",
    })
    setEditSection({ basic: false, address: false, password: false })
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
            {/* Información Básica */}
            <div className="bg-white rounded-[8px] p-6 shadow-sm relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Información Básica</h2>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => handleEditSection("basic")}
                  aria-label="Editar información básica"
                >
                  <SquarePen  className={`w-5 h-5  ${editSection.basic
                        ? "text-red-500 "
                        : "text-gray-700"
                      }`} />
                </button>
              </div>
              <p className="text-gray-700 mb-4">Actualiza tu información personal y de contacto.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="name" className="text-sm text-gray-700 font-medium">
                    Nombre
                  </label>
                  <input
                    id="name"
                    name="name"
                    value={userData.name}
                    onChange={handleChange}
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 transition-colors
                      ${editSection.basic
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.basic}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="email" className="text-sm text-gray-700 font-medium">
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={userData.email}
                    onChange={handleChange}
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 transition-colors
                      ${editSection.basic
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.basic}
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
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 transition-colors
                      ${editSection.basic
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.basic}
                  />
                </div>
              </div>
            </div>

            {/* Dirección */}
            <div className="bg-white rounded-[8px] p-6 shadow-sm relative">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Dirección</h2>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => handleEditSection("address")}
                  aria-label="Editar dirección"
                >
                  <SquarePen className={`w-5 h-5  ${editSection.address
                        ? "text-red-500 "
                        : "text-gray-700"
                      }`} />
                </button>
              </div>
              <p className="text-gray-700 mb-4">Información de ubicación y dirección.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex flex-col">
                  <label htmlFor="calle" className="text-sm text-gray-700 font-medium">
                    Calle
                  </label>
                  <input
                    id="calle"
                    name="calle"
                    placeholder="Ej: San Martín"
                    value={address.calle}
                    onChange={handleAddressChange}
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 transition-colors
                      ${editSection.address
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.address}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="numero" className="text-sm text-gray-700 font-medium">
                    Número
                  </label>
                  <input
                    id="numero"
                    name="numero"
                    placeholder="Ej: 1234"
                    value={address.numero}
                    onChange={handleAddressChange}
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 transition-colors
                      ${editSection.address
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.address}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="departamento" className="text-sm text-gray-700 font-medium">
                    Departamento (opcional)
                  </label>
                  <input
                    id="departamento"
                    name="departamento"
                    placeholder="Ej: 2B"
                    value={address.departamento}
                    onChange={handleAddressChange}
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 transition-colors
                      ${editSection.address
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.address}
                  />
                </div>
                <div className="flex flex-col">
                  <label htmlFor="ciudad" className="text-sm text-gray-700 font-medium">
                    Ciudad
                  </label>
                  <input
                    id="ciudad"
                    name="ciudad"
                    placeholder="Ej: Buenos Aires"
                    value={address.ciudad}
                    onChange={handleAddressChange}
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 transition-colors
                      ${editSection.address
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.address}
                  />
                </div>
              </div>
            </div>

            {/* Cambiar Contraseña */}
            <div className="bg-white rounded-[8px] p-6 shadow-sm relative">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
                </div>
                <button
                  type="button"
                  className="p-1 rounded-full hover:bg-gray-100"
                  onClick={() => handleEditSection("password")}
                  aria-label="Editar contraseña"
                >
                  <SquarePen className={`w-5 h-5  ${editSection.password
                        ? "text-red-500 "
                        : "text-gray-700"
                      }`} />
                </button>
              </div>
              <div className="bg-blue-50 p-3 mb-2 rounded-[8px]">
                  <h4 className="font-medium text-blue-900 mb-2">Para una contraseña segura:</h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Al menos 8 caracteres de longitud</li>
                    <li>• Incluye mayúsculas y minúsculas</li>
                    <li>• Usa números y símbolos especiales</li>
                    <li>• Evita información personal obvia</li>
                  </ul>
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
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 pr-12 transition-colors
                      ${editSection.password
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.password}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("current_password")}
                    className="absolute right-3 top-[37px] transform -translate-y-1/2"
                    tabIndex={-1}
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
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 pr-12 transition-colors
                      ${editSection.password
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.password}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("password")}
                    className="absolute right-3 top-[37px] transform -translate-y-1/2"
                    tabIndex={-1}
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
                    className={`p-1 px-2 rounded-[6px] border border-gray-300 pr-12 transition-colors
                      ${editSection.password
                        ? "bg-yellow-50 focus:bg-white focus:border-naranja"
                        : "bg-gray-100 text-gray-400 cursor-not-allowed"
                      }`}
                    disabled={!editSection.password}
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowPassword("password_confirmation")}
                    className="absolute right-3 top-[37px] transform -translate-y-1/2"
                    tabIndex={-1}
                  >
                    {showPassword.password_confirmation ? <EyeOff className="h-5 w-5 text-gray-700" /> : <Eye className="h-5 w-5 text-gray-700" />}
                  </button>
                </div>
              </div>
            </div>

            {/* Acciones del Formulario */}
            <div className="flex justify-between pt-4">
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 items-center flex rounded-[6px] transition-colors"
                onClick={handleCancelarClick}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`bg-naranja px-3 py-2 text-white items-center flex rounded-[6px] transition-opacity ${hasChanges ? "hover:opacity-90" : "opacity-60 cursor-not-allowed"}`}
                disabled={!hasChanges || isLoading}
              >
                {isLoading
                  ? "Guardando..."
                  : hasChanges
                  ? "Guardar Cambios"
                  : "Sin cambios"}
              </button>
            </div>
          </form>
        </div>
      </main>
      <Footer />
    </div>
  )
}
