import { useState, useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Clock, Star, Calendar } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import Header from '@/components/cinema/Header';
import Footer from '@/components/cinema/Footer';
import BookingFlow from '@/components/cinema/BookingFlow';
import { getMovies, type Movie, type MovieSession } from '@/lib/movieStore';
import { cn } from '@/lib/utils';
import { useTrackVisit } from '@/hooks/use-track-visit';

function getDayLabel(date: Date, index: number) {
  if (index === 0) return 'HOJE';
  if (index === 1) return 'AMANHÃ';
  return format(date, 'EEE', { locale: ptBR }).toUpperCase().replace('.', '');
}

export default function MovieDetail() {
  const { id } = useParams();
  useTrackVisit(`/movie/${id}`, id);
  const [movies, setMovies] = useState<Movie[]>([]);

  useEffect(() => {
    getMovies().then(setMovies);
  }, []);

  const movie = movies.find(m => m.id === id);

  const days = useMemo(() => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const d = addDays(today, i);
      return {
        date: format(d, 'yyyy-MM-dd'),
        label: getDayLabel(d, i),
        day: format(d, 'dd'),
        month: format(d, 'MMM', { locale: ptBR }).toUpperCase(),
      };
    });
  }, []);

  const [selectedDay, setSelectedDay] = useState(days[0].date);
  const [bookingSession, setBookingSession] = useState<MovieSession | null>(null);

  if (!movie) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-bold text-foreground">Filme não encontrado</h1>
          <Link to="/" className="text-primary mt-4 inline-block hover:underline">Voltar</Link>
        </div>
      </div>
    );
  }

  if (bookingSession) {
    return (
      <BookingFlow
        movie={movie}
        session={bookingSession}
        date={selectedDay}
        onClose={() => setBookingSession(null)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-8">
        <Link to="/" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar
        </Link>

        <div className="flex flex-col md:flex-row gap-8">
          <div className="w-full md:w-72 shrink-0">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-full rounded-lg shadow-xl"
            />
          </div>

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <span className={`rating-badge rating-${movie.rating}`}>{movie.rating}</span>
              <span className="flex items-center gap-1 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" /> {movie.duration}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-foreground">{movie.title}</h1>
            <p className="text-sm text-primary font-bold mt-1">{movie.genre}</p>

            <p className="text-muted-foreground mt-4 leading-relaxed text-sm">{movie.synopsis}</p>

            <div className="mt-6 space-y-2 text-sm">
              <p><span className="font-bold text-foreground">Direção:</span> <span className="text-muted-foreground">{movie.director}</span></p>
              <p><span className="font-bold text-foreground">Elenco:</span> <span className="text-muted-foreground">{movie.cast_members}</span></p>
              <p><span className="font-bold text-foreground">Estreia:</span> <span className="text-muted-foreground">{movie.release_date ? new Date(movie.release_date).toLocaleDateString('pt-BR') : '-'}</span></p>
            </div>

            {(movie.status === 'now_playing' || movie.status === 'pre_sale') && movie.sessions.length > 0 && (
              <div className="mt-8">
                <h3 className="text-base font-black uppercase tracking-wider text-foreground mb-4 flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" /> 
                  {movie.status === 'pre_sale' ? 'Pré-venda Disponível' : 'Sessões Disponíveis'}
                </h3>

                {movie.status === 'pre_sale' && (
                  <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 mb-4 text-center">
                    <p className="text-amber-400 text-sm font-semibold">🎟️ Este filme está em pré-venda! Garanta seus ingressos antecipadamente.</p>
                  </div>
                )}

                {/* Day selector */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide mb-4">
                  {days.map(day => (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDay(day.date)}
                      className={cn(
                        "flex flex-col items-center min-w-[60px] px-3 py-2 rounded-lg border text-center transition-colors",
                        selectedDay === day.date
                          ? "bg-primary border-primary text-primary-foreground"
                          : "bg-card border-border text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      <span className="text-[10px] font-bold uppercase">{day.label}</span>
                      <span className="text-lg font-black">{day.day}</span>
                      <span className="text-[10px]">{day.month}</span>
                    </button>
                  ))}
                </div>

                {/* Sessions */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {movie.sessions.map(session => (
                    <button
                      key={session.id}
                      onClick={() => setBookingSession(session)}
                      className="rounded-lg border border-border bg-card p-3 text-center hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <p className="text-lg font-bold text-foreground">{session.time}</p>
                      <p className="text-xs text-muted-foreground">{session.room}</p>
                      <span className="mt-1 inline-block rounded bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                        {session.type}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {movie.status === 'coming_soon' && (
              <div className="mt-8 rounded-lg bg-card border border-border p-6 text-center">
                <p className="text-muted-foreground">Este filme ainda não está em cartaz.</p>
                <p className="text-sm text-primary font-bold mt-1">
                  Estreia: {movie.release_date ? new Date(movie.release_date).toLocaleDateString('pt-BR') : '-'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
