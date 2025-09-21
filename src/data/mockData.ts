// Mock data for AntiCrime 04 - PRM System

export interface User {
  id: string;
  nome: string;
  documento: string;
  telefone: string;
  endereco: {
    bairro: string;
    rua: string;
    numero: string;
    coordenadas: {
      latitude: number;
      longitude: number;
    };
  };
  fotografia: string;
  contatos_emergencia: string[];
  data_cadastro: string;
  status: "ativo" | "inativo" | "suspenso";
}

export interface Device {
  id: string;
  imei: string;
  usuario_id: string;
  modelo: string;
  marca: string;
  status: "online" | "offline" | "roubado" | "recuperado";
  ultima_localizacao: {
    latitude: number;
    longitude: number;
    timestamp: string;
  };
  bateria: number;
}

export interface Emergency {
  id: string;
  usuario_id: string;
  device_id: string;
  tipo: "sos_domestico" | "roubo_dispositivo" | "emergencia_medica" | "assalto";
  localizacao: {
    latitude: number;
    longitude: number;
  };
  timestamp: string;
  status: "ativo" | "atendido" | "resolvido" | "cancelado";
  prioridade: "alta" | "media" | "baixa";
  descricao?: string;
  tempo_resposta?: number;
}

export interface SystemStats {
  usuarios_ativos: number;
  dispositivos_online: number;
  emergencias_ativas: number;
  taxa_resposta: number;
  tempo_medio_resposta: number;
  dispositivos_recuperados_mes: number;
}

// Mock Users Data (Maputo/Matola area)
export const mockUsers: User[] = [
  {
    id: "USR-001",
    nome: "Maria Santos Macamo",
    documento: "12345678901MZ",
    telefone: "+258 82 123 4567",
    endereco: {
      bairro: "Sommerschield",
      rua: "Av. Julius Nyerere",
      numero: "245",
      coordenadas: { latitude: -25.9692, longitude: 32.5731 }
    },
    fotografia: "/mock-house-1.jpg",
    contatos_emergencia: ["+258 84 567 890", "+258 82 345 678"],
    data_cadastro: "2024-01-15",
    status: "ativo"
  },
  {
    id: "USR-002", 
    nome: "João Carlos Nhachote",
    documento: "98765432101MZ",
    telefone: "+258 84 987 6543",
    endereco: {
      bairro: "Polana Cimento",
      rua: "Rua da Marginal",
      numero: "156",
      coordenadas: { latitude: -25.9553, longitude: 32.5892 }
    },
    fotografia: "/mock-house-2.jpg",
    contatos_emergencia: ["+258 82 111 222"],
    data_cadastro: "2024-02-03",
    status: "ativo"
  },
  {
    id: "USR-003",
    nome: "Ana Luisa Tembe",
    documento: "11223344501MZ",
    telefone: "+258 87 456 7890",
    endereco: {
      bairro: "Matola Rio",
      rua: "Av. da Independência",
      numero: "78",
      coordenadas: { latitude: -25.9628, longitude: 32.4587 }
    },
    fotografia: "/mock-house-3.jpg",
    contatos_emergencia: ["+258 84 333 444", "+258 82 555 666"],
    data_cadastro: "2024-01-28",
    status: "ativo"
  },
  {
    id: "USR-004",
    nome: "Pedro Manhiça Sitoe",
    documento: "55667788901MZ",
    telefone: "+258 82 654 3210",
    endereco: {
      bairro: "Malhangalene",
      rua: "Rua do Bagamoio",
      numero: "432",
      coordenadas: { latitude: -25.9324, longitude: 32.5731 }
    },
    fotografia: "/mock-house-4.jpg",
    contatos_emergencia: ["+258 84 777 888"],
    data_cadastro: "2024-03-12",
    status: "suspenso"
  }
];

// Mock Devices Data
export const mockDevices: Device[] = [
  {
    id: "DEV-001",
    imei: "351756051523999",
    usuario_id: "USR-001",
    modelo: "Galaxy A54",
    marca: "Samsung",
    status: "online",
    ultima_localizacao: {
      latitude: -25.9692,
      longitude: 32.5731,
      timestamp: "2024-03-18T14:32:00Z"
    },
    bateria: 87
  },
  {
    id: "DEV-002",
    imei: "860987654321098",
    usuario_id: "USR-002",
    modelo: "iPhone 14",
    marca: "Apple",
    status: "online",
    ultima_localizacao: {
      latitude: -25.9553,
      longitude: 32.5892,
      timestamp: "2024-03-18T14:45:00Z"
    },
    bateria: 64
  },
  {
    id: "DEV-003",
    imei: "123456789012345",
    usuario_id: "USR-003",
    modelo: "Redmi Note 12",
    marca: "Xiaomi",
    status: "roubado",
    ultima_localizacao: {
      latitude: -25.9156,
      longitude: 32.6052,
      timestamp: "2024-03-18T13:15:00Z"
    },
    bateria: 23
  },
  {
    id: "DEV-004",
    imei: "987654321098765",
    usuario_id: "USR-004",
    modelo: "P40 Lite",
    marca: "Huawei",
    status: "offline",
    ultima_localizacao: {
      latitude: -25.9324,
      longitude: 32.5731,
      timestamp: "2024-03-18T12:30:00Z"
    },
    bateria: 0
  }
];

// Mock Emergencies Data
export const mockEmergencies: Emergency[] = [
  {
    id: "EMG-001",
    usuario_id: "USR-001",
    device_id: "DEV-001",
    tipo: "sos_domestico",
    localizacao: { latitude: -25.9692, longitude: 32.5731 },
    timestamp: "2024-03-18T14:32:00Z",
    status: "ativo",
    prioridade: "alta",
    descricao: "Ativação botão SOS - possível invasão domiciliar"
  },
  {
    id: "EMG-002",
    usuario_id: "USR-002",
    device_id: "DEV-002",
    tipo: "assalto",
    localizacao: { latitude: -25.9553, longitude: 32.5892 },
    timestamp: "2024-03-18T14:15:00Z",
    status: "atendido",
    prioridade: "alta",
    descricao: "Tentativa de assalto na Marginal",
    tempo_resposta: 8
  },
  {
    id: "EMG-003",
    usuario_id: "USR-003",
    device_id: "DEV-003",
    tipo: "roubo_dispositivo",
    localizacao: { latitude: -25.9628, longitude: 32.4587 },
    timestamp: "2024-03-18T13:45:00Z",
    status: "ativo",
    prioridade: "media",
    descricao: "Dispositivo roubado - última localização ativa"
  },
  {
    id: "EMG-004",
    usuario_id: "USR-001",
    device_id: "DEV-001",
    tipo: "emergencia_medica",
    localizacao: { latitude: -25.9692, longitude: 32.5731 },
    timestamp: "2024-03-18T12:20:00Z",
    status: "resolvido",
    prioridade: "alta",
    descricao: "Emergência médica - idoso com problemas cardíacos",
    tempo_resposta: 12
  }
];

// Mock System Statistics
export const mockSystemStats: SystemStats = {
  usuarios_ativos: 1247,
  dispositivos_online: 1089,
  emergencias_ativas: 3,
  taxa_resposta: 98.7,
  tempo_medio_resposta: 6.8,
  dispositivos_recuperados_mes: 23
};

// Recent Activity Data
export const mockRecentActivity = [
  {
    timestamp: "14:45",
    descricao: "Dispositivo DEV-089 online",
    tipo: "info",
    usuario: "Carlos Matusse"
  },
  {
    timestamp: "14:32", 
    descricao: "SOS ativado - Maria Santos",
    tipo: "emergency",
    usuario: "Maria Santos Macamo"
  },
  {
    timestamp: "14:15",
    descricao: "Assalto reportado - Marginal",
    tipo: "warning",
    usuario: "João Carlos Nhachote"
  },
  {
    timestamp: "13:58",
    descricao: "Backup sistema concluído",
    tipo: "success",
    usuario: "Sistema"
  },
  {
    timestamp: "13:45",
    descricao: "Dispositivo roubado detectado",
    tipo: "alert",
    usuario: "Ana Luisa Tembe"
  }
];

// System Status Data
export const mockSystemStatus = [
  {
    servico: "Central PRM",
    status: "online",
    uptime: "99.8%"
  },
  {
    servico: "Base de Dados",
    status: "online", 
    uptime: "99.9%"
  },
  {
    servico: "WebSocket Server",
    status: "online",
    uptime: "98.7%"
  },
  {
    servico: "GPS Tracking",
    status: "online",
    uptime: "99.2%"
  },
  {
    servico: "Backup Server",
    status: "maintenance",
    uptime: "95.1%"
  }
];