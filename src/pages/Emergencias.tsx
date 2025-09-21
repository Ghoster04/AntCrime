import { useEffect, useMemo, useState } from 'react';
import { useEmergencias } from '@/hooks/useAnticrimeData';
import { anticrimeAPI } from '@/services/anticrimeAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { MapPin, Phone, Info, ClipboardCopy, Check, ExternalLink, Search, AlertTriangle } from 'lucide-react';

interface Details {
  user?: any;
  device?: any;
}

const Emergencias = () => {
  const { data = [], isLoading, refetch } = useEmergencias('ativo');
  const { toast } = useToast();
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    if (!query) return data;
    const q = query.toLowerCase();
    return data.filter((e: any) =>
      e.id.includes(q) ||
      e.usuario_id.includes(q) ||
      e.device_id.includes(q)
    );
  }, [data, query]);

  const [open, setOpen] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [details, setDetails] = useState<Details>({});
  const [selected, setSelected] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const openDetails = async (item: any) => {
    setSelected(item);
    setOpen(true);
    setLoadingDetails(true);
    try {
      const user = await anticrimeAPI.usuarios.getById(Number(item.usuario_id));
      // Optionally fetch device by list cache; for now we only need IMEI from item
      setDetails({ user });
    } catch (err: any) {
      toast({ title: 'Erro', description: 'Falha ao carregar dados do usuário' });
    } finally {
      setLoadingDetails(false);
    }
  };

  const copyLocation = async (lat: number, lng: number) => {
    try {
      await navigator.clipboard.writeText(`${lat}, ${lng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast({ title: 'Falha ao copiar', description: 'Permita acesso à área de transferência' });
    }
  };

  const responder = async (id: number) => {
    try {
      await anticrimeAPI.emergencias.responder(id, 'Em deslocação');
      toast({ title: 'Emergência respondida' });
      await refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao responder';
      toast({ title: 'Falha', description: String(msg) });
    }
  };

  const finalizar = async (id: number) => {
    try {
      await anticrimeAPI.emergencias.finalizar(id, 'Situação resolvida');
      toast({ title: 'Emergência finalizada' });
      await refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao finalizar';
      toast({ title: 'Falha', description: String(msg) });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Emergências</h1>
        <p className="text-muted-foreground">Sinais SOS recebidos em tempo real</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar por ID, usuário ou dispositivo" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ativas ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Usuário</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Localização</TableHead>
                <TableHead>Hora</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6} className="text-sm text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {!isLoading && filtered.map((e: any) => (
                <TableRow key={e.id}>
                  <TableCell className="font-mono">#{e.id}</TableCell>
                  <TableCell>{e.usuario_id}</TableCell>
                  <TableCell>{e.device_id}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      <span className="font-mono text-xs">{e.localizacao?.latitude ?? e.latitude}, {e.localizacao?.longitude ?? e.longitude}</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(e.timestamp).toLocaleString('pt-MZ')}</TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => openDetails(e)}>
                      <Info className="h-4 w-4" />
                    </Button>
                    <a href={`https://www.google.com/maps?q=${e.localizacao?.latitude ?? e.latitude},${e.localizacao?.longitude ?? e.longitude}`} target="_blank" rel="noreferrer">
                      <Button size="sm" variant="outline">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button size="sm" variant="outline" onClick={() => copyLocation(e.localizacao?.latitude ?? e.latitude, e.localizacao?.longitude ?? e.longitude)}>
                      {copied ? <Check className="h-4 w-4" /> : <ClipboardCopy className="h-4 w-4" />}
                    </Button>
                    <Button size="sm" className="bg-warning hover:opacity-90" onClick={() => responder(Number(e.id))}>
                      Responder
                    </Button>
                    <Button size="sm" className="bg-success hover:opacity-90" onClick={() => finalizar(Number(e.id))}>
                      Finalizar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Residência</DialogTitle>
          </DialogHeader>
          {!selected ? (
            <div className="text-sm text-muted-foreground">Nenhuma emergência selecionada</div>
          ) : loadingDetails ? (
            <div className="text-sm text-muted-foreground">Carregando...</div>
          ) : details.user ? (
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-warning" />
                <span>Emergência #{selected.id} • {new Date(selected.timestamp).toLocaleString('pt-MZ')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <div className="text-xs text-muted-foreground">Nome</div>
                  <div className="font-medium">{details.user.nome_completo}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Telefone</div>
                  <div>{details.user.telefone_principal}</div>
                </div>
                <div className="md:col-span-2">
                  <div className="text-xs text-muted-foreground">Endereço</div>
                  <div>{[details.user.rua, details.user.bairro, details.user.cidade].filter(Boolean).join(', ')}</div>
                </div>
                {details.user.foto_residencia && (
                  <div className="md:col-span-2">
                    <div className="text-xs text-muted-foreground mb-2">Foto da Residência</div>
                    <img 
                      src={`http://localhost:8000${details.user.foto_residencia}`} 
                      alt="Foto da residência" 
                      className="w-full max-w-sm h-auto rounded border shadow-sm"
                    />
                  </div>
                )}
                <div>
                  <div className="text-xs text-muted-foreground">Coordenadas</div>
                  <div className="font-mono text-xs">{selected.localizacao?.latitude ?? selected.latitude}, {selected.localizacao?.longitude ?? selected.longitude}</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Contato emergência</div>
                  <div>{details.user.telefone_emergencia || '-'}</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <a href={`https://www.google.com/maps?q=${selected.localizacao?.latitude ?? selected.latitude},${selected.localizacao?.longitude ?? selected.longitude}`} target="_blank" rel="noreferrer">
                  <Button size="sm" variant="outline">
                    Ver no mapa
                  </Button>
                </a>
                <Button size="sm" variant="outline" onClick={() => copyLocation(selected.localizacao?.latitude ?? selected.latitude, selected.localizacao?.longitude ?? selected.longitude)}>
                  {copied ? 'Copiado' : 'Copiar localização'}
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-sm text-muted-foreground">Dados não disponíveis</div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Fechar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Emergencias;
