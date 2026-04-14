import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Cookie } from 'lucide-react';

const COOKIE_ACK_KEY = 'cookie_intro_ack_v1';

interface CookiesPageProps {
  onAccept?: () => void;
}

export default function Cookies({ onAccept }: CookiesPageProps) {
  const navigate = useNavigate();

  const handleAccept = () => {
    localStorage.setItem(COOKIE_ACK_KEY, '1');
    if (onAccept) {
      onAccept();
      return;
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl rounded-xl border border-border bg-card p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Cookie className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Política de Cookies</h1>
            <p className="text-sm text-muted-foreground">Antes de continuar, veja como usamos cookies.</p>
          </div>
        </div>

        <div className="space-y-3 text-sm text-muted-foreground leading-relaxed">
          <p>
            Utilizamos cookies para melhorar sua experiência, lembrar preferências e analisar acessos para otimizar o site.
          </p>
          <p>
            Alguns cookies são essenciais para o funcionamento da plataforma. Cookies de análise ajudam a entender como você navega nas páginas.
          </p>
          <p>
            Ao clicar em "Entendi e continuar", você confirma que está ciente desta política de uso de cookies.
          </p>
        </div>

        <div className="mt-8 flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-4 w-4" />
            Seus dados são tratados conforme nossas políticas de privacidade.
          </div>
          <button
            onClick={handleAccept}
            className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Entendi e continuar
          </button>
        </div>
      </div>
    </div>
  );
}

export { COOKIE_ACK_KEY };