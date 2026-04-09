import { useState } from 'react';
import { cn } from '@/lib/utils';

export interface Seat {
  id: string;
  row: string;
  number: number;
  type: 'standard' | 'premium';
  status: 'available' | 'occupied' | 'selected';
}

interface SeatMapProps {
  maxSeats: number;
  selectedSeats: Seat[];
  onSeatsChange: (seats: Seat[]) => void;
}

const ROWS_STANDARD = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const ROWS_PREMIUM = ['I', 'J'];
const SEATS_PER_ROW = 14;

function generateSeats(): Seat[] {
  const seats: Seat[] = [];
  const occupied = new Set<string>();
  // Simulate some occupied seats
  const occupiedCount = Math.floor(Math.random() * 30) + 10;
  for (let i = 0; i < occupiedCount; i++) {
    const allRows = [...ROWS_STANDARD, ...ROWS_PREMIUM];
    const row = allRows[Math.floor(Math.random() * allRows.length)];
    const num = Math.floor(Math.random() * SEATS_PER_ROW) + 1;
    occupied.add(`${row}${num}`);
  }

  [...ROWS_STANDARD, ...ROWS_PREMIUM].forEach(row => {
    const isPremium = ROWS_PREMIUM.includes(row);
    for (let n = 1; n <= SEATS_PER_ROW; n++) {
      seats.push({
        id: `${row}${n}`,
        row,
        number: n,
        type: isPremium ? 'premium' : 'standard',
        status: occupied.has(`${row}${n}`) ? 'occupied' : 'available',
      });
    }
  });
  return seats;
}

// Generate once to keep stable
let cachedSeats: Seat[] | null = null;

export default function SeatMap({ maxSeats, selectedSeats, onSeatsChange }: SeatMapProps) {
  const [seats] = useState<Seat[]>(() => {
    if (!cachedSeats) cachedSeats = generateSeats();
    return cachedSeats;
  });

  const selectedIds = new Set(selectedSeats.map(s => s.id));

  const handleSeatClick = (seat: Seat) => {
    if (seat.status === 'occupied') return;
    if (selectedIds.has(seat.id)) {
      onSeatsChange(selectedSeats.filter(s => s.id !== seat.id));
    } else if (selectedSeats.length < maxSeats) {
      onSeatsChange([...selectedSeats, seat]);
    }
  };

  const allRows = [...ROWS_STANDARD, ...ROWS_PREMIUM];

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Screen */}
      <div className="w-full max-w-md mb-4">
        <div className="h-2 bg-primary/60 rounded-full mx-8" />
        <p className="text-center text-xs text-muted-foreground mt-1">TELA</p>
      </div>

      {/* Seats */}
      <div className="flex flex-col gap-1.5">
        {allRows.map(row => {
          const isPremium = ROWS_PREMIUM.includes(row);
          const rowSeats = seats.filter(s => s.row === row);

          return (
            <div key={row} className="flex items-center gap-1">
              <span className={cn(
                "w-5 text-xs font-bold text-center",
                isPremium ? "text-[hsl(var(--cinema-gold))]" : "text-muted-foreground"
              )}>
                {row}
              </span>
              <div className="flex gap-1">
                {rowSeats.map((seat, i) => (
                  <div key={seat.id} className={cn("flex", i === 6 && "ml-4")}>
                    <button
                      onClick={() => handleSeatClick(seat)}
                      disabled={seat.status === 'occupied'}
                      className={cn(
                        "w-7 h-7 rounded-t-md text-[10px] font-bold transition-colors border",
                        seat.status === 'occupied' && "bg-muted/50 border-muted text-muted-foreground/30 cursor-not-allowed",
                        seat.status === 'available' && !selectedIds.has(seat.id) && !isPremium &&
                          "bg-secondary border-border text-secondary-foreground hover:bg-primary/20 hover:border-primary cursor-pointer",
                        seat.status === 'available' && !selectedIds.has(seat.id) && isPremium &&
                          "bg-[hsl(var(--cinema-gold))/0.15] border-[hsl(var(--cinema-gold))/0.4] text-[hsl(var(--cinema-gold))] hover:bg-[hsl(var(--cinema-gold))/0.3] cursor-pointer",
                        selectedIds.has(seat.id) && "bg-primary border-primary text-primary-foreground",
                      )}
                    >
                      {seat.number}
                    </button>
                  </div>
                ))}
              </div>
              <span className={cn(
                "w-5 text-xs font-bold text-center",
                isPremium ? "text-[hsl(var(--cinema-gold))]" : "text-muted-foreground"
              )}>
                {row}
              </span>
            </div>
          );
        })}
      </div>

      {/* Separator before premium */}
      <div className="flex items-center gap-2 -mt-2 mb-0">
        <div className="h-px bg-[hsl(var(--cinema-gold))/0.3] flex-1 w-16" />
        <span className="text-[10px] text-[hsl(var(--cinema-gold))] font-bold uppercase tracking-wider">Premium</span>
        <div className="h-px bg-[hsl(var(--cinema-gold))/0.3] flex-1 w-16" />
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-secondary border border-border" />
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-primary border border-primary" />
          <span>Selecionado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-muted/50 border border-muted" />
          <span>Ocupado</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-t-md bg-[hsl(var(--cinema-gold))/0.15] border border-[hsl(var(--cinema-gold))/0.4]" />
          <span className="text-[hsl(var(--cinema-gold))]">Premium</span>
        </div>
      </div>
    </div>
  );
}

export interface TicketPrices {
  normal: number;
  half: number;
  vip: number;
  vip_half: number;
}

export const DEFAULT_PRICES: TicketPrices = { normal: 28.00, half: 14.00, vip: 42.00, vip_half: 21.00 };

export function getSeatPrice(type: 'standard' | 'premium', prices: TicketPrices = DEFAULT_PRICES): number {
  return type === 'premium' ? prices.vip : prices.normal;
}

export function getSeatHalfPrice(type: 'standard' | 'premium', prices: TicketPrices = DEFAULT_PRICES): number {
  return type === 'premium' ? prices.vip_half : prices.half;
}
