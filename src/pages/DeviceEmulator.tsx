import { useEffect, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { anticrimeAPI } from '@/services/anticrimeAPI';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertTriangle, Radio, Satellite, Send } from 'lucide-react';

const DeviceEmulator = () => {
  const { toast } = useToast();

  // Device fields
  const [imei, setImei] = useState('768006023688070');
  const [modelo, setModelo] = useState('Android Phone');
  const [marca, setMarca] = useState('Acme');
  const [so, setSo] = useState('Android 13');
  const [versaoApp, setVersaoApp] = useState('1.0.0');

  // Connection state
  const [registeredDeviceId, setRegisteredDeviceId] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  // Location
  const [lat, setLat] = useState<number | ''>(-25.9655);
  const [lng, setLng] = useState<number | ''>(32.5832);
  const [gpsAcc, setGpsAcc] = useState<number | ''>(10);
  const [battery, setBattery] = useState<number>(95);

  const connectWS = () => {
    try {
      const ws = new WebSocket('ws://localhost:8000/ws');
      wsRef.current = ws;
      ws.onopen = () => setWsConnected(true);
      ws.onclose = () => setWsConnected(false);
      ws.onerror = () => setWsConnected(false);
      ws.onmessage = (e) => {
        // For now echo from backend; could parse notifications
        // console.log('WS:', e.data);
      };
    } catch (e) {
      setWsConnected(false);
    }
  };

  const disconnectWS = () => {
    try { wsRef.current?.close(); } catch {}
    wsRef.current = null;
    setWsConnected(false);
  };

  useEffect(() => {
    return () => disconnectWS();
  }, []);

  const handleGeolocate = () => {
    if (!('geolocation' in navigator)) {
      toast({ title: 'Geolocalização indisponível' });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(Number(pos.coords.latitude.toFixed(6)));
        setLng(Number(pos.coords.longitude.toFixed(6)));
        setGpsAcc(Number((pos.coords.accuracy || 0).toFixed(0)));
      },
      () => toast({ title: 'Não foi possível obter a localização' }),
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
  };

  const handleRegister = async () => {
    const imeiClean = imei.trim();
    if (!/^[0-9]{15}$/.test(imeiClean)) {
      toast({ title: 'IMEI inválido', description: 'Digite 15 dígitos numéricos.' });
      return;
    }
    try {
      const res = await anticrimeAPI.dispositivos.register({
        imei: imeiClean,
        modelo: modelo || undefined,
        marca: marca || undefined,
        sistema_operacional: so || undefined,
        versao_app: versaoApp || undefined,
      });
      setRegisteredDeviceId(res.dispositivo_id);
      toast({ title: 'Dispositivo registrado', description: `ID: ${res.dispositivo_id}` });
      connectWS();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Falha ao registrar o dispositivo';
      toast({ title: 'Erro', description: String(msg) });
    }
  };

  const handleSOS = async () => {
    if (!registeredDeviceId) {
      toast({ title: 'Registre o dispositivo antes', description: 'Informe um IMEI válido e clique Registrar' });
      return;
    }
    // ensure coordinates
    if (lat === '' || lng === '') {
      toast({ title: 'Localização ausente', description: 'Clique em Obter localização ou preencha manualmente' });
      return;
    }
    try {
      const res = await anticrimeAPI.emergencias.sos({
        dispositivo_id: registeredDeviceId,
        latitude: Number(lat),
        longitude: Number(lng),
        nivel_bateria: battery,
        precisao_gps: gpsAcc === '' ? undefined : Number(gpsAcc),
      });
      toast({ title: 'SOS enviado', description: `Emergência #${res.emergency_id}` });
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Falha ao enviar SOS';
      toast({ title: 'Erro', description: String(msg) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emulador de Dispositivo</h1>
        <p className="text-muted-foreground">Simule um Android/cliente para acionar SOS e testar a central.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Identificação do Dispositivo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-medium">IMEI</label>
              <Input className="h-9 text-sm" placeholder="15 dígitos" value={imei} onChange={(e) => setImei(e.target.value)} />
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

          <div className="flex items-center gap-3">
            <Button onClick={handleRegister}>
              <Radio className="h-4 w-4 mr-2" /> Registrar/Conectar
            </Button>
            <Badge className={wsConnected ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
              {wsConnected ? 'WebSocket conectado' : 'WebSocket desconectado'}
            </Badge>
            {registeredDeviceId && (
              <Badge>Device ID: {registeredDeviceId}</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Localização & SOS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="text-xs font-medium">Latitude</label>
              <Input className="h-9 text-sm" type="number" step="any" value={lat} onChange={(e) => setLat(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-medium">Longitude</label>
              <Input className="h-9 text-sm" type="number" step="any" value={lng} onChange={(e) => setLng(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-medium">Precisão GPS (m)</label>
              <Input className="h-9 text-sm" type="number" value={gpsAcc} onChange={(e) => setGpsAcc(e.target.value === '' ? '' : Number(e.target.value))} />
            </div>
            <div>
              <label className="text-xs font-medium">Bateria (%)</label>
              <Input className="h-9 text-sm" type="number" value={battery} onChange={(e) => setBattery(Number(e.target.value))} />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleGeolocate}>
              <Satellite className="h-4 w-4 mr-2" /> Obter localização
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <Button className="bg-gradient-danger hover:opacity-90" onClick={handleSOS}>
              <AlertTriangle className="h-4 w-4 mr-2" /> Enviar SOS
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notas</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• Use um IMEI que já esteja vinculado a um usuário no admin. Você pode criar em "Dispositivos" ou junto ao cadastro do usuário.</p>
          <p>• Registrar/Conectar chama <code>/dispositivos/register</code> e conecta ao WebSocket.</p>
          <p>• Enviar SOS chama <code>/emergencias/sos</code> com as coordenadas informadas.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceEmulator;
