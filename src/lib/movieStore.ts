import { supabase } from '@/integrations/supabase/client';

export type MovieRating = 'L' | '10' | '12' | '14' | '16' | '18';

export interface MovieSession {
  id: string;
  time: string;
  room: string;
  type: string;
  movie_id?: string;
}

export interface Movie {
  id: string;
  title: string;
  poster: string;
  banner?: string;
  genre: string;
  duration: string;
  rating: MovieRating;
  synopsis: string;
  director: string;
  cast_members: string;
  status: 'now_playing' | 'coming_soon' | 'pre_sale';
  release_date: string;
  start_date?: string;
  end_date?: string;
  sessions: MovieSession[];
  featured: boolean;
}

// Fetch all movies (public, uses anon key)
export async function getMovies(): Promise<Movie[]> {
  const { data: movies, error } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching movies:', error);
    return [];
  }

  const movieIds = (movies || []).map(m => m.id);
  if (movieIds.length === 0) return [];

  const { data: sessions } = await supabase
    .from('movie_sessions')
    .select('*')
    .in('movie_id', movieIds);

  return (movies || []).map(m => ({
    ...m,
    poster: m.poster || '',
    banner: m.banner || '',
    genre: m.genre || '',
    duration: m.duration || '',
    rating: (m.rating || 'L') as MovieRating,
    synopsis: m.synopsis || '',
    director: m.director || '',
    cast_members: m.cast_members || '',
    status: m.status as 'now_playing' | 'coming_soon' | 'pre_sale',
    release_date: m.release_date || '',
    sessions: (sessions || []).filter(s => s.movie_id === m.id).map(s => ({
      id: s.id,
      time: s.time,
      room: s.room || '',
      type: s.type || '2D',
    })),
    featured: m.featured || false,
  }));
}

// Admin functions - use edge function with password
const EDGE_FN_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/manage-movies`;

function getAdminPassword(): string {
  return sessionStorage.getItem('admin_password') || '';
}

export function setAdminPassword(password: string) {
  sessionStorage.setItem('admin_password', password);
}

async function adminFetch(action: string, body?: any) {
  const password = getAdminPassword();
  const res = await fetch(`${EDGE_FN_URL}?action=${action}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-admin-password': password,
      'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error || 'Erro na operação');
  }
  return res.json();
}

export async function addMovie(movie: Omit<Movie, 'id'>): Promise<Movie> {
  return adminFetch('create', {
    title: movie.title,
    poster: movie.poster,
    banner: movie.banner,
    genre: movie.genre,
    duration: movie.duration,
    rating: movie.rating,
    synopsis: movie.synopsis,
    director: movie.director,
    cast_members: movie.cast_members,
    status: movie.status,
    release_date: movie.release_date || null,
    start_date: movie.start_date || null,
    end_date: movie.end_date || null,
    featured: movie.featured,
    sessions: movie.sessions,
  });
}

export async function updateMovie(id: string, data: Partial<Movie>): Promise<Movie> {
  return adminFetch('update', { id, ...data });
}

export async function deleteMovie(id: string): Promise<void> {
  await adminFetch('delete', { id });
}
