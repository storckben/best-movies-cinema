import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

function getVisitorId(): string {
  let id = localStorage.getItem('visitor_id');
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem('visitor_id', id);
  }
  return id;
}

export function useTrackVisit(page: string, movieId?: string) {
  useEffect(() => {
    const visitorId = getVisitorId();
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;

    fetch(`https://${projectId}.supabase.co/functions/v1/track-visits`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        page,
        movie_id: movieId || null,
        visitor_id: visitorId,
      }),
    }).catch(() => {});
  }, [page, movieId]);
}
