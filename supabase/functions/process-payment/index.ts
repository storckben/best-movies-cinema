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

  try {
    if (req.method !== 'POST') {
      return new Response(JSON.stringify({ error: 'Method not allowed' }), {
        status: 405,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const body = await req.json()
    const { amount, customer_name, customer_email, customer_cpf, movie_title, seats, description } = body

    if (!amount || !customer_name || !customer_email || !customer_cpf) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Get gateway config from site_settings
    const { data: gatewayConfig } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'gateway_config')
      .single()

    if (!gatewayConfig?.value) {
      return new Response(JSON.stringify({ error: 'Gateway not configured' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const rawConfig = gatewayConfig.value as any

    // Determine primary and fallback gateways
    let primaryGateway: string
    if (rawConfig.active_gateway) {
      primaryGateway = rawConfig.active_gateway
    } else {
      primaryGateway = rawConfig.gateway || 'gestaopay'
    }
    const fallbackGateway = primaryGateway === 'gestaopay' ? 'syncpay' : 'gestaopay'

    function getKeys(gw: string) {
      if (rawConfig[gw]?.public_key && rawConfig[gw]?.secret_key) {
        return { public_key: rawConfig[gw].public_key, secret_key: rawConfig[gw].secret_key }
      }
      if (gw === primaryGateway && rawConfig.public_key && rawConfig.secret_key) {
        return { public_key: rawConfig.public_key, secret_key: rawConfig.secret_key }
      }
      return null
    }

    const paymentDescription = 'Mentoria personalizada'
    const amountCents = Math.max(10, Math.round(amount * 100))
    const paymentInput: PaymentInput = { amount: amountCents, customer_name, customer_email, customer_cpf, description: paymentDescription }

    let pixData: { qr_code: string; qr_code_text: string; transaction_id: string; status: string }
    let usedGateway = primaryGateway

    // Try primary gateway
    const primaryKeys = getKeys(primaryGateway)
    if (!primaryKeys) {
      console.error(`Primary gateway ${primaryGateway} has no keys configured`)
    }

    let primarySuccess = false
    if (primaryKeys) {
      try {
        console.log(`Trying primary gateway: ${primaryGateway}`)
        pixData = await processGateway(primaryGateway, { ...primaryKeys, gateway: primaryGateway }, paymentInput)
        primarySuccess = true
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`[FALLBACK] Primary gateway "${primaryGateway}" failed. Reason: ${errMsg}`)
      }
    }

    // Fallback to secondary gateway
    if (!primarySuccess) {
      const fallbackKeys = getKeys(fallbackGateway)
      if (!fallbackKeys) {
        return new Response(JSON.stringify({ error: 'Ambas as gateways falharam ou não estão configuradas' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
      try {
        console.log(`[FALLBACK] Trying fallback gateway: ${fallbackGateway}`)
        pixData = await processGateway(fallbackGateway, { ...fallbackKeys, gateway: fallbackGateway }, paymentInput)
        usedGateway = fallbackGateway
        console.log(`[FALLBACK] Fallback gateway "${fallbackGateway}" succeeded`)
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : String(err)
        console.error(`[FALLBACK] Fallback gateway "${fallbackGateway}" also failed. Reason: ${errMsg}`)
        return new Response(JSON.stringify({ error: 'Ambas as gateways falharam ao gerar o PIX' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        })
      }
    }

    // Save order to database
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        transaction_id: pixData.transaction_id,
        gateway: usedGateway,
        status: 'pending',
        amount,
        movie_title: movie_title || 'N/A',
        seats: seats || '',
        customer_name,
        customer_email,
        customer_cpf: customer_cpf.replace(/\D/g, ''),
        pix_code: pixData.qr_code_text,
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('Failed to save order:', orderError)
    }

    // Send pending payment email
    if (order?.id && customer_email) {
      try {
        await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            type: 'payment_pending',
            to: customer_email,
            data: {
              customer_name,
              movie_title: movie_title || 'N/A',
              seats: seats || '',
              amount,
              pix_code: pixData.qr_code_text,
              qr_code: pixData.qr_code,
              order_id: order.id,
            },
          }),
        })
      } catch (emailErr) {
        console.error('Failed to send pending email:', emailErr)
      }
    }

    return new Response(JSON.stringify({
      success: true,
      gateway: usedGateway,
      fallback_used: usedGateway !== primaryGateway,
      order_id: order?.id || null,
      ...pixData,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Payment error:', err)
    return new Response(JSON.stringify({
      error: err instanceof Error ? err.message : 'Internal error',
      fallback: true,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})

async function processGateway(
  gateway: string,
  config: { public_key: string; secret_key: string },
  input: PaymentInput
) {
  if (gateway === 'gestaopay') {
    return processGestãoPay(config, input)
  } else if (gateway === 'syncpay') {
    return processSyncpay(config, input)
  }
  throw new Error(`Gateway desconhecida: ${gateway}`)
}


interface PaymentInput {
  amount: number
  customer_name: string
  customer_email: string
  customer_cpf: string
  description: string
}

async function processGestãoPay(
  config: { public_key: string; secret_key: string },
  input: PaymentInput
) {
  const auth = btoa(`${config.public_key}:${config.secret_key}`)
  const cpfClean = input.customer_cpf.replace(/\D/g, '')

  const payload = {
    payment_method: 'pix',
    customer: {
      document: {
        type: 'cpf',
        number: cpfClean,
      },
      name: input.customer_name,
      email: input.customer_email,
      phone: '+5500000000000',
    },
    amount: input.amount,
    postback_url: 'https://mhyptyktlxnnjmhxywyj.supabase.co/functions/v1/payment-webhook',
    items: [
      {
        title: 'Mentoria Personalizada',
        unit_price: input.amount,
        quantity: 1,
        tangible: false,
      },
    ],
    metadata: {
      prevenda: 'false',
    },
  }

  console.log('GestãoPay payload:', JSON.stringify(payload))

  const response = await fetch('https://api.gestaopayments.com/v1/payment-transaction/create', {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  const responseText = await response.text()
  console.log('GestãoPay response:', response.status, responseText)

  if (!response.ok) {
    throw new Error(`GestãoPay error: ${response.status} - ${responseText}`)
  }

  const parsed = JSON.parse(responseText)
  // GestãoPay wraps response in { data: { ... }, success: true }
  const data = parsed.data || parsed

  return {
    qr_code: data.pix?.qr_code || '',
    qr_code_text: data.pix?.qr_code || '',
    transaction_id: data.id || '',
    status: data.status || 'PENDING',
    expiration_date: data.pix?.expiration_date || '',
  }
}

// Cache do token SyncPay em memória
let cachedSyncpayToken: string | null = null;
let syncpayTokenExpiresAt = 0;

async function getSyncPayToken(config: { public_key: string; secret_key: string }): Promise<string> {
  const now = Date.now();
  if (cachedSyncpayToken && syncpayTokenExpiresAt > now + 5 * 60 * 1000) {
    console.log('Usando token SyncPay em cache')
    return cachedSyncpayToken;
  }

  console.log('Gerando novo token SyncPay...')
  const response = await fetch('https://api.syncpayments.com.br/api/partner/v1/auth-token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client_id: config.public_key, client_secret: config.secret_key }),
  });

  const responseText = await response.text();
  console.log('Syncpay auth response:', response.status, responseText);

  if (!response.ok) {
    throw new Error(`Syncpay auth error: ${response.status} - ${responseText}`);
  }

  const data = JSON.parse(responseText);
  cachedSyncpayToken = data.access_token;
  syncpayTokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  console.log('Token SyncPay gerado com sucesso');
  return cachedSyncpayToken!;
}

function parseSyncpayPixCode(data: Record<string, any>): string {
  const pix = data.pix || null;
  const qrCodeObj = data.qrCode || null;
  const paymentData = data.payment_data || null;

  return (
    data.pix_code || data.pixCode || data.brcode || data.pix_payload ||
    data.copy_paste_code || data.copy_and_paste || data.qrCodeText ||
    (pix?.qr_code) || (pix?.copyPaste) || (pix?.copy_paste) ||
    (pix?.pix_payload) || (pix?.code) || (pix?.qrCodeText) ||
    (qrCodeObj?.text) ||
    (paymentData?.pix_code) || (paymentData?.pix_payload) ||
    ''
  );
}

async function processSyncpay(
  config: { public_key: string; secret_key: string },
  input: PaymentInput
) {
  const token = await getSyncPayToken(config);
  const cpfClean = input.customer_cpf.replace(/\D/g, '');

  const payload = {
    amount: input.amount,
    description: 'Mentoria Personalizada',
    client: {
      name: input.customer_name,
      cpf: cpfClean,
      email: input.customer_email || 'naoinformado@email.com',
      phone: '00000000000',
    },
  };

  console.log('Syncpay cash-in payload:', JSON.stringify(payload));

  const response = await fetch('https://api.syncpayments.com.br/api/partner/v1/cash-in', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const responseText = await response.text();
  console.log(`[Syncpay] cash-in response: HTTP ${response.status} | Body: ${responseText}`);

  if (!response.ok) {
    if (response.status === 401) {
      cachedSyncpayToken = null;
      syncpayTokenExpiresAt = 0;
    }
    throw new Error(`[Syncpay] cash-in failed: HTTP ${response.status} | Reason: ${responseText}`);
  }

  const data = JSON.parse(responseText);
  const pixCode = parseSyncpayPixCode(data);

  if (!pixCode) {
    throw new Error(`[Syncpay] Nenhum código PIX retornado. Response: ${responseText}`);
  }

  const transactionId =
    data.identifier || data.transaction_id || data.transactionId || data.id || '';

  return {
    qr_code: pixCode,
    qr_code_text: pixCode,
    transaction_id: transactionId,
    status: data.status || 'pending',
    expiration_date: data.pix?.expiration_date || data.expiration_date || '',
  };
}
