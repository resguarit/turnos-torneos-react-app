import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axiosConfig";

const DeportesContext = createContext();

export function useDeportes() {
  return useContext(DeportesContext);
}

export function DeportesProvider({ children }) {
  const [deportes, setDeportesState] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Al iniciar, lee de localStorage si existe
  useEffect(() => {
    const fetchDeportes = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/deportes");
        setDeportesState(response.data);
        localStorage.setItem("deportes", JSON.stringify(response.data));
      } catch (error) {
        console.error('Error al obtener deportes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const stored = localStorage.getItem("deportes");
    if (stored) {
      setDeportesState(JSON.parse(stored));
      setIsLoading(false);
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
    <DeportesContext.Provider value={{ deportes, setDeportes, isLoading }}>
      {children}
    </DeportesContext.Provider>
  );
}