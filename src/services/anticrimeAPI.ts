import axios from 'axios';

// Configuração da API AntiCrime 04
const API_BASE_URL = 'http://localhost:8000';

// Tipos adaptados para o backend AntiCrime 04
export interface LoginRequest {
  email: string;
  senha: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
}

export interface BackendAdmin {
  id: number;
  nome_completo: string;
  email: string;
  numero_badge: string;
  posto_policial: string;
  tipo_admin: string;
  telefone?: string;
  ativo: boolean;
  data_criacao: string;
  ultimo_login?: string;
}

export interface BackendUsuario {
  id: number;
  nome_completo: string;
  numero_identidade: string;
  telefone_principal: string;
  telefone_emergencia?: string;
  email?: string;
  provincia: string;
  cidade: string;
  bairro: string;
  rua?: string;
  numero_casa?: string;
  ponto_referencia?: string;
  latitude_residencia: number;
  longitude_residencia: number;
  foto_residencia?: string;
  observacoes?: string;
  ativo: boolean;
  data_cadastro: string;
  admin_cadastrador_id: number;
}

export interface BackendDispositivo {
  id: number;
  imei: string;
  modelo?: string;
  marca?: string;
  sistema_operacional?: string;
  versao_app?: string;
  status: string;
  data_primeiro_registro: string;
  ultima_localizacao_lat?: number;
  ultima_localizacao_lng?: number;
  ultimo_ping?: string;
  usuario_id: number;
  data_cadastro: string;
}

export interface BackendEmergencia {
  id: number;
  latitude: number;
  longitude: number;
  timestamp_acionamento: string;
  status: string;
  usuario_id: number;
  dispositivo_id: number;
  admin_responsavel_id?: number;
  tempo_resposta?: number;
  timestamp_resposta?: string;
  timestamp_finalizacao?: string;
  observacoes_admin?: string;
  nivel_bateria?: number;
  precisao_gps?: number;
}

export interface BackendEstatisticas {
  total_usuarios: number;
  total_dispositivos: number;
  total_emergencias: number;
  emergencias_ativas: number;
  dispositivos_roubados: number;
  usuarios_ativos: number;
}

// Configurar axios
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('anticrime_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('anticrime_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Serviços da API
export const anticrimeAPI = {
  // Autenticação
  auth: {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      const response = await api.post('/auth/login', data);
      return response.data;
    },

    getMe: async (): Promise<BackendAdmin> => {
      const response = await api.get('/auth/me');
      return response.data;
    },

    logout: () => {
      localStorage.removeItem('anticrime_token');
      window.location.href = '/login';
    }
  },

  // Usuários
  usuarios: {
    getAll: async (skip = 0, limit = 100, search?: string): Promise<BackendUsuario[]> => {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      if (search) params.append('search', search);
      
      const response = await api.get(`/usuarios/?${params}`);
      return response.data;
    },

    getById: async (id: number): Promise<BackendUsuario> => {
      const response = await api.get(`/usuarios/${id}`);
      return response.data;
    },

    create: async (data: Partial<BackendUsuario>): Promise<BackendUsuario> => {
      const response = await api.post('/usuarios/', data);
      return response.data;
    },

    createWithPhoto: async (formData: FormData): Promise<BackendUsuario> => {
      const response = await api.post('/usuarios/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },

    update: async (id: number, data: Partial<BackendUsuario>): Promise<BackendUsuario> => {
      const response = await api.put(`/usuarios/${id}`, data);
      return response.data;
    }
  },

  // Dispositivos
  dispositivos: {
    getAll: async (skip = 0, limit = 100, status?: string): Promise<BackendDispositivo[]> => {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      if (status) params.append('status_filter', status);
      
      const response = await api.get(`/dispositivos/?${params}`);
      return response.data;
    },

    create: async (data: {
      imei: string;
      modelo?: string;
      marca?: string;
      sistema_operacional?: string;
      versao_app?: string;
      usuario_id: number;
    }): Promise<BackendDispositivo> => {
      const response = await api.post('/dispositivos/', data);
      return response.data;
    },

    updateStatus: async (id: number, status: string): Promise<{ message: string }> => {
      const response = await api.put(`/dispositivos/${id}/status`, { status });
      return response.data;
    },

    // Registro (simula app Android informando IMEI e infos do aparelho)
    register: async (data: {
      imei: string;
      modelo?: string;
      marca?: string;
      sistema_operacional?: string;
      versao_app?: string;
    }): Promise<{ status: string; message: string; usuario_id: number; dispositivo_id: number }> => {
      const response = await api.post('/dispositivos/register', data);
      return response.data;
    },

    // Marcar dispositivo como roubado
    marcarRoubado: async (id: number): Promise<{ message: string; device_id: number }> => {
      const response = await api.put(`/dispositivos/${id}/marcar-roubado`);
      return response.data;
    },

    // Marcar dispositivo como recuperado
    marcarRecuperado: async (id: number): Promise<{ message: string; device_id: number }> => {
      const response = await api.put(`/dispositivos/${id}/marcar-recuperado`);
      return response.data;
    },

    // Buscar pings de dispositivos roubados
    getPingsRoubados: async (skip = 0, limit = 100, dispositivoId?: number): Promise<any[]> => {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      if (dispositivoId) params.append('dispositivo_id', dispositivoId.toString());
      
      const response = await api.get(`/dispositivos/pings-roubados?${params}`);
      return response.data;
    }
  },

  // Emergências
  emergencias: {
    getAll: async (skip = 0, limit = 100, status?: string): Promise<BackendEmergencia[]> => {
      const params = new URLSearchParams({
        skip: skip.toString(),
        limit: limit.toString(),
      });
      if (status) params.append('status_filter', status);
      
      const response = await api.get(`/emergencias/?${params}`);
      return response.data;
    },

    getAtivas: async (): Promise<BackendEmergencia[]> => {
      const response = await api.get('/emergencias/ativas');
      return response.data;
    },

    responder: async (id: number, observacoes?: string): Promise<{ message: string }> => {
      const response = await api.put(`/emergencias/${id}/responder`, { observacoes });
      return response.data;
    },

    finalizar: async (id: number, observacoes?: string): Promise<{ message: string }> => {
      const response = await api.put(`/emergencias/${id}/finalizar`, { observacoes });
      return response.data;
    },

    // SOS diretamente do dispositivo (emulador)
    sos: async (data: {
      dispositivo_id: number;
      latitude: number;
      longitude: number;
      nivel_bateria?: number;
      precisao_gps?: number;
    }): Promise<{ status: string; message: string; emergency_id: number }> => {
      const response = await api.post('/emergencias/sos', data);
      return response.data;
    }
  },

  // Dashboard
  dashboard: {
    getStats: async (): Promise<BackendEstatisticas> => {
      const response = await api.get('/dashboard/stats');
      return response.data;
    }
  }
};

// Funções de conversão entre tipos do frontend e backend
export const dataMappers = {
  // Converter usuário do backend para formato do frontend
  backendToFrontendUser: (backendUser: BackendUsuario) => ({
    id: backendUser.id.toString(),
    nome: backendUser.nome_completo,
    documento: backendUser.numero_identidade,
    telefone: backendUser.telefone_principal,
    endereco: {
      bairro: backendUser.bairro,
      rua: backendUser.rua || '',
      numero: backendUser.numero_casa || '',
      coordenadas: {
        latitude: backendUser.latitude_residencia,
        longitude: backendUser.longitude_residencia
      }
    },
    fotografia: backendUser.foto_residencia ? `http://localhost:8000${backendUser.foto_residencia}` : '/placeholder.svg',
    contatos_emergencia: backendUser.telefone_emergencia ? [backendUser.telefone_emergencia] : [],
    data_cadastro: backendUser.data_cadastro,
    status: backendUser.ativo ? 'ativo' : 'inativo'
  }),

  // Converter dispositivo do backend para formato do frontend
  backendToFrontendDevice: (backendDevice: BackendDispositivo) => ({
    id: backendDevice.id.toString(),
    imei: backendDevice.imei,
    usuario_id: backendDevice.usuario_id.toString(),
    modelo: backendDevice.modelo || 'Desconhecido',
    marca: backendDevice.marca || 'Desconhecida',
    status: backendDevice.status === 'ativo' ? 'online' : 
            backendDevice.status === 'roubado' ? 'roubado' :
            backendDevice.status === 'recuperado' ? 'recuperado' : 'offline',
    ultima_localizacao: {
      latitude: backendDevice.ultima_localizacao_lat || 0,
      longitude: backendDevice.ultima_localizacao_lng || 0,
      timestamp: backendDevice.ultimo_ping || backendDevice.data_cadastro
    },
    bateria: 100 // Backend não tem esse campo ainda
  }),

  // Converter emergência do backend para formato do frontend
  backendToFrontendEmergency: (backendEmergency: BackendEmergencia) => ({
    id: backendEmergency.id.toString(),
    usuario_id: backendEmergency.usuario_id.toString(),
    device_id: backendEmergency.dispositivo_id.toString(),
    tipo: 'sos_domestico' as const, // Backend não tem tipos específicos ainda
    localizacao: {
      latitude: backendEmergency.latitude,
      longitude: backendEmergency.longitude
    },
    timestamp: backendEmergency.timestamp_acionamento,
    status: backendEmergency.status as 'ativo' | 'atendido' | 'resolvido' | 'cancelado',
    prioridade: 'alta' as const, // Backend não tem prioridade ainda
    descricao: backendEmergency.observacoes_admin || 'Emergência acionada via botão SOS',
    tempo_resposta: backendEmergency.tempo_resposta
  }),

  // Converter estatísticas do backend para formato do frontend
  backendToFrontendStats: (backendStats: BackendEstatisticas) => ({
    usuarios_ativos: backendStats.usuarios_ativos,
    dispositivos_online: backendStats.total_dispositivos - backendStats.dispositivos_roubados,
    emergencias_ativas: backendStats.emergencias_ativas,
    taxa_resposta: backendStats.total_emergencias > 0 ? 
      Math.round(((backendStats.total_emergencias - backendStats.emergencias_ativas) / backendStats.total_emergencias) * 100) : 0,
    tempo_medio_resposta: 6.8, // Calcular do backend futuramente
    dispositivos_recuperados_mes: 0 // Implementar no backend futuramente
  })
};

export default api;
