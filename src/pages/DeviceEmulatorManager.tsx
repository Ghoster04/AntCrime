import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { 
  Smartphone, 
  Play, 
  Pause, 
  MapPin, 
  Battery, 
  Signal, 
  AlertTriangle,
  Settings,
  Search,
  RefreshCw,
  StopCircle,
  PlayCircle,
  Clock
} from 'lucide-react';
import { useDispositivos } from '@/hooks/useAnticrimeData';
import { useToast } from '@/components/ui/use-toast';
import { useWS } from '@/context/WebSocketProvider';

interface EmulatorState {
  deviceId: number;
  isRunning: boolean;
  pingType: 'normal' | 'stolen';
  interval: number; // segundos
  battery: number;
  location: {
    lat: number;
    lng: number;
  };
}

const DeviceEmulatorManager = () => {
  const { toast } = useToast();
  const { send } = useWS();
  const [searchQuery, setSearchQuery] = useState('');
  const [emulators, setEmulators] = useState<Map<number, EmulatorState>>(new Map());
  const [selectedDevice, setSelectedDevice] = useState<number | null>(null);

  // Buscar todos os dispositivos
  const { data: devices = [], isLoading, refetch } = useDispositivos();

  // Filtrar dispositivos pela busca
  const filteredDevices = devices.filter(device =>
    device.marca.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.modelo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.imei.includes(searchQuery)
  );

  // Inicializar emulador para um dispositivo
  const initializeEmulator = (deviceId: number) => {
    const device = devices.find(d => d.id === deviceId);
    if (!device) return;

    const newEmulator: EmulatorState = {
      deviceId,
      isRunning: false,
      pingType: 'normal',
      interval: 30, // 30 segundos por padrão
      battery: 85,
      location: {
        lat: device.ultima_localizacao_lat || -25.9692,
        lng: device.ultima_localizacao_lng || 32.5732
      }
    };

    setEmulators(prev => new Map(prev.set(deviceId, newEmulator)));
  };

  // Iniciar/pausar emulador
  const toggleEmulator = (deviceId: number) => {
    const emulator = emulators.get(deviceId);
    if (!emulator) return;

    const updatedEmulator = { ...emulator, isRunning: !emulator.isRunning };
    setEmulators(prev => new Map(prev.set(deviceId, updatedEmulator)));

    if (updatedEmulator.isRunning) {
      toast({
        title: "Emulador Iniciado",
        description: `Dispositivo ${deviceId} começou a enviar pings`,
      });
    } else {
      toast({
        title: "Emulador Pausado",
        description: `Dispositivo ${deviceId} parou de enviar pings`,
      });
    }
  };

  // Atualizar configurações do emulador
  const updateEmulatorConfig = (deviceId: number, updates: Partial<EmulatorState>) => {
    const emulator = emulators.get(deviceId);
    if (!emulator) return;

    const updatedEmulator = { ...emulator, ...updates };
    setEmulators(prev => new Map(prev.set(deviceId, updatedEmulator)));
  };

  // Simular movimento do dispositivo
  const moveDevice = (deviceId: number) => {
    const emulator = emulators.get(deviceId);
    if (!emulator) return;

    // Mover em um raio de ~1km
    const moveDistance = 0.01; // ~1km
    const newLat = emulator.location.lat + (Math.random() - 0.5) * moveDistance;
    const newLng = emulator.location.lng + (Math.random() - 0.5) * moveDistance;

    updateEmulatorConfig(deviceId, {
      location: { lat: newLat, lng: newLng },
      battery: Math.max(10, emulator.battery - Math.random() * 2) // Bateria diminui gradualmente
    });
  };

  // Enviar ping via HTTP
  const sendPing = async (deviceId: number) => {
    const emulator = emulators.get(deviceId);
    const device = devices.find(d => d.id === deviceId);
    
    if (!emulator || !device) return;

    const pingData = {
      imei: device.imei,
      latitude: emulator.location.lat,
      longitude: emulator.location.lng,
      bateria: Math.round(emulator.battery),
      precisao: Math.round(Math.random() * 20 + 5), // 5-25 metros
      status: emulator.pingType === 'stolen' ? 'roubado' : 'ativo',
      tipo_ping: emulator.pingType === 'stolen' ? 'stolen_device_ping' : 'device_ping'
    };

    try {
      const response = await fetch('http://localhost:8000/dispositivos/ping', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('anticrime_token')}`
        },
        body: JSON.stringify(pingData)
      });

      if (response.ok) {
        const result = await response.json();
        toast({
          title: "Ping Enviado",
          description: `${emulator.pingType === 'stolen' ? '🚨 Ping de roubo' : '📍 Ping normal'} enviado com sucesso`,
        });
      } else {
        const error = await response.json();
        toast({
          title: "Erro no Ping",
          description: `Erro: ${error.detail || 'Falha ao enviar ping'}`,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao enviar ping:', error);
      toast({
        title: "Erro de Conexão",
        description: "Falha ao conectar com o servidor",
        variant: "destructive"
      });
    }

    // Mover dispositivo após ping
    moveDevice(deviceId);
  };

  // Efeito para enviar pings automaticamente
  useEffect(() => {
    const intervals: NodeJS.Timeout[] = [];

    emulators.forEach((emulator, deviceId) => {
      if (emulator.isRunning) {
        const interval = setInterval(() => {
          sendPing(deviceId);
        }, emulator.interval * 1000);
        
        intervals.push(interval);
      }
    });

    return () => {
      intervals.forEach(clearInterval);
    };
  }, [emulators, devices]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-success text-success-foreground";
      case "roubado": return "bg-destructive text-destructive-foreground animate-pulse";
      case "inativo": return "bg-muted text-muted-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo": return <Signal className="h-4 w-4" />;
      case "roubado": return <AlertTriangle className="h-4 w-4" />;
      case "inativo": return <Signal className="h-4 w-4 opacity-50" />;
      default: return <Signal className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Emulador de Dispositivos</h1>
          <p className="text-muted-foreground mt-2">
            Gerencie emuladores para testar pings de dispositivos normais e roubados
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Atualizar
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Buscar por marca, modelo ou IMEI..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Devices Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {isLoading && (
          <Card className="col-span-full">
            <CardContent className="p-6 text-center">
              <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Carregando dispositivos...</p>
            </CardContent>
          </Card>
        )}

        {!isLoading && filteredDevices.map((device) => {
          const emulator = emulators.get(device.id);
          const isEmulatorActive = emulator?.isRunning || false;

          return (
            <Card key={device.id} className={`transition-all duration-200 ${
              isEmulatorActive ? 'ring-2 ring-primary shadow-lg' : ''
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary rounded-lg">
                      <Smartphone className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{device.marca} {device.modelo}</CardTitle>
                      <p className="text-sm text-muted-foreground">IMEI: {device.imei}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(device.status)}>
                    {getStatusIcon(device.status)}
                    <span className="ml-1">{device.status}</span>
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Device Info */}
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Localização:</span>
                  </div>
                  <div className="text-right">
                    {device.ultima_localizacao_lat ? (
                      <span className="font-mono text-xs">
                        {device.ultima_localizacao_lat.toFixed(4)}, {device.ultima_localizacao_lng.toFixed(4)}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">Não disponível</span>
                    )}
                  </div>
                </div>

                {/* Emulator Controls */}
                {!emulator && (
                  <Button
                    onClick={() => initializeEmulator(device.id)}
                    className="w-full"
                    variant="outline"
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Configurar Emulador
                  </Button>
                )}

                {emulator && (
                  <div className="space-y-4">
                    {/* Emulator Status */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${isEmulatorActive ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`} />
                        <span className="text-sm font-medium">
                          {isEmulatorActive ? 'Emulador Ativo' : 'Emulador Inativo'}
                        </span>
                      </div>
                      <Button
                        onClick={() => toggleEmulator(device.id)}
                        size="sm"
                        variant={isEmulatorActive ? "destructive" : "default"}
                      >
                        {isEmulatorActive ? (
                          <>
                            <StopCircle className="h-4 w-4 mr-1" />
                            Parar
                          </>
                        ) : (
                          <>
                            <PlayCircle className="h-4 w-4 mr-1" />
                            Iniciar
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Ping Type */}
                    <div className="space-y-2">
                      <Label className="text-sm">Tipo de Ping</Label>
                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateEmulatorConfig(device.id, { pingType: 'normal' })}
                          size="sm"
                          variant={emulator.pingType === 'normal' ? 'default' : 'outline'}
                          className="flex-1"
                        >
                          <Signal className="h-4 w-4 mr-1" />
                          Normal
                        </Button>
                        <Button
                          onClick={() => updateEmulatorConfig(device.id, { pingType: 'stolen' })}
                          size="sm"
                          variant={emulator.pingType === 'stolen' ? 'destructive' : 'outline'}
                          className="flex-1"
                        >
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Roubado
                        </Button>
                      </div>
                    </div>

                    {/* Interval */}
                    <div className="space-y-2">
                      <Label className="text-sm">Intervalo (segundos)</Label>
                      <Input
                        type="number"
                        value={emulator.interval}
                        onChange={(e) => updateEmulatorConfig(device.id, { interval: parseInt(e.target.value) || 30 })}
                        min="5"
                        max="300"
                        className="text-sm"
                      />
                    </div>

                    {/* Battery */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Bateria</Label>
                        <span className="text-sm font-medium">{Math.round(emulator.battery)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            emulator.battery > 50 ? 'bg-green-500' :
                            emulator.battery > 20 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${emulator.battery}%` }}
                        />
                      </div>
                    </div>

                    {/* Manual Ping */}
                    <Button
                      onClick={() => sendPing(device.id)}
                      className="w-full"
                      variant="outline"
                      disabled={!isEmulatorActive}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Enviar Ping Manual
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!isLoading && filteredDevices.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Smartphone className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Nenhum dispositivo encontrado</h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Tente ajustar sua busca' : 'Cadastre dispositivos primeiro'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DeviceEmulatorManager;
