import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, MapPin, Clock, User, Smartphone, Phone, X, ExternalLink, Copy } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';

interface EmergencyDialogProps {
  emergency: any;
  isOpen: boolean;
  onClose: () => void;
  onRespond: (emergencyId: string) => void;
}

export const EmergencyDialog: React.FC<EmergencyDialogProps> = ({
  emergency,
  isOpen,
  onClose,
  onRespond
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen && emergency) {
      // Inicializar áudio de alarme
      if (!audioRef.current) {
        audioRef.current = new Audio('/emergency-alert-siren-253180.mp3');
        audioRef.current.loop = true;
        audioRef.current.volume = 0.7;
      }

      // Tocar áudio
      const playAudio = async () => {
        try {
          await audioRef.current?.play();
          setIsPlaying(true);
        } catch (error) {
          console.warn('Não foi possível reproduzir o áudio automaticamente');
        }
      };

      playAudio();
    }

    return () => {
      // Parar áudio ao fechar
      if (audioRef.current && !audioRef.current.paused) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        setIsPlaying(false);
      }
    };
  }, [isOpen, emergency]);

  const stopAlarm = () => {
    if (audioRef.current && !audioRef.current.paused) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleRespond = () => {
    stopAlarm();
    onRespond(emergency?.id);
    onClose();
  };

  const handleDismiss = () => {
    stopAlarm();
    onClose();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "alta": return "bg-red-600 text-white";
      case "media": return "bg-orange-500 text-white";
      case "baixa": return "bg-yellow-500 text-black";
      default: return "bg-gray-500 text-white";
    }
  };

  const getEmergencyTypeLabel = (tipo: string) => {
    switch (tipo) {
      case "sos_domestico": return "SOS Domiciliar";
      case "roubo_dispositivo": return "Roubo de Dispositivo";
      case "emergencia_medica": return "Emergência Médica";
      case "assalto": return "Assalto";
      default: return "Emergência";
    }
  };

  const formatLocation = () => {
    const lat = emergency?.localizacao?.latitude ?? emergency?.latitude;
    const lng = emergency?.localizacao?.longitude ?? emergency?.longitude;
    
    if (!lat || !lng) return "Localização não disponível";
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-MZ', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Africa/Maputo'
    });
  };

  const copyLocation = async () => {
    const lat = emergency?.localizacao?.latitude ?? emergency?.latitude;
    const lng = emergency?.localizacao?.longitude ?? emergency?.longitude;
    
    if (!lat || !lng) return;
    
    const locationText = `${lat}, ${lng}`;
    
    try {
      await navigator.clipboard.writeText(locationText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback para browsers mais antigos
      const textArea = document.createElement('textarea');
      textArea.value = locationText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openInMap = () => {
    const lat = emergency?.localizacao?.latitude ?? emergency?.latitude;
    const lng = emergency?.localizacao?.longitude ?? emergency?.longitude;
    
    if (!lat || !lng) return;
    
    const googleMapsUrl = `https://www.google.com/maps?q=${lat},${lng}`;
    window.open(googleMapsUrl, '_blank');
  };

  if (!emergency) return null;

  return (
    <>
      <style>{`
        @keyframes pulse-border {
          0% {
            border-color: rgb(239, 68, 68);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7), 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          50% {
            border-color: rgb(220, 38, 38);
            box-shadow: 0 0 0 6px rgba(239, 68, 68, 0.4), 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
          100% {
            border-color: rgb(185, 28, 28);
            box-shadow: 0 0 0 10px rgba(239, 68, 68, 0.1), 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          }
        }
        
        .emergency-dialog {
          animation: pulse-border 1.8s ease-in-out infinite !important;
        }
      `}</style>
      <Dialog open={isOpen} onOpenChange={() => {}}>
        <DialogContent 
          className="max-w-2xl p-0 gap-0 border-4 shadow-2xl emergency-dialog"
        >
        {/* Header com animação de emergência */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 text-white p-6 relative overflow-hidden">
          <div className="absolute inset-0 bg-red-500 opacity-10"></div>
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-full">
                <AlertTriangle className="h-8 w-8 animate-bounce" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">🚨 EMERGÊNCIA ATIVA</h2>
                <p className="text-red-100">Sistema AntiCrime 04 - PRM</p>
              </div>
            </div>
            <div className="text-right">
              <Badge className="bg-white/20 text-white border-white/30 text-lg px-3 py-1">
                ID: {emergency.id}
              </Badge>
            </div>
          </div>
        </div>

        {/* Conteúdo principal */}
        <div className="p-6 space-y-6">
          {/* Status e Prioridade */}
          <div className="flex items-center justify-between">
            <Badge className={`${getPriorityColor(emergency.prioridade)} text-lg px-4 py-2`}>
              🔥 PRIORIDADE {emergency.prioridade?.toUpperCase()}
            </Badge>
            <Badge className="bg-red-100 text-red-800 text-lg px-4 py-2">
              ⚠️ ATIVO
            </Badge>
          </div>

          {/* Tipo de Emergência */}
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <h3 className="text-xl font-bold text-red-800 mb-2">
                {getEmergencyTypeLabel(emergency.tipo)}
              </h3>
              {emergency.descricao && (
                <p className="text-red-700 text-base">
                  {emergency.descricao}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Informações detalhadas */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-3">
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <User className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold">Usuário</p>
                  <p className="text-sm text-gray-600">ID: {emergency.usuario_id}</p>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  <p className="font-semibold">Dispositivo</p>
                </div>
                <div className="text-sm text-gray-600 space-y-1">
                  <p>ID: {emergency.device_id}</p>
                  <div className="flex items-center gap-4 text-xs">
                    <span>📱 {emergency.marca || emergency.device_marca || 'N/A'} {emergency.modelo || emergency.device_modelo || 'N/A'}</span>
                    <span>🔋 {emergency.battery_level || emergency.nivel_bateria || 'N/A'}%</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3 mb-3">
                  <MapPin className="h-5 w-5 text-red-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Localização</p>
                    <p className="text-sm text-gray-600 font-mono">
                      {formatLocation()}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={openInMap}
                    className="text-xs"
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Ver no Mapa
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyLocation}
                    className="text-xs"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    {copied ? 'Copiado!' : 'Copiar'}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold">Horário</p>
                  <p className="text-sm text-gray-600">
                    {formatTime(emergency.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Status do áudio */}
          {isPlaying && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-3 w-3 bg-yellow-400 rounded-full animate-pulse"></div>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    🔊 Alarme sonoro ativo - Responda ou silencie a emergência
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Botões de ação */}
        <div className="bg-gray-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-end">
          <Button
            variant="outline"
            onClick={handleDismiss}
            className="flex items-center gap-2 border-gray-300"
          >
            <X className="h-4 w-4" />
            Silenciar Alarme
          </Button>
          
          <Button
            onClick={handleRespond}
            className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
          >
            <Phone className="h-4 w-4" />
            🚨 RESPONDER EMERGÊNCIA
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};
