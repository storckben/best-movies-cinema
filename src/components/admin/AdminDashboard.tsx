import { Film, DollarSign, Eye, TrendingUp, Plus, RefreshCw, Target, ShieldAlert, ShieldOff } from 'lucide-react';
import MarketingROIModal from './MarketingROIModal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useState } from 'react';
import { getMovies } from '@/lib/movieStore';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface Order {
  id: string;
  movie_title: string;
  amount: number;
  gateway: string;
  status: string;
  created_at: string;
}

const quickActions = [
  { label: 'Novo Filme', icon: Plus, action: 'new_movie' },
  { label: 'Atualizar Dados', icon: RefreshCw, action: 'refresh' },
  { label: 'Análise de Performance', icon: Target, action: 'marketing' },
];

interface AdminDashboardProps {
  onNavigate: (page: 'filmes') => void;
  onNewMovie: () => void;
}

interface VisitStats {
  totalVisits: number;
  weeklyVisits: number;
  chartData: { date: string; acessos: number }[];
  topMovie: { title: string; count: number } | null;
}

export default function AdminDashboard({ onNavigate, onNewMovie }: AdminDashboardProps) {
  const [movieCount, setMovieCount] = useState(0);
  const [visitStats, setVisitStats] = useState<VisitStats | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [weeklyTotal, setWeeklyTotal] = useState(0);
  const [marketingOpen, setMarketingOpen] = useState(false);
  const [maintenanceEnabled, setMaintenanceEnabled] = useState(false);
  const [maintenanceMsg, setMaintenanceMsg] = useState('');
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [showDisableModal, setShowDisableModal] = useState(false);
  const [maintenanceMsgInput, setMaintenanceMsgInput] = useState('Estamos em manutenção. Voltaremos em breve!');
  const [maintenanceLoading, setMaintenanceLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    getMovies().then((m) => setMovieCount(m.length));
    fetchVisitStats();
    fetchOrders();
    fetchMaintenanceStatus();
  }, []);

  const fetchVisitStats = async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/track-visits?action=dashboard`);
      if (res.ok) {
        const data = await res.json();
        setVisitStats(data);
      }
    } catch {}
  };

  const fetchOrders = async () => {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    const allOrders = (data as Order[]) || [];
    setOrders(allOrders);

    // Weekly stats
    const weeklyOrders = allOrders.filter(o => new Date(o.created_at) >= weekAgo);
    const paidOnly = weeklyOrders.filter(o => o.status === 'paid');
    const total = paidOnly.reduce((s, o) => s + Number(o.amount), 0);
    setWeeklyTotal(total);
  };

  const statusColors: Record<string, string> = {
    paid: 'text-green-400 bg-green-400/10',
    pending: 'text-yellow-400 bg-yellow-400/10',
    expired: 'text-red-400 bg-red-400/10',
    refunded: 'text-blue-400 bg-blue-400/10',
  };

  const statusLabels: Record<string, string> = {
    paid: 'Pago',
    pending: 'Pendente',
    expired: 'Expirado',
    refunded: 'Reembolsado',
  };

  const fetchMaintenanceStatus = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'maintenance_mode')
      .single();
    if (data?.value) {
      const val = data.value as any;
      setMaintenanceEnabled(!!val.enabled);
      setMaintenanceMsg(val.message || '');
    }
  };

  const handleEnableMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const adminPassword = sessionStorage.getItem('admin_password') || '';
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/manage-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ action: 'set', key: 'maintenance_mode', value: { enabled: true, message: maintenanceMsgInput } }),
      });
      setMaintenanceEnabled(true);
      setMaintenanceMsg(maintenanceMsgInput);
      setShowMaintenanceModal(false);
      toast({ title: 'Modo de manutenção ativado' });
    } catch {
      toast({ title: 'Erro ao ativar manutenção', variant: 'destructive' });
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleDisableMaintenance = async () => {
    setMaintenanceLoading(true);
    try {
      const adminPassword = sessionStorage.getItem('admin_password') || '';
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      await fetch(`https://${projectId}.supabase.co/functions/v1/manage-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': adminPassword },
        body: JSON.stringify({ action: 'set', key: 'maintenance_mode', value: { enabled: false, message: maintenanceMsg } }),
      });
      setMaintenanceEnabled(false);
      setShowDisableModal(false);
      toast({ title: 'Modo de manutenção desativado' });
    } catch {
      toast({ title: 'Erro ao desativar manutenção', variant: 'destructive' });
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleQuickAction = (action: string) => {
    if (action === 'new_movie') onNewMovie();
    if (action === 'refresh') window.location.reload();
    if (action === 'marketing') setMarketingOpen(true);
    if (action === 'maintenance') {
      if (maintenanceEnabled) {
        setShowDisableModal(true);
      } else {
        setShowMaintenanceModal(true);
      }
    }
  };

  const chartData = visitStats?.chartData || [
    { date: 'Dom', acessos: 0 },
    { date: 'Seg', acessos: 0 },
    { date: 'Ter', acessos: 0 },
    { date: 'Qua', acessos: 0 },
    { date: 'Qui', acessos: 0 },
    { date: 'Sex', acessos: 0 },
    { date: 'Sáb', acessos: 0 },
  ];

  const recentPayments = orders.slice(0, 5);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }) + ' ' +
      date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Visão geral semanal do seu cinema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Filmes Cadastrados</p>
                <p className="text-3xl font-bold text-foreground mt-1">{movieCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Film className="h-5 w-5 text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Pago (Semana)</p>
                <p className="text-3xl font-bold text-foreground mt-1">R$ {weeklyTotal.toFixed(2)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Visitas na Semana</p>
                <p className="text-3xl font-bold text-foreground mt-1">{visitStats?.weeklyVisits ?? '...'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Total: {visitStats?.totalVisits ?? '...'}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Eye className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Filme + Visitado</p>
                <p className="text-lg font-bold text-foreground mt-1">{visitStats?.topMovie?.title ?? '—'}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{visitStats?.topMovie ? `${visitStats.topMovie.count} visitas` : 'Sem dados'}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-semibold text-foreground">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {quickActions.map((qa) => (
              <button
                key={qa.action}
                onClick={() => handleQuickAction(qa.action)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-secondary text-secondary-foreground text-sm font-medium hover:bg-accent transition-colors"
              >
                <qa.icon className="h-4 w-4" />
                {qa.label}
              </button>
            ))}
            <button
              onClick={() => handleQuickAction('maintenance')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                maintenanceEnabled
                  ? 'bg-destructive/10 text-destructive hover:bg-destructive/20'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {maintenanceEnabled ? <ShieldOff className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
              {maintenanceEnabled ? 'Desabilitar Manutenção' : 'Habilitar Manutenção'}
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Chart + Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Acessos da Semana</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line type="monotone" dataKey="acessos" stroke="#3b82f6" strokeWidth={2} name="Acessos" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">Últimos Pagamentos</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {recentPayments.length === 0 ? (
                <p className="px-5 py-6 text-sm text-muted-foreground text-center">Nenhum pagamento registrado</p>
              ) : recentPayments.map((p) => (
                <div key={p.id} className="px-5 py-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{p.movie_title}</p>
                    <p className="text-xs text-muted-foreground">{p.gateway} · {formatDate(p.created_at)}</p>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-sm font-semibold text-foreground">R$ {Number(p.amount).toFixed(2)}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded ${statusColors[p.status] || ''}`}>
                      {statusLabels[p.status] || p.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enable Maintenance Modal */}
      <Dialog open={showMaintenanceModal} onOpenChange={setShowMaintenanceModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ativar Modo de Manutenção</DialogTitle>
            <DialogDescription>O site ficará inacessível para os visitantes enquanto o modo de manutenção estiver ativo.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">Mensagem informativa</label>
            <Textarea
              value={maintenanceMsgInput}
              onChange={(e) => setMaintenanceMsgInput(e.target.value)}
              placeholder="Ex: Estamos em manutenção programada..."
              rows={3}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowMaintenanceModal(false)}>Cancelar</Button>
            <Button onClick={handleEnableMaintenance} disabled={maintenanceLoading || !maintenanceMsgInput.trim()} variant="destructive">
              {maintenanceLoading ? 'Ativando...' : 'Ativar Manutenção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Disable Maintenance Modal */}
      <Dialog open={showDisableModal} onOpenChange={setShowDisableModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar Modo de Manutenção</DialogTitle>
            <DialogDescription>O site voltará a ficar acessível para todos os visitantes.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDisableModal(false)}>Cancelar</Button>
            <Button onClick={handleDisableMaintenance} disabled={maintenanceLoading}>
              {maintenanceLoading ? 'Desativando...' : 'Desativar Manutenção'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MarketingROIModal open={marketingOpen} onClose={() => setMarketingOpen(false)} />
    </div>
  );
}
