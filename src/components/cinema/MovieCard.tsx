import { Link } from 'react-router-dom';
import type { Movie } from '@/lib/movieStore';

function formatDuration(duration: string): string {
  const match = duration.match(/(\d+)h\s*(\d+)/);
  if (match) return `${parseInt(match[1]) * 60 + parseInt(match[2])}min`;
  const mMatch = duration.match(/(\d+)\s*min/);
  if (mMatch) return `${mMatch[1]}min`;
  return duration;
}

function primaryGenre(genre: string): string {
  return genre.split(',')[0].trim();
}

export default function MovieCard({ movie }: { movie: Movie }) {
  return (
    <Link to={`/filme/${movie.id}`} className="group block flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px]">
      <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg bg-secondary">
        <img
          src={movie.poster}
          alt={movie.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />
        {movie.status === 'pre_sale' && (
          <div className="absolute top-2 left-2 rounded bg-amber-500 px-2 py-0.5 text-[10px] font-bold text-black uppercase tracking-wider shadow">
            Pré-venda
          </div>
        )}
      </div>
      <div className="rounded-b-lg bg-[hsl(0_0%_14%)] group-hover:bg-[hsl(0_0%_18%)] transition-colors px-3 py-2.5 space-y-1.5">
        <h3 className="text-sm font-bold text-foreground line-clamp-2 leading-tight">
          {movie.title}
        </h3>
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {primaryGenre(movie.genre)} - {formatDuration(movie.duration)}
          </p>
          <span className={`rating-badge rating-${movie.rating} !text-[10px] !min-w-[24px] !h-5 !px-1`}>
            {movie.rating}
          </span>
        </div>
      </div>
    </Link>
  );
}
