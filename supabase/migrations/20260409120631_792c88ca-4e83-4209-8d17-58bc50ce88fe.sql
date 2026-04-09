
CREATE TABLE public.page_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  movie_id uuid REFERENCES public.movies(id) ON DELETE SET NULL,
  visitor_id text,
  visited_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE INDEX idx_page_visits_visited_at ON public.page_visits (visited_at);
CREATE INDEX idx_page_visits_movie_id ON public.page_visits (movie_id);
CREATE INDEX idx_page_visits_page ON public.page_visits (page);

ALTER TABLE public.page_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits"
ON public.page_visits
FOR INSERT
TO public
WITH CHECK (true);

CREATE POLICY "Anyone can read visits"
ON public.page_visits
FOR SELECT
TO public
USING (true);
