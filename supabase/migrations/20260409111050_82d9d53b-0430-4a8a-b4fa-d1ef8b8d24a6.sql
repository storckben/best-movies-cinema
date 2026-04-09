
-- Drop permissive mutation policies
DROP POLICY "Service role can insert movies" ON public.movies;
DROP POLICY "Service role can update movies" ON public.movies;
DROP POLICY "Service role can delete movies" ON public.movies;
DROP POLICY "Service role can insert sessions" ON public.movie_sessions;
DROP POLICY "Service role can update sessions" ON public.movie_sessions;
DROP POLICY "Service role can delete sessions" ON public.movie_sessions;

-- Recreate with service_role only (service_role bypasses RLS by default, so no explicit policies needed for mutations)
-- The anon key won't be able to mutate since there are no permissive policies for anon role
