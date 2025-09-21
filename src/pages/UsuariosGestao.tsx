import { useEffect, useMemo, useState } from 'react';
import { useUsuarios } from '@/hooks/useAnticrimeData';
import { anticrimeAPI } from '@/services/anticrimeAPI';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Pencil, Trash2, Save, X, Search } from 'lucide-react';

interface EditForm {
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
  observacoes?: string;
  ativo: boolean;
}

const UsuariosGestao = () => {
  const { data: users = [], isLoading, refetch } = useUsuarios();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u =>
      u.nome.toLowerCase().includes(q) ||
      u.documento.toLowerCase().includes(q) ||
      u.telefone.toLowerCase().includes(q)
    );
  }, [users, search]);

  // Edit dialog state
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const handleEdit = (u: any) => {
    const f: EditForm = {
      id: Number(u.id),
      nome_completo: u.nome,
      numero_identidade: u.documento,
      telefone_principal: u.telefone,
      telefone_emergencia: u.contatos_emergencia?.[0] || '',
      email: undefined,
      provincia: '',
      cidade: '',
      bairro: u.endereco?.bairro || '',
      rua: u.endereco?.rua || '',
      numero_casa: u.endereco?.numero || '',
      ponto_referencia: '',
      latitude_residencia: u.endereco?.coordenadas?.latitude || 0,
      longitude_residencia: u.endereco?.coordenadas?.longitude || 0,
      observacoes: '',
      ativo: u.status === 'ativo',
    };
    setEditForm(f);
    setOpen(true);
  };

  const submitEdit = async () => {
    if (!editForm) return;
    setSaving(true);
    try {
      await anticrimeAPI.usuarios.update(editForm.id, {
        nome_completo: editForm.nome_completo,
        numero_identidade: editForm.numero_identidade,
        telefone_principal: editForm.telefone_principal,
        telefone_emergencia: editForm.telefone_emergencia || undefined,
        email: editForm.email || undefined,
        provincia: editForm.provincia || undefined,
        cidade: editForm.cidade || undefined,
        bairro: editForm.bairro || undefined,
        rua: editForm.rua || undefined,
        numero_casa: editForm.numero_casa || undefined,
        ponto_referencia: editForm.ponto_referencia || undefined,
        latitude_residencia: editForm.latitude_residencia,
        longitude_residencia: editForm.longitude_residencia,
        observacoes: editForm.observacoes || undefined,
        ativo: editForm.ativo,
      } as any);
      toast({ title: 'Usuário atualizado' });
      setOpen(false);
      await refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao atualizar';
      toast({ title: 'Falha', description: String(msg) });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este usuário?')) return;
    try {
      await anticrimeAPI.usuarios.delete(id);
      toast({ title: 'Usuário excluído' });
      await refetch();
    } catch (err: any) {
      const msg = err?.response?.data?.detail || 'Erro ao excluir';
      toast({ title: 'Falha', description: String(msg) });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Edite ou elimine usuários em tabela.</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-10" placeholder="Buscar por nome, documento ou telefone" value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Usuários ({filtered.length})</CardTitle>
        </CardHeader>
        <CardContent className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Endereço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading && (
                <TableRow><TableCell colSpan={6} className="text-sm text-muted-foreground">Carregando...</TableCell></TableRow>
              )}
              {!isLoading && filtered.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="font-medium">{u.nome}</TableCell>
                  <TableCell className="font-mono">{u.documento}</TableCell>
                  <TableCell>{u.telefone}</TableCell>
                  <TableCell>{u.endereco?.bairro} {u.endereco?.rua && `- ${u.endereco.rua}`}</TableCell>
                  <TableCell>
                    <Badge className={u.status === 'ativo' ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                      {u.status.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => handleDelete(Number(u.id))}>
                      <Trash2 className="h-4 w-4" />
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
            <DialogTitle>Editar Usuário</DialogTitle>
          </DialogHeader>
          {editForm && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium">Nome</label>
                  <Input className="h-9 text-sm" value={editForm.nome_completo} onChange={(e) => setEditForm({ ...editForm, nome_completo: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Documento</label>
                  <Input className="h-9 text-sm" value={editForm.numero_identidade} onChange={(e) => setEditForm({ ...editForm, numero_identidade: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Telefone</label>
                  <Input className="h-9 text-sm" value={editForm.telefone_principal} onChange={(e) => setEditForm({ ...editForm, telefone_principal: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Telefone emergência</label>
                  <Input className="h-9 text-sm" value={editForm.telefone_emergencia} onChange={(e) => setEditForm({ ...editForm, telefone_emergencia: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Bairro</label>
                  <Input className="h-9 text-sm" value={editForm.bairro} onChange={(e) => setEditForm({ ...editForm, bairro: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Rua</label>
                  <Input className="h-9 text-sm" value={editForm.rua} onChange={(e) => setEditForm({ ...editForm, rua: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Número</label>
                  <Input className="h-9 text-sm" value={editForm.numero_casa} onChange={(e) => setEditForm({ ...editForm, numero_casa: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Ponto de referência</label>
                  <Input className="h-9 text-sm" value={editForm.ponto_referencia} onChange={(e) => setEditForm({ ...editForm, ponto_referencia: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Latitude</label>
                  <Input className="h-9 text-sm" type="number" step="any" value={editForm.latitude_residencia} onChange={(e) => setEditForm({ ...editForm, latitude_residencia: Number(e.target.value) })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Longitude</label>
                  <Input className="h-9 text-sm" type="number" step="any" value={editForm.longitude_residencia} onChange={(e) => setEditForm({ ...editForm, longitude_residencia: Number(e.target.value) })} />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  <X className="h-4 w-4 mr-2" /> Cancelar
                </Button>
                <Button onClick={submitEdit} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar'}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UsuariosGestao;
