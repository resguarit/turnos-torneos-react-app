import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Agrega el Router aquí para claridad.
import "./index.css";
import AppRoutes from "./routes/Routes";
import { TorneosProvider } from "@/context/TorneosContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <TorneosProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </TorneosProvider>
  </StrictMode>
);
