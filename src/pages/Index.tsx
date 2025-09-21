import { Users, Monitor, AlertTriangle, Activity, TrendingUp, Shield, MapPin, Clock, Smartphone, UserCheck, Loader2 } from "lucide-react";
import { StatsCard } from "@/components/StatsCard";
import { EmergencyAlert } from "@/components/EmergencyAlert";
import { EmergencyTestButton } from "@/components/EmergencyTestButton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDashboardData, useEmergencyActions } from "@/hooks/useAnticrimeData";

const Index = () => {
  const { stats, emergenciasAtivas, isLoading, error, refetch } = useDashboardData();
  const { responderEmergencia } = useEmergencyActions();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
          <p className="text-muted-foreground">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <AlertTriangle className="h-8 w-8 text-red-500 mx-auto" />
          <p className="text-muted-foreground">Erro ao carregar dados</p>
          <Button onClick={refetch} variant="outline">
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Sistema AntiCrime 04 - PRM</h1>
          <p className="text-muted-foreground">Centro de Controle e Monitoramento de Segurança Pública</p>
        </div>
        <div className="flex items-center gap-4">
          <EmergencyTestButton />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Activity className="h-4 w-4 text-green-500 animate-pulse" />
            <span className="font-medium">Sistema Operacional</span>
          </div>
        </div>
      </div>

      {/* Stats Cards - Dados Reais do Backend */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Usuários Cadastrados"
          value={stats?.usuarios_ativos.toLocaleString() || '0'}
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          variant="default"
        />
        <StatsCard
          title="Dispositivos Online"
          value={stats?.dispositivos_online.toLocaleString() || '0'}
          icon={Smartphone}
          trend={{ value: 5, isPositive: true }}
          variant="success"
        />
        <StatsCard
          title="Emergências Ativas"
          value={stats?.emergencias_ativas.toString() || '0'}
          icon={AlertTriangle}
          trend={{ value: emergenciasAtivas.length > 3 ? 15 : -5, isPositive: emergenciasAtivas.length <= 3 }}
          variant="danger"
        />
        <StatsCard
          title="Taxa de Resposta"
          value={`${stats?.taxa_resposta || 0}%`}
          icon={TrendingUp}
          trend={{ value: 3, isPositive: true }}
          variant="success"
        />
      </div>

      {/* Secondary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <StatsCard
          title="Tempo Médio Resposta"
          value={`${stats?.tempo_medio_resposta || 0} min`}
          icon={Clock}
          trend={{ value: 8, isPositive: true }}
          variant="default"
          className="col-span-1"
        />
        <StatsCard
          title="Dispositivos Recuperados"
          value={stats?.dispositivos_recuperados_mes || 0}
          icon={UserCheck}
          trend={{ value: 25, isPositive: true }}
          variant="success"
          className="col-span-1"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <EmergencyAlert />
        </div>
        
        <div className="space-y-6">
          {/* System Status */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Status dos Serviços
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex-1">
                  <span className="font-medium text-sm">API Backend</span>
                  <p className="text-xs text-muted-foreground">AntiCrime 04</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  ONLINE
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex-1">
                  <span className="font-medium text-sm">Base de Dados</span>
                  <p className="text-xs text-muted-foreground">SQLite</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  CONECTADO
                </Badge>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex-1">
                  <span className="font-medium text-sm">WebSocket</span>
                  <p className="text-xs text-muted-foreground">Emergências</p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  ATIVO
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Status do Sistema */}
          <Card className="shadow-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Status do Sistema
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">API AntiCrime 04</span>
                </div>
                <span className="text-xs text-green-600">Online</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">Banco de Dados</span>
                </div>
                <span className="text-xs text-green-600">Conectado</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-background/50 rounded-lg border border-border/50">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">WebSocket</span>
                </div>
                <span className="text-xs text-green-600">Ativo</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;