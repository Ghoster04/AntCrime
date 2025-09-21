import { Search, Plus, Smartphone, Battery, MapPin, Clock, Signal, AlertTriangle, Shield, ExternalLink, Copy } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useUsuarios, useDispositivos } from "@/hooks/useAnticrimeData";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { anticrimeAPI } from "@/services/anticrimeAPI";
import { useToast } from "@/components/ui/use-toast";

const Dispositivos = () => {
  const { data: usersData = [], isLoading: usersLoading } = useUsuarios();
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const { data: devices = [], isLoading: devicesLoading } = useDispositivos(statusFilter);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online": return "bg-success text-success-foreground";
      case "offline": return "bg-muted text-muted-foreground";
      case "roubado": return "bg-destructive text-destructive-foreground animate-pulse";
      case "recuperado": return "bg-warning text-warning-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "online": return <Signal className="h-4 w-4" />;
      case "offline": return <Signal className="h-4 w-4 opacity-50" />;
      case "roubado": return <AlertTriangle className="h-4 w-4" />;
      case "recuperado": return <Signal className="h-4 w-4" />;
      default: return <Signal className="h-4 w-4" />;
    }
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return "bg-success";
    if (battery > 20) return "bg-warning";
    return "bg-destructive";
  };

  const getUserName = (userId: string) => {
    const user = usersData.find(u => u.id === userId);
    return user ? user.nome : "Usuário não identificado";
  };

  const formatLastSeen = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return "Agora mesmo";
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleDateString('pt-MZ');
  };

  // Dialog state for creating device
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Funções para ações de dispositivos
  const marcarComoRoubado = useMutation({
    mutationFn: async (deviceId: string) => {
      return anticrimeAPI.dispositivos.marcarRoubado(Number(deviceId));
    },
    onSuccess: (data) => {
      toast({ 
        title: "🚨 Dispositivo marcado como ROUBADO", 
        description: "Rastreamento ativado - será localizado quando conectar à internet",
        duration: 5000
      });
      queryClient.invalidateQueries({ queryKey: ["dispositivos"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Erro ao marcar como roubado";
      toast({ title: "Erro", description: String(msg), variant: "destructive" });
    },
  });

  const marcarComoRecuperado = useMutation({
    mutationFn: async (deviceId: string) => {
      return anticrimeAPI.dispositivos.marcarRecuperado(Number(deviceId));
    },
    onSuccess: (data) => {
      toast({ 
        title: "✅ Dispositivo RECUPERADO!", 
        description: "Status atualizado - dispositivo seguro",
        duration: 5000
      });
      queryClient.invalidateQueries({ queryKey: ["dispositivos"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Erro ao marcar como recuperado";
      toast({ title: "Erro", description: String(msg), variant: "destructive" });
    },
  });

  const copyLocation = async (lat: number, lng: number) => {
    try {
      await navigator.clipboard.writeText(`${lat}, ${lng}`);
      toast({ title: "Localização copiada", description: "Coordenadas copiadas para área de transferência" });
    } catch {
      toast({ title: "Erro ao copiar", description: "Não foi possível copiar as coordenadas" });
    }
  };

  const openInMap = (lat: number, lng: number) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  const [form, setForm] = useState({
    imei: "",
    usuario_id: "",
    modelo: "",
    marca: "",
    sistema_operacional: "",
    versao_app: "",
  });

  const createDevice = useMutation({
    mutationFn: async () => {
      const payload = {
        imei: form.imei,
        usuario_id: Number(form.usuario_id),
        modelo: form.modelo || undefined,
        marca: form.marca || undefined,
        sistema_operacional: form.sistema_operacional || undefined,
        versao_app: form.versao_app || undefined,
      } as any;
      return anticrimeAPI.dispositivos.create(payload);
    },
    onSuccess: () => {
      toast({ title: "Dispositivo cadastrado com sucesso" });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["dispositivos"] });
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Erro ao cadastrar dispositivo";
      toast({ title: "Falha no cadastro", description: String(msg) });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    createDevice.mutate(undefined, {
      onSettled: () => setCreating(false),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Dispositivos</h1>
          <p className="text-muted-foreground">Sistema AntiCrime 04 - Monitoramento IMEI</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Cadastrar Dispositivo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl p-0">
            <DialogHeader>
              <DialogTitle>Novo Dispositivo</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-auto px-6 pb-2">
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium">IMEI</label>
                  <Input className="h-9 text-sm" value={form.imei} onChange={(e) => setForm({ ...form, imei: e.target.value })} required placeholder="15 dígitos" />
                </div>
                <div>
                  <label className="text-xs font-medium">Usuário</label>
                  <select
                    className="w-full h-9 text-sm border rounded px-3 bg-background"
                    value={form.usuario_id}
                    onChange={(e) => setForm({ ...form, usuario_id: e.target.value })}
                    required
                  >
                    <option value="" disabled>Selecione um usuário</option>
                    {usersLoading && <option>Carregando...</option>}
                    {!usersLoading && usersData.map(u => (
                      <option key={u.id} value={u.id}>{u.nome}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium">Modelo (opcional)</label>
                  <Input className="h-9 text-sm" value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Marca (opcional)</label>
                  <Input className="h-9 text-sm" value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Sistema Operacional (opcional)</label>
                  <Input className="h-9 text-sm" value={form.sistema_operacional} onChange={(e) => setForm({ ...form, sistema_operacional: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Versão do App (opcional)</label>
                  <Input className="h-9 text-sm" value={form.versao_app} onChange={(e) => setForm({ ...form, versao_app: e.target.value })} />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={creating}>{creating ? "Salvando..." : "Salvar"}</Button>
              </DialogFooter>
            </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards (backend) */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Signal className="h-5 w-5 text-success" />
              <div>
                <div className="text-2xl font-bold text-success">
                  {devices.filter(d => d.status === "online").length}
                </div>
                <div className="text-sm text-muted-foreground">Online</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Signal className="h-5 w-5 text-muted-foreground opacity-50" />
              <div>
                <div className="text-2xl font-bold text-muted-foreground">
                  {devices.filter(d => d.status === "offline").length}
                </div>
                <div className="text-sm text-muted-foreground">Offline</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div>
                <div className="text-2xl font-bold text-destructive">
                  {devices.filter(d => d.status === "roubado").length}
                </div>
                <div className="text-sm text-muted-foreground">Roubados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-warning" />
              <div>
                <div className="text-2xl font-bold text-warning">
                  {devices.filter(d => d.status === "recuperado").length}
                </div>
                <div className="text-sm text-muted-foreground">Recuperados</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por IMEI, modelo ou usuário..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
            <Button
              variant="outline"
              className={`hover:text-destructive ${statusFilter === 'roubado' ? 'text-destructive border-destructive' : ''}`}
              onClick={() => setStatusFilter((prev) => (prev === 'roubado' ? undefined : 'roubado'))}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              {statusFilter === 'roubado' ? 'Mostrar Todos' : 'Apenas Roubados'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Devices List (backend) */}
      <div className="grid gap-4">
        {devicesLoading && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando dispositivos...</CardContent></Card>
        )}
        {!devicesLoading && devices.map((device) => (
          <Card key={device.id} className="shadow-elevated hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gradient-primary rounded-lg">
                    <Smartphone className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">{device.marca} {device.modelo}</h3>
                      <Badge className={getStatusColor(device.status)}>
                        {getStatusIcon(device.status)}
                        <span className="ml-1">{device.status.toUpperCase()}</span>
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">IMEI:</span>
                        <div className="font-mono text-lg">{device.imei}</div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Usuário:</span>
                        <div>{getUserName(device.usuario_id)}</div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Última Localização:</span>
                        <div className="flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          <span className="font-mono text-xs">
                            {device.ultima_localizacao.latitude.toFixed(4)}, {device.ultima_localizacao.longitude.toFixed(4)}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-muted-foreground">Última Atividade:</span>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{formatLastSeen(device.ultima_localizacao.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Battery className="h-4 w-4" />
                        <span className="text-sm font-medium">Bateria:</span>
                        <div className="flex items-center gap-2">
                          <Progress 
                            value={device.bateria} 
                            className={`w-20 h-2 ${getBatteryColor(device.bateria)}`}
                          />
                          <span className="text-sm font-mono">{device.bateria}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Ações do Dispositivo */}
                <div className="flex flex-col gap-2">
                  {/* Ações de Localização */}
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => openInMap(device.ultima_localizacao.latitude, device.ultima_localizacao.longitude)}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Ver no Mapa
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyLocation(device.ultima_localizacao.latitude, device.ultima_localizacao.longitude)}
                      className="text-xs"
                    >
                      <Copy className="h-3 w-3 mr-1" />
                      Copiar Local
                    </Button>
                  </div>

                  {/* Ações de Status */}
                  {device.status === "online" || device.status === "offline" ? (
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => marcarComoRoubado.mutate(device.id)}
                      disabled={marcarComoRoubado.isPending}
                      className="text-xs"
                    >
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {marcarComoRoubado.isPending ? "Marcando..." : "Marcar como Roubado"}
                    </Button>
                  ) : device.status === "roubado" ? (
                    <Button
                      size="sm"
                      className="bg-green-600 hover:bg-green-700 text-white text-xs"
                      onClick={() => marcarComoRecuperado.mutate(device.id)}
                      disabled={marcarComoRecuperado.isPending}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      {marcarComoRecuperado.isPending ? "Recuperando..." : "Marcar como Recuperado"}
                    </Button>
                  ) : (
                    <Badge className="bg-green-100 text-green-800 text-xs px-3 py-1">
                      <Shield className="h-3 w-3 mr-1" />
                      Dispositivo Recuperado
                    </Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dispositivos;