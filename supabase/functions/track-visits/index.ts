const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  const url = new URL(req.url)

  try {
    if (req.method === 'POST') {
      const body = await req.json()
      const { page, movie_id, visitor_id } = body

      if (!page || typeof page !== 'string') {
        return new Response(JSON.stringify({ error: 'page is required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase.from('page_visits').insert({
        page,
        movie_id: movie_id || null,
        visitor_id: visitor_id || null,
      })

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (req.method === 'GET') {
      const action = url.searchParams.get('action')

      const now = new Date()
      const weekStart = new Date(now)
      weekStart.setDate(now.getDate() - now.getDay())
      weekStart.setHours(0, 0, 0, 0)
      const weekStartISO = weekStart.toISOString()

      if (action === 'dashboard') {
        // Total visits all time
        const { count: totalVisits } = await supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })

        // Weekly visits
        const { count: weeklyVisits } = await supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .gte('visited_at', weekStartISO)

        // Daily visits for the week (for chart)
        const { data: weekData } = await supabase
          .from('page_visits')
          .select('visited_at')
          .gte('visited_at', weekStartISO)

        const dailyCounts: Record<string, number> = {}
        const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
        for (let i = 0; i < 7; i++) {
          const d = new Date(weekStart)
          d.setDate(weekStart.getDate() + i)
          dailyCounts[dayNames[i]] = 0
        }
        if (weekData) {
          for (const row of weekData) {
            const day = new Date(row.visited_at).getDay()
            dailyCounts[dayNames[day]]++
          }
        }

        const chartData = Object.entries(dailyCounts).map(([day, count]) => ({
          date: day,
          acessos: count,
        }))

        // Most visited movie all time
        const { data: topMovie } = await supabase
          .from('page_visits')
          .select('movie_id, movies(title)')
          .not('movie_id', 'is', null)
          .limit(1000)

        const movieCounts: Record<string, { count: number; title: string }> = {}
        if (topMovie) {
          for (const row of topMovie as any[]) {
            const mid = row.movie_id
            if (!movieCounts[mid]) {
              movieCounts[mid] = { count: 0, title: row.movies?.title || 'Desconhecido' }
            }
            movieCounts[mid].count++
          }
        }
        const topMovieEntry = Object.values(movieCounts).sort((a, b) => b.count - a.count)[0]

        return new Response(JSON.stringify({
          totalVisits: totalVisits || 0,
          weeklyVisits: weeklyVisits || 0,
          chartData,
          topMovie: topMovieEntry ? { title: topMovieEntry.title, count: topMovieEntry.count } : null,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      if (action === 'movies') {
        // Total visits to movie pages
        const { count: totalMovieVisits } = await supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .not('movie_id', 'is', null)

        // Weekly movie visits
        const { count: weeklyMovieVisits } = await supabase
          .from('page_visits')
          .select('*', { count: 'exact', head: true })
          .not('movie_id', 'is', null)
          .gte('visited_at', weekStartISO)

        // All movie visits for ranking
        const { data: allMovieVisits } = await supabase
          .from('page_visits')
          .select('movie_id, visited_at, movies(title)')
          .not('movie_id', 'is', null)
          .limit(1000)

        const movieStats: Record<string, { title: string; total: number; weekly: number }> = {}
        if (allMovieVisits) {
          for (const row of allMovieVisits as any[]) {
            const mid = row.movie_id
            if (!movieStats[mid]) {
              movieStats[mid] = { title: row.movies?.title || 'Desconhecido', total: 0, weekly: 0 }
            }
            movieStats[mid].total++
            if (new Date(row.visited_at) >= weekStart) {
              movieStats[mid].weekly++
            }
          }
        }

        const sorted = Object.values(movieStats).sort((a, b) => b.total - a.total)
        const sortedWeekly = Object.values(movieStats).sort((a, b) => b.weekly - a.weekly)

        return new Response(JSON.stringify({
          totalMovieVisits: totalMovieVisits || 0,
          weeklyMovieVisits: weeklyMovieVisits || 0,
          topMovie: sorted[0] || null,
          topMovieWeekly: sortedWeekly[0] || null,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      return new Response(JSON.stringify({ error: 'Invalid action' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error(err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
