import { Search, Plus, MapPin, Phone, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUsuarios } from "@/hooks/useAnticrimeData";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { anticrimeAPI } from "@/services/anticrimeAPI";
import { useToast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

const Usuarios = () => {
  const { data: users = [], isLoading } = useUsuarios();
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo": return "bg-success text-success-foreground";
      case "inativo": return "bg-muted text-muted-foreground";
      case "suspenso": return "bg-warning text-warning-foreground";
      default: return "bg-secondary text-secondary-foreground";
    }
  };

  const getInitials = (nome: string) => {
    return nome.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Dialog state for creating user
  const [open, setOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    nome_completo: "",
    numero_identidade: "",
    telefone_principal: "",
    provincia: "",
    cidade: "",
    bairro: "",
    latitude_residencia: "",
    longitude_residencia: "",
    email: "",
    telefone_emergencia: "",
    rua: "",
    numero_casa: "",
    ponto_referencia: "",
    observacoes: "",
  });
  const [fotoResidencia, setFotoResidencia] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string | null>(null);

  // Dispositivo opcional vinculado a esta residência
  const [createDeviceForUser, setCreateDeviceForUser] = useState(false);
  const [deviceForm, setDeviceForm] = useState({
    imei: "",
    modelo: "",
    marca: "",
    sistema_operacional: "",
    versao_app: "",
  });

  const createUsuario = useMutation({
    mutationFn: async () => {
      // Se houver foto, usar multipart/form-data conforme backend
      if (fotoResidencia) {
        const fd = new FormData();
        fd.append("nome_completo", form.nome_completo);
        fd.append("numero_identidade", form.numero_identidade);
        fd.append("telefone_principal", form.telefone_principal);
        fd.append("provincia", form.provincia);
        fd.append("cidade", form.cidade);
        fd.append("bairro", form.bairro);
        fd.append("latitude_residencia", String(Number(form.latitude_residencia)));
        fd.append("longitude_residencia", String(Number(form.longitude_residencia)));
        if (form.telefone_emergencia) fd.append("telefone_emergencia", form.telefone_emergencia);
        if (form.email) fd.append("email", form.email);
        if (form.rua) fd.append("rua", form.rua);
        if (form.numero_casa) fd.append("numero_casa", form.numero_casa);
        if (form.ponto_referencia) fd.append("ponto_referencia", form.ponto_referencia);
        if (form.observacoes) fd.append("observacoes", form.observacoes);
        fd.append("foto_residencia", fotoResidencia);
        return anticrimeAPI.usuarios.createWithPhoto(fd);
      }

      // Caso contrário, usar o endpoint JSON simples
      const payload = {
        nome_completo: form.nome_completo,
        numero_identidade: form.numero_identidade,
        telefone_principal: form.telefone_principal,
        provincia: form.provincia,
        cidade: form.cidade,
        bairro: form.bairro,
        latitude_residencia: Number(form.latitude_residencia),
        longitude_residencia: Number(form.longitude_residencia),
        email: form.email || undefined,
        telefone_emergencia: form.telefone_emergencia || undefined,
        rua: form.rua || undefined,
        numero_casa: form.numero_casa || undefined,
        ponto_referencia: form.ponto_referencia || undefined,
        observacoes: form.observacoes || undefined,
      } as any;
      return anticrimeAPI.usuarios.create(payload);
    },
    onSuccess: async (createdUser) => {
      // Após criar usuário, opcionalmente criar o dispositivo vinculado
      try {
        if (createDeviceForUser && deviceForm.imei) {
          const imei = deviceForm.imei.trim();
          if (imei.length !== 15 || !/^[0-9]{15}$/.test(imei)) {
            toast({ title: "IMEI inválido", description: "O IMEI deve ter exatamente 15 dígitos numéricos." });
          } else {
            await anticrimeAPI.dispositivos.create({
              imei,
              usuario_id: Number(createdUser.id),
              modelo: deviceForm.modelo || undefined,
              marca: deviceForm.marca || undefined,
              sistema_operacional: deviceForm.sistema_operacional || undefined,
              versao_app: deviceForm.versao_app || undefined,
            });
            toast({ title: "Usuário e dispositivo cadastrados com sucesso" });
          }
        } else {
          toast({ title: "Usuário cadastrado com sucesso" });
        }
      } finally {
        setOpen(false);
        queryClient.invalidateQueries({ queryKey: ["usuarios"] });
      }
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.detail || "Erro ao cadastrar usuário";
      toast({ title: "Falha no cadastro", description: String(msg) });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    createUsuario.mutate(undefined, {
      onSettled: () => setCreating(false),
    });
  };
  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFotoResidencia(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFotoPreview(reader.result as string);
      reader.readAsDataURL(file);
    } else {
      setFotoPreview(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Gestão de Usuários</h1>
          <p className="text-muted-foreground">Sistema AntiCrime 04 - Usuários Cadastrados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-primary hover:opacity-90">
              <Plus className="h-4 w-4 mr-2" />
              Novo Usuário
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl p-0">
            <DialogHeader>
              <DialogTitle>Novo Usuário</DialogTitle>
            </DialogHeader>
            <div className="max-h-[70vh] overflow-auto px-6 pb-2">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <h3 className="text-sm font-semibold">Informações essenciais</h3>
                <p className="text-xs text-muted-foreground">Preencha os dados básicos do cidadão</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium">Nome completo</label>
                  <Input className="h-9 text-sm" placeholder="Ex.: João Carlos" value={form.nome_completo} onChange={(e) => setForm({ ...form, nome_completo: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium">Número de identidade</label>
                  <Input className="h-9 text-sm" placeholder="Documento oficial" value={form.numero_identidade} onChange={(e) => setForm({ ...form, numero_identidade: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium">Telefone principal</label>
                  <Input className="h-9 text-sm" placeholder="+258 ..." value={form.telefone_principal} onChange={(e) => setForm({ ...form, telefone_principal: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium">Província</label>
                  <Select value={form.provincia} onValueChange={(v) => setForm({ ...form, provincia: v })}>
                    <SelectTrigger className="h-9 text-sm">
                      <SelectValue placeholder="Selecione a província" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Cabo Delgado">Cabo Delgado</SelectItem>
                      <SelectItem value="Gaza">Gaza</SelectItem>
                      <SelectItem value="Inhambane">Inhambane</SelectItem>
                      <SelectItem value="Manica">Manica</SelectItem>
                      <SelectItem value="Maputo">Maputo</SelectItem>
                      <SelectItem value="Maputo Cidade">Maputo Cidade</SelectItem>
                      <SelectItem value="Nampula">Nampula</SelectItem>
                      <SelectItem value="Niassa">Niassa</SelectItem>
                      <SelectItem value="Sofala">Sofala</SelectItem>
                      <SelectItem value="Tete">Tete</SelectItem>
                      <SelectItem value="Zambézia">Zambézia</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs font-medium">Cidade</label>
                  <Input className="h-9 text-sm" placeholder="Ex.: Matola" value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium">Bairro</label>
                  <Input className="h-9 text-sm" placeholder="Ex.: Central" value={form.bairro} onChange={(e) => setForm({ ...form, bairro: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium">Latitude residência</label>
                  <Input className="h-9 text-sm" type="number" step="any" placeholder="Ex.: -25.965" value={form.latitude_residencia} onChange={(e) => setForm({ ...form, latitude_residencia: e.target.value })} required />
                </div>
                <div>
                  <label className="text-xs font-medium">Longitude residência</label>
                  <Input className="h-9 text-sm" type="number" step="any" placeholder="Ex.: 32.583" value={form.longitude_residencia} onChange={(e) => setForm({ ...form, longitude_residencia: e.target.value })} required />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-medium">Email (opcional)</label>
                  <Input className="h-9 text-sm" placeholder="email@exemplo.com" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
                </div>
                <div>
                  <label className="text-xs font-medium">Telefone emergência (opcional)</label>
                  <Input className="h-9 text-sm" placeholder="Contato de emergência" value={form.telefone_emergencia} onChange={(e) => setForm({ ...form, telefone_emergencia: e.target.value })} />
                </div>
              </div>

              <Separator />

              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="dados-adicionais">
                  <AccordionTrigger className="text-sm">Dados adicionais (opcional)</AccordionTrigger>
                  <AccordionContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="text-xs font-medium">Rua</label>
                        <Input className="h-9 text-sm" placeholder="Nome da rua" value={form.rua} onChange={(e) => setForm({ ...form, rua: e.target.value })} />
                      </div>
                      <div>
                        <label className="text-xs font-medium">Número da casa</label>
                        <Input className="h-9 text-sm" placeholder="Ex.: 123" value={form.numero_casa} onChange={(e) => setForm({ ...form, numero_casa: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium">Ponto de referência</label>
                        <Input className="h-9 text-sm" placeholder="Próximo a..." value={form.ponto_referencia} onChange={(e) => setForm({ ...form, ponto_referencia: e.target.value })} />
                      </div>
                      <div className="md:col-span-2">
                        <label className="text-xs font-medium">Observações</label>
                        <Textarea className="text-sm" placeholder="Notas relevantes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="foto">
                  <AccordionTrigger className="text-sm">Foto da residência (opcional)</AccordionTrigger>
                  <AccordionContent>
                    <div className="pt-2">
                      <Input className="h-9 text-sm" type="file" accept="image/*" onChange={handleFotoChange} />
                      {fotoPreview && (
                        <img src={fotoPreview} alt="Pré-visualização" className="mt-2 h-28 w-auto rounded border" />
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="dispositivo">
                  <AccordionTrigger className="text-sm">Dispositivo para esta residência (opcional)</AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-3 pt-2">
                      <div className="flex items-center gap-2">
                        <Switch id="switch-device" checked={createDeviceForUser} onCheckedChange={setCreateDeviceForUser} />
                        <Label htmlFor="switch-device" className="text-sm">Cadastrar dispositivo imediatamente</Label>
                      </div>
                      {createDeviceForUser && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium">IMEI</label>
                            <Input className="h-9 text-sm" placeholder="15 dígitos" value={deviceForm.imei} onChange={(e) => setDeviceForm({ ...deviceForm, imei: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Modelo (opcional)</label>
                            <Input className="h-9 text-sm" value={deviceForm.modelo} onChange={(e) => setDeviceForm({ ...deviceForm, modelo: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Marca (opcional)</label>
                            <Input className="h-9 text-sm" value={deviceForm.marca} onChange={(e) => setDeviceForm({ ...deviceForm, marca: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Sistema Operacional (opcional)</label>
                            <Input className="h-9 text-sm" value={deviceForm.sistema_operacional} onChange={(e) => setDeviceForm({ ...deviceForm, sistema_operacional: e.target.value })} />
                          </div>
                          <div>
                            <label className="text-xs font-medium">Versão App (opcional)</label>
                            <Input className="h-9 text-sm" value={deviceForm.versao_app} onChange={(e) => setDeviceForm({ ...deviceForm, versao_app: e.target.value })} />
                          </div>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
                <Button type="submit" disabled={creating}>{creating ? "Salvando..." : "Salvar"}</Button>
              </DialogFooter>
            </form>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, documento ou telefone..."
                className="pl-10"
              />
            </div>
            <Button variant="outline">Filtros</Button>
          </div>
        </CardContent>
      </Card>

      {/* Users List (backend) */}
      <div className="grid gap-4">
        {isLoading && (
          <Card><CardContent className="p-6 text-sm text-muted-foreground">Carregando usuários...</CardContent></Card>
        )}
        {!isLoading && users.map((user) => (
          <Card key={user.id} className="shadow-elevated hover:shadow-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={user.fotografia} alt={`Foto de ${user.nome}`} />
                    <AvatarFallback className="bg-gradient-primary text-white text-lg font-bold">
                      {getInitials(user.nome)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xl font-bold text-foreground">{user.nome}</h3>
                      <Badge className={getStatusColor(user.status)}>
                        {user.status.toUpperCase()}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">Doc:</span>
                        <span className="font-mono">{user.documento}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        <span>{user.telefone}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        <span>{user.endereco.bairro}, {user.endereco.rua}, {user.endereco.numero}</span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Cadastrado em {new Date(user.data_cadastro).toLocaleDateString('pt-MZ')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Coordenadas:</span>
                      <span className="font-mono text-xs bg-muted px-2 py-1 rounded">
                        {user.endereco.coordenadas.latitude.toFixed(4)}, {user.endereco.coordenadas.longitude.toFixed(4)}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Contatos de Emergência:</span>
                      <div className="flex gap-2">
                        {user.contatos_emergencia.map((contato, index) => (
                          <span key={index} className="text-xs bg-accent px-2 py-1 rounded">
                            {contato}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Stats Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Estatístico</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-success/10 rounded-lg">
              <div className="text-2xl font-bold text-success">
                {users.filter(u => u.status === "ativo").length}
              </div>
              <div className="text-sm text-muted-foreground">Usuários Ativos</div>
            </div>
            <div className="text-center p-4 bg-warning/10 rounded-lg">
              <div className="text-2xl font-bold text-warning">
                {users.filter(u => u.status === "suspenso").length}
              </div>
              <div className="text-sm text-muted-foreground">Usuários Suspensos</div>
            </div>
            <div className="text-center p-4 bg-muted/20 rounded-lg">
              <div className="text-2xl font-bold text-muted-foreground">
                {users.filter(u => u.status === "inativo").length}
              </div>
              <div className="text-sm text-muted-foreground">Usuários Inativos</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Usuarios;