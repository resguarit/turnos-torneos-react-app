import { createContext, useContext, useState } from "react";

const TorneosContext = createContext();

export function useTorneos() {
  return useContext(TorneosContext);
}

export function TorneosProvider({ children }) {
  const [torneos, setTorneos] = useState([]);
  return (
    <TorneosContext.Provider value={{ torneos, setTorneos }}>
      {children}
    </TorneosContext.Provider>
  );
}