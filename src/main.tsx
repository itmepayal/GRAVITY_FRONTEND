import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import { AppProvider } from "@/providers";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <AppProvider>
      <TooltipProvider>
        <BrowserRouter>
          <App />
          <Toaster
            richColors
            toastOptions={{
              className: "!font-sans",
            }}
          />
        </BrowserRouter>
      </TooltipProvider>
    </AppProvider>
  </React.StrictMode>,
);
