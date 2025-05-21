import { createContext, useContext, useState, useEffect } from "react";

const TorneosContext = createContext();

export function useTorneos() {
  return useContext(TorneosContext);
}

export function TorneosProvider({ children }) {
  const [torneos, setTorneosState] = useState([]);

  // Al iniciar, lee de localStorage si existe
  useEffect(() => {
    const stored = localStorage.getItem("torneos");
    if (stored) {
      setTorneosState(JSON.parse(stored));
    }
  }, []);

  // Cada vez que cambian los torneos, guarda en localStorage
  const setTorneos = (data) => {
    setTorneosState(data);
    localStorage.setItem("torneos", JSON.stringify(data));
  };

  return (
    <TorneosContext.Provider value={{ torneos, setTorneos }}>
      {children}
    </TorneosContext.Provider>
  );
}