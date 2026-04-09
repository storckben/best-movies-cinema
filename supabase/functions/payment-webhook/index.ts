const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
    const body = await req.json()
    console.log('Webhook received:', JSON.stringify(body))

    // Detect gateway format and extract transaction ID + status
    let transactionId = ''
    let rawStatus = ''
    let detectedGateway = ''

    // Syncpay format: { data: { id, status, ... } } with header event: cashin.update
    if (body.data && body.data.id) {
      transactionId = body.data.id
      rawStatus = (body.data.status || '').toLowerCase()
      detectedGateway = 'syncpay'
    }
    // GestãoPay format: { Id, Status, Amount, ... }
    else if (body.Id || body.id) {
      transactionId = body.Id || body.id
      rawStatus = (body.Status || body.status || '').toLowerCase()
      detectedGateway = 'gestaopay'
    }
    // Fallback
    else {
      transactionId = body.transaction_id || body.payment_id || body.charge_id || ''
      rawStatus = (body.status || '').toLowerCase()
    }

    if (!transactionId) {
      console.error('Webhook: missing transaction ID')
      return new Response(JSON.stringify({ error: 'Missing transaction ID' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Map gateway statuses to our order_status enum
    let orderStatus: 'pending' | 'paid' | 'expired' | 'refunded' = 'pending'

    // GestãoPay: PAID, PENDING, EXPIRED, REFUNDED, REFUSED, ERROR
    // Syncpay: completed, pending, expired, refunded
    if (['paid', 'approved', 'confirmed', 'completed', 'pago'].includes(rawStatus)) {
      orderStatus = 'paid'
    } else if (['expired', 'canceled', 'cancelled', 'expirado', 'cancelado', 'refused', 'error'].includes(rawStatus)) {
      orderStatus = 'expired'
    } else if (['refunded', 'reversed', 'reembolsado', 'estornado', 'chargeback', 'prechargeback'].includes(rawStatus)) {
      orderStatus = 'refunded'
    } else if (['pending', 'waiting', 'processing', 'pendente', 'aguardando'].includes(rawStatus)) {
      orderStatus = 'pending'
    }

    // Find the order by transaction_id
    const { data: order, error: findError } = await supabase
      .from('orders')
      .select('id, status, customer_email, customer_name, movie_title, seats, amount, pix_code')
      .eq('transaction_id', transactionId)
      .single()

    if (findError || !order) {
      console.error('Webhook: order not found for transaction', transactionId)
      return new Response(JSON.stringify({ received: true, warning: 'Order not found' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Update order status
    const updateData: Record<string, unknown> = {
      status: orderStatus,
      webhook_data: body,
    }

    if (orderStatus === 'paid') {
      updateData.paid_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', order.id)

    if (updateError) {
      console.error('Webhook: failed to update order', updateError)
      return new Response(JSON.stringify({ error: 'Failed to update order' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Webhook: order ${order.id} updated to ${orderStatus} (gateway: ${detectedGateway})`)

    // Send confirmation email if paid
    if (orderStatus === 'paid' && order.customer_email) {
      try {
        const emailRes = await fetch(`${supabaseUrl}/functions/v1/send-email`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${serviceRoleKey}`,
          },
          body: JSON.stringify({
            type: 'payment_confirmed',
            to: order.customer_email,
            data: {
              customer_name: order.customer_name,
              movie_title: order.movie_title,
              seats: order.seats,
              amount: order.amount,
              order_id: order.id,
              transaction_id: transactionId,
            },
          }),
        })
        const emailResult = await emailRes.json()
        console.log('Confirmation email result:', emailResult)
      } catch (emailErr) {
        console.error('Failed to send confirmation email:', emailErr)
      }
    }

    return new Response(JSON.stringify({
      received: true,
      order_id: order.id,
      status: orderStatus,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (err) {
    console.error('Webhook error:', err)
    return new Response(JSON.stringify({ error: 'Internal error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
