import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Radio, Satellite, Send, Smartphone, MapPin, Battery, Zap } from 'lucide-react';

export const StolenDeviceEmulator = () => {
  const { toast } = useToast();

  // Dados do dispositivo roubado (persistem mesmo após formatação)
  const [imei, setImei] = useState('281572518459116'); // IMEI único do hardware (Oppo)
  const [modelo, setModelo] = useState('iPhone 14 Pro');
  const [marca, setMarca] = useState('Apple');
  const [so, setSo] = useState('iOS 17.2');
  const [versaoApp, setVersaoApp] = useState('2.1.0-recovered');

  // Estado do dispositivo
  const [isActive, setIsActive] = useState(false);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  
  // Localização simulada (muda automaticamente)
  const [lat, setLat] = useState<number>(-25.9655);
  const [lng, setLng] = useState<number>(32.5832);
  const [gpsAcc, setGpsAcc] = useState<number>(15);
  const [battery, setBattery] = useState<number>(45); // Bateria baixa típica de dispositivo roubado

  // Intervalo para envio automático
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const connectWS = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = ws;
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
    } catch (e) {
      setWsConnected(false);
    }
  };

  const disconnectWS = () => {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    setWsConnected(false);
  };

  // Simular movimento do dispositivo roubado
  const simulateMovement = () => {
    // Pequenas mudanças na localização (movimento urbano)
    const deltaLat = (Math.random() - 0.5) * 0.001; // ~100m
    const deltaLng = (Math.random() - 0.5) * 0.001;
    
    setLat(prev => Number((prev + deltaLat).toFixed(6)));
    setLng(prev => Number((prev + deltaLng).toFixed(6)));
    setGpsAcc(Math.floor(Math.random() * 20) + 5); // 5-25m accuracy
    setBattery(prev => Math.max(1, prev - Math.floor(Math.random() * 2))); // Bateria diminui
  };

  // Enviar ping automático (dispositivo roubado enviando localização)
  const sendAutomaticPing = () => {
    if (!wsConnected || !wsRef.current) return;

    const pingData = {
      type: "stolen_device_ping", // Tipo específico para dispositivo roubado
      imei: imei,
      marca: marca,
      modelo: modelo,
      sistema_operacional: so,
      versao_app: versaoApp,
      latitude: lat,
      longitude: lng,
      bateria: battery,
      precisao: gpsAcc,
      status: "roubado",
      timestamp: new Date().toISOString()
    };

    try {
      wsRef.current.send(JSON.stringify(pingData));
      toast({ 
        title: '🚨 Dispositivo Roubado Localizado!', 
        description: `${lat.toFixed(4)}, ${lng.toFixed(4)} • Bateria: ${battery}%`,
        duration: 3000
      });
    } catch (error) {
      console.error('Erro ao enviar ping:', error);
    }
  };

  // Iniciar/parar emulação
  const toggleEmulation = () => {
    if (isActive) {
      // Parar emulação
      setIsActive(false);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      disconnectWS();
      toast({ title: '🔴 Emulação Parada', description: 'Dispositivo roubado desconectado' });
    } else {
      // Iniciar emulação
      setIsActive(true);
      connectWS();
      
      // Enviar dados a cada 10 segundos (dispositivo roubado reportando localização)
      intervalRef.current = setInterval(() => {
        simulateMovement();
        sendAutomaticPing();
      }, 10000);
      
      toast({ 
        title: '🟢 Emulação Iniciada', 
        description: 'Dispositivo roubado ativo - enviando localização',
        duration: 3000
      });
    }
  };

  // Enviar SOS de emergência (usuário conseguiu acesso temporário)
  const sendEmergencySOS = async () => {
    if (!wsConnected || !wsRef.current) {
      toast({ title: 'Erro', description: 'WebSocket não conectado' });
      return;
    }

    const sosData = {
      type: "device_sos",
      imei: imei,
      latitude: lat,
      longitude: lng,
      bateria: battery,
      precisao: gpsAcc,
      emergency_type: "dispositivo_roubado",
      message: "SOS - Dispositivo roubado localizado!"
    };

    try {
      wsRef.current.send(JSON.stringify(sosData));
      toast({ 
        title: '🚨 SOS ENVIADO!', 
        description: 'Emergência de dispositivo roubado reportada!',
        duration: 5000
      });
    } catch (error) {
      toast({ title: 'Erro', description: 'Falha ao enviar SOS' });
    }
  };

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      disconnectWS();
    };
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Emulador de Dispositivo Roubado</h1>
        <p className="text-muted-foreground">Simula dispositivo que continua enviando localização mesmo após formatação</p>
      </div>

      {/* Status */}
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-800">
            <AlertTriangle className="h-5 w-5" />
            Status do Dispositivo Roubado
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Badge className={isActive ? 'bg-red-600 text-white' : 'bg-gray-500 text-white'}>
                {isActive ? '🔴 ATIVO - RASTREANDO' : '⚫ INATIVO'}
              </Badge>
              <Badge className={wsConnected ? 'bg-green-600 text-white' : 'bg-gray-500 text-white'}>
                {wsConnected ? '📡 CONECTADO' : '📵 DESCONECTADO'}
              </Badge>
            </div>
            <Button
              onClick={toggleEmulation}
              className={isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
            >
              {isActive ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Dispositivo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Identificação do Dispositivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium text-red-600">IMEI (Hardware)</label>
              <Input className="h-9 text-sm font-mono" value={imei} onChange={(e) => setImei(e.target.value)} />
              <p className="text-xs text-gray-500 mt-1">Não pode ser alterado mesmo com formatação</p>
            </div>
            <div>
              <label className="text-xs font-medium">Modelo</label>
              <Input className="h-9 text-sm" value={modelo} onChange={(e) => setModelo(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Marca</label>
              <Input className="h-9 text-sm" value={marca} onChange={(e) => setMarca(e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-medium">Sistema Operacional</label>
              <Input className="h-9 text-sm" value={so} onChange={(e) => setSo(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-medium">Versão do App</label>
              <Input className="h-9 text-sm" value={versaoApp} onChange={(e) => setVersaoApp(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Localização Atual */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Localização Atual (Atualiza Automaticamente)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium">Latitude</label>
              <Input className="h-9 text-sm font-mono" type="number" step="any" value={lat} readOnly />
            </div>
            <div>
              <label className="text-xs font-medium">Longitude</label>
              <Input className="h-9 text-sm font-mono" type="number" step="any" value={lng} readOnly />
            </div>
            <div>
              <label className="text-xs font-medium">Precisão GPS (m)</label>
              <Input className="h-9 text-sm" type="number" value={gpsAcc} readOnly />
            </div>
            <div>
              <label className="text-xs font-medium">Bateria (%)</label>
              <div className="flex items-center gap-2">
                <Input className="h-9 text-sm" type="number" value={battery} readOnly />
                <Battery className={`h-4 w-4 ${battery < 20 ? 'text-red-500' : battery < 50 ? 'text-yellow-500' : 'text-green-500'}`} />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="destructive" 
              onClick={sendEmergencySOS}
              disabled={!wsConnected || !isActive}
            >
              <AlertTriangle className="h-4 w-4 mr-2" />
              🚨 Enviar SOS de Emergência
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="text-sm text-muted-foreground">
              {isActive ? '📡 Enviando localização a cada 10 segundos' : '⏸️ Rastreamento pausado'}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Informações do Sistema */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona o Rastreamento</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• <strong>IMEI Único:</strong> Identificação do hardware que não pode ser alterada</p>
          <p>• <strong>Rastreamento Contínuo:</strong> Envia localização mesmo após formatação/reset</p>
          <p>• <strong>Movimento Simulado:</strong> Coordenadas mudam automaticamente simulando movimento urbano</p>
          <p>• <strong>Bateria Realista:</strong> Diminui gradualmente como dispositivo real</p>
          <p>• <strong>SOS de Emergência:</strong> Usuário pode enviar alerta se recuperar acesso temporário</p>
          <p>• <strong>WebSocket:</strong> Comunicação em tempo real com o sistema AntiCrime 04</p>
        </CardContent>
      </Card>
    </div>
  );
};
