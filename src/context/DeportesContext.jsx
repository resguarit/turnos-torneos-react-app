import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axiosConfig";

const DeportesContext = createContext();

export function useDeportes() {
  return useContext(DeportesContext);
}

export function DeportesProvider({ children }) {
  const [deportes, setDeportesState] = useState([]);

  // Al iniciar, lee de localStorage si existe
  useEffect(() => {
    const fetchDeportes = async () => {
      const response = await api.get("/deportes");
      setDeportesState(response.data);
      localStorage.setItem("deportes", JSON.stringify(response.data));
    };

    const stored = localStorage.getItem("deportes");
    if (stored) {
      setDeportesState(JSON.parse(stored));
    } else {
      fetchDeportes();
    }
  }, []);

  // Cada vez que cambian los deportes, guarda en localStorage
  const setDeportes = (data) => {
    setDeportesState(data);
    localStorage.setItem("deportes", JSON.stringify(data));
  };

  return (
    <DeportesContext.Provider value={{ deportes, setDeportes }}>
      {children}
    </DeportesContext.Provider>
  );
}