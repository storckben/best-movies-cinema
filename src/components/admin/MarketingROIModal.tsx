import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, TrendingUp, DollarSign, Users, Target, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Card, CardContent } from '@/components/ui/card';

interface CampaignResult {
  totalOrders: number;
  paidOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  paidRevenue: number;
  investment: number;
  roi: number;
  roas: number;
  cpa: number;
  cpl: number;
  conversionRate: number;
  averageTicket: number;
  profit: number;
}

interface MarketingROIModalProps {
  open: boolean;
  onClose: () => void;
}

export default function MarketingROIModal({ open, onClose }: MarketingROIModalProps) {
  const [investment, setInvestment] = useState('');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CampaignResult | null>(null);

  const handleProcess = async () => {
    if (!investment || !startDate || !endDate) return;

    setLoading(true);
    setResult(null);

    try {
      const inv = parseFloat(investment);
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');

      // End date should include the full day
      const { data } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', `${start}T00:00:00`)
        .lte('created_at', `${end}T23:59:59`)
        .order('created_at', { ascending: false });

      const orders = data || [];
      const totalOrders = orders.length;
      const paidOrders = orders.filter(o => o.status === 'paid').length;
      const pendingOrders = orders.filter(o => o.status === 'pending').length;
      const totalRevenue = orders.reduce((s, o) => s + Number(o.amount), 0);
      const paidRevenue = orders.filter(o => o.status === 'paid').reduce((s, o) => s + Number(o.amount), 0);

      const profit = paidRevenue - inv;
      const roi = inv > 0 ? ((profit / inv) * 100) : 0;
      const roas = inv > 0 ? (paidRevenue / inv) : 0;
      const cpa = paidOrders > 0 ? (inv / paidOrders) : 0;
      const cpl = totalOrders > 0 ? (inv / totalOrders) : 0;
      const conversionRate = totalOrders > 0 ? ((paidOrders / totalOrders) * 100) : 0;
      const averageTicket = paidOrders > 0 ? (paidRevenue / paidOrders) : 0;

      setResult({
        totalOrders,
        paidOrders,
        pendingOrders,
        totalRevenue,
        paidRevenue,
        investment: inv,
        roi,
        roas,
        cpa,
        cpl,
        conversionRate,
        averageTicket,
        profit,
      });
    } catch (err) {
      console.error('Error processing campaign:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setResult(null);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Análise de Performance
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Inputs */}
          <div>
            <Label>Investimento na Campanha (R$)</Label>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={investment}
              onChange={e => setInvestment(e.target.value)}
              placeholder="Ex: 500.00"
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal mt-1',
                      !startDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'dd/MM/yyyy') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <Label>Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal mt-1',
                      !endDate && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'dd/MM/yyyy') : 'Selecionar'}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    locale={ptBR}
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          <Button
            onClick={handleProcess}
            disabled={loading || !investment || !startDate || !endDate}
            className="w-full"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <TrendingUp className="h-4 w-4 mr-2" />}
            {loading ? 'Processando...' : 'Processar Análise'}
          </Button>

          {/* Results */}
          {result && (
            <div className="space-y-4 pt-2 border-t border-border">
              <h3 className="text-sm font-semibold text-foreground">Resultados da Campanha</h3>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-3">
                <Card className={cn("border", result.roi >= 0 ? "border-green-500/30" : "border-red-500/30")}>
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ROI</p>
                    <p className={cn("text-xl font-bold", result.roi >= 0 ? "text-green-400" : "text-red-400")}>
                      {result.roi.toFixed(1)}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">ROAS</p>
                    <p className="text-xl font-bold text-foreground">{result.roas.toFixed(2)}x</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPA</p>
                    <p className="text-xl font-bold text-foreground">R$ {result.cpa.toFixed(2)}</p>
                  </CardContent>
                </Card>
                <Card className="border-border">
                  <CardContent className="p-3 text-center">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground">CPL</p>
                    <p className="text-xl font-bold text-foreground">R$ {result.cpl.toFixed(2)}</p>
                  </CardContent>
                </Card>
              </div>

              {/* Detailed Stats */}
              <div className="rounded-lg border border-border divide-y divide-border text-sm">
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Pedidos Gerados</span>
                  <span className="font-semibold text-foreground">{result.totalOrders}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Pedidos Pagos</span>
                  <span className="font-semibold text-green-400">{result.paidOrders}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Pedidos Pendentes</span>
                  <span className="font-semibold text-yellow-400">{result.pendingOrders}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Taxa de Conversão</span>
                  <span className="font-semibold text-foreground">{result.conversionRate.toFixed(1)}%</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Ticket Médio</span>
                  <span className="font-semibold text-foreground">R$ {result.averageTicket.toFixed(2)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Receita Total (Paga)</span>
                  <span className="font-semibold text-green-400">R$ {result.paidRevenue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Investimento</span>
                  <span className="font-semibold text-foreground">R$ {result.investment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-muted-foreground">Lucro Líquido</span>
                  <span className={cn("font-semibold", result.profit >= 0 ? "text-green-400" : "text-red-400")}>
                    R$ {result.profit.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
