import { useState, useMemo, useEffect, useCallback } from 'react';
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShoppingCart, Ticket, User, QrCode, Copy, Loader2, Clock } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import SeatMap, { Seat, getSeatPrice, getSeatHalfPrice, TicketPrices, DEFAULT_PRICES } from './SeatMap';
import type { Movie, MovieSession } from '@/lib/movieStore';
import { cn } from '@/lib/utils';

interface BookingFlowProps {
  movie: Movie;
  session: MovieSession;
  date: string;
  onClose: () => void;
}

interface ComboItem {
  id: string;
  name: string;
  description: string;
  price: number;
  emoji: string;
}

const combos: ComboItem[] = [
  { id: 'c1', name: 'Combo Individual', description: 'Pipoca Média + Refrigerante 500ml', price: 34.90, emoji: '🍿🥤' },
  { id: 'c2', name: 'Combo Casal', description: 'Pipoca Grande + 2 Refrigerantes 500ml', price: 59.90, emoji: '🍿🥤🥤' },
  { id: 'c3', name: 'Combo Família', description: 'Pipoca Mega + 4 Refrigerantes + Chocolate', price: 89.90, emoji: '🍿🥤🥤🥤🥤' },
  { id: 'c4', name: 'Nachos com Queijo', description: 'Nachos crocantes + molho cheddar', price: 24.90, emoji: '🧀' },
  { id: 'c5', name: 'Água Mineral 500ml', description: 'Água mineral sem gás', price: 8.90, emoji: '💧' },
  { id: 'c6', name: 'Chocolate M&Ms', description: 'Pacote de M&Ms 100g', price: 14.90, emoji: '🍫' },
];

type Step = 'tickets' | 'seats' | 'combos' | 'checkout' | 'pix';
const STEPS: Step[] = ['tickets', 'seats', 'combos', 'checkout', 'pix'];
const STEP_LABELS: Record<Step, string> = {
  tickets: 'Ingressos',
  seats: 'Poltronas',
  combos: 'Bomboniere',
  checkout: 'Dados',
  pix: 'Pagamento',
};

export default function BookingFlow({ movie, session, date, onClose }: BookingFlowProps) {
  const { toast } = useToast();
  const [step, setStep] = useState<Step>('tickets');
  const [ticketCount, setTicketCount] = useState(1);
  const [halfTickets, setHalfTickets] = useState(0);
  const [selectedSeats, setSelectedSeats] = useState<Seat[]>([]);
  const [comboQty, setComboQty] = useState<Record<string, number>>({});
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [pixLoading, setPixLoading] = useState(false);
  const [pixData, setPixData] = useState<{ qr_code: string; qr_code_text: string; transaction_id: string; expiration_date?: string } | null>(null);
  const [pixCopied, setPixCopied] = useState(false);
  const [pixTimeLeft, setPixTimeLeft] = useState(600); // 10 minutes in seconds
  const [pixExpired, setPixExpired] = useState(false);
  const [prices, setPrices] = useState<TicketPrices>(DEFAULT_PRICES);

  // Load ticket prices from database
  useEffect(() => {
    const loadPrices = async () => {
      try {
        const url = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/manage-settings`;
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          const setting = Array.isArray(data) ? data.find((s: any) => s.key === 'ticket_prices') : null;
          if (setting?.value) {
            const v = setting.value as any;
            setPrices({
              normal: Number(v.normal) || DEFAULT_PRICES.normal,
              half: Number(v.half) || DEFAULT_PRICES.half,
              vip: Number(v.vip) || DEFAULT_PRICES.vip,
              vip_half: Number(v.vip_half) || DEFAULT_PRICES.vip_half,
            });
          }
        }
      } catch (e) {
        console.error('Failed to load ticket prices:', e);
      }
    };
    loadPrices();
  }, []);
  // Countdown timer for PIX payment (always 10 minutes)
  useEffect(() => {
    if (step !== 'pix' || !pixData || pixLoading || pixExpired) return;

    setPixTimeLeft(600);

    const interval = setInterval(() => {
      setPixTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          setPixExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [step, pixData, pixLoading]);

  const formatCountdown = useCallback((secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }, []);

  const currentStepIdx = STEPS.indexOf(step);

  const ticketTotal = useMemo(() => {
    if (selectedSeats.length > 0) {
      const fullCount = ticketCount - halfTickets;
      let total = 0;
      selectedSeats.forEach((seat, i) => {
        if (i < fullCount) {
          total += getSeatPrice(seat.type, prices);
        } else {
          total += getSeatHalfPrice(seat.type, prices);
        }
      });
      return total;
    }
    return ticketCount * prices.normal - halfTickets * (prices.normal - prices.half);
  }, [ticketCount, halfTickets, selectedSeats, prices]);

  const comboTotal = useMemo(() => {
    return Object.entries(comboQty).reduce((sum, [id, qty]) => {
      const item = combos.find(c => c.id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  }, [comboQty]);

  const grandTotal = ticketTotal + comboTotal;

  const formatCPF = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const canProceed = () => {
    switch (step) {
      case 'tickets': return ticketCount > 0;
      case 'seats': return selectedSeats.length === ticketCount;
      case 'combos': return true;
      case 'checkout': return name.trim() && email.trim() && cpf.replace(/\D/g, '').length === 11;
    }
  };

  const handleNext = async () => {
    if (step === 'checkout') {
      // Process PIX payment
      setPixLoading(true);
      setStep('pix');
      try {
        const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
        const res = await fetch(`https://${projectId}.supabase.co/functions/v1/process-payment`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: grandTotal,
            customer_name: name,
            customer_email: email,
            customer_cpf: cpf,
            movie_title: movie.title,
            seats: selectedSeats.map(s => `${s.row}${s.number}`).join(', '),
            description: `${movie.title} - ${date} ${session.time}`,
          }),
        });
        const data = await res.json();
        if (data.error) {
          toast({ title: 'Erro no pagamento', description: data.error, variant: 'destructive' });
          setStep('checkout');
        } else {
          setPixData(data);
        }
      } catch {
        toast({ title: 'Erro ao processar pagamento', variant: 'destructive' });
        setStep('checkout');
      } finally {
        setPixLoading(false);
      }
      return;
    }
    if (step === 'pix') {
      toast({
        title: '🎬 Compra realizada!',
        description: `Seus ingressos foram enviados para ${email}. Aproveite o filme!`,
      });
      onClose();
      return;
    }
    setStep(STEPS[currentStepIdx + 1]);
  };

  const handleBack = () => {
    if (currentStepIdx === 0) { onClose(); return; }
    setStep(STEPS[currentStepIdx - 1]);
  };

  const dateFormatted = new Date(date + 'T12:00:00').toLocaleDateString('pt-BR', {
    weekday: 'long', day: '2-digit', month: 'long',
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="bg-card border-b border-border">
        <div className="container py-3 flex items-center justify-between">
          <button onClick={handleBack} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </button>
          <div className="text-center">
            <p className="text-sm font-bold text-foreground">{movie.title}</p>
            <p className="text-xs text-muted-foreground">{dateFormatted} · {session.time} · {session.room} · {session.type}</p>
          </div>
          <div className="w-16" />
        </div>
      </div>

      {/* Step indicator */}
      <div className="container py-4">
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                i < currentStepIdx && "bg-primary/20 text-primary",
                i === currentStepIdx && "bg-primary text-primary-foreground",
                i > currentStepIdx && "bg-secondary text-muted-foreground",
              )}>
                {i < currentStepIdx ? <Check className="h-3 w-3" /> : <span>{i + 1}</span>}
                <span className="hidden sm:inline">{STEP_LABELS[s]}</span>
              </div>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-border" />}
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="container pb-32">
        {step === 'tickets' && (
          <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-lg font-black text-foreground">Quantos ingressos?</h2>

            <div className="rounded-lg bg-card border border-border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Inteira</p>
                  <p className="text-xs text-muted-foreground">A partir de R$ 28,00</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => { setTicketCount(Math.max(1, ticketCount - 1)); setHalfTickets(Math.min(halfTickets, Math.max(0, ticketCount - 2))); }}
                    className="w-8 h-8 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold text-foreground w-6 text-center">{ticketCount}</span>
                  <button
                    onClick={() => setTicketCount(Math.min(10, ticketCount + 1))}
                    className="w-8 h-8 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="border-t border-border pt-4 flex items-center justify-between">
                <div>
                  <p className="font-bold text-foreground">Meia-entrada</p>
                  <p className="text-xs text-muted-foreground">Estudante, idoso, etc.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setHalfTickets(Math.max(0, halfTickets - 1))}
                    className="w-8 h-8 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <span className="text-lg font-bold text-foreground w-6 text-center">{halfTickets}</span>
                  <button
                    onClick={() => setHalfTickets(Math.min(ticketCount, halfTickets + 1))}
                    className="w-8 h-8 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-primary/20 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {ticketCount - halfTickets} inteira(s) + {halfTickets} meia(s)
            </p>
          </div>
        )}

        {step === 'seats' && (
          <div className="max-w-xl mx-auto space-y-4">
            <h2 className="text-lg font-black text-foreground text-center">
              Selecione {ticketCount} poltrona{ticketCount > 1 ? 's' : ''}
            </h2>
            <p className="text-xs text-muted-foreground text-center">
              {selectedSeats.length} de {ticketCount} selecionada{ticketCount > 1 ? 's' : ''}
              {selectedSeats.some(s => s.type === 'premium') && (
                <span className="text-[hsl(var(--cinema-gold))]"> · Inclui poltrona(s) Premium (+R$ 14,00)</span>
              )}
            </p>
            <SeatMap maxSeats={ticketCount} selectedSeats={selectedSeats} onSeatsChange={setSelectedSeats} />
          </div>
        )}

        {step === 'combos' && (
          <div className="max-w-lg mx-auto space-y-4">
            <h2 className="text-lg font-black text-foreground">Adicionar Bomboniere?</h2>
            <p className="text-xs text-muted-foreground">Opcional — você pode pular esta etapa.</p>

            <div className="space-y-3">
              {combos.map(combo => {
                const qty = comboQty[combo.id] || 0;
                return (
                  <div key={combo.id} className="rounded-lg bg-card border border-border p-4 flex items-center gap-4">
                    <span className="text-2xl">{combo.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-foreground text-sm">{combo.name}</p>
                      <p className="text-xs text-muted-foreground">{combo.description}</p>
                      <p className="text-sm font-bold text-primary mt-1">R$ {combo.price.toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {qty > 0 && (
                        <>
                          <button
                            onClick={() => setComboQty({ ...comboQty, [combo.id]: qty - 1 })}
                            className="w-7 h-7 rounded-full bg-secondary text-foreground flex items-center justify-center hover:bg-primary/20 transition-colors"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-sm font-bold text-foreground w-4 text-center">{qty}</span>
                        </>
                      )}
                      <button
                        onClick={() => setComboQty({ ...comboQty, [combo.id]: qty + 1 })}
                        className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/80 transition-colors"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {step === 'checkout' && (
          <div className="max-w-md mx-auto space-y-6">
            <h2 className="text-lg font-black text-foreground">Finalizar Compra</h2>

            {/* Order summary */}
            <div className="rounded-lg bg-card border border-border p-4 space-y-3 text-sm">
              <p className="font-bold text-foreground flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> Resumo</p>
              <div className="space-y-1 text-muted-foreground">
                <div className="flex justify-between">
                  <span>{ticketCount - halfTickets}x Inteira</span>
                  <span>R$ {((ticketCount - halfTickets) * 28).toFixed(2)}</span>
                </div>
                {halfTickets > 0 && (
                  <div className="flex justify-between">
                    <span>{halfTickets}x Meia</span>
                    <span>R$ {(halfTickets * 14).toFixed(2)}</span>
                  </div>
                )}
                {selectedSeats.filter(s => s.type === 'premium').length > 0 && (
                  <div className="flex justify-between text-[hsl(var(--cinema-gold))]">
                    <span>{selectedSeats.filter(s => s.type === 'premium').length}x Taxa Premium</span>
                    <span>R$ {(selectedSeats.filter(s => s.type === 'premium').length * 14).toFixed(2)}</span>
                  </div>
                )}
                {Object.entries(comboQty).filter(([, q]) => q > 0).map(([id, q]) => {
                  const item = combos.find(c => c.id === id)!;
                  return (
                    <div key={id} className="flex justify-between">
                      <span>{q}x {item.name}</span>
                      <span>R$ {(item.price * q).toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border pt-2 flex justify-between font-bold text-foreground">
                <span>Total</span>
                <span className="text-primary">R$ {grandTotal.toFixed(2)}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Poltronas: {selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input id="name" placeholder="Seu nome" value={name} onChange={e => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input id="email" type="email" placeholder="seu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input id="cpf" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(formatCPF(e.target.value))} maxLength={14} />
              </div>
            </div>
          </div>
        )}

        {step === 'pix' && (
          <div className="max-w-md mx-auto space-y-6 text-center">
            {pixLoading ? (
              <div className="py-16 flex flex-col items-center gap-4">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Gerando cobrança PIX...</p>
              </div>
            ) : pixExpired ? (
              <div className="py-16 flex flex-col items-center gap-4">
                <Clock className="h-12 w-12 text-destructive" />
                <h2 className="text-lg font-black text-foreground">Tempo esgotado</h2>
                <p className="text-sm text-muted-foreground">O prazo para pagamento expirou. As poltronas não foram reservadas.</p>
                <Button onClick={onClose} variant="outline">Voltar ao início</Button>
              </div>
            ) : pixData ? (
              <>
                <h2 className="text-lg font-black text-foreground">Pagamento via PIX</h2>

                {/* Countdown */}
                <div className={cn(
                  "inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold",
                  pixTimeLeft <= 60 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                )}>
                  <Clock className="h-4 w-4" />
                  <span>Expira em {formatCountdown(pixTimeLeft)}</span>
                </div>

                <p className="text-sm text-muted-foreground">Escaneie o QR Code ou copie o código para pagar</p>

                <div className="bg-card border border-border rounded-lg p-6 space-y-4">
                  {pixData.qr_code_text ? (
                    <div className="flex justify-center">
                      <div className="bg-white p-3 rounded-lg">
                        <QRCodeSVG value={pixData.qr_code_text} size={192} />
                      </div>
                    </div>
                  ) : (
                    <div className="w-48 h-48 mx-auto bg-secondary rounded flex items-center justify-center">
                      <QrCode className="h-16 w-16 text-muted-foreground" />
                    </div>
                  )}

                  {pixData.qr_code_text && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">PIX Copia e Cola</p>
                      <div className="flex gap-2">
                        <Input
                          value={pixData.qr_code_text}
                          readOnly
                          className="text-xs flex-1"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            navigator.clipboard.writeText(pixData.qr_code_text);
                            setPixCopied(true);
                            setTimeout(() => setPixCopied(false), 2000);
                          }}
                        >
                          {pixCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="border-t border-border pt-3">
                    <p className="text-2xl font-black text-primary">R$ {grandTotal.toFixed(2)}</p>
                  </div>
                </div>

                {/* Order details */}
                <div className="bg-card border border-border rounded-lg p-4 space-y-2 text-left text-sm">
                  <p className="font-bold text-foreground flex items-center gap-2"><Ticket className="h-4 w-4 text-primary" /> Detalhes do Pedido</p>
                  <div className="space-y-1 text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Filme</span>
                      <span className="font-medium text-foreground">{movie.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Data / Horário</span>
                      <span className="font-medium text-foreground">{dateFormatted} · {session.time}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sala</span>
                      <span className="font-medium text-foreground">{session.room} · {session.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Poltronas</span>
                      <span className="font-medium text-foreground">{selectedSeats.map(s => `${s.row}${s.number}`).join(', ')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Ingressos</span>
                      <span className="font-medium text-foreground">{ticketCount - halfTickets} inteira(s) + {halfTickets} meia(s)</span>
                    </div>
                    {Object.entries(comboQty).filter(([, q]) => q > 0).length > 0 && (
                      <div className="border-t border-border pt-1 mt-1">
                        <span className="font-medium text-foreground">Bomboniere</span>
                        {Object.entries(comboQty).filter(([, q]) => q > 0).map(([id, q]) => {
                          const item = combos.find(c => c.id === id)!;
                          return (
                            <div key={id} className="flex justify-between pl-2">
                              <span>{q}x {item.name}</span>
                              <span>R$ {(item.price * q).toFixed(2)}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-xs text-muted-foreground">
                  Após o pagamento ser confirmado, você receberá os ingressos no e-mail <strong>{email}</strong>.
                </p>
              </>
            ) : (
              <div className="py-16">
                <p className="text-sm text-muted-foreground">Erro ao gerar pagamento. Tente novamente.</p>
                <Button onClick={() => setStep('checkout')} variant="outline" className="mt-4">Tentar novamente</Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom bar */}
      {step !== 'pix' && (
        <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
          <div className="container py-3 flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground">Total</p>
              <p className="text-lg font-black text-primary">R$ {grandTotal.toFixed(2)}</p>
            </div>
            <Button
              onClick={handleNext}
              disabled={!canProceed()}
              className="gap-2"
              size="lg"
            >
              {step === 'checkout' ? (
                <>
                  <QrCode className="h-4 w-4" /> Gerar PIX
                </>
              ) : (
                <>
                  Continuar <ArrowRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
