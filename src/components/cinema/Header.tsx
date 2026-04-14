import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, MapPin, ChevronDown, Search } from 'lucide-react';
import CinemaSelector from './CinemaSelector';

const navItems = [
  { label: 'Prоgrаmаçãо', path: '/' },
  { label: 'Сinemаs', path: '/cinemas' },
  { label: 'Snаckbаr', path: '/snackbar' },
  { label: 'Сinemаk Сlub', path: '/#club' },
  { label: 'Pаrа Еmрrеsаs', path: '/#empresas' },
  { label: 'Pаrсеriаs', path: '/#parcerias' },
  { label: 'Suа Sеssãо', path: '/#sessao' },
  { label: 'Lоjа Сinemаk', path: '/#loja' },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedCinema, setSelectedCinema] = useState<string | null>(
    () => localStorage.getItem('selected_cinema')
  );
  const [selectorOpen, setSelectorOpen] = useState(() => !localStorage.getItem('selected_cinema'));
  const location = useLocation();

  // Listen for custom event to open selector from other components
  useEffect(() => {
    const handler = () => setSelectorOpen(true);
    window.addEventListener('open-cinema-selector', handler);
    return () => window.removeEventListener('open-cinema-selector', handler);
  }, []);

  function handleSelectCinema(cinema: string) {
    setSelectedCinema(cinema);
    localStorage.setItem('selected_cinema', cinema);
  }

  const cinemaLabel = selectedCinema || 'Sеlеciоnаr cinеmа';

  return (
    <>
      <header className="sticky top-0 z-50 bg-background">
        {/* Top bar */}
        <div className="border-b border-border">
          <div className="container flex h-14 items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center">
                <span className="text-2xl font-black tracking-tighter text-foreground">
                  СINЕMАK
                </span>
              </Link>
              <button
                onClick={() => setSelectorOpen(true)}
                className="hidden md:flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors border-l border-border pl-4"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="font-medium truncate max-w-[200px]">{cinemaLabel}</span>
                <ChevronDown className="h-3 w-3 flex-shrink-0" />
              </button>
            </div>

          <div className="hidden md:flex items-center gap-3">
            <button className="text-muted-foreground hover:text-foreground transition-colors">
              <Search className="h-5 w-5" />
            </button>
          </div>

            <button
              className="md:hidden text-foreground"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Navigation bar */}
        <nav className="hidden md:block border-b border-border bg-background">
          <div className="container flex items-center gap-1 h-11 overflow-x-auto scrollbar-hide">
            {navItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={`whitespace-nowrap px-3 py-2 text-xs font-bold uppercase tracking-wider transition-colors hover:text-primary ${
                  location.pathname === item.path ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-b border-border bg-background">
            <div className="container py-4 space-y-1">
              <button
                onClick={() => { setSelectorOpen(true); setMenuOpen(false); }}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-3 pb-3 border-b border-border w-full"
              >
                <MapPin className="h-4 w-4 text-primary" />
                <span className="truncate">{cinemaLabel}</span>
              </button>
              {navItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMenuOpen(false)}
                  className="block py-2 text-sm font-bold uppercase tracking-wider text-muted-foreground hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <CinemaSelector
        open={selectorOpen}
        onClose={() => setSelectorOpen(false)}
        onSelect={handleSelectCinema}
      />
    </>
  );
}
