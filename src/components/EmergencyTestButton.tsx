import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { anticrimeAPI } from '@/services/anticrimeAPI';
import { EmergencyDialog } from '@/components/EmergencyDialog';

export const EmergencyTestButton: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const TEST_IMEI = '281572518459116';
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [currentEmergency, setCurrentEmergency] = useState<any | null>(null);

  const simulateEmergency = async () => {
    setIsLoading(true);
    let phase: 'init' | 'resolve-device' | 'send-sos' = 'init';
    try {
      // Obter localização atual do usuário
      let latitude = -25.9692; // Fallback para Maputo
      let longitude = 32.5732;
      let precisao = 10;

      if ('geolocation' in navigator) {
        try {
          const position = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(
              resolve,
              reject,
              { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
            );
          });
          
          latitude = Number(position.coords.latitude.toFixed(6));
          longitude = Number(position.coords.longitude.toFixed(6));
          precisao = Number((position.coords.accuracy || 10).toFixed(0));

          toast({
            title: '📍 Localização Obtida',
            description: `Usando sua localização atual: ${latitude}, ${longitude}`,
            duration: 3000
          });
        } catch (geoError) {
          toast({
            title: '⚠️ Localização Padrão',
            description: 'Não foi possível obter sua localização. Usando Maputo como padrão.',
            duration: 3000
          });
        }
      }
      // Resolver dispositivo existente por IMEI (sem registrar)
      phase = 'resolve-device';
      let deviceId: number | null = null;
      const dispositivos = await anticrimeAPI.dispositivos.getAll(0, 500);
      const existente = dispositivos.find((d) => d.imei === TEST_IMEI);
      if (existente) {
        deviceId = existente.id;
      } else {
        throw new Error(`Dispositivo com IMEI ${TEST_IMEI} não encontrado. Crie/associe este dispositivo antes de testar o SOS.`);
      }

      // Criar emergência SOS real com localização atual
      if (!deviceId) throw new Error('Falha ao resolver o ID do dispositivo de teste.');

      phase = 'send-sos';
      const sosRes = await anticrimeAPI.emergencias.sos({
        dispositivo_id: deviceId,
        latitude,
        longitude,
        nivel_bateria: Math.floor(Math.random() * 30) + 70, // 70-100%
        precisao_gps: precisao,
      });

      toast({ 
        title: '🚨 Emergência de Teste Criada', 
        description: `ID: ${sosRes.emergency_id} - Localização: ${latitude}, ${longitude}`,
        duration: 5000
      });

    } catch (err: any) {
      // Reportar erro detalhado ao usuário
      const status = err?.response?.status;
      const data = err?.response?.data;
      const detail = data?.detail || data?.message;
      const msg = detail || err?.message || 'Falha ao simular emergência';
      const snippet = data ? `\nResp: ${JSON.stringify(data).slice(0, 300)}` : '';
      console.error('Erro ao simular emergência:', err);
      toast({
        title: `Erro no Teste${status ? ` (HTTP ${status})` : ''}`,
        description: `Fase: ${phase || 'desconhecida'}\n${msg}${snippet}`,
        variant: 'destructive',
        duration: 8000,
      });

      // Abrir dialog de emergência em modo demo para simular alerta
      const now = new Date().toISOString();
      const mockEmergency = {
        id: `DEMO-${Date.now()}`,
        tipo: 'sos_domestico',
        device_id: TEST_IMEI,
        device_marca: 'Oppo',
        device_modelo: 'Find X3',
        battery_level: 85,
        usuario_id: 'N/A',
        localizacao: {
          latitude: -25.9692,
          longitude: 32.5732,
        },
        timestamp: now,
        status: 'ativo',
        prioridade: 'alta',
        descricao: `DEMO: Falha no teste (${phase}). ${msg}`,
      };
      setCurrentEmergency(mockEmergency);
      setEmergencyDialogOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button 
        onClick={simulateEmergency}
        disabled={isLoading}
        className="bg-red-600 hover:bg-red-700 text-white"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Criando Emergência...
          </>
        ) : (
          <>
            <AlertTriangle className="h-4 w-4 mr-2" />
            🚨 Simular Emergência (Teste)
          </>
        )}
      </Button>

      <EmergencyDialog
        emergency={currentEmergency}
        isOpen={emergencyDialogOpen}
        onClose={() => { setEmergencyDialogOpen(false); setCurrentEmergency(null); }}
        onRespond={() => { setEmergencyDialogOpen(false); setCurrentEmergency(null); }}
      />
    </>
  );
};
