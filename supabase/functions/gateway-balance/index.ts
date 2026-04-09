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
    const adminPassword = req.headers.get('x-admin-password')
    const storedPassword = Deno.env.get('ADMIN_PASSWORD')
    if (!storedPassword || adminPassword !== storedPassword) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    )

    const { data: setting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'gateway_config')
      .maybeSingle()

    if (!setting?.value) {
      return new Response(JSON.stringify({ gestaopay: null, syncpay: null }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const config = setting.value as any
    const gestaopayKeys = config.gestaopay || {}
    const syncpayKeys = config.syncpay || {}

    const results: Record<string, any> = { gestaopay: null, syncpay: null }

    // GestãoPay: GET /v1/dashboard/balance with Basic Auth
    if (gestaopayKeys.public_key && gestaopayKeys.secret_key) {
      try {
        const auth = btoa(`${gestaopayKeys.public_key}:${gestaopayKeys.secret_key}`)
        const res = await fetch('https://api.gestaopayments.com/v1/dashboard/balance', {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${auth}`,
            'Accept': 'application/json',
          },
        })
        if (res.ok) {
          const json = await res.json()
          // GestãoPay returns { data: { amount: 14229 }, success: true }
          const amount = json.data?.amount ?? json.balance ?? json.available ?? null
          // amount is in centavos, convert to reais
          const balance = amount != null ? (amount / 100).toFixed(2) : null
          results.gestaopay = { balance, raw: json }
        } else {
          const text = await res.text()
          console.log('GestãoPay balance:', res.status, text)
          results.gestaopay = { error: `HTTP ${res.status}`, balance: null }
        }
      } catch (e) {
        console.error('GestãoPay error:', e)
        results.gestaopay = { error: e.message, balance: null }
      }
    }

    // Syncpay: first get auth token, then query balance
    if (syncpayKeys.public_key && syncpayKeys.secret_key) {
      try {
        // Step 1: Get bearer token
        const tokenRes = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: syncpayKeys.public_key,
            client_secret: syncpayKeys.secret_key,
          }),
        })

        if (!tokenRes.ok) {
          const text = await tokenRes.text()
          console.log('Syncpay token error:', tokenRes.status, text)
          results.syncpay = { error: `Auth failed: HTTP ${tokenRes.status}`, balance: null }
        } else {
          const tokenData = await tokenRes.json()
          const accessToken = tokenData.access_token || tokenData.token

          if (!accessToken) {
            results.syncpay = { error: 'No token returned', balance: null }
          } else {
            // Step 2: Get balance
            const balRes = await fetch('https://api.syncpayments.com.br/api/partner/v1/balance', {
              method: 'GET',
              headers: { 'Authorization': `Bearer ${accessToken}` },
            })

            if (balRes.ok) {
              const data = await balRes.json()
              results.syncpay = { balance: data.balance ?? null, raw: data }
            } else {
              const text = await balRes.text()
              console.log('Syncpay balance:', balRes.status, text)
              results.syncpay = { error: `HTTP ${balRes.status}`, balance: null }
            }
          }
        }
      } catch (e) {
        console.error('Syncpay error:', e)
        results.syncpay = { error: e.message, balance: null }
      }
    }

    return new Response(JSON.stringify(results), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
