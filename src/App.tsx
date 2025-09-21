import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { DashboardHeader } from "@/components/DashboardHeader";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { WebSocketProvider } from "@/context/WebSocketProvider";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import Index from "./pages/Index";
import Usuarios from "./pages/Usuarios";
import Dispositivos from "./pages/Dispositivos";
import DeviceEmulator from "./pages/DeviceEmulator";
import StolenDeviceEmulator from "./pages/StolenDeviceEmulator";
import DeviceEmulatorManager from "./pages/DeviceEmulatorManager";
import DispositivoRoubadoTest from "./pages/DispositivoRoubadoTest";
import PingsDispositivosRoubados from "./pages/PingsDispositivosRoubados";
import Emergencias from "./pages/Emergencias";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Rota pública de login */}
            <Route path="/login" element={<Login />} />
            
            {/* Rotas protegidas */}
            <Route path="/*" element={
              <ProtectedRoute>
                <WebSocketProvider>
                  <SidebarProvider defaultOpen={true}>
                    <div className="min-h-screen flex w-full bg-gray-50">
                      <AppSidebar />
                      <div className="flex-1 flex flex-col min-w-0">
                        <DashboardHeader />
                        <main className="flex-1 p-6 overflow-auto">
                          <Routes>
                            <Route path="/" element={<Index />} />
                            <Route path="/usuarios" element={<Usuarios />} />
                            <Route path="/dispositivos" element={<Dispositivos />} />
                            <Route path="/emulador" element={<DeviceEmulator />} />
                            <Route path="/emulador-manager" element={<DeviceEmulatorManager />} />
                            <Route path="/dispositivo-roubado" element={<StolenDeviceEmulator />} />
                            <Route path="/pings-roubados" element={<PingsDispositivosRoubados />} />
                            <Route path="/emergencias" element={<Emergencias />} />
                            <Route path="*" element={<NotFound />} />
                          </Routes>
                        </main>
                      </div>
                    </div>
                  </SidebarProvider>
                </WebSocketProvider>
                <PWAInstallPrompt />
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
