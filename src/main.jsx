import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Agrega el Router aquí para claridad.
import "./index.css";
import AppRoutes from "./routes/Routes";
import { TorneosProvider } from "@/context/TorneosContext";
import { DeportesProvider } from "@/context/DeportesContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <DeportesProvider>
    <TorneosProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TorneosProvider>
    </DeportesProvider>
  </StrictMode>
);
