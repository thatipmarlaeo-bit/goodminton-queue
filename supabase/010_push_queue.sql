-- =============================================================================
-- 010_push_queue.sql
-- เก็บงาน "ต้องส่ง push" ลงตาราง เมื่อคอร์ดถูกเรียกลง (CALLING) — Edge Function
-- `send-court-call` จะมาอ่าน + ส่ง OneSignal + ลบแถว (เหมือน work queue)
-- -----------------------------------------------------------------------------
-- ปัญหาที่แก้:
--   008/009 เรียกลงคอร์ดโดยเปลี่ยน court.status -> CALLING -> ผู้เล่นที่เปิดแอปอยู่
--   โดนปลุก (เสียง/สั่น/แบนเนอร์) ทันที แต่ถ้าปิดแอป -> ไม่โดนแจ้ง
--   010 แก้: เมื่อ court.status กลายเป็น CALLING -> เก็บ device_id ทั้ง 4 ของคิว
--   นี้ลง push_queue -> Edge Function `send-court-call` อ่านแล้วส่ง OneSignal push
--   ให้ครบ 4 คน (แม้ปิดแอป) -> ลบแถวที่ส่งแล้ว (กันส่งซ้ำ)
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run
--         ต้องรันหลัง 008/009 (ใช้ pick_next_ready_queue() และ
--         assign_full_queue_to_available_court() เหมือนกัน ไม่ได้ define ใหม่)
--         รันซ้ำได้ ไม่ชน 42710
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) ตารางคิวงาน push (idempotent — drop/create ทุกครั้ง รันซ้ำได้)
-- -----------------------------------------------------------------------------
drop table if exists public.push_queue;

create table public.push_queue (
  id           bigint generated always as identity primary key,
  court_number integer     not null,
  queue_id     text        not null,
  device_ids   text[]      not null,  -- device_id ของ 4 คนในคิวที่ถูกเรียก
  created_at   timestamptz not null default now(),
  sent_at      timestamptz            -- Edge Function เซ็ตเมื่อส่งสําเร็จ
);

create index push_queue_unsent_idx on public.push_queue (sent_at)
 where sent_at is null;

-- -----------------------------------------------------------------------------
-- 2) Trigger (AFTER UPDATE OF status ON courts -> เมื่อคอร์ดกลายเป็น CALLING)
--    เก็บ device_id ของสมาชิกคิวที่ถูกเรียกลง (กัน push ไปผิดคน)
-- -----------------------------------------------------------------------------
create or replace function trigger_enqueue_push_on_calling()
returns trigger
language plpgsql
as $$
declare
  v_device_ids text[];
begin
  -- กัน trigger วน: 008/009 เปลี่ยนคอร์ดเป็น CALLING -> trigger นี้ยิง -> แต่
  -- 008/009 เองก็ update courts อีก (CALLING -> AVAILABLE ตอน expire) -> ใช้
  -- WHEN (old.status <> 'CALLING') กันยิงซ้ำตอน CALLING -> CALLING
  if old.status is not distinct from 'CALLING' then
    return new pyramid;
  end if;

  -- ดึง device_id ของสมาชิกคิวที่ถูกเรียกลง (คิวนี้ status = CALLING)
  select coalesce(array_agg(qm.device_id order by qm.joined_at), '{}')
    into v_device_ids
    from queue_members qm
   where qm.queue_id = new.current_queue_id;

  if cardinality(v_device_ids) = 0 then
    return new;  -- ไม่มีสมาชิก -> ไม่มีใครต้อง push
  end if;

  -- เก็บงาน (Edge Function จะอ่านแถวที่ sent_at is null)
  insert into public.push_queue (court_number, queue_id, device_ids)
  values (new.court_number, new.current_queue_id, v_device_ids)
  on conflict do nothing;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) สร้าง trigger (drop ก่อนเสมอเพื่อรันซ้ำได้ ไม่ชน 42710)
-- -----------------------------------------------------------------------------
drop trigger if exists trg_enqueue_push_on_calling on courts;

create trigger trg_enqueue_push_on_calling
after update of status on courts
for each row
when (old.status is distinct from 'CALLING' and new.status = 'CALLING')
execute function trigger_enqueue_push_on_calling();

-- -----------------------------------------------------------------------------
-- 4) ให้สิทธิ์ (ไม่จำเป็นต้อง grant ต่อ anon เพราะ Edge Function ใช้ service_role
--    อยู่แล้ว แต่ให้ไว้ เผื่ออยาก self-heal เองแบบ 001)
-- -----------------------------------------------------------------------------
grant execute on function trigger_enqueue_push_on_calling() to anon;
grant execute on function trigger_enqueue_push_on_calling() to authenticated;
