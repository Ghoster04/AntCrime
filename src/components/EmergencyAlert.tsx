import { AlertTriangle, MapPin, Clock, User, Smartphone } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { mockEmergencies, mockUsers, mockDevices } from "@/data/mockData";

export function EmergencyAlert() {
  const activeEmergencies = mockEmergencies.filter(e => e.status === "ativo");

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-destructive text-destructive-foreground";
      case "media": return "bg-warning text-warning-foreground";
      case "baixa": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-destructive text-destructive-foreground animate-pulse";
      case "atendido": return "bg-warning text-warning-foreground";
      case "resolvido": return "bg-success text-success-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getEmergencyTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "sos_domestico": return "SOS Domiciliar";
      case "roubo_dispositivo": return "Roubo de Dispositivo";
      case "emergencia_medica": return "Emergência Médica";
      case "assalto": return "Assalto";
      default: return "Emergência";
    }
  };

  const getUserName = (userId: string) => {
    const user = mockUsers.find(u => u.id === userId);
    return user ? user.nome : "Usuário não identificado";
  };

  const getDeviceInfo = (deviceId: string) => {
    const device = mockDevices.find(d => d.id === deviceId);
    return device ? `${device.marca} ${device.modelo}` : "Dispositivo não identificado";
  };

  const formatLocation = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-MZ', { 
      hour: '2-digit', 
      minute: '2-digit',
      timeZone: 'Africa/Maputo'
    });
  };

  return (
    <Card className="shadow-elevated">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <AlertTriangle className="h-5 w-5 text-destructive animate-pulse" />
          Emergências Ativas - Sistema AntiCrime 04
          <Badge className="ml-2 bg-destructive text-destructive-foreground">
            {activeEmergencies.length} ATIVAS
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activeEmergencies.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-lg font-medium">Nenhuma emergência ativa</p>
            <p className="text-sm">Sistema operando normalmente</p>
          </div>
        ) : (
          activeEmergencies.map((emergency) => (
            <div
              key={emergency.id}
              className="p-4 bg-background/50 rounded-lg border-2 border-destructive/20 hover:border-destructive/40 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(emergency.prioridade)}>
                    PRIORIDADE {emergency.prioridade.toUpperCase()}
                  </Badge>
                  <Badge className={getStatusColor(emergency.status)}>
                    {emergency.status.toUpperCase()}
                  </Badge>
                </div>
                <span className="text-sm font-mono text-muted-foreground">
                  {emergency.id}
                </span>
              </div>
              
              <h4 className="font-bold text-lg text-foreground mb-2">
                {getEmergencyTypeLabel(emergency.tipo)}
              </h4>
              
              {emergency.descricao && (
                <p className="text-sm text-muted-foreground mb-3 p-2 bg-muted/50 rounded">
                  {emergency.descricao}
                </p>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{getUserName(emergency.usuario_id)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Smartphone className="h-4 w-4 text-primary" />
                  <span>{getDeviceInfo(emergency.device_id)}</span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-destructive" />
                  <span className="font-mono">
                    {formatLocation(emergency.localizacao.latitude, emergency.localizacao.longitude)}
                  </span>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(emergency.timestamp)}</span>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" className="bg-gradient-primary hover:opacity-90">
                  Atender Emergência
                </Button>
                <Button size="sm" variant="outline">
                  Ver no Mapa
                </Button>
                <Button size="sm" variant="outline">
                  Detalhes Completos
                </Button>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}