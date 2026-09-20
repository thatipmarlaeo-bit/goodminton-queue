-- =============================================================================
-- 001_auto_call_trigger.sql
-- Core Engine: เรียกคิวลงสนามอัตโนมัติเมื่อคอร์ดเข้าสู่สถานะ AVAILABLE
-- -----------------------------------------------------------------------------
-- วิธีใช้: เปิด Supabase Dashboard -> SQL Editor -> New query -> วางโค้ดนี้ -> Run
--
-- สมมติฐาน schema ฝั่ง Supabase (schema ไม่อยู่ใน repo):
--   courts(court_number, status, current_queue_id, status_updated_at, close_reason)
--   queues(id, status, assigned_court, created_at, updated_at)
--   queue_members(queue_id, device_id, joined_at)
--   active_queues_view(...)  -- มีคอลัมน์ players (jsonb array) / status / id / created_at
--                            -- (ไม่มีคอลัมน์ player_count -> ใช้นับจาก queue_members แทน)
--
-- หมายเหตุ: status_updated_at ถูกเขียนด้วย Date.now() จากฝั่ง JS (epoch milliseconds)
--           ถ้าคอลัมน์จริงเป็น timestamp ให้แก้ให้ตรงกับชนิดคอลัมน์ในเส้นโค้ดที่ cast
-- =============================================================================

-- 1) ฟังก์ชันเลือกคิวที่ "พร้อมลงสนาม" ถัดไป
--    ลำดับ: SKIPPED (สิทธิ์ลัดคิว) ก่อนเสมอ แล้ว FIFO ตาม created_at
--    ทั้งคู่ต้องมีสมาชิกครบ 4 คน (ตาม productLogic: ต้องครบ 4)
create or replace function pick_next_ready_queue()
returns table (qid text)
language sql
stable
as $$
  select q.id
    from active_queues_view q
   where q.status in ('SKIPPED', 'WAITING')
     and (select count(*)::int from queue_members qm where qm.queue_id = q.id) >= 4
   order by
     case when q.status = 'SKIPPED' then 0 else 1 end asc,
     (select created_at from queues qt where qt.id = q.id) asc
   limit 1;
$$;

-- -----------------------------------------------------------------------------
-- 1.5) ฟังก์ชันปลดคอร์ดที่ CALLING ค้างเกิน 3 นาที (self-heal แบบไม่มี pg_cron)
--      ถูกเรียกจาก auto_call_next_queue() ทุกครั้งที่ trigger ทำงาน
--      -> คอร์ดค้างจะถูกปล่อยเป็น AVAILABLE และคิวกลับเป็น ON_HOLD ให้อัตโนมัติ
--      (หากเปิด pg_cron ได้แล้ว ใช้ 002_calling_timeout_cron.sql แทนการเรียกแบบนี้
--       เพื่อให้จัดการได้แม้ไม่มีคอร์ดใดเปลี่ยนสถานะเลย)
create or replace function expire_calling_queues()
returns void
language plpgsql
as $$
declare
  r record;
begin
  for r in
    select court_number, current_queue_id
      from courts
     where status = 'CALLING'
       and (extract(epoch from now()) * 1000)::bigint
           - coalesce(status_updated_at, 0) > 3 * 60 * 1000
  loop
    if r.current_queue_id is not null then
      update queues
         set status = 'ON_HOLD',
             assigned_court = null
       where id = r.current_queue_id;
    end if;

    update courts
       set status = 'AVAILABLE',
           current_queue_id = null,
           status_updated_at = (extract(epoch from now()) * 1000)::bigint
     where court_number = r.court_number;
  end loop;
end;
$$;

-- 2) ฟังก์ชัน trigger: เมื่อคอร์ดถูกปล่อยว่าง -> จองคิวถัดไปทันที
create or replace function auto_call_next_queue()
returns trigger
language plpgsql
as $$
declare
  v_queue_id text;
begin
  -- ล็อกทั่วทั้งฐานข้อมูล ป้องกันสองคอร์ดว่างพร้อมกันแย่งคิวเดียวกัน
  perform pg_advisory_xact_lock(83011);

  -- ปลดคอร์ดที่ CALLING ค้างเกิน 3 นาที ก่อนเลือกคิวถัดไป (self-heal)
  perform expire_calling_queues();

  if new.status <> 'AVAILABLE' then
    return new;
  end if;

  select qid into v_queue_id from pick_next_ready_queue();
  if v_queue_id is null then
    return new;  -- ยังไม่มีคิวที่พร้อม -> คอร์ดจอดว่างรอเฉย ๆ
  end if;

  -- 1) จองคิวเข้ากับคอร์ด
  update queues
     set status = 'ASSIGNED',
         assigned_court = new.court_number
   where id = v_queue_id;

  -- 2) เปลี่ยนคอร์ดเป็น CALLING พร้อมเริ่มจับเวลา 3 นาที
  update courts
     set status = 'CALLING',
         current_queue_id = v_queue_id,
         status_updated_at = (extract(epoch from now()) * 1000)::bigint
   where court_number = new.court_number
     and status = 'AVAILABLE';

  return new;
end;
$$;

drop trigger if exists trg_auto_call_next_queue on courts;

create trigger trg_auto_call_next_queue
after update of status on courts
for each row
when (new.status = 'AVAILABLE')
execute function auto_call_next_queue();

-- -----------------------------------------------------------------------------
-- ให้สิทธิ์แอป (anon/authenticated role ของ Supabase) เรียก RPC นี้ได้
-- ใช้สำหรับ watchdog ฝั่ง client-หน้าแอป (ทดแทน pg_cron แบบไม่มีค่าใช้จ่าย)
-- -----------------------------------------------------------------------------
grant execute on function expire_calling_queues() to anon;
grant execute on function expire_calling_queues() to authenticated;

-- -----------------------------------------------------------------------------
-- ทดสอบ: เปิดคอร์ด/จบเกม -> court.status เป็น AVAILABLE -> ระบบจองคิวถัดไปเอง
-- -----------------------------------------------------------------------------