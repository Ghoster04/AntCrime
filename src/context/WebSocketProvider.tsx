import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { EmergencyDialog } from '@/components/EmergencyDialog';

interface WSContextValue {
  connected: boolean;
  send: (data: any) => void;
  lastEvent: any | null;
  muted: boolean;
  setMuted: (v: boolean) => void;
}

const WSContext = createContext<WSContextValue | undefined>(undefined);

export const useWS = () => {
  const ctx = useContext(WSContext);
  if (!ctx) throw new Error('useWS must be used within WebSocketProvider');
  return ctx;
};

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const client = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastEvent, setLastEvent] = useState<any | null>(null);
  const [muted, setMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  
  // Estados para o dialog de emergência
  const [emergencyDialogOpen, setEmergencyDialogOpen] = useState(false);
  const [currentEmergency, setCurrentEmergency] = useState<any | null>(null);

  useEffect(() => {
    // Single connection for the whole app
    const ws = new WebSocket('wss://ant-crime-production.up.railway.app//ws');
    wsRef.current = ws;

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = () => setConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setLastEvent(data);

        // Global cache invalidations per event type
        switch (data?.type) {
          case 'user_created':
          case 'user_updated':
          case 'user_deleted':
            client.invalidateQueries({ queryKey: ['usuarios'] });
            break;
          case 'device_created':
          case 'device_ping':
          case 'device_status_changed':
            client.invalidateQueries({ queryKey: ['dispositivos'] });
            client.invalidateQueries({ queryKey: ['dashboard-stats'] });
            client.invalidateQueries({ queryKey: ['pings-roubados'] }); // Atualizar pings
            break;
          case 'stolen_device_located':
            // Notificação especial para dispositivo roubado localizado
            client.invalidateQueries({ queryKey: ['dispositivos'] });
            client.invalidateQueries({ queryKey: ['pings-roubados'] }); // Atualizar pings
            if (!muted) {
              // Criar emergência simulada para mostrar no dialog
              const stolenDeviceEmergency = {
                id: `STOLEN-${data.device_id}-${Date.now()}`,
                tipo: 'dispositivo_roubado',
                device_id: data.imei,
                device_marca: data.device_info?.split(' ')[0] || 'N/A',
                device_modelo: data.device_info?.split(' ').slice(1).join(' ') || 'N/A',
                battery_level: data.bateria,
                usuario_id: data.user_name || 'N/A',
                localizacao: {
                  latitude: data.latitude,
                  longitude: data.longitude
                },
                timestamp: data.timestamp,
                status: 'ativo',
                prioridade: 'alta',
                descricao: `🚨 ${data.message} - IMEI: ${data.imei}`
              };
              setCurrentEmergency(stolenDeviceEmergency);
              setEmergencyDialogOpen(true);
            }
            break;
          case 'emergency_created':
          case 'emergency_response':
            client.invalidateQueries({ queryKey: ['emergencias'] });
            // Mostrar dialog de emergência em vez de apenas tocar áudio
            if (data?.type === 'emergency_created' && !muted) {
              setCurrentEmergency(data.emergency || data);
              setEmergencyDialogOpen(true);
            }
            break;
          default:
            break;
        }
      } catch {
        // ignore
      }
    };

    const reconnect = () => {
      if (wsRef.current) return;
      setTimeout(() => {
        if (!wsRef.current) {
          // trigger effect re-run by creating a dummy listener
          const ev = new Event('ws-reconnect');
          window.dispatchEvent(ev);
        }
      }, 2000);
    };

    ws.onclose = reconnect;

    const handler = () => {
      // noop, effect will re-run on remount
    };
    window.addEventListener('ws-reconnect', handler);

    return () => {
      window.removeEventListener('ws-reconnect', handler);
      try { ws.close(); } catch {}
      wsRef.current = null;
    };
  }, [client]);

  // Funções para manipular o dialog de emergência
  const handleEmergencyResponse = async (emergencyId: string) => {
    try {
      // Aqui você pode adicionar a lógica para responder à emergência
      // Por exemplo, chamar uma API para marcar como "em atendimento"
      console.log('Respondendo à emergência:', emergencyId);
      
      // Invalidar queries para atualizar dados
      client.invalidateQueries({ queryKey: ['emergencias'] });
      client.invalidateQueries({ queryKey: ['dashboard-stats'] });
      
      setEmergencyDialogOpen(false);
      setCurrentEmergency(null);
    } catch (error) {
      console.error('Erro ao responder emergência:', error);
    }
  };

  const handleEmergencyDismiss = () => {
    setEmergencyDialogOpen(false);
    setCurrentEmergency(null);
  };

  const value = useMemo<WSContextValue>(() => ({
    connected,
    lastEvent,
    muted,
    setMuted,
    send: (msg: any) => {
      try {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
          wsRef.current.send(typeof msg === 'string' ? msg : JSON.stringify(msg));
        }
      } catch {}
    },
  }), [connected, lastEvent, muted]);

  return (
    <WSContext.Provider value={value}>
      {children}
      
      {/* Dialog de Emergência */}
      <EmergencyDialog
        emergency={currentEmergency}
        isOpen={emergencyDialogOpen}
        onClose={handleEmergencyDismiss}
        onRespond={handleEmergencyResponse}
      />
    </WSContext.Provider>
  );
};
