import { useState, useEffect } from 'react';
import Header from '@/components/cinema/Header';
import HeroBanner from '@/components/cinema/HeroBanner';
import MovieSection from '@/components/cinema/MovieSection';
import Footer from '@/components/cinema/Footer';
import { getMovies, type Movie } from '@/lib/movieStore';
import { useTrackVisit } from '@/hooks/use-track-visit';

export default function Index() {
  useTrackVisit('/');
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  const nowPlaying = movies.filter(m => m.status === 'now_playing');
  const comingSoon = movies.filter(m => m.status === 'coming_soon');
  const preSale = movies.filter(m => m.status === 'pre_sale');

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroBanner movies={movies} />
      <MovieSection title="Em Cartaz" movies={nowPlaying} />
      {preSale.length > 0 && <MovieSection title="Pré-venda" movies={preSale} />}
      <MovieSection title="Em Breve" movies={comingSoon} />
      <Footer />
    </div>
  );
}
