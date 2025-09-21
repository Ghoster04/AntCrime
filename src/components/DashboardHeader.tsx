import { Bell, BellOff, Search, LogOut, User, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useWS } from "@/context/WebSocketProvider";
import { useEmergencias } from "@/hooks/useAnticrimeData";

export function DashboardHeader() {
  const { user, logout } = useAuth();
  const { connected, muted, setMuted } = useWS();
  const { data: emergenciasAtivas } = useEmergencias('ativo');

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getTipoAdminDisplay = (tipo: string) => {
    switch (tipo) {
      case 'super_admin': return 'Super Admin';
      case 'supervisor': return 'Supervisor';
      case 'operador': return 'Operador';
      default: return 'Admin';
    }
  };

  return (
    <header className="h-16 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-4">
          <SidebarTrigger className="hover:bg-accent" />
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar usuários, dispositivos..."
              className="pl-10 bg-background/50 border-border/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Status de Conexão WebSocket */}
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-background/50 border border-border/50">
            <div className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
            <span className="text-xs font-medium text-muted-foreground">
              {connected ? 'Online' : 'Desconectado'}
            </span>
          </div>

          {/* Controle de Áudio de Emergência */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setMuted(!muted)}
            className={`relative ${muted ? 'text-red-500' : 'text-green-600'}`}
            title={muted ? 'Alarmes silenciados - Clique para ativar' : 'Alarmes ativos - Clique para silenciar'}
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            {muted && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </Button>

          {/* Notificações de emergências */}
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            {emergenciasAtivas && emergenciasAtivas.length > 0 && (
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 bg-destructive text-destructive-foreground flex items-center justify-center text-xs">
                {emergenciasAtivas.length}
              </Badge>
            )}
          </Button>

          {/* Menu do usuário */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="flex items-center gap-3 pl-4 border-l hover:bg-accent">
                <div className="text-right">
                  <p className="text-sm font-medium">
                    {user ? getTipoAdminDisplay(user.tipo_admin) : 'Admin'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.posto_policial || 'PRM Central'}
                  </p>
                </div>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-600 text-white font-semibold">
                    {user ? getInitials(user.nome_completo) : 'AD'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div>
                  <p className="font-medium">{user?.nome_completo || 'Administrador'}</p>
                  <p className="text-xs text-muted-foreground">{user?.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-red-600 focus:text-red-600">
                <LogOut className="h-4 w-4 mr-2" />
                Sair do Sistema
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}