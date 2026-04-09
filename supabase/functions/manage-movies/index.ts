import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-admin-password',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify admin password from header
    const adminPassword = req.headers.get('x-admin-password')
    const storedPassword = Deno.env.get('ADMIN_PASSWORD')

    if (!storedPassword || adminPassword !== storedPassword) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    const url = new URL(req.url)
    const action = url.searchParams.get('action')

    // LIST movies
    if (req.method === 'GET' || action === 'list') {
      const { data: movies, error } = await supabase
        .from('movies')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      // Fetch sessions for each movie
      const movieIds = (movies || []).map(m => m.id)
      const { data: sessions, error: sessErr } = await supabase
        .from('movie_sessions')
        .select('*')
        .in('movie_id', movieIds.length > 0 ? movieIds : ['00000000-0000-0000-0000-000000000000'])

      if (sessErr) throw sessErr

      const result = (movies || []).map(m => ({
        ...m,
        sessions: (sessions || []).filter(s => s.movie_id === m.id),
      }))

      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()

    // CREATE movie
    if (action === 'create') {
      const { sessions, ...movieData } = body

      const { data: movie, error } = await supabase
        .from('movies')
        .insert(movieData)
        .select()
        .single()

      if (error) throw error

      // Insert sessions
      if (sessions && sessions.length > 0) {
        const sessionsToInsert = sessions.map((s: any) => ({
          movie_id: movie.id,
          time: s.time,
          room: s.room,
          type: s.type || '2D',
        }))
        const { error: sessErr } = await supabase
          .from('movie_sessions')
          .insert(sessionsToInsert)
        if (sessErr) throw sessErr
      }

      return new Response(JSON.stringify(movie), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // UPDATE movie
    if (action === 'update') {
      const { id, sessions, ...movieData } = body
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      // Remove fields that shouldn't be updated
      delete movieData.created_at
      delete movieData.updated_at

      const { data: movie, error } = await supabase
        .from('movies')
        .update(movieData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      // Replace sessions: delete old, insert new
      const { error: delErr } = await supabase
        .from('movie_sessions')
        .delete()
        .eq('movie_id', id)
      if (delErr) throw delErr

      if (sessions && sessions.length > 0) {
        const sessionsToInsert = sessions.map((s: any) => ({
          movie_id: id,
          time: s.time,
          room: s.room,
          type: s.type || '2D',
        }))
        const { error: sessErr } = await supabase
          .from('movie_sessions')
          .insert(sessionsToInsert)
        if (sessErr) throw sessErr
      }

      return new Response(JSON.stringify(movie), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // DELETE movie
    if (action === 'delete') {
      const { id } = body
      if (!id) {
        return new Response(JSON.stringify({ error: 'ID é obrigatório' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }

      const { error } = await supabase
        .from('movies')
        .delete()
        .eq('id', id)

      if (error) throw error

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    return new Response(JSON.stringify({ error: 'Ação inválida' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
