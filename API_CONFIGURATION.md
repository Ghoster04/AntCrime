# Configuração da API - AntiCrime Frontend

## Visão Geral

O frontend do AntiCrime está configurado para usar a API de produção em `https://ant-crime-production.up.railway.app`.

## Configuração Atual

### URL da API
- **Produção**: `https://ant-crime-production.up.railway.app`
- **Desenvolvimento**: `http://localhost:8000`

### Documentação da API
- **URL da Documentação**: `https://ant-crime-production.up.railway.app/docs`

## Arquivos de Configuração

### `src/config/api.ts`
Contém todas as configurações da API, incluindo:
- URLs de produção e desenvolvimento
- Configurações de timeout
- Configurações de retry
- Funções auxiliares para obter URLs

### `src/services/anticrimeAPI.ts`
Serviço principal da API que:
- Usa a configuração do `api.ts`
- Implementa interceptors para autenticação
- Trata erros de forma centralizada
- Fornece métodos para todas as operações da API

## Como Alterar a Configuração

### Para Desenvolvimento Local

1. **Opção 1 - Variável de Ambiente**:
   Crie um arquivo `.env` na raiz do projeto:
   ```
   VITE_API_BASE_URL=http://localhost:8000
   ```

2. **Opção 2 - Editar o Arquivo de Configuração**:
   Edite `src/config/api.ts` e altere:
   ```typescript
   BASE_URL: 'http://localhost:8000'
   ```

### Para Produção
A configuração atual já está apontando para a API de produção. Não é necessário fazer alterações.

## Endpoints Principais

### Autenticação
- `POST /auth/login` - Login de administradores
- `GET /auth/me` - Informações do usuário logado

### Usuários
- `GET /usuarios/` - Listar usuários
- `POST /usuarios/` - Criar usuário
- `POST /usuarios/upload` - Criar usuário com foto
- `GET /usuarios/{id}` - Obter usuário por ID
- `PUT /usuarios/{id}` - Atualizar usuário

### Dispositivos
- `GET /dispositivos/` - Listar dispositivos
- `POST /dispositivos/` - Criar dispositivo
- `POST /dispositivos/register` - Registrar dispositivo (app Android)
- `PUT /dispositivos/{id}/status` - Atualizar status
- `PUT /dispositivos/{id}/marcar-roubado` - Marcar como roubado
- `PUT /dispositivos/{id}/marcar-recuperado` - Marcar como recuperado
- `GET /dispositivos/pings-roubados` - Obter pings de dispositivos roubados

### Emergências
- `GET /emergencias/` - Listar emergências
- `GET /emergencias/ativas` - Obter emergências ativas
- `POST /emergencias/sos` - Criar SOS
- `PUT /emergencias/{id}/responder` - Responder emergência
- `PUT /emergencias/{id}/finalizar` - Finalizar emergência

### Dashboard
- `GET /dashboard/stats` - Obter estatísticas

## Testando a Conexão

Para verificar se a API está funcionando:

1. Acesse a documentação: https://ant-crime-production.up.railway.app/docs
2. Teste um endpoint simples como `GET /dashboard/stats`
3. Verifique se o frontend consegue fazer login

## Troubleshooting

### Erro de CORS
Se houver problemas de CORS, verifique se o backend está configurado para aceitar requisições do frontend.

### Erro de Conexão
1. Verifique se a URL da API está correta
2. Teste a API diretamente no navegador
3. Verifique se há problemas de rede

### Problemas de Autenticação
1. Verifique se o token está sendo enviado corretamente
2. Confirme se o token não expirou
3. Teste o login novamente
