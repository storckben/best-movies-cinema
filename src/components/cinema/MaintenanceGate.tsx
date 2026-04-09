import { useState, useEffect, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Shield, Loader2 } from 'lucide-react';

interface MaintenanceMode {
  enabled: boolean;
  message: string;
}

export default function MaintenanceGate({ children }: { children: ReactNode }) {
  const [maintenance, setMaintenance] = useState<MaintenanceMode | null>(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Skip maintenance check for admin routes
  const isAdmin = location.pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) {
      setLoading(false);
      return;
    }

    const fetchMaintenance = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-settings`
        );
        const data = await res.json();
        if (Array.isArray(data)) {
          const setting = data.find((s: any) => s.key === 'maintenance_mode');
          if (setting?.value) {
            setMaintenance(setting.value as MaintenanceMode);
          }
        }
      } catch {
        // If we can't fetch, allow access
      } finally {
        setLoading(false);
      }
    };

    fetchMaintenance();
  }, [isAdmin]);

  if (isAdmin) return <>{children}</>;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (maintenance?.enabled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center max-w-md px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-3">Site em Manutenção</h1>
          <p className="text-muted-foreground text-lg">{maintenance.message}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
