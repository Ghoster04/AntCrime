import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Clock, Battery, Smartphone, User, Search, ExternalLink, Copy, AlertTriangle, RefreshCw } from 'lucide-react';
import { anticrimeAPI } from '@/services/anticrimeAPI';
import { useToast } from '@/components/ui/use-toast';
import { useWS } from '@/context/WebSocketProvider';

const PingsDispositivosRoubados = () => {
  const { toast } = useToast();
  const { lastEvent, connected } = useWS(); // Escutar eventos WebSocket
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<number | undefined>();

  // Buscar pings de dispositivos roubados
  const { data: pings = [], isLoading, refetch, error } = useQuery({
    queryKey: ['pings-roubados', selectedDevice],
    queryFn: async () => {
      console.log('🔍 Buscando pings roubados...', { selectedDevice });
      console.log('🔑 Token no localStorage:', !!localStorage.getItem('anticrime_token'));
      try {
        const result = await anticrimeAPI.dispositivos.getPingsRoubados(0, 100, selectedDevice);
        console.log('✅ Pings recebidos:', result.length, result);
        return result;
      } catch (err) {
        console.error('❌ Erro ao buscar pings:', err);
        console.error('❌ Detalhes do erro:', err.response?.data);
        throw err;
      }
    },
    // Sem refetchInterval - atualização via WebSocket
  });

  // Atualizar em tempo real via WebSocket
  useEffect(() => {
    if (lastEvent) {
      const eventType = lastEvent.type;
      
      // Atualizar quando receber eventos relacionados a dispositivos roubados
      if (eventType === 'device_ping' || 
          eventType === 'stolen_device_located' || 
          eventType === 'device_status_changed') {
        
        console.log('🔄 WebSocket event recebido, atualizando pings:', eventType);
        refetch();
        
        // Mostrar notificação para dispositivos roubados localizados
        if (eventType === 'stolen_device_located') {
          toast({
            title: '🚨 Dispositivo Roubado Localizado!',
            description: `${lastEvent.device_info} foi localizado`,
            duration: 5000
          });
        }
        
        // Mostrar notificação para mudanças de status
        if (eventType === 'device_status_changed') {
          toast({
            title: '📱 Status de Dispositivo Alterado',
            description: lastEvent.message,
            duration: 3000
          });
        }
      }
    }
  }, [lastEvent, refetch, toast]);

  // Filtrar pings baseado na busca
  const filteredPings = useMemo(() => {
    if (!searchQuery) return pings;
    const query = searchQuery.toLowerCase();
    return pings.filter((ping: any) => 
      ping.dispositivo?.imei?.toLowerCase().includes(query) ||
      ping.dispositivo?.marca?.toLowerCase().includes(query) ||
      ping.dispositivo?.modelo?.toLowerCase().includes(query) ||
      ping.usuario?.nome?.toLowerCase().includes(query)
    );
  }, [pings, searchQuery]);

  // Obter dispositivos únicos para filtro
  const uniqueDevices = useMemo(() => {
    const devices = new Map();
    pings.forEach((ping: any) => {
      if (ping.dispositivo && !devices.has(ping.dispositivo.id)) {
        devices.set(ping.dispositivo.id, ping.dispositivo);
      }
    });
    return Array.from(devices.values());
  }, [pings]);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Agora mesmo';
    if (diffInMinutes < 60) return `${diffInMinutes} min atrás`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h atrás`;
    return date.toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getBatteryColor = (battery: number) => {
    if (battery > 50) return 'text-green-600';
    if (battery > 20) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'roubado': return 'bg-red-600 text-white animate-pulse';
      case 'recuperado': return 'bg-green-600 text-white';
      case 'ativo': return 'bg-blue-600 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const copyLocation = async (lat: number, lng: number) => {
    try {
      await navigator.clipboard.writeText(`${lat}, ${lng}`);
      toast({ title: 'Coordenadas copiadas', description: `${lat}, ${lng}` });
    } catch {
      toast({ title: 'Erro ao copiar', description: 'Não foi possível copiar as coordenadas' });
    }
  };

  const openInMap = (lat: number, lng: number) => {
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}&z=18`;
    window.open(googleMapsUrl, '_blank');
  };

  if (error) {
    console.error('🚨 Erro na página de pings:', error);
    return (
      <div className="space-y-6">
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-600">Erro ao Carregar Dados</h2>
          <p className="text-gray-600 mb-4">Não foi possível buscar os pings dos dispositivos roubados</p>
          <div className="bg-red-50 border border-red-200 p-4 rounded-lg mb-4 text-left max-w-md mx-auto">
            <p className="text-sm text-red-700 font-mono">
              {error?.message || 'Erro desconhecido'}
            </p>
          </div>
          <Button onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Tentar Novamente
          </Button>
        </div>
      </div>
    );
  }

  // Debug: Mostrar estado dos dados
  console.log('🔍 Estado da página:', { 
    isLoading, 
    error: error?.message, 
    pingsCount: pings?.length,
    connected,
    lastEventType: lastEvent?.type 
  });

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
        <h3 className="font-bold text-yellow-800 mb-2">🔧 Debug Info</h3>
        <div className="text-sm text-yellow-700 space-y-1">
          <p>• WebSocket: {connected ? '✅ Conectado' : '❌ Desconectado'}</p>
          <p>• Loading: {isLoading ? '🔄 Carregando...' : '✅ Carregado'}</p>
          <p>• Pings: {pings?.length || 0} encontrados</p>
          <p>• Erro: {error?.message || 'Nenhum'}</p>
          <p>• Último evento: {lastEvent?.type || 'Nenhum'}</p>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-red-600">🚨 Rastreamento de Dispositivos Roubados</h1>
          <p className="text-muted-foreground">Histórico de localizações e pings em tempo real</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className={connected ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
            {connected ? "📡 WebSocket Conectado" : "📵 WebSocket Desconectado"}
          </Badge>
          <Badge className="bg-blue-600 text-white">
            🔄 Tempo Real
          </Badge>
          <Button onClick={() => refetch()} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar Manual
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <div className="text-2xl font-bold text-red-600">
                  {uniqueDevices.filter((d: any) => d.status === 'roubado').length}
                </div>
                <div className="text-sm text-muted-foreground">Dispositivos Roubados</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-blue-600" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {filteredPings.length}
                </div>
                <div className="text-sm text-muted-foreground">Total de Pings</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-green-600" />
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {filteredPings.filter((p: any) => {
                    const diffInMinutes = Math.floor((new Date().getTime() - new Date(p.timestamp).getTime()) / (1000 * 60));
                    return diffInMinutes <= 60;
                  }).length}
                </div>
                <div className="text-sm text-muted-foreground">Última Hora</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Smartphone className="h-5 w-5 text-purple-600" />
              <div>
                <div className="text-2xl font-bold text-purple-600">
                  {uniqueDevices.length}
                </div>
                <div className="text-sm text-muted-foreground">Dispositivos Únicos</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por IMEI, marca, modelo ou usuário..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select
              className="px-3 py-2 border rounded-md bg-background"
              value={selectedDevice || ''}
              onChange={(e) => setSelectedDevice(e.target.value ? Number(e.target.value) : undefined)}
            >
              <option value="">Todos os Dispositivos</option>
              {uniqueDevices.map((device: any) => (
                <option key={device.id} value={device.id}>
                  {device.marca} {device.modelo} - {device.imei}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Pings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Histórico de Localizações ({filteredPings.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-auto max-h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Dispositivo</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Localização</TableHead>
                  <TableHead>Bateria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex items-center justify-center gap-2">
                        <RefreshCw className="h-4 w-4 animate-spin" />
                        Carregando pings...
                      </div>
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filteredPings.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      Nenhum ping encontrado para dispositivos roubados
                    </TableCell>
                  </TableRow>
                )}
                {!isLoading && filteredPings.map((ping: any) => (
                  <TableRow key={ping.id} className="hover:bg-muted/50">
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{formatTime(ping.timestamp)}</div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(ping.timestamp).toLocaleString('pt-MZ')}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4 text-blue-600" />
                        <div>
                          <div className="font-medium">
                            {ping.dispositivo?.marca} {ping.dispositivo?.modelo}
                          </div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {ping.dispositivo?.imei}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-green-600" />
                        <div>
                          <div className="font-medium">{ping.usuario?.nome || 'N/A'}</div>
                          <div className="text-xs text-muted-foreground">
                            {ping.usuario?.telefone || ''}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-mono text-xs">
                        <div>{ping.latitude.toFixed(6)}</div>
                        <div>{ping.longitude.toFixed(6)}</div>
                        {ping.precisao_gps && (
                          <div className="text-muted-foreground">±{ping.precisao_gps}m</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Battery className={`h-4 w-4 ${getBatteryColor(ping.nivel_bateria || 0)}`} />
                        <span className="font-medium">{ping.nivel_bateria || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(ping.status_dispositivo)}>
                        {ping.status_dispositivo?.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => openInMap(ping.latitude, ping.longitude)}
                          className="text-xs"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyLocation(ping.latitude, ping.longitude)}
                          className="text-xs"
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PingsDispositivosRoubados;
