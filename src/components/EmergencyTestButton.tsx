import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { anticrimeAPI } from '@/services/anticrimeAPI';

export const EmergencyTestButton: React.FC = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const simulateEmergency = async () => {
    setIsLoading(true);
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

      // Primeiro, registrar um dispositivo de teste se necessário
      let deviceId = 999; // ID de dispositivo de teste

      try {
        // Tentar registrar dispositivo de teste (mesmo IMEI do emulador)
        const deviceRes = await anticrimeAPI.dispositivos.register({
          imei: '768006023688070',
          modelo: 'Android Phone',
          marca: 'Acme',
          sistema_operacional: 'Android 13',
          versao_app: '1.0.0',
        });
        deviceId = deviceRes.dispositivo_id;
      } catch (err: any) {
        // Se o dispositivo já existe, usar ID padrão
        if (err?.response?.status !== 400) {
          throw err;
        }
      }

      // Criar emergência SOS real com localização atual
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
      console.error('Erro ao simular emergência:', err);
      const msg = err?.response?.data?.detail || 'Falha ao simular emergência';
      toast({ 
        title: 'Erro no Teste', 
        description: String(msg),
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
};
