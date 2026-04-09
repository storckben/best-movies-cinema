import { useState, useEffect } from 'react';
import { Film, Plus, Pencil, Trash2, Save, X, Clock, Eye, TrendingUp, Calendar } from 'lucide-react';
import { getMovies, addMovie, updateMovie, deleteMovie, type Movie, type MovieRating, type MovieSession } from '@/lib/movieStore';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

const emptyMovie = {
  title: '',
  poster: '',
  banner: '',
  genre: '',
  duration: '',
  rating: 'L' as MovieRating,
  synopsis: '',
  director: '',
  cast_members: '',
  status: 'now_playing' as const,
  release_date: '',
  start_date: '',
  end_date: '',
  sessions: [] as MovieSession[],
  featured: false,
};

interface MovieVisitStats {
  totalMovieVisits: number;
  weeklyMovieVisits: number;
  topMovie: { title: string; total: number } | null;
  topMovieWeekly: { title: string; weekly: number } | null;
}

export default function AdminFilmes() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [editing, setEditing] = useState<Partial<Movie> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [visitStats, setVisitStats] = useState<MovieVisitStats | null>(null);
  const { toast } = useToast();

  const refresh = () => getMovies().then(setMovies);
  useEffect(() => { refresh(); fetchVisitStats(); }, []);

  const fetchVisitStats = async () => {
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const res = await fetch(`https://${projectId}.supabase.co/functions/v1/track-visits?action=movies`);
      if (res.ok) setVisitStats(await res.json());
    } catch {}
  };

  const handleNew = () => { setEditing({ ...emptyMovie }); setIsNew(true); };
  const handleEdit = (movie: Movie) => { setEditing({ ...movie }); setIsNew(false); };
  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este filme?')) {
      await deleteMovie(id);
      refresh();
      toast({ title: 'Filme excluído com sucesso' });
    }
  };

  const handleSave = async () => {
    if (!editing?.title) { toast({ title: 'Preencha o título', variant: 'destructive' }); return; }
    try {
      if (isNew) { await addMovie(editing as Omit<Movie, 'id'>); toast({ title: 'Filme adicionado' }); }
      else if (editing.id) { await updateMovie(editing.id, editing); toast({ title: 'Filme atualizado' }); }
      setEditing(null); refresh();
    } catch (err: any) { toast({ title: err.message || 'Erro ao salvar', variant: 'destructive' }); }
  };

  const handleAddSession = () => {
    if (!editing) return;
    const sessions = [...(editing.sessions || [])];
    sessions.push({ id: Date.now().toString(), time: '', room: '', type: '2D' });
    setEditing({ ...editing, sessions });
  };

  const handleRemoveSession = (idx: number) => {
    if (!editing) return;
    const sessions = [...(editing.sessions || [])];
    sessions.splice(idx, 1);
    setEditing({ ...editing, sessions });
  };

  const handleSessionChange = (idx: number, field: keyof MovieSession, value: string) => {
    if (!editing) return;
    const sessions = [...(editing.sessions || [])];
    sessions[idx] = { ...sessions[idx], [field]: value };
    setEditing({ ...editing, sessions });
  };

  const inputClass = "w-full rounded-md border border-border bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary";

  if (editing) {
    return (
      <div>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-foreground">{isNew ? 'Novo Filme' : 'Editar Filme'}</h1>
          <div className="flex gap-2">
            <button onClick={() => setEditing(null)} className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm font-semibold text-secondary-foreground hover:bg-accent transition-colors">
              <X className="h-4 w-4" /> Cancelar
            </button>
            <button onClick={handleSave} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
              <Save className="h-4 w-4" /> Salvar
            </button>
          </div>
        </div>

        <div className="space-y-5 max-w-3xl">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Título *</label>
              <input type="text" value={editing.title || ''} onChange={e => setEditing({ ...editing, title: e.target.value })} className={inputClass} placeholder="Nome do filme" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Gênero</label>
              <input type="text" value={editing.genre || ''} onChange={e => setEditing({ ...editing, genre: e.target.value })} className={inputClass} placeholder="Ex: Ação, Aventura" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Duração</label>
              <input type="text" value={editing.duration || ''} onChange={e => setEditing({ ...editing, duration: e.target.value })} className={inputClass} placeholder="Ex: 1h 45min" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Classificação</label>
              <select value={editing.rating || 'L'} onChange={e => setEditing({ ...editing, rating: e.target.value as MovieRating })} className={inputClass}>
                <option value="L">Livre</option>
                <option value="10">10 anos</option>
                <option value="12">12 anos</option>
                <option value="14">14 anos</option>
                <option value="16">16 anos</option>
                <option value="18">18 anos</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Status</label>
              <select value={editing.status || 'now_playing'} onChange={e => setEditing({ ...editing, status: e.target.value as 'now_playing' | 'coming_soon' | 'pre_sale' })} className={inputClass}>
                <option value="now_playing">Em Cartaz</option>
                <option value="coming_soon">Em Breve</option>
                <option value="pre_sale">Pré-venda</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">URL do Pôster</label>
              <input type="url" value={editing.poster || ''} onChange={e => setEditing({ ...editing, poster: e.target.value })} className={inputClass} placeholder="https://..." />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">URL do Banner</label>
              <input type="url" value={editing.banner || ''} onChange={e => setEditing({ ...editing, banner: e.target.value })} className={inputClass} placeholder="https://..." />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Diretor</label>
              <input type="text" value={editing.director || ''} onChange={e => setEditing({ ...editing, director: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Data de estreia</label>
              <input type="date" value={editing.release_date || ''} onChange={e => setEditing({ ...editing, release_date: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Elenco</label>
            <input type="text" value={editing.cast_members || ''} onChange={e => setEditing({ ...editing, cast_members: e.target.value })} className={inputClass} placeholder="Nomes separados por vírgula" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-foreground mb-1">Sinopse</label>
            <textarea value={editing.synopsis || ''} onChange={e => setEditing({ ...editing, synopsis: e.target.value })} rows={3} className={`${inputClass} resize-none`} placeholder="Descrição do filme" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Data início em cartaz</label>
              <input type="date" value={editing.start_date || ''} onChange={e => setEditing({ ...editing, start_date: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1">Data fim em cartaz</label>
              <input type="date" value={editing.end_date || ''} onChange={e => setEditing({ ...editing, end_date: e.target.value })} className={inputClass} />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" id="featured" checked={editing.featured || false} onChange={e => setEditing({ ...editing, featured: e.target.checked })} className="h-4 w-4 rounded border-border accent-primary" />
            <label htmlFor="featured" className="text-sm font-semibold text-foreground">Destaque no banner principal</label>
          </div>

          {/* Sessions */}
          <div className="border-t border-border pt-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-primary" /> Sessões</h3>
              <button onClick={handleAddSession} className="flex items-center gap-1 rounded bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground hover:bg-accent transition-colors">
                <Plus className="h-3 w-3" /> Adicionar
              </button>
            </div>
            {(editing.sessions || []).length === 0 && <p className="text-sm text-muted-foreground">Nenhuma sessão cadastrada.</p>}
            <div className="space-y-3">
              {(editing.sessions || []).map((session, idx) => (
                <div key={session.id} className="flex items-center gap-2 rounded-md bg-card border border-border p-3">
                  <input type="time" value={session.time} onChange={e => handleSessionChange(idx, 'time', e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <input type="text" value={session.room} onChange={e => handleSessionChange(idx, 'room', e.target.value)} placeholder="Sala" className="flex-1 rounded border border-border bg-background px-2 py-1 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary" />
                  <select value={session.type} onChange={e => handleSessionChange(idx, 'type', e.target.value)} className="rounded border border-border bg-background px-2 py-1 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary">
                    <option value="2D">2D</option>
                    <option value="3D">3D</option>
                    <option value="IMAX">IMAX</option>
                  </select>
                  <button onClick={() => handleRemoveSession(idx)} className="text-destructive hover:text-destructive/80 transition-colors"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Filmes</h1>
          <p className="text-sm text-muted-foreground">Gerencie os filmes em cartaz e em breve</p>
        </div>
        <button onClick={handleNew} className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors">
          <Plus className="h-4 w-4" /> Novo Filme
        </button>
      </div>

      {/* Visit Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Total de Visitas</p>
                <p className="text-2xl font-bold text-foreground mt-1">{visitStats?.totalMovieVisits ?? '...'}</p>
              </div>
              <Eye className="h-5 w-5 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Visitas na Semana</p>
                <p className="text-2xl font-bold text-foreground mt-1">{visitStats?.weeklyMovieVisits ?? '...'}</p>
              </div>
              <Calendar className="h-5 w-5 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Mais Visitado</p>
                <p className="text-sm font-bold text-foreground mt-1 truncate">{visitStats?.topMovie?.title ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{visitStats?.topMovie ? `${visitStats.topMovie.total} visitas` : ''}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Top da Semana</p>
                <p className="text-sm font-bold text-foreground mt-1 truncate">{visitStats?.topMovieWeekly?.title ?? '—'}</p>
                <p className="text-xs text-muted-foreground">{visitStats?.topMovieWeekly ? `${visitStats.topMovieWeekly.weekly} visitas` : ''}</p>
              </div>
              <TrendingUp className="h-5 w-5 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full">
          <thead className="bg-card">
            <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3">Filme</th>
              <th className="px-4 py-3 hidden sm:table-cell">Gênero</th>
              <th className="px-4 py-3 hidden md:table-cell">Classificação</th>
              <th className="px-4 py-3 hidden md:table-cell">Status</th>
              <th className="px-4 py-3 hidden lg:table-cell">Sessões</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {movies.map(movie => (
              <tr key={movie.id} className="hover:bg-card/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-8 rounded bg-secondary overflow-hidden shrink-0">
                      {movie.poster && <img src={movie.poster} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div>
                      <p className="font-semibold text-sm text-foreground">{movie.title}</p>
                      <p className="text-xs text-muted-foreground sm:hidden">{movie.genre}</p>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden sm:table-cell">{movie.genre}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`rating-badge rating-${movie.rating} text-[10px]`}>{movie.rating}</span>
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${
                    movie.status === 'now_playing' ? 'bg-green-500/10 text-green-400' : 
                    movie.status === 'pre_sale' ? 'bg-amber-500/10 text-amber-400' : 
                    'bg-blue-500/10 text-blue-400'
                  }`}>
                    {movie.status === 'now_playing' ? 'Em Cartaz' : movie.status === 'pre_sale' ? 'Pré-venda' : 'Em Breve'}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground hidden lg:table-cell">{movie.sessions?.length || 0}</td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => handleEdit(movie)} className="p-1.5 rounded hover:bg-accent transition-colors text-muted-foreground hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                    <button onClick={() => handleDelete(movie.id)} className="p-1.5 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Nenhum filme cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
