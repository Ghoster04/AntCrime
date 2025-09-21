import { useQuery } from '@tanstack/react-query';
import { anticrimeAPI, dataMappers } from '@/services/anticrimeAPI';
import type { User, Device, Emergency, SystemStats } from '@/data/mockData';

// Hook para obter usuários do backend
export const useUsuarios = (search?: string) => {
  return useQuery({
    queryKey: ['usuarios', search],
    queryFn: async () => {
      const backendUsers = await anticrimeAPI.usuarios.getAll(0, 100, search);
      return backendUsers.map(dataMappers.backendToFrontendUser);
    },
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });
};

// Hook para obter dispositivos do backend
export const useDispositivos = (status?: string) => {
  return useQuery({
    queryKey: ['dispositivos', status],
    queryFn: async () => {
      const backendDevices = await anticrimeAPI.dispositivos.getAll(0, 100, status);
      return backendDevices.map(dataMappers.backendToFrontendDevice);
    },
    refetchInterval: 30000,
  });
};

// Hook para obter emergências do backend
export const useEmergencias = (status?: string) => {
  return useQuery({
    queryKey: ['emergencias', status],
    queryFn: async () => {
      const backendEmergencies = status === 'ativo' 
        ? await anticrimeAPI.emergencias.getAtivas()
        : await anticrimeAPI.emergencias.getAll(0, 100, status);
      return backendEmergencies.map(dataMappers.backendToFrontendEmergency);
    },
    refetchInterval: 10000, // Emergências atualizadas a cada 10 segundos
  });
};

// Hook para obter estatísticas do backend
export const useEstatisticas = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const backendStats = await anticrimeAPI.dashboard.getStats();
      return dataMappers.backendToFrontendStats(backendStats);
    },
    refetchInterval: 30000,
  });
};

// Hook combinado para o dashboard
export const useDashboardData = () => {
  const stats = useEstatisticas();
  const emergenciasAtivas = useEmergencias('ativo');
  const usuarios = useUsuarios();
  const dispositivos = useDispositivos();

  return {
    stats: stats.data,
    emergenciasAtivas: emergenciasAtivas.data || [],
    usuarios: usuarios.data || [],
    dispositivos: dispositivos.data || [],
    isLoading: stats.isLoading || emergenciasAtivas.isLoading,
    error: stats.error || emergenciasAtivas.error,
    refetch: () => {
      stats.refetch();
      emergenciasAtivas.refetch();
      usuarios.refetch();
      dispositivos.refetch();
    }
  };
};

// Hook para ações de emergência
export const useEmergencyActions = () => {
  const responderEmergencia = async (id: number, observacoes?: string) => {
    try {
      await anticrimeAPI.emergencias.responder(id, observacoes);
      return { success: true, message: 'Emergência respondida com sucesso' };
    } catch (error) {
      return { success: false, message: 'Erro ao responder emergência' };
    }
  };

  const finalizarEmergencia = async (id: number, observacoes?: string) => {
    try {
      await anticrimeAPI.emergencias.finalizar(id, observacoes);
      return { success: true, message: 'Emergência finalizada com sucesso' };
    } catch (error) {
      return { success: false, message: 'Erro ao finalizar emergência' };
    }
  };

  return {
    responderEmergencia,
    finalizarEmergencia
  };
};

// Hook para ações de dispositivos
export const useDeviceActions = () => {
  const updateDeviceStatus = async (id: number, status: string) => {
    try {
      await anticrimeAPI.dispositivos.updateStatus(id, status);
      return { success: true, message: `Status do dispositivo atualizado para ${status}` };
    } catch (error) {
      return { success: false, message: 'Erro ao atualizar status do dispositivo' };
    }
  };

  return {
    updateDeviceStatus
  };
};
