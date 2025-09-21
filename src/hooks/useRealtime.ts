import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';

// Simple realtime hook: connects to backend WebSocket and invalidates caches on events
export const useRealtime = () => {
  const client = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);

  useEffect(() => {
    // Avoid duplicate connections
    if (wsRef.current) return;

    const url = 'ws://localhost:8000/ws';
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      // Optionally send a hello
      try { ws.send('hello'); } catch {}
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data?.type === 'user_created') {
          client.invalidateQueries({ queryKey: ['usuarios'] });
        }
        if (data?.type === 'device_created') {
          client.invalidateQueries({ queryKey: ['dispositivos'] });
        }
        if (data?.type === 'device_ping') {
          client.invalidateQueries({ queryKey: ['dispositivos'] });
          client.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
        if (data?.type === 'emergency_created' || data?.type === 'emergency_updated') {
          client.invalidateQueries({ queryKey: ['emergencias'] });
        }
        if (data?.type === 'stats_updated') {
          client.invalidateQueries({ queryKey: ['dashboard-stats'] });
        }
      } catch {
        // ignore non-JSON messages (e.g., echo)
      }
    };

    ws.onerror = () => {
      // noop
    };

    // Reconnect on close after a delay
    ws.onclose = () => {
      wsRef.current = null;
      setTimeout(() => {
        // trigger effect again to reconnect
        if (!wsRef.current) {
          const ev = new Event('reconnect') as any;
          window.dispatchEvent(ev);
        }
      }, 3000);
    };

    const handler = () => {
      // Called to re-run effect by dispatching 'reconnect' event
    };
    window.addEventListener('reconnect', handler);

    return () => {
      window.removeEventListener('reconnect', handler);
      try { ws.close(); } catch {}
      wsRef.current = null;
    };
  }, [client]);
};
