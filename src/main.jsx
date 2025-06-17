import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; 
import "./index.css";
import AppRoutes from "./routes/Routes";
import { DeportesProvider } from "@/context/DeportesContext";
import { ConfigurationProvider } from "@/context/ConfigurationContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ConfigurationProvider>
      <DeportesProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
      </DeportesProvider>
    </ConfigurationProvider>
  </StrictMode>
);
