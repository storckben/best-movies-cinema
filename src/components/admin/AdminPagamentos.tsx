import { useState, useEffect } from 'react';
import { Search, RefreshCw, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Order {
  id: string;
  transaction_id: string | null;
  gateway: string;
  status: string;
  amount: number;
  movie_title: string;
  seats: string | null;
  customer_name: string;
  customer_email: string;
  created_at: string;
  paid_at: string | null;
}

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

export default function AdminPagamentos() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [balances, setBalances] = useState<Record<string, any>>({ gestaopay: null, syncpay: null });
  const [loadingBalance, setLoadingBalance] = useState(false);

  const fetchOrders = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    setOrders((data as Order[]) || []);
    setLoading(false);
  };

  const fetchBalances = async () => {
    setLoadingBalance(true);
    try {
      const adminPass = sessionStorage.getItem('admin_password') || '';
      const res = await fetch(
        `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/gateway-balance`,
        { headers: { 'x-admin-password': adminPass } }
      );
      if (res.ok) {
        setBalances(await res.json());
      }
    } catch {}
    setLoadingBalance(false);
  };

  useEffect(() => { fetchOrders(); fetchBalances(); }, []);

  const filtered = orders.filter(o =>
    !search || 
    o.movie_title.toLowerCase().includes(search.toLowerCase()) ||
    o.customer_name.toLowerCase().includes(search.toLowerCase()) ||
    o.transaction_id?.toLowerCase().includes(search.toLowerCase())
  );

  const totalPaid = orders.filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.amount), 0);
  const totalPending = orders.filter(o => o.status === 'pending').reduce((s, o) => s + Number(o.amount), 0);

  const formatDate = (d: string) => {
    const date = new Date(d);
    return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Pagamentos</h1>
          <p className="text-sm text-muted-foreground">Histórico de transações PIX</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground hover:bg-accent transition-colors">
          <RefreshCw className="h-4 w-4" /> Atualizar
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Recebido</p>
            <p className="text-2xl font-bold text-green-400 mt-1">R$ {totalPaid.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-400 mt-1">R$ {totalPending.toFixed(2)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total de Pedidos</p>
            <p className="text-2xl font-bold text-foreground mt-1">{orders.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Gateway Balances */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo GestãoPay</p>
            </div>
            {loadingBalance ? (
              <p className="text-sm text-muted-foreground">Consultando...</p>
            ) : balances.gestaopay?.balance != null ? (
              <p className="text-xl font-bold text-foreground">R$ {parseFloat(balances.gestaopay.balance).toFixed(2)}</p>
            ) : balances.gestaopay?.error ? (
              <p className="text-sm text-muted-foreground">Indisponível ({balances.gestaopay.error})</p>
            ) : (
              <p className="text-sm text-muted-foreground">Chaves não configuradas</p>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <p className="text-xs text-muted-foreground uppercase tracking-wider">Saldo Syncpay</p>
            </div>
            {loadingBalance ? (
              <p className="text-sm text-muted-foreground">Consultando...</p>
            ) : balances.syncpay?.balance != null ? (
              <p className="text-xl font-bold text-foreground">R$ {parseFloat(balances.syncpay.balance).toFixed(2)}</p>
            ) : balances.syncpay?.error ? (
              <p className="text-sm text-muted-foreground">Indisponível ({balances.syncpay.error})</p>
            ) : (
              <p className="text-sm text-muted-foreground">Chaves não configuradas</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por filme, cliente ou ID..."
            className="w-full rounded-md border border-border bg-card pl-9 pr-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Filme</th>
              <th className="px-4 py-3 hidden md:table-cell">Cliente</th>
              <th className="px-4 py-3">Valor</th>
              <th className="px-4 py-3 hidden sm:table-cell">Gateway</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 hidden lg:table-cell">Data</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Carregando...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum pagamento encontrado</td></tr>
            ) : filtered.map(o => (
              <tr key={o.id} className="hover:bg-card/50 transition-colors">
                <td className="px-4 py-3">
                  <p className="text-sm font-medium text-foreground">{o.movie_title}</p>
                  <p className="text-xs text-muted-foreground md:hidden">{o.customer_name}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <p className="text-sm text-foreground">{o.customer_name}</p>
                  <p className="text-xs text-muted-foreground">{o.customer_email}</p>
                </td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">R$ {Number(o.amount).toFixed(2)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell capitalize">{o.gateway}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded ${statusColors[o.status] || ''}`}>
                    {statusLabels[o.status] || o.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden lg:table-cell">
                  {formatDate(o.created_at)}
                  {o.paid_at && <p className="text-green-400">Pago: {formatDate(o.paid_at)}</p>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
