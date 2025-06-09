
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Teams } from "./pages/Teams";
import { TeamDetails } from "./pages/TeamDetails";
import { People } from "./pages/People";
import { Licenses } from "./pages/Licenses";
import { Assets } from "./pages/Assets";
import { Inventory } from "./pages/Inventory";
import { Organizations } from "./pages/Organizations";
import NotFound from "./pages/NotFound";
import { initDatabase } from "./lib/database";

// Inicializar o banco de dados
initDatabase();

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="organizations" element={<Organizations />} />
              <Route path="teams" element={<Teams />} />
              <Route path="people" element={<People />} />
              <Route path="licenses" element={<Licenses />} />
              <Route path="assets" element={<Assets />} />
              <Route path="inventory" element={<Inventory />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
