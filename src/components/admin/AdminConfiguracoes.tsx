import { useState, useEffect } from 'react';
import { Save, Copy, Check } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

const MANAGE_SETTINGS_URL = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/manage-settings`;

interface GatewayKeys {
  public_key: string;
  secret_key: string;
}

interface GatewayConfigValue {
  active_gateway: string;
  gestaopay: GatewayKeys;
  syncpay: GatewayKeys;
}

interface SmtpConfig {
  host: string;
  port: string;
  from_email: string;
  user: string;
  pass: string;
  encryption: string;
}

interface TicketPricesState {
  normal: string;
  half: string;
  vip: string;
  vip_half: string;
}

export default function AdminConfiguracoes() {
  const { toast } = useToast();
  const [activeGateway, setActiveGateway] = useState('');
  const [gestaopayKeys, setGestaopayKeys] = useState<GatewayKeys>({ public_key: '', secret_key: '' });
  const [syncpayKeys, setSyncpayKeys] = useState<GatewayKeys>({ public_key: '', secret_key: '' });
  const [loadingGateway, setLoadingGateway] = useState(false);
  const [copied, setCopied] = useState(false);
  const [smtp, setSmtp] = useState<SmtpConfig>({ host: '', port: '587', from_email: '', user: '', pass: '', encryption: 'tls' });
  const [loadingSmtp, setLoadingSmtp] = useState(false);
  const [ticketPrices, setTicketPrices] = useState<TicketPricesState>({ normal: '28.00', half: '14.00', vip: '42.00', vip_half: '21.00' });
  const [loadingPrices, setLoadingPrices] = useState(false);

  const webhookUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/payment-webhook`;

  useEffect(() => {
    loadGatewayConfig();
    loadSmtpConfig();
    loadTicketPrices();
  }, []);

  const loadTicketPrices = async () => {
    try {
      const res = await fetch(MANAGE_SETTINGS_URL);
      if (res.ok) {
        const data = await res.json();
        const setting = Array.isArray(data) ? data.find((s: any) => s.key === 'ticket_prices') : null;
        if (setting?.value) {
          const v = setting.value as any;
          setTicketPrices({
            normal: String(v.normal ?? '28.00'),
            half: String(v.half ?? '14.00'),
            vip: String(v.vip ?? '42.00'),
            vip_half: String(v.vip_half ?? '21.00'),
          });
        }
      }
    } catch (e) {
      console.error('Failed to load ticket prices:', e);
    }
  };

  const saveTicketPrices = async () => {
    setLoadingPrices(true);
    try {
      const adminPassword = sessionStorage.getItem('admin_password') || '';
      const res = await fetch(MANAGE_SETTINGS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({
          key: 'ticket_prices',
          value: {
            normal: parseFloat(ticketPrices.normal) || 28,
            half: parseFloat(ticketPrices.half) || 14,
            vip: parseFloat(ticketPrices.vip) || 42,
            vip_half: parseFloat(ticketPrices.vip_half) || 21,
          },
        }),
      });
      if (res.ok) {
        toast({ title: 'Preços salvos com sucesso!' });
      } else {
        toast({ title: 'Erro ao salvar preços', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro ao salvar preços', variant: 'destructive' });
    } finally {
      setLoadingPrices(false);
    }
  };

  const loadSmtpConfig = async () => {
    try {
      const res = await fetch(MANAGE_SETTINGS_URL);
      if (res.ok) {
        const data = await res.json();
        const setting = Array.isArray(data) ? data.find((s: any) => s.key === 'smtp_config') : null;
        if (setting?.value) {
          const val = setting.value as any;
          setSmtp({
            host: val.host || '',
            port: val.port || '587',
            from_email: val.from_email || '',
            user: val.user || '',
            pass: val.pass || '',
            encryption: val.encryption || 'tls',
          });
        }
      }
    } catch {}
  };

  const saveSmtpConfig = async () => {
    setLoadingSmtp(true);
    try {
      const adminPass = sessionStorage.getItem('admin_password') || '';
      const res = await fetch(MANAGE_SETTINGS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPass,
        },
        body: JSON.stringify({ key: 'smtp_config', value: smtp }),
      });
      if (res.ok) {
        toast({ title: 'Configuração SMTP salva com sucesso!' });
      } else {
        toast({ title: 'Erro ao salvar SMTP', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro ao salvar SMTP', variant: 'destructive' });
    } finally {
      setLoadingSmtp(false);
    }
  };

  const loadGatewayConfig = async () => {
    try {
      const res = await fetch(MANAGE_SETTINGS_URL);
      if (res.ok) {
        const data = await res.json();
        const setting = Array.isArray(data) ? data.find((s: any) => s.key === 'gateway_config') : null;
        if (setting?.value) {
          const val = setting.value as any;
          // Support new format
          if (val.active_gateway) {
            setActiveGateway(val.active_gateway || '');
            setGestaopayKeys(val.gestaopay || { public_key: '', secret_key: '' });
            setSyncpayKeys(val.syncpay || { public_key: '', secret_key: '' });
          } else {
            // Legacy format migration
            setActiveGateway(val.gateway || '');
            if (val.gateway === 'gestaopay') {
              setGestaopayKeys({ public_key: val.public_key || '', secret_key: val.secret_key || '' });
            } else if (val.gateway === 'syncpay') {
              setSyncpayKeys({ public_key: val.public_key || '', secret_key: val.secret_key || '' });
            }
          }
        }
      }
    } catch {}
  };

  const saveGatewayConfig = async () => {
    setLoadingGateway(true);
    try {
      const adminPass = sessionStorage.getItem('admin_password') || '';
      const payload: GatewayConfigValue = {
        active_gateway: activeGateway,
        gestaopay: gestaopayKeys,
        syncpay: syncpayKeys,
      };
      const res = await fetch(MANAGE_SETTINGS_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPass,
        },
        body: JSON.stringify({ key: 'gateway_config', value: payload }),
      });
      if (res.ok) {
        toast({ title: 'Gateway salva com sucesso!' });
      } else {
        toast({ title: 'Erro ao salvar', variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Erro ao salvar', variant: 'destructive' });
    } finally {
      setLoadingGateway(false);
    }
  };

  const copyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Configurações</h1>
        <p className="text-sm text-muted-foreground">Configurações gerais do sistema</p>
      </div>

      <Tabs defaultValue="precos" className="max-w-2xl">
        <TabsList className="mb-6">
          <TabsTrigger value="precos">Preços</TabsTrigger>
          <TabsTrigger value="gateway">Gateway</TabsTrigger>
          <TabsTrigger value="email">Email (SMTP)</TabsTrigger>
          <TabsTrigger value="seguranca">Segurança</TabsTrigger>
        </TabsList>

        <TabsContent value="precos">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Preços dos Ingressos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Inteira</Label>
                  <Input type="number" value={ticketPrices.normal} step="0.10" className="mt-1"
                    onChange={e => setTicketPrices(p => ({ ...p, normal: e.target.value }))} />
                </div>
                <div>
                  <Label>Meia-entrada</Label>
                  <Input type="number" value={ticketPrices.half} step="0.10" className="mt-1"
                    onChange={e => setTicketPrices(p => ({ ...p, half: e.target.value }))} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Poltrona VIP</Label>
                  <Input type="number" value={ticketPrices.vip} step="0.10" className="mt-1"
                    onChange={e => setTicketPrices(p => ({ ...p, vip: e.target.value }))} />
                </div>
                <div>
                  <Label>VIP Meia</Label>
                  <Input type="number" value={ticketPrices.vip_half} step="0.10" className="mt-1"
                    onChange={e => setTicketPrices(p => ({ ...p, vip_half: e.target.value }))} />
                </div>
              </div>
            </CardContent>
          </Card>
          <button
            onClick={saveTicketPrices}
            disabled={loadingPrices}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-4 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {loadingPrices ? 'Salvando...' : 'Salvar Preços'}
          </button>
        </TabsContent>

        <TabsContent value="gateway">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Gateway de Pagamento</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Gateway Ativa</Label>
                <Select value={activeGateway} onValueChange={setActiveGateway}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione a gateway ativa" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestaopay">GestãoPay</SelectItem>
                    <SelectItem value="syncpay">Syncpay</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground mt-1">Essa é a gateway que será usada nas transações. Você pode cadastrar as chaves de ambas abaixo.</p>
              </div>

              {/* Webhook */}
              <div>
                <Label>Webhook URL</Label>
                <div className="flex gap-2 mt-1">
                  <Input type="text" value={webhookUrl} readOnly className="flex-1 text-xs" />
                  <button
                    onClick={copyWebhook}
                    className="shrink-0 flex items-center gap-1 rounded-md bg-secondary px-3 py-2 text-xs font-medium text-secondary-foreground hover:bg-accent transition-colors"
                  >
                    {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                    {copied ? 'Copiado' : 'Copiar'}
                  </button>
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Cole essa URL no painel de ambas as gateways.</p>
              </div>
            </CardContent>
          </Card>

          {/* GestãoPay keys */}
          <Card className="bg-card border-border mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">GestãoPay</CardTitle>
                {activeGateway === 'gestaopay' && (
                  <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded">Ativa</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                Utiliza <strong>Basic Auth</strong> (Public Key + Secret Key). Credenciais em <em>Painel → Credenciais API</em>.
              </div>
              <div>
                <Label>Public Key</Label>
                <Input
                  type="password"
                  value={gestaopayKeys.public_key}
                  onChange={e => setGestaopayKeys(prev => ({ ...prev, public_key: e.target.value }))}
                  placeholder="pk_..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={gestaopayKeys.secret_key}
                  onChange={e => setGestaopayKeys(prev => ({ ...prev, secret_key: e.target.value }))}
                  placeholder="sk_..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Syncpay keys */}
          <Card className="bg-card border-border mt-4">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Syncpay</CardTitle>
                {activeGateway === 'syncpay' && (
                  <span className="text-xs font-semibold bg-primary/20 text-primary px-2 py-0.5 rounded">Ativa</span>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                Utiliza <strong>Bearer Token</strong> (Secret Key). Encontre sua chave no painel da Syncpay.
              </div>
              <div>
                <Label>API Key</Label>
                <Input
                  type="password"
                  value={syncpayKeys.public_key}
                  onChange={e => setSyncpayKeys(prev => ({ ...prev, public_key: e.target.value }))}
                  placeholder="Chave da API"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Secret Key</Label>
                <Input
                  type="password"
                  value={syncpayKeys.secret_key}
                  onChange={e => setSyncpayKeys(prev => ({ ...prev, secret_key: e.target.value }))}
                  placeholder="sk_..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          <button
            onClick={saveGatewayConfig}
            disabled={loadingGateway || !activeGateway}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-4 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {loadingGateway ? 'Salvando...' : 'Salvar Gateway'}
          </button>
        </TabsContent>

        <TabsContent value="email">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Configuração SMTP</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md bg-muted/50 p-3 text-xs text-muted-foreground">
                Configure o servidor SMTP para enviar emails de pagamento pendente e confirmação de compra aos clientes.
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Host SMTP</Label>
                  <Input type="text" placeholder="smtp.exemplo.com" className="mt-1" value={smtp.host} onChange={e => setSmtp(prev => ({ ...prev, host: e.target.value }))} />
                </div>
                <div>
                  <Label>Porta</Label>
                  <Input type="number" placeholder="587" className="mt-1" value={smtp.port} onChange={e => setSmtp(prev => ({ ...prev, port: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Email de Envio</Label>
                <Input type="email" placeholder="noreply@seucinema.com" className="mt-1" value={smtp.from_email} onChange={e => setSmtp(prev => ({ ...prev, from_email: e.target.value }))} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Usuário</Label>
                  <Input type="text" placeholder="Usuário SMTP" className="mt-1" value={smtp.user} onChange={e => setSmtp(prev => ({ ...prev, user: e.target.value }))} />
                </div>
                <div>
                  <Label>Senha</Label>
                  <Input type="password" placeholder="Senha SMTP" className="mt-1" value={smtp.pass} onChange={e => setSmtp(prev => ({ ...prev, pass: e.target.value }))} />
                </div>
              </div>
              <div>
                <Label>Criptografia</Label>
                <Select value={smtp.encryption} onValueChange={v => setSmtp(prev => ({ ...prev, encryption: v }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="tls">TLS</SelectItem>
                    <SelectItem value="ssl">SSL</SelectItem>
                    <SelectItem value="none">Nenhuma</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
          <button
            onClick={saveSmtpConfig}
            disabled={loadingSmtp}
            className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-4 disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {loadingSmtp ? 'Salvando...' : 'Salvar Email'}
          </button>
        </TabsContent>

        <TabsContent value="seguranca">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-base">Segurança</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Alterar Senha Mestra</Label>
                <Input type="password" placeholder="Nova senha" className="mt-1" />
              </div>
            </CardContent>
          </Card>
          <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors mt-4">
            <Save className="h-4 w-4" /> Salvar Senha
          </button>
        </TabsContent>
      </Tabs>
    </div>
  );
}
