import { createClient } from 'npm:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const BASE_DELAY_MIN = 2 // 2,4,8,16,32,64 minutes
const BATCH_LIMIT = 25

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  const supabase = createClient(supabaseUrl, serviceKey)

  const now = new Date()
  const { data: due, error: dueError } = await supabase
    .from('signup_confirmation_retries')
    .select('*')
    .is('completed_at', null)
    .lte('next_retry_at', now.toISOString())
    .order('next_retry_at', { ascending: true })
    .limit(BATCH_LIMIT)

  if (dueError) {
    console.error('Failed to fetch due retries', dueError)
    return new Response(JSON.stringify({ error: dueError.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  let processed = 0
  let confirmed = 0
  let resent = 0
  let failed = 0
  let exhausted = 0

  for (const row of due ?? []) {
    processed++

    // 1. Skip & complete if user is already confirmed
    const { data: userRes } = await supabase.auth.admin.getUserById(row.user_id)
    if (userRes?.user?.email_confirmed_at) {
      await supabase
        .from('signup_confirmation_retries')
        .update({ completed_at: now.toISOString(), last_error: null })
        .eq('id', row.id)
      confirmed++
      continue
    }

    // 2. Resend confirmation via Supabase auth
    const attempt = row.attempt_count + 1
    const { error: resendError } = await supabase.auth.resend({
      type: 'signup',
      email: row.email,
    } as never)

    if (resendError) {
      failed++
      const isExhausted = attempt >= row.max_attempts
      const nextDelayMin = BASE_DELAY_MIN * Math.pow(2, attempt)
      await supabase
        .from('signup_confirmation_retries')
        .update({
          attempt_count: attempt,
          last_attempt_at: now.toISOString(),
          last_error: resendError.message.slice(0, 1000),
          next_retry_at: new Date(now.getTime() + nextDelayMin * 60 * 1000).toISOString(),
          completed_at: isExhausted ? now.toISOString() : null,
        })
        .eq('id', row.id)
      if (isExhausted) exhausted++
      continue
    }

    resent++
    const isExhausted = attempt >= row.max_attempts
    const nextDelayMin = BASE_DELAY_MIN * Math.pow(2, attempt)
    await supabase
      .from('signup_confirmation_retries')
      .update({
        attempt_count: attempt,
        last_attempt_at: now.toISOString(),
        last_error: null,
        next_retry_at: new Date(now.getTime() + nextDelayMin * 60 * 1000).toISOString(),
        completed_at: isExhausted ? now.toISOString() : null,
      })
      .eq('id', row.id)
    if (isExhausted) exhausted++
  }

  return new Response(
    JSON.stringify({ processed, confirmed, resent, failed, exhausted }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
  )
})
