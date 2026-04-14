import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import Header from '@/components/cinema/Header';
import Footer from '@/components/cinema/Footer';
import { getMovies, type Movie } from '@/lib/movieStore';
import { addDays, format, isToday, isTomorrow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useTrackVisit } from '@/hooks/use-track-visit';

function getDayLabel(date: Date): string {
  if (isToday(date)) return 'HOJE';
  if (isTomorrow(date)) return 'AMANHÃ';
  return format(date, 'EEEE', { locale: ptBR }).toUpperCase();
}

function getDayDate(date: Date): string {
  return format(date, "dd/MMM", { locale: ptBR }).toUpperCase();
}

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

export default function Cinemas() {
  useTrackVisit('/cinemas');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const selectedCinema = localStorage.getItem('selected_cinema');

  // Open cinema selector if none selected
  useEffect(() => {
    if (!selectedCinema) {
      window.dispatchEvent(new Event('open-cinema-selector'));
    }
  }, [selectedCinema]);

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(new Date(), i);
      return { label: getDayLabel(date), date: getDayDate(date), full: date };
    });
  }, []);

  const nowPlaying = movies.filter(m => m.status === 'now_playing' && m.sessions.length > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container py-8">
        {/* Title with cinema name */}
        <div className="flex items-center gap-2 mb-6">
          <h1 className="text-base font-black uppercase tracking-wider text-foreground">
            Filmes próximos a você.
          </h1>
          {selectedCinema && (
            <span className="flex items-center gap-1 text-sm text-primary font-bold uppercase">
              <MapPin className="h-4 w-4" />
              {selectedCinema.replace('Cinemark ', '')}
            </span>
          )}
        </div>

        {/* Day tabs */}
        <div className="flex gap-0 mb-6 border border-border rounded-lg overflow-hidden w-fit">
          {days.map((day, i) => (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex flex-col items-center px-4 py-2.5 text-center min-w-[90px] transition-colors border-r border-border last:border-r-0 ${
                selectedDay === i
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-accent'
              }`}
            >
              <span className="text-[11px] font-bold uppercase tracking-wider">{day.label}</span>
              <span className="text-[10px] opacity-70">{day.date}</span>
            </button>
          ))}
        </div>

        {/* No cinema selected */}
        {!selectedCinema && (
          <p className="text-center text-muted-foreground py-12">
            Selecione um cinema no menu acima para ver a programação.
          </p>
        )}

        {/* Movie listings with sessions */}
        {selectedCinema && nowPlaying.length > 0 && (
          <div className="space-y-8">
            {nowPlaying.map(movie => (
              <div key={movie.id} className="flex gap-5 border-b border-border pb-8 last:border-b-0">
                {/* Poster */}
                <Link to={`/filme/${movie.id}`} className="flex-shrink-0">
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-[140px] md:w-[180px] rounded-lg object-cover aspect-[2/3]"
                    loading="lazy"
                  />
                </Link>

                {/* Info & Sessions */}
                <div className="flex-1 min-w-0">
                  <Link to={`/filme/${movie.id}`}>
                    <h2 className="text-base md:text-lg font-black uppercase text-foreground hover:text-primary transition-colors mb-2">
                      {movie.title}
                    </h2>
                  </Link>

                  <div className="flex items-center gap-2 mb-4">
                    <span className={`rating-badge rating-${movie.rating} !text-[10px] !min-w-[22px] !h-5 !px-1`}>
                      {movie.rating}
                    </span>
                    <span className="text-xs text-muted-foreground uppercase">
                      {primaryGenre(movie.genre)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatDuration(movie.duration)}
                    </span>
                  </div>

                  {/* Sessions grouped by type */}
                  {Object.entries(
                    movie.sessions.reduce<Record<string, typeof movie.sessions>>((acc, s) => {
                      const key = `${s.type} · ${s.room}`;
                      if (!acc[key]) acc[key] = [];
                      acc[key].push(s);
                      return acc;
                    }, {})
                  ).map(([key, sessions]) => (
                    <div key={key} className="mb-3">
                      <p className="text-[11px] text-muted-foreground uppercase tracking-wider mb-2">
                        {key}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {sessions.map(session => (
                          <button
                            key={session.id}
                            className="rounded border border-border bg-secondary hover:bg-accent px-4 py-2.5 text-sm transition-colors"
                          >
                            <span className="text-[10px] text-muted-foreground block">
                              {days[selectedDay].label}, {days[selectedDay].date.split('/')[0]} {days[selectedDay].date.split('/')[1]}
                            </span>
                            <span className="text-foreground font-bold">{session.time}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {selectedCinema && nowPlaying.length === 0 && (
          <p className="text-center text-muted-foreground py-12">
            Nenhuma sessão disponível para este cinema.
          </p>
        )}
      </div>

      <Footer />
    </div>
  );
}
