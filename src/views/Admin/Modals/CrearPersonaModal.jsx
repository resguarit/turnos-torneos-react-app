import React, { useState } from "react";
import api from "@/lib/axiosConfig";
import { toast } from "react-toastify";

export default function CrearPersonaModal({ onClose, onPersonaCreada }) {
  const [form, setForm] = useState({
    name: "",
    apellido: "",
    dni: "",
    telefono: "",
    direccion: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post("/personas", {
        name: form.name,
        dni: form.dni,
        telefono: form.telefono,
        direccion: form.direccion,
      });
      if (res.data && res.data.persona) {
        toast.success("Persona creada con éxito");
        if (onPersonaCreada) onPersonaCreada(res.data.persona);
      } else {
        toast.error("No se pudo crear la persona");
      }
    } catch (err) {
      toast.error("Error al crear la persona");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-[8px] shadow-lg w-96">
        <h2 className="text-xl font-semibold mb-1">Registrar Persona</h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <p className="text-sm text-gray-700 mb-3">Completar los datos de la nueva persona</p>
            <label className="text-sm">Nombre Completo</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              className="w-full border rounded p-1"
              required
              placeholder="Nombre y Apellido"
            />
          </div>
          <div>
            <label className="text-sm">DNI</label>
            <input
              name="dni"
              value={form.dni}
              onChange={handleChange}
              className="w-full border rounded p-1"
              required
            />
          </div>
          <div>
            <label className="text-sm">Teléfono</label>
            <input
              name="telefono"
              value={form.telefono}
              onChange={handleChange}
              className="w-full border rounded p-1"
              required
            />
          </div>
          <div>
            <label className="text-sm">Dirección</label>
            <input
              name="direccion"
              value={form.direccion}
              onChange={handleChange}
              className="w-full border rounded p-1"
            />
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <button
              type="button"
              className="bg-gray-400 rounded-[8px] p-2 px-3"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="bg-verde text-white rounded-[8px] p-2 px-3"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Guardar"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}