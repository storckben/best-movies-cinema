import { useState, useEffect } from 'react';
import { Shield, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface MaintenanceMode {
  enabled: boolean;
  message: string;
}

export default function AdminProtecao() {
  const [maintenance, setMaintenance] = useState<MaintenanceMode>({
    enabled: false,
    message: 'Estamos em manutenção. Voltaremos em breve!',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/manage-settings`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const maintenanceSetting = data.find((s: any) => s.key === 'maintenance_mode');
        if (maintenanceSetting) setMaintenance(maintenanceSetting.value as MaintenanceMode);
      }
    } catch (err) {
      console.error('Erro ao carregar configurações:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    const adminPassword = sessionStorage.getItem('admin_password') || '';
    setSaving(true);
    try {
      const res = await fetch(`${supabaseUrl}/functions/v1/manage-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-password': adminPassword,
        },
        body: JSON.stringify({ key: 'maintenance_mode', value: maintenance }),
      });
      if (!res.ok) throw new Error('Erro ao salvar');
      toast.success('Configuração salva com sucesso!');
    } catch {
      toast.error('Erro ao salvar configuração.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Proteção</h1>
        <p className="text-sm text-muted-foreground">Gerencie o modo de manutenção do site</p>
      </div>

      <div className="space-y-6 max-w-2xl">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Modo de Manutenção
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maintenance-toggle" className="text-sm">
                Ativar modo de manutenção
              </Label>
              <Switch
                id="maintenance-toggle"
                checked={maintenance.enabled}
                onCheckedChange={(checked) =>
                  setMaintenance((prev) => ({ ...prev, enabled: checked }))
                }
              />
            </div>
            <div>
              <Label>Mensagem de Manutenção</Label>
              <Input
                className="mt-1"
                value={maintenance.message}
                onChange={(e) =>
                  setMaintenance((prev) => ({ ...prev, message: e.target.value }))
                }
                placeholder="Mensagem exibida durante a manutenção"
              />
            </div>
            {maintenance.enabled && (
              <p className="text-xs text-destructive font-medium">
                ⚠ O site está em modo de manutenção. Os visitantes verão a mensagem acima.
              </p>
            )}
          </CardContent>
        </Card>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Configurações
        </button>
      </div>
    </div>
  );
}
