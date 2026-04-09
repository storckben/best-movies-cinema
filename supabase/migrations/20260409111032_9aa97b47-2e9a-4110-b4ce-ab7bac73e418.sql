
-- Create rating enum
CREATE TYPE public.movie_rating AS ENUM ('L', '10', '12', '14', '16', '18');

-- Create movie status enum
CREATE TYPE public.movie_status AS ENUM ('now_playing', 'coming_soon');

-- Create session type enum
CREATE TYPE public.session_type AS ENUM ('2D', '3D', 'IMAX');

-- Create movies table
CREATE TABLE public.movies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  poster TEXT,
  banner TEXT,
  genre TEXT,
  duration TEXT,
  rating public.movie_rating NOT NULL DEFAULT 'L',
  synopsis TEXT,
  director TEXT,
  cast_members TEXT,
  status public.movie_status NOT NULL DEFAULT 'now_playing',
  release_date DATE,
  featured BOOLEAN NOT NULL DEFAULT false,
  start_date DATE,
  end_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create movie sessions table
CREATE TABLE public.movie_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movie_id UUID NOT NULL REFERENCES public.movies(id) ON DELETE CASCADE,
  time TEXT NOT NULL,
  room TEXT,
  type public.session_type NOT NULL DEFAULT '2D',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.movie_sessions ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view movies" ON public.movies FOR SELECT USING (true);
CREATE POLICY "Anyone can view sessions" ON public.movie_sessions FOR SELECT USING (true);

-- Service role only for mutations (edge functions use service role key)
CREATE POLICY "Service role can insert movies" ON public.movies FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update movies" ON public.movies FOR UPDATE USING (true);
CREATE POLICY "Service role can delete movies" ON public.movies FOR DELETE USING (true);

CREATE POLICY "Service role can insert sessions" ON public.movie_sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role can update sessions" ON public.movie_sessions FOR UPDATE USING (true);
CREATE POLICY "Service role can delete sessions" ON public.movie_sessions FOR DELETE USING (true);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_movies_updated_at
  BEFORE UPDATE ON public.movies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
