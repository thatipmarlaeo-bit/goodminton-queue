-- =============================================================================
-- 011_on_court_calling_enqueue_push.sql
-- เมื่อคอร์ดเปลี่ยนเป็น CALLING (เรียกลงคอร์ด = 008/009/001) -> เก็บงาน push
-- ลง push_queue เพื่อให้ Edge Function (send-court-call) อ่านแล้วส่ง OneSignal
-- -----------------------------------------------------------------------------
-- ทำไมต้องมี:
--   004/008/009 เรียกลงคอร์ดโดยเปลี่ยน courts.status -> CALLING -> ผู้เล่นที่
--   เปิดแอปอยู่โดนปลุก (realtime) แต่ถ้าปิดแอป -> ไม่โดน
--   011 เก็บ device_id ของคิวที่ถูกเรียก (ครบ 4) ลง push_queue -> Edge Function
--   อ่านแล้วส่ง web push ไปทุกคน (แม้ปิดแอป)
-- -----------------------------------------------------------------------------
-- วิธีใช้:
--   1) Supabase Console -> SQL Editor -> New query -> วาง -> Run
--      (ต้องรันหลัง 008 — trigger นี้ใช้ฟังก์ชัน/คอลัมน์จาก 008/009 แต่ไม่ชนชื่อ)
--   2) สร้าง Edge Function "send-court-call" (ดู ../../supabase/functions/
--      send-court-call/README.md) แล้วตั้ง secret:
--        ONESIGNAL_REST_API_KEY  = OneSignal Dashboard -> Settings -> Keys & IDs -> REST API Key
--        ONESIGNAL_APP_ID        = OneSignal Dashboard -> Settings -> Keys & IDs -> App ID
--   3) ตั้ง OneSignal Schedule: ทุก 1 นาทีเรียก Edge Function (ใน Console ->
--      Edge Functions -> send-court-call -> Triggers -> Add "Time-based" หรือ
--      ใช้ 012_onesignal_cron ตัวที่เปิด pg_cron ได้) — หรือเรียกจากฝั่งแอปเอง
--      ทุก 30-60 วิ (QueueService.runCourtMaintenance เป็นตัวเลือกอยู่แล้ว)
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) ตารางงาน push (idempotent: drop + create รันซ้ำได้)
-- -----------------------------------------------------------------------------
drop table if exists public.push_queue;

create table public.push_queue (
  id          bigint generated always as identity primary key,
  queue_id    text        not null,
  court_number integer    not null,
  device_ids  text[]      not null,  -- device_id ของผู้เล่น 4 คนในคิวนี้
  created_at  timestamptz not null default now(),
  sent_at     timestamptz           -- ไม่ null = ส่งแล้ว (Edge Function เซ็ต)
);

create index push_queue_unsent_idx on public.push_queue (sent_at)
 where sent_at is null;

-- -----------------------------------------------------------------------------
-- 2) ฟังก์ชัน trigger: เมื่อคอร์ดกลายเป็น CALLING -> เก็บ device ของคิวที่ถูกเรียก
-- -----------------------------------------------------------------------------
create or replace function enqueue_push_on_court_calling()
returns trigger
language plpgsql
as $$
declare
  v_device_ids text[];
begin
  -- กัน trigger วน: ถ้าคอร์ด CALLING อยู่แล้ว (เช่น self-heal 001/008) ไม่ต้องซ้ำ
  if new.status <> 'CALLING' then
    return new;
  end if;

  if new.current_queue_id is null then
    return new;  -- คอร์ด CALLING แต่ไม่มีคิว -> ไม่มีใครต้องแจ้ง
  end if;

  -- ดึง device_id ของสมาชิกคิวที่ถูกเรียก (เรียงตามเวลาเข้าคิว = ลำดับในคิว)
  select coalesce(array_agg(qm.device_id order by qm.joined_at), '{}')
    into v_device_ids
    from queue_members qm
   where qm.queue_id = new.current_queue_id;

  if cardinality(v_device_ids) > 0 then
    insert into public.push_queue (queue_id, court_number, device_ids)
    values (new.current_queue_id, new.court_number, v_device_ids);
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) Trigger (drop ก่อนเสมอ -> รันซ้ำได้ ไม่ชน 42710)
-- -----------------------------------------------------------------------------
drop trigger if exists trg_enqueue_push_on_calling on courts;

create trigger trg_enqueue_push_on_calling
after update of status on courts
for each row
when (old.status is distinct from 'CALLING' and new.status = 'CALLING')
execute function enqueue_push_on_court_calling();

-- ให้สิทธิ์ (ถึงแม้ trigger รันในบทบาทเจ้าของตารางอยู่แล้ว — ให้ไว้เผื่ออยาก
-- เรียก self-heal จาก client แบบ 001)
grant execute on function enqueue_push_on_court_calling() to anon;
grant execute on function enqueue_push_on_court_calling() to authenticated;
