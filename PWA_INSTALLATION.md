# 📱 Instalação do AntiCrime04 PWA

## 🎯 **Como Instalar o App**

### **Desktop (Chrome/Edge/Firefox)**
1. Acesse o sistema no navegador
2. Procure o ícone de **instalação** na barra de endereços
3. Clique em **"Instalar AntiCrime04"**
4. Confirme a instalação

### **Mobile (Android)**
1. Abra o Chrome/Edge
2. Acesse o sistema
3. Toque no menu (3 pontos) → **"Instalar app"**
4. Toque em **"Instalar"**

### **Mobile (iOS)**
1. Abra o Safari
2. Acesse o sistema
3. Toque no botão **compartilhar** (↗️)
4. Toque em **"Adicionar à Tela Inicial"**

## ✨ **Funcionalidades PWA**

### **🔄 Funciona Offline**
- Cache automático de recursos
- Dados salvos localmente
- Sincronização quando online

### **📱 App Nativo**
- Ícone na tela inicial
- Funciona como app nativo
- Sem barra de navegador

### **🔔 Notificações**
- Alertas de emergência
- Pings de dispositivos
- Atualizações do sistema

### **⚡ Performance**
- Carregamento instantâneo
- Cache inteligente
- Atualizações automáticas

## 🛠️ **Recursos Técnicos**

### **Service Worker**
- Cache estratégico
- Sincronização offline
- Notificações push

### **Manifest**
- Configuração de app
- Ícones responsivos
- Tema personalizado

### **Shortcuts**
- Acesso rápido às emergências
- Emulador de dispositivos
- Dashboard principal

## 📋 **Requisitos**

- **Navegador**: Chrome 68+, Firefox 60+, Safari 11.1+
- **HTTPS**: Necessário para service worker
- **Local Storage**: Para cache offline

## 🔧 **Desenvolvimento**

### **Testar PWA**
```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview
```

### **Lighthouse PWA**
- Acesse DevTools → Lighthouse
- Selecione "Progressive Web App"
- Execute auditoria

## 📊 **Métricas PWA**

### **Performance**
- ✅ First Contentful Paint < 2s
- ✅ Largest Contentful Paint < 2.5s
- ✅ Cumulative Layout Shift < 0.1

### **Acessibilidade**
- ✅ Contraste adequado
- ✅ Navegação por teclado
- ✅ Screen reader friendly

### **PWA**
- ✅ Manifest válido
- ✅ Service worker ativo
- ✅ HTTPS habilitado
- ✅ Ícones responsivos

## 🚀 **Deploy**

### **Produção**
1. Configure HTTPS
2. Atualize URLs no manifest
3. Teste em diferentes dispositivos
4. Valide com Lighthouse

### **CDN**
- Cache de assets estáticos
- Compressão gzip/brotli
- Headers de cache apropriados

## 📞 **Suporte**

Para problemas com instalação:
1. Verifique se o navegador suporta PWA
2. Certifique-se de estar usando HTTPS
3. Limpe cache e cookies
4. Teste em modo incógnito

---

**AntiCrime04 PWA** - Sistema PRM Moçambique 🇲🇿
