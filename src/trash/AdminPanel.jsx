import React, { useState } from "react";
import { BarChart, Users, Clock, PencilIcon as Pitch, Shield, Edit, Trash, ToggleLeft, Plus } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const metrics = {
    totalReservations: 1250,
    activeUsers: 780,
    revenue: 45000,
    occupancyRate: 75,
    averageReservationDuration: 90,
    mostPopularCourt: "Cancha 1",
    peakHours: "18:00 - 20:00",
    customerSatisfaction: 4.7,
  };

  const reservationData = [
    { name: "Ene", reservations: 400 },
    { name: "Feb", reservations: 300 },
    { name: "Mar", reservations: 500 },
    { name: "Abr", reservations: 280 },
    { name: "May", reservations: 350 },
    { name: "Jun", reservations: 450 },
  ];

  const schedules = [
    { id: 1, day: "Lunes", start: "09:00", end: "21:00" },
    { id: 2, day: "Martes", start: "09:00", end: "21:00" },
    { id: 3, day: "Miércoles", start: "09:00", end: "21:00" },
    { id: 4, day: "Jueves", start: "09:00", end: "21:00" },
    { id: 5, day: "Viernes", start: "09:00", end: "21:00" },
    { id: 6, day: "Sábado", start: "09:00", end: "23:00" },
    { id: 7, day: "Domingo", start: "09:00", end: "21:00" },
  ];

  const timeOptions = [
    "09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00", "21:00", "22:00", "23:00"
  ];

  const [courtTypes, setCourtTypes] = useState(["Fútbol 5", "Fútbol 7", "Fútbol 11"]);
  const [courts, setCourts] = useState([
    { id: 1, name: "Cancha 1", type: "Fútbol 5", price: 24000, deposit: 5000, active: true },
    { id: 2, name: "Cancha 2", type: "Fútbol 7", price: 32000, deposit: 7000, active: true },
  ]);

  const [users, setUsers] = useState([
    { id: 1, name: "Juan Pérez", email: "juan@example.com", dni: "12345678", phone: "123456789", role: "admin" },
    { id: 2, name: "María López", email: "maria@example.com", dni: "87654321", phone: "987654321", role: "user" },
  ]);

  const [newUser, setNewUser] = useState({ name: "", email: "", dni: "", phone: "", password: "", role: "client" });
  const [newCourt, setNewCourt] = useState({ name: "", type: "Fútbol 5", price: 0, deposit: 0 });

  const handleAddUser = (e) => {
    e.preventDefault();
    setUsers([...users, { ...newUser, id: users.length + 1 }]);
    setNewUser({ name: "", email: "", dni: "", phone: "", password: "", role: "client" });
  };

  const handleAddCourt = (e) => {
    e.preventDefault();
    setCourts([...courts, { ...newCourt, id: courts.length + 1 }]);
    setNewCourt({ name: "", type: "Fútbol 5", price: 0, deposit: 0 });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 p-6 bg-gray-100">
        <div className="max-w-9xl mx-auto">
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-6 py-3 rounded-xl text-lg font-medium ${
                activeTab === "dashboard" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <BarChart className="inline-block mr-2" size={24} />
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("schedules")}
              className={`px-6 py-3 rounded-xl text-lg font-medium ${
                activeTab === "schedules" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Clock className="inline-block mr-2" size={24} />
              Horarios
            </button>
            <button
              onClick={() => setActiveTab("courts")}
              className={`px-6 py-3 rounded-xl text-lg font-medium ${
                activeTab === "courts" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Pitch className="inline-block mr-2" size={24} />
              Canchas
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`px-6 py-3 rounded-xl text-lg font-medium ${
                activeTab === "users" ? "bg-orange-500 text-white" : "bg-gray-200 text-gray-700"
              }`}
            >
              <Shield className="inline-block mr-2" size={24} />
              Usuarios
            </button>
          </div>

          {activeTab === "dashboard" && (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Total Reservas</h3>
                  <p className="text-3xl font-bold text-blue-600">{metrics.totalReservations}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Usuarios Activos</h3>
                  <p className="text-3xl font-bold text-green-600">{metrics.activeUsers}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Ingresos</h3>
                  <p className="text-3xl font-bold text-yellow-600">${metrics.revenue}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Tasa de Ocupación</h3>
                  <p className="text-3xl font-bold text-purple-600">{metrics.occupancyRate}%</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Duración Promedio de Reserva</h3>
                  <p className="text-3xl font-bold text-indigo-600">{metrics.averageReservationDuration} min</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Cancha Más Popular</h3>
                  <p className="text-3xl font-bold text-pink-600">{metrics.mostPopularCourt}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Horas Pico</h3>
                  <p className="text-3xl font-bold text-orange-600">{metrics.peakHours}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                  <h3 className="text-lg font-semibold mb-2">Satisfacción del Cliente</h3>
                  <p className="text-3xl font-bold text-teal-600">{metrics.customerSatisfaction}/5</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Reservas por Mes</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={reservationData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="reservations" stroke="#8884d8" activeDot={{ r: 8 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {activeTab === "schedules" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Configuración de Horarios</h2>
              <button className="mb-4 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors">
                Configurar Horarios
              </button>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Día
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hora Inicio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hora Fin
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {schedules.map((schedule) => (
                      <tr key={schedule.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{schedule.day}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={schedule.start}
                            onChange={(e) => {
                              const updatedSchedules = schedules.map((s) =>
                                s.id === schedule.id ? { ...s, start: e.target.value } : s,
                              )
                              setSchedules(updatedSchedules)
                            }}
                            className="border rounded px-2 py-1"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <select
                            value={schedule.end}
                            onChange={(e) => {
                              const updatedSchedules = schedules.map((s) =>
                                s.id === schedule.id ? { ...s, end: e.target.value } : s,
                              )
                              setSchedules(updatedSchedules)
                            }}
                            className="border rounded px-2 py-1"
                          >
                            {timeOptions.map((time) => (
                              <option key={time} value={time}>
                                {time}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">
                            <Edit size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "courts" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Configuración de Canchas</h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Agregar Nueva Cancha</h3>
                <form onSubmit={handleAddCourt} className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newCourt.name}
                    onChange={(e) => setNewCourt({ ...newCourt, name: e.target.value })}
                    className="flex-1 px-4 py-2 border rounded-md"
                  />
                  <select
                    value={newCourt.type}
                    onChange={(e) => setNewCourt({ ...newCourt, type: e.target.value })}
                    className="px-4 py-2 border rounded-md"
                  >
                    {courtTypes.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="Precio"
                    value={newCourt.price}
                    onChange={(e) => setNewCourt({ ...newCourt, price: Number(e.target.value) })}
                    className="px-4 py-2 border rounded-md"
                  />
                  <input
                    type="number"
                    placeholder="Seña"
                    value={newCourt.deposit}
                    onChange={(e) => setNewCourt({ ...newCourt, deposit: Number(e.target.value) })}
                    className="px-4 py-2 border rounded-md"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Agregar Cancha
                  </button>
                </form>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Tipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Seña
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Estado
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {courts.map((court) => (
                      <tr key={court.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{court.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{court.type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <input
                            type="number"
                            value={court.price}
                            onChange={(e) => {
                              const updatedCourts = courts.map((c) =>
                                c.id === court.id ? { ...c, price: Number.parseInt(e.target.value) } : c,
                              )
                              setCourts(updatedCourts)
                            }}
                            className="border rounded px-2 py-1 w-24"
                          />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">${court.deposit}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button
                            onClick={() => {
                              const updatedCourts = courts.map((c) =>
                                c.id === court.id ? { ...c, active: !c.active } : c,
                              )
                              setCourts(updatedCourts)
                            }}
                            className={`px-2 py-1 rounded ${
                              court.active ? "bg-green-500 text-white" : "bg-red-500 text-white"
                            }`}
                          >
                            {court.active ? "Activa" : "Inactiva"}
                          </button>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">
                            <Edit size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <h2 className="text-2xl font-bold mb-4">Gestión de Usuarios</h2>
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Agregar Nuevo Usuario</h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    placeholder="Nombre"
                    value={newUser.name}
                    onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                    className="px-4 py-2 border rounded-md"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                    className="px-4 py-2 border rounded-md"
                  />
                  <input
                    type="text"
                    placeholder="DNI"
                    value={newUser.dni}
                    onChange={(e) => setNewUser({ ...newUser, dni: e.target.value })}
                    className="px-4 py-2 border rounded-md"
                  />
                  <input
                    type="tel"
                    placeholder="Teléfono"
                    value={newUser.phone}
                    onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                    className="px-4 py-2 border rounded-md"
                  />
                  <input
                    type="password"
                    placeholder="Contraseña"
                    value={newUser.password}
                    onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                    className="px-4 py-2 border rounded-md"
                  />
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                    className="px-4 py-2 border rounded-md"
                  >
                    <option value="client">Cliente</option>
                    <option value="moderator">Moderador</option>
                    <option value="admin">Admin</option>
                  </select>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors"
                  >
                    Agregar Usuario
                  </button>
                </form>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nombre
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        DNI
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Teléfono
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rol
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Acciones
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">{user.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.dni}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.phone}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{user.role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <button className="text-blue-600 hover:text-blue-900 mr-2">
                            <Edit size={18} />
                          </button>
                          <button className="text-red-600 hover:text-red-900">
                            <Trash size={18} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default AdminPanel;

