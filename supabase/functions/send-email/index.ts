const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

function generateTicketQRCodeSVG(orderId: string): string {
  // Generate a simple QR-like pattern as SVG for the ticket
  const code = orderId.replace(/-/g, '').slice(0, 16).toUpperCase()
  const size = 200
  const cellSize = size / 10
  let cells = ''
  
  // Create a deterministic pattern based on the order ID
  for (let y = 0; y < 10; y++) {
    for (let x = 0; x < 10; x++) {
      const charCode = code.charCodeAt((y * 10 + x) % code.length)
      if ((charCode + x * y) % 3 !== 0) {
        cells += `<rect x="${x * cellSize}" y="${y * cellSize}" width="${cellSize}" height="${cellSize}" fill="#000"/>`
      }
    }
  }
  
  // Add position markers (corners)
  const marker = (mx: number, my: number) => `
    <rect x="${mx}" y="${my}" width="${cellSize * 3}" height="${cellSize * 3}" fill="#000"/>
    <rect x="${mx + cellSize * 0.5}" y="${my + cellSize * 0.5}" width="${cellSize * 2}" height="${cellSize * 2}" fill="#fff"/>
    <rect x="${mx + cellSize}" y="${my + cellSize}" width="${cellSize}" height="${cellSize}" fill="#000"/>
  `
  
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" fill="#fff"/>
    ${cells}
    ${marker(0, 0)}
    ${marker(size - cellSize * 3, 0)}
    ${marker(0, size - cellSize * 3)}
  </svg>`
}

function buildPendingEmailHTML(data: {
  customer_name: string
  movie_title: string
  seats: string
  amount: number
  pix_code: string
  qr_code: string
  order_id: string
}): string {
  const qrImageTag = data.qr_code 
    ? `<img src="${data.qr_code}" alt="QR Code PIX" width="220" height="220" style="display:block;margin:0 auto;border-radius:12px;"/>`
    : `<div style="width:220px;height:220px;background:#f3f4f6;border-radius:12px;display:flex;align-items:center;justify-content:center;margin:0 auto;font-size:14px;color:#6b7280;">QR Code indisponível</div>`

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111111;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1c1c1c;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
  
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#dc2626,#991b1b);padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">🎬 Pagamento Pendente</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Escaneie o QR Code ou copie o código PIX para pagar</p>
  </td></tr>

  <!-- QR Code -->
  <tr><td style="padding:32px 40px;text-align:center;">
    <div style="background:#ffffff;border-radius:16px;padding:24px;display:inline-block;">
      ${qrImageTag}
    </div>
  </td></tr>

  <!-- PIX Code -->
  <tr><td style="padding:0 40px 24px;">
    <p style="color:#8b8b8b;font-size:12px;margin:0 0 8px;text-transform:uppercase;font-weight:600;letter-spacing:1px;">Código Copia e Cola</p>
    <div style="background:#0a0a0a;border:1px solid #333;border-radius:10px;padding:16px;word-break:break-all;font-family:monospace;font-size:11px;color:#e5e5e5;line-height:1.5;">
      ${data.pix_code || 'Código não disponível'}
    </div>
  </td></tr>

  <!-- Order details -->
  <tr><td style="padding:0 40px 32px;">
    <div style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#8b8b8b;font-size:13px;padding:6px 0;">Filme</td>
          <td style="color:#e5e5e5;font-size:13px;padding:6px 0;text-align:right;font-weight:600;">${data.movie_title}</td>
        </tr>
        <tr>
          <td style="color:#8b8b8b;font-size:13px;padding:6px 0;">Poltronas</td>
          <td style="color:#e5e5e5;font-size:13px;padding:6px 0;text-align:right;font-weight:600;">${data.seats || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color:#8b8b8b;font-size:13px;padding:6px 0;">Cliente</td>
          <td style="color:#e5e5e5;font-size:13px;padding:6px 0;text-align:right;font-weight:600;">${data.customer_name}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top:1px solid #2a2a2a;padding-top:12px;margin-top:8px;"></td>
        </tr>
        <tr>
          <td style="color:#ffffff;font-size:16px;font-weight:700;padding:4px 0;">Total</td>
          <td style="color:#dc2626;font-size:18px;font-weight:800;padding:4px 0;text-align:right;">R$ ${Number(data.amount).toFixed(2)}</td>
        </tr>
      </table>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0a0a0a;padding:20px 40px;text-align:center;border-top:1px solid #2a2a2a;">
    <p style="margin:0;color:#6b6b6b;font-size:11px;">Pedido #${(data.order_id || '').slice(0, 8).toUpperCase()}</p>
    <p style="margin:4px 0 0;color:#4b4b4b;font-size:10px;">Este é um email automático. Por favor, não responda.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

function buildConfirmedEmailHTML(data: {
  customer_name: string
  movie_title: string
  seats: string
  amount: number
  order_id: string
  transaction_id: string
}): string {
  const qrSvg = generateTicketQRCodeSVG(data.order_id)
  const qrBase64 = btoa(qrSvg)
  const qrDataUri = `data:image/svg+xml;base64,${qrBase64}`

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#111111;font-family:'Inter',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#111111;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#1c1c1c;border-radius:16px;overflow:hidden;border:1px solid #2a2a2a;">
  
  <!-- Header -->
  <tr><td style="background:linear-gradient(135deg,#16a34a,#15803d);padding:32px 40px;text-align:center;">
    <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">✅ Pagamento Confirmado!</h1>
    <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">Seus ingressos estão prontos. Bom filme!</p>
  </td></tr>

  <!-- Ticket QR Code -->
  <tr><td style="padding:32px 40px;text-align:center;">
    <p style="color:#8b8b8b;font-size:12px;margin:0 0 16px;text-transform:uppercase;font-weight:600;letter-spacing:1px;">Seu Ingresso Digital</p>
    <div style="background:#ffffff;border-radius:16px;padding:24px;display:inline-block;">
      <img src="${qrDataUri}" alt="QR Code Ingresso" width="200" height="200" style="display:block;margin:0 auto;"/>
    </div>
    <p style="color:#e5e5e5;font-size:13px;margin:16px 0 0;font-weight:500;">📱 Apresente este QR Code no balcão de atendimento</p>
    <p style="color:#6b6b6b;font-size:11px;margin:4px 0 0;">Código: ${(data.order_id || '').slice(0, 8).toUpperCase()}</p>
  </td></tr>

  <!-- Order details -->
  <tr><td style="padding:0 40px 32px;">
    <div style="background:#0a0a0a;border:1px solid #2a2a2a;border-radius:12px;padding:20px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="color:#8b8b8b;font-size:13px;padding:6px 0;">Filme</td>
          <td style="color:#e5e5e5;font-size:13px;padding:6px 0;text-align:right;font-weight:600;">${data.movie_title}</td>
        </tr>
        <tr>
          <td style="color:#8b8b8b;font-size:13px;padding:6px 0;">Poltronas</td>
          <td style="color:#e5e5e5;font-size:13px;padding:6px 0;text-align:right;font-weight:600;">${data.seats || 'N/A'}</td>
        </tr>
        <tr>
          <td style="color:#8b8b8b;font-size:13px;padding:6px 0;">Cliente</td>
          <td style="color:#e5e5e5;font-size:13px;padding:6px 0;text-align:right;font-weight:600;">${data.customer_name}</td>
        </tr>
        <tr>
          <td colspan="2" style="border-top:1px solid #2a2a2a;padding-top:12px;margin-top:8px;"></td>
        </tr>
        <tr>
          <td style="color:#ffffff;font-size:16px;font-weight:700;padding:4px 0;">Total Pago</td>
          <td style="color:#16a34a;font-size:18px;font-weight:800;padding:4px 0;text-align:right;">R$ ${Number(data.amount).toFixed(2)}</td>
        </tr>
      </table>
    </div>
  </td></tr>

  <!-- Instructions -->
  <tr><td style="padding:0 40px 24px;">
    <div style="background:#16a34a15;border:1px solid #16a34a30;border-radius:12px;padding:16px;text-align:center;">
      <p style="margin:0;color:#4ade80;font-size:13px;font-weight:600;">🎟️ Basta apresentar o QR Code acima no balcão de atendimento para retirar seus ingressos</p>
    </div>
  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#0a0a0a;padding:20px 40px;text-align:center;border-top:1px solid #2a2a2a;">
    <p style="margin:0;color:#6b6b6b;font-size:11px;">Transação: ${data.transaction_id || 'N/A'}</p>
    <p style="margin:4px 0 0;color:#4b4b4b;font-size:10px;">Este é um email automático. Por favor, não responda.</p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

async function sendSMTPEmail(
  smtpConfig: { host: string; port: number; user: string; pass: string; from_email: string; encryption: string },
  to: string,
  subject: string,
  html: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Use Deno's built-in SMTP capabilities via denopkg
    const { SMTPClient } = await import('https://deno.land/x/denomailer@1.6.0/mod.ts')
    
    const client = new SMTPClient({
      connection: {
        hostname: smtpConfig.host,
        port: smtpConfig.port,
        tls: smtpConfig.encryption === 'tls',
        auth: {
          username: smtpConfig.user,
          password: smtpConfig.pass,
        },
      },
    })

    await client.send({
      from: smtpConfig.from_email,
      to: to,
      subject: subject,
      content: 'Seu cliente de email não suporta HTML.',
      html: html,
    })

    await client.close()
    return { success: true }
  } catch (err) {
    console.error('SMTP send error:', err)
    return { success: false, error: err instanceof Error ? err.message : 'Unknown SMTP error' }
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceRoleKey)

  try {
    const { type, to, data } = await req.json()

    if (!type || !to || !data) {
      return new Response(JSON.stringify({ error: 'Missing type, to, or data' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Load SMTP config from site_settings
    const { data: smtpSetting } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'smtp_config')
      .single()

    if (!smtpSetting?.value) {
      console.error('SMTP not configured')
      return new Response(JSON.stringify({ error: 'SMTP not configured', sent: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const smtp = smtpSetting.value as any

    if (!smtp.host || !smtp.from_email) {
      return new Response(JSON.stringify({ error: 'SMTP config incomplete', sent: false }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    let subject = ''
    let html = ''

    if (type === 'payment_pending') {
      subject = `🎬 Pagamento Pendente - ${data.movie_title}`
      html = buildPendingEmailHTML(data)
    } else if (type === 'payment_confirmed') {
      subject = `✅ Pagamento Confirmado - ${data.movie_title}`
      html = buildConfirmedEmailHTML(data)
    } else {
      return new Response(JSON.stringify({ error: 'Unknown email type' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const result = await sendSMTPEmail(
      {
        host: smtp.host,
        port: Number(smtp.port) || 587,
        user: smtp.user || '',
        pass: smtp.pass || '',
        from_email: smtp.from_email,
        encryption: smtp.encryption || 'tls',
      },
      to,
      subject,
      html
    )

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Send email error:', err)
    return new Response(JSON.stringify({ error: 'Internal error', sent: false }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
