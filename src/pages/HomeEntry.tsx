import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
import Index from './Index';
import Cookies, { COOKIE_ACK_KEY } from './Cookies';

const MANAGE_SETTINGS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-settings`;

export default function HomeEntry() {
  const [loading, setLoading] = useState(true);
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    const fetchCookieScreen = async () => {
      try {
        const res = await fetch(MANAGE_SETTINGS_URL);
        const data = await res.json();

        if (Array.isArray(data)) {
          const cookieScreenSetting = data.find((s: any) => s.key === 'cookie_screen');
          const enabled = !!cookieScreenSetting?.value?.enabled;
          const accepted = localStorage.getItem(COOKIE_ACK_KEY) === '1';
          setShowCookies(enabled && !accepted);
        }
      } catch {
        setShowCookies(false);
      } finally {
        setLoading(false);
      }
    };

    fetchCookieScreen();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (showCookies) {
    return <Cookies onAccept={() => setShowCookies(false)} />;
  }

  return <Index />;
}