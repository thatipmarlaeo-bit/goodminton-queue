// =============================================================================
// send-court-call — Supabase Edge Function (Deno)
// -----------------------------------------------------------------------------
// อ่านแถวที่ยังไม่ได้ส่งใน public.push_queue (ที่ trigger `011` เก็บไว้ตอนคอร์ด
// กลายเป็น CALLING) -> ส่ง web push ผ่าน OneSignal REST API -> mark sent_at
// (กันส่งซ้ำรอบหน้า)
//
// secrets ที่ต้องตั้ง (Supabase Dashboard -> Project Settings -> Edge Functions):
//   ONESIGNAL_REST_API_KEY  = OneSignal Dashboard -> Settings -> Keys & IDs -> REST API Key
//   ONESIGNAL_APP_ID        = OneSignal Dashboard -> Settings -> Keys & IDs -> OneSignal App ID
//
// deploy: supabase functions deploy send-court-call
// วิธีเรียก (ทุก ~1 นาที):
//   - Edge Function schedule (Dashboard -> Edge Functions -> send-court-call ->
//     Schedule -> ทุกนาที) หรือ
//   - Supabase CLI: supabase functions deploy --no-verify-jwt (ถ้าไม่มี auth ก็
//     ให้ public เรียกได้ — เนื้อหาเก็บบน DB lock กันซ้ำอยู่แล้ว)
// =============================================================================
import { createClient } from 'jsr:@supabase/supabase-js@2'

// -----------------------------------------------------------------------------
// secrets (Edge Function รันบน server -> ใช้ service_role + OneSignal REST key
// ฝั่ง server อย่างเดียว SPA ไม่เห็น key เหล่านี้)
// -----------------------------------------------------------------------------
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const ONESIGNAL_REST_API_KEY = Deno.env.get('ONESIGNAL_REST_API_KEY')
const ONESIGNAL_APP_ID = Deno.env.get('ONESIGNAL_APP_ID')

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
})

const ONESIGNAL_ENDPOINT = 'https://api.onesignal.com/notifications'

const cors = 'https://badminton-queue.vercel.app'

// -----------------------------------------------------------------------------
// ส่ง push ถึง device_id ของคิวที่ถูกเรียกลง (OneSignal: login(devId) ->
// external_id = devId -> ส่ง target ด้วย include_aliases external_id)
// -----------------------------------------------------------------------------
async function sendOneSignalPush(deviceIds: string[], courtNumber: number, queueId: string) {
  if (!ONESIGNAL_REST_API_KEY || !ONESIGNAL_APP_ID) {
    throw new Error('OneSignal secrets ยังไม่ตั้ง (ONESIGNAL_REST_API_KEY / ONESIGNAL_APP_ID)')
  }

  const res = await fetch(ONESIGNAL_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Key ${ONESIGNAL_REST_API_KEY}`,
    },
    body: JSON.stringify({
      app_id: ONESIGNAL_APP_ID,
      include_aliases: { external_id: deviceIds },
      target_channel: 'push',
      contents: { en: `คอร์ด ${courtNumber} เรียก คิว ${queueId} ลงสนามภายใน 3 นาที`, th: `คอร์ด ${courtNumber} เรียก คิว ${queueId} ลงสนามภายใน 3 นาที` },
      headings: { en: `ถึงคิวคุณแล้ว — คอร์ด ${courtNumber}`, th: `ถึงคิวคุณแล้ว — คอร์ด ${courtNumber}` },
      url: 'https://badminton-queue.vercel.app/',
      data: { type: 'COURT_CALL', court_number: courtNumber, queue_id: queueId },
    }),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OneSignal HTTP ${res.status}: ${text.slice(0, 300)}`)
  }
  return await res.json()
}

// -----------------------------------------------------------------------------
// main
// -----------------------------------------------------------------------------
Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': cors,
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'ต้อง POST' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': cors },
    })
  }

  // 1) อ่านงานค้าง (sent_at is null) ครั้งละไม่เกิน 20 กันงานท่วม
  const { data: jobs, error } = await supabase
    .from('push_queue')
    .select('id, queue_id, court_number, device_ids')
    .is('sent_at', null)
    .order('id')
    .limit(20)

  if (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': cors },
    })
  }

  const results = []
  for (const job of jobs || []) {
    try {
      await sendOneSignalPush(job.device_ids, job.court_number, job.queue_id)
      await supabase.from('push_queue').update({ sent_at: new Date().toISOString() }).eq('id', job.id)
      results.push({ id: job.id, ok: true })
    } catch (err) {
      results.push({ id: job.id, ok: false, error: err.message })
    }
  }

  return new Response(
    JSON.stringify({
      ok: true,
      sent: results.filter((r) => r.ok).length,
      failed: results.filter((r) => !r.ok).length,
      results,
    }),
    { headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': cors } }
  )
})
