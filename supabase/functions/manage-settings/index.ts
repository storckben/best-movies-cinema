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
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, serviceRoleKey)

    // GET - public read
    if (req.method === 'GET') {
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')

      if (error) throw error
      return new Response(JSON.stringify(data), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // POST - admin only
    const adminPassword = req.headers.get('x-admin-password')
    const storedPassword = Deno.env.get('ADMIN_PASSWORD')

    if (!storedPassword || adminPassword !== storedPassword) {
      return new Response(
        JSON.stringify({ error: 'Não autorizado' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const body = await req.json()
    const { key, value } = body

    if (!key) {
      return new Response(
        JSON.stringify({ error: 'Key é obrigatória' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Upsert: try update first, if no rows affected then insert
    const { data: existing } = await supabase
      .from('site_settings')
      .select('id')
      .eq('key', key)
      .maybeSingle()

    let data, error
    if (existing) {
      const result = await supabase
        .from('site_settings')
        .update({ value })
        .eq('key', key)
        .select()
        .maybeSingle()
      data = result.data
      error = result.error
    } else {
      const result = await supabase
        .from('site_settings')
        .insert({ key, value })
        .select()
        .maybeSingle()
      data = result.data
      error = result.error
    }

    if (error) throw error

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || 'Erro interno' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
