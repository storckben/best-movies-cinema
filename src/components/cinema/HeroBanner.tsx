import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Movie } from '@/lib/movieStore';

interface Props {
  movies: Movie[];
}

export default function HeroBanner({ movies }: Props) {
  const navigate = useNavigate();
  const featured = movies.filter(m => m.featured && m.status === 'now_playing').slice(0, 5);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (featured.length <= 1) return;
    const timer = setInterval(() => {
      setCurrent(prev => (prev + 1) % featured.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [featured.length]);

  if (featured.length === 0) return null;

  const movie = featured[current];
  const bannerUrl = movie.banner || movie.poster;

  return (
    <section className="relative w-full aspect-[16/5] min-h-[240px] max-h-[460px] overflow-hidden bg-background">
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-700"
        style={{ backgroundImage: `url(${bannerUrl})` }}
      />
      <div className="absolute inset-0 hero-gradient" />

      <div className="relative container h-full flex flex-col justify-end pb-6 md:pb-10">
        <span className={`rating-badge rating-${movie.rating} mb-2 w-fit`}>
          {movie.rating}
        </span>
        <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-foreground leading-tight max-w-lg">
          {movie.title}
        </h2>
        <button
          onClick={() => navigate(`/filme/${movie.id}`)}
          className="mt-3 w-fit rounded bg-primary px-5 py-2 text-xs sm:text-sm font-bold uppercase text-primary-foreground hover:bg-primary/90 transition-colors tracking-wide"
        >
          Comprar Ingresso
        </button>
      </div>

      {featured.length > 1 && (
        <>
          <button
            onClick={() => setCurrent(prev => (prev - 1 + featured.length) % featured.length)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/40 p-1.5 text-foreground hover:bg-background/70 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => setCurrent(prev => (prev + 1) % featured.length)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/40 p-1.5 text-foreground hover:bg-background/70 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {featured.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrent(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === current ? 'w-7 bg-foreground' : 'w-2.5 bg-foreground/30'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
