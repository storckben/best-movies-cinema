import { useState } from 'react';
import Header from '@/components/cinema/Header';
import Footer from '@/components/cinema/Footer';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Plus, Minus, ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTrackVisit } from '@/hooks/use-track-visit';

interface SnackItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  tag?: string;
}

const snackItems: SnackItem[] = [
  // Combos
  { id: 'c1', name: 'Combo Casal', description: 'Pipoca Grande + 2 Refrigerantes 500ml', price: 59.90, image: '🍿🥤🥤', category: 'combos', tag: 'Mais vendido' },
  { id: 'c2', name: 'Combo Família', description: 'Pipoca Mega + 4 Refrigerantes 500ml + Chocolate', price: 89.90, image: '🍿🥤🥤🥤🥤', category: 'combos', tag: 'Economia' },
  { id: 'c3', name: 'Combo Individual', description: 'Pipoca Média + 1 Refrigerante 500ml', price: 34.90, image: '🍿🥤', category: 'combos' },
  { id: 'c4', name: 'Combo Kids', description: 'Pipoca Pequena + Suco de Caixinha + Bala de Goma', price: 29.90, image: '🍿🧃🍬', category: 'combos', tag: 'Infantil' },
  { id: 'c5', name: 'Combo Premium', description: 'Pipoca Grande Gourmet + 2 Refrigerantes + Nachos com Queijo', price: 74.90, image: '🍿🥤🧀', category: 'combos', tag: 'Premium' },
  { id: 'c6', name: 'Combo Amigos', description: 'Pipoca Mega + 3 Refrigerantes 500ml + Nachos', price: 79.90, image: '🍿🥤🥤🥤', category: 'combos' },

  // Pipocas
  { id: 'p1', name: 'Pipoca Pequena', description: 'Pipoca salgada tradicional - Tamanho P', price: 16.90, image: '🍿', category: 'pipocas' },
  { id: 'p2', name: 'Pipoca Média', description: 'Pipoca salgada tradicional - Tamanho M', price: 22.90, image: '🍿', category: 'pipocas' },
  { id: 'p3', name: 'Pipoca Grande', description: 'Pipoca salgada tradicional - Tamanho G', price: 28.90, image: '🍿', category: 'pipocas', tag: 'Mais vendida' },
  { id: 'p4', name: 'Pipoca Mega', description: 'Pipoca salgada tradicional - Tamanho Mega (balde)', price: 34.90, image: '🪣🍿', category: 'pipocas' },
  { id: 'p5', name: 'Pipoca Doce Média', description: 'Pipoca doce caramelizada - Tamanho M', price: 24.90, image: '🍿✨', category: 'pipocas' },
  { id: 'p6', name: 'Pipoca Doce Grande', description: 'Pipoca doce caramelizada - Tamanho G', price: 30.90, image: '🍿✨', category: 'pipocas' },
  { id: 'p7', name: 'Pipoca Mista Grande', description: 'Metade salgada, metade doce - Tamanho G', price: 30.90, image: '🍿🍿', category: 'pipocas' },
  { id: 'p8', name: 'Pipoca Gourmet Cheddar', description: 'Pipoca com cobertura de cheddar cremoso', price: 32.90, image: '🍿🧀', category: 'pipocas', tag: 'Gourmet' },

  // Bebidas
  { id: 'b1', name: 'Refrigerante 300ml', description: 'Coca-Cola, Guaraná, Fanta ou Sprite', price: 12.90, image: '🥤', category: 'bebidas' },
  { id: 'b2', name: 'Refrigerante 500ml', description: 'Coca-Cola, Guaraná, Fanta ou Sprite', price: 16.90, image: '🥤', category: 'bebidas' },
  { id: 'b3', name: 'Refrigerante 700ml', description: 'Coca-Cola, Guaraná, Fanta ou Sprite', price: 19.90, image: '🥤', category: 'bebidas' },
  { id: 'b4', name: 'Água Mineral 500ml', description: 'Água mineral sem gás', price: 8.90, image: '💧', category: 'bebidas' },
  { id: 'b5', name: 'Água com Gás 500ml', description: 'Água mineral com gás', price: 9.90, image: '💧', category: 'bebidas' },
  { id: 'b6', name: 'Suco Natural 400ml', description: 'Laranja, Uva ou Maracujá', price: 14.90, image: '🧃', category: 'bebidas' },
  { id: 'b7', name: 'Cerveja Long Neck', description: 'Heineken, Budweiser ou Corona', price: 18.90, image: '🍺', category: 'bebidas' },
  { id: 'b8', name: 'Milkshake', description: 'Chocolate, Morango ou Baunilha - 400ml', price: 22.90, image: '🥛', category: 'bebidas', tag: 'Novo' },

  // Salgados
  { id: 's1', name: 'Nachos com Queijo', description: 'Nachos crocantes com molho de queijo cheddar', price: 24.90, image: '🧀', category: 'salgados', tag: 'Favorito' },
  { id: 's2', name: 'Hot Dog Tradicional', description: 'Pão, salsicha, molho, batata palha e catchup', price: 19.90, image: '🌭', category: 'salgados' },
  { id: 's3', name: 'Hot Dog Duplo', description: 'Pão, 2 salsichas, queijo, molho especial', price: 25.90, image: '🌭🌭', category: 'salgados' },
  { id: 's4', name: 'Chicken Fingers', description: 'Tirinhas empanadas de frango (6 unidades)', price: 27.90, image: '🍗', category: 'salgados' },
  { id: 's5', name: 'Onion Rings', description: 'Anéis de cebola empanados crocantes (8 unidades)', price: 22.90, image: '🧅', category: 'salgados' },
  { id: 's6', name: 'Pretzel', description: 'Pretzel assado com sal grosso e molho de queijo', price: 18.90, image: '🥨', category: 'salgados', tag: 'Novo' },

  // Doces
  { id: 'd1', name: 'Chocolate M&M\'s', description: 'Pacote M&M\'s ao leite 148g', price: 14.90, image: '🍫', category: 'doces' },
  { id: 'd2', name: 'Bala de Goma', description: 'Pacote de balas de goma sortidas 200g', price: 12.90, image: '🍬', category: 'doces' },
  { id: 'd3', name: 'KitKat', description: 'Chocolate KitKat 41.5g', price: 9.90, image: '🍫', category: 'doces' },
  { id: 'd4', name: 'Brownie', description: 'Brownie de chocolate com nozes', price: 14.90, image: '🍫', category: 'doces' },
  { id: 'd5', name: 'Sorvete Ben & Jerry\'s', description: 'Pote individual 120ml - Diversos sabores', price: 24.90, image: '🍦', category: 'doces', tag: 'Premium' },
  { id: 'd6', name: 'Cookie', description: 'Cookie artesanal de chocolate chips', price: 11.90, image: '🍪', category: 'doces' },
  { id: 'd7', name: 'Algodão Doce', description: 'Algodão doce tradicional', price: 12.90, image: '🍭', category: 'doces' },
];

const categories = [
  { value: 'combos', label: 'Combos' },
  { value: 'pipocas', label: 'Pipocas' },
  { value: 'bebidas', label: 'Bebidas' },
  { value: 'salgados', label: 'Salgados' },
  { value: 'doces', label: 'Doces & Sobremesas' },
];

function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function SnackCard({ item, quantity, onAdd, onRemove }: {
  item: SnackItem;
  quantity: number;
  onAdd: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="group flex gap-4 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-secondary/50">
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-lg bg-secondary text-4xl">
        {item.image.slice(0, 2)}
      </div>
      <div className="flex flex-1 flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-foreground text-sm leading-tight">{item.name}</h3>
            {item.tag && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-primary/15 text-primary border-none font-semibold">
                {item.tag}
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{item.description}</p>
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-sm font-bold text-primary">{formatPrice(item.price)}</span>
          <div className="flex items-center gap-2">
            {quantity > 0 ? (
              <div className="flex items-center gap-2 bg-secondary rounded-full px-1">
                <button
                  onClick={onRemove}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="text-sm font-bold text-foreground w-5 text-center">{quantity}</span>
                <button
                  onClick={onAdd}
                  className="h-7 w-7 rounded-full flex items-center justify-center text-primary hover:bg-primary/10 transition-colors"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onAdd}
                className="h-8 px-3 rounded-full bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors flex items-center gap-1"
              >
                <Plus className="h-3.5 w-3.5" />
                Adicionar
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Snackbar() {
  useTrackVisit('/snackbar');
  const [cart, setCart] = useState<Record<string, number>>({});
  const { toast } = useToast();

  const addItem = (id: string) => {
    setCart(prev => ({ ...prev, [id]: (prev[id] || 0) + 1 }));
  };

  const removeItem = (id: string) => {
    setCart(prev => {
      const next = { ...prev };
      if (next[id] > 1) next[id]--;
      else delete next[id];
      return next;
    });
  };

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = snackItems.find(i => i.id === id);
    return sum + (item ? item.price * qty : 0);
  }, 0);

  const handleFinalize = () => {
    if (totalItems === 0) return;
    toast({
      title: 'Pedido enviado! 🎬',
      description: `${totalItems} ${totalItems === 1 ? 'item' : 'itens'} - ${formatPrice(totalPrice)}. Retire no balcão do Snackbar.`,
    });
    setCart({});
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <div className="bg-secondary border-b border-border">
          <div className="container py-8">
            <h1 className="text-2xl md:text-3xl font-black text-foreground tracking-tight">
              Snackbar
            </h1>
            <p className="text-muted-foreground mt-1 text-sm">
              Monte seu combo perfeito e aproveite a sessão com muito sabor.
            </p>
          </div>
        </div>

        <div className="container py-6">
          <Tabs defaultValue="combos">
            <TabsList className="w-full justify-start overflow-x-auto bg-transparent gap-1 h-auto p-0 mb-6 border-b border-border rounded-none">
              {categories.map(cat => (
                <TabsTrigger
                  key={cat.value}
                  value={cat.value}
                  className="rounded-none border-b-2 border-transparent px-4 py-3 text-xs font-bold uppercase tracking-wider text-muted-foreground data-[state=active]:border-primary data-[state=active]:text-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  {cat.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {categories.map(cat => (
              <TabsContent key={cat.value} value={cat.value} className="mt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {snackItems
                    .filter(item => item.category === cat.value)
                    .map(item => (
                      <SnackCard
                        key={item.id}
                        item={item}
                        quantity={cart[item.id] || 0}
                        onAdd={() => addItem(item.id)}
                        onRemove={() => removeItem(item.id)}
                      />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </div>

        {/* Floating cart bar */}
        {totalItems > 0 && (
          <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur-sm">
            <div className="container flex items-center justify-between py-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <ShoppingCart className="h-5 w-5 text-primary" />
                  <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                    {totalItems}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">
                    {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                  </p>
                  <p className="text-sm font-bold text-foreground">{formatPrice(totalPrice)}</p>
                </div>
              </div>
              <Button onClick={handleFinalize} size="sm" className="font-bold uppercase text-xs tracking-wider">
                Finalizar Pedido
              </Button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
