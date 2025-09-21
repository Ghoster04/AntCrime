import { useState } from "react";
import {
  Shield,
  Users,
  Monitor,
  AlertTriangle,
  Settings,
  Radio,
  LogOut,
  Menu,
  Activity,
  Zap,
  MapPin,
  PlayCircle
} from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

const navigationItems = [
  { 
    title: "Dashboard", 
    url: "/", 
    icon: Shield, 
    description: "Centro de Controle",
    priority: "high"
  },
  { 
    title: "Emergências", 
    url: "/emergencias", 
    icon: AlertTriangle, 
    description: "Alertas Ativos",
    priority: "critical"
  },
  { 
    title: "Usuários", 
    url: "/usuarios", 
    icon: Users, 
    description: "Gestão de Cidadãos",
    priority: "normal"
  },
  { 
    title: "Dispositivos", 
    url: "/dispositivos", 
    icon: Monitor, 
    description: "Equipamentos",
    priority: "normal"
  },
  { 
    title: "Emulador Manager", 
    url: "/emulador-manager", 
    icon: PlayCircle, 
    description: "Testes de Dispositivos",
    priority: "high"
  },
  { 
    title: "PRM Central", 
    url: "/prm-central", 
    icon: Radio, 
    description: "Comunicações",
    priority: "normal"
  },
  { 
    title: "Dispositivo Roubado", 
    url: "/dispositivo-roubado", 
    icon: AlertTriangle, 
    description: "Emulador Rastreamento",
    priority: "critical"
  },
  { 
    title: "Pings Roubados", 
    url: "/pings-roubados", 
    icon: MapPin, 
    description: "Histórico Localizações",
    priority: "critical"
  },
  { 
    title: "Administração", 
    url: "/admin", 
    icon: Settings, 
    description: "Configurações",
    priority: "low"
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const { logout } = useAuth();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";

  const getPriorityColor = (priority: string, isActive: boolean) => {
    if (isActive) {
      switch (priority) {
        case "critical": return "bg-gradient-to-r from-red-600 to-red-500 text-white shadow-lg shadow-red-500/25";
        case "high": return "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-500/25";
        default: return "bg-gradient-to-r from-slate-600 to-slate-500 text-white shadow-lg";
      }
    }
    
    switch (priority) {
      case "critical": return "text-red-400 hover:bg-red-600 hover:text-white border border-red-600/30 hover:border-red-500";
      case "high": return "text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-600/30 hover:border-blue-500";
      default: return "text-white hover:bg-slate-700 hover:text-white border border-slate-600/30 hover:border-slate-500";
    }
  };

  return (
    <Sidebar className="border-r bg-slate-900 shadow-xl w-64 min-w-64 border-slate-600">
      <SidebarContent className="flex flex-col h-full">
        {/* Header */}
        <div className="p-6 border-b border-slate-600 bg-slate-800">
          <div className="flex items-center gap-3">
            <div className="relative p-3 bg-gradient-to-br from-red-600 via-red-500 to-orange-500 rounded-xl shadow-lg shadow-red-500/25">
              <Shield className="h-7 w-7 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-slate-900 animate-pulse"></div>
            </div>
            <div>
              <h2 className="font-bold text-xl text-white drop-shadow-sm">
                AntiCrime 04
              </h2>
              <div className="flex items-center gap-2">
                <Activity className="h-3 w-3 text-green-400 animate-pulse" />
                <p className="text-sm text-slate-200 font-medium">Sistema PRM • Online</p>
              </div>
            </div>
          </div>
        </div>

        {/* Status Bar */}
        <div className="px-6 py-3 bg-slate-800 border-b border-slate-600">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-green-400 font-bold">Sistema Operacional</span>
            </div>
            <div className="flex items-center gap-1 text-white font-medium">
              <Zap className="h-3 w-3" />
              <span>Tempo Real</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <SidebarGroup className="flex-1 px-4 py-6 bg-slate-900">
          <SidebarGroupLabel className="text-xs uppercase tracking-wider font-bold text-white mb-6 flex items-center gap-2">
            <div className="w-4 h-px bg-gradient-to-r from-white to-transparent"></div>
            Central de Comando
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-2">
              {navigationItems.map((item) => {
                const isActive = currentPath === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        className={`flex items-center gap-4 px-4 py-4 rounded-xl transition-all duration-300 group relative overflow-hidden ${getPriorityColor(item.priority, isActive)}`}
                      >
                        <div className="relative">
                          <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive && item.priority === 'critical' ? 'animate-pulse' : ''}`} />
                          {item.priority === 'critical' && !isActive && (
                            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-400 rounded-full animate-ping"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-sm">{item.title}</div>
                          <div className={`text-xs font-medium ${isActive ? 'text-white/90' : 'text-white/70'}`}>
                            {item.description}
                          </div>
                        </div>
                        {isActive && (
                          <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/30 rounded-l-full"></div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Footer */}
        <div className="p-4 border-t border-slate-600 bg-slate-800">
          <Button 
            variant="ghost" 
            onClick={logout}
            className="w-full justify-start text-red-600 font-bold hover:text-white hover:bg-red-600 transition-all duration-200 rounded-xl py-3 group border border-red-600/30 hover:border-red-500"
          >
            <LogOut className="h-5 w-5 mr-3 group-hover:animate-pulse" />
            <div>
              <div className="text-sm">Sair do Sistema</div>
              <div className="text-xs opacity-90 group-hover:opacity-100">Encerrar Sessão</div>
            </div>
          </Button>
        </div>
      </SidebarContent>
    </Sidebar>
  );
}