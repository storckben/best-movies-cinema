import { useState, useEffect } from 'react';
import Header from '@/components/cinema/Header';
import MovieCard from '@/components/cinema/MovieCard';
import Footer from '@/components/cinema/Footer';
import { getMovies, type Movie } from '@/lib/movieStore';
import { useTrackVisit } from '@/hooks/use-track-visit';

export default function Movies() {
  useTrackVisit('/movies');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filter, setFilter] = useState<'all' | 'now_playing' | 'coming_soon' | 'pre_sale'>('all');

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  const filtered = filter === 'all' ? movies : movies.filter(m => m.status === filter);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <h1 className="text-lg font-black uppercase tracking-wider text-foreground mb-6">Filmes</h1>
        
        <div className="flex gap-2 mb-6 flex-wrap">
          {[
            { key: 'all' as const, label: 'Todos' },
            { key: 'now_playing' as const, label: 'Em Cartaz' },
            { key: 'pre_sale' as const, label: 'Pré-venda' },
            { key: 'coming_soon' as const, label: 'Em Breve' },
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-wider transition-colors ${
                filter === tab.key
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 md:gap-5">
          {filtered.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="text-center text-muted-foreground py-12">Nenhum filme encontrado.</p>
        )}
      </div>
      <Footer />
    </div>
  );
}
