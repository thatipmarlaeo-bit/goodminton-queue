-- =============================================================================
-- 008_auto_call_on_queue_full.sql
-- เรียกลงคอร์ดทันทีเมื่อคิวครบ 4 (ไม่ต้องรอให้คอร์ดถูกปล่อยว่างก่อน)
-- -----------------------------------------------------------------------------
-- ต่างจาก 001:
--   001 เรียกเฉพาะเมื่อ court.status เปลี่ยนเป็น AVAILABLE -> เลือกคิวถัดไป
--       (ถ้าคอร์ดถูกครอบหมดตอนคิวครบ -> คิวค้าง WAITING ไม่โดนเรียก)
--   008 เรียกเมื่อ queue_members ถูกแทรกจนครบ 4 -> หาคอร์ด AVAILABLE ที่ว่าง
--       แล้วดึงคิวนี้ลงทันที (ถ้าไม่มีคอร์ดว่าง -> คิวก็ยังค้าง WAITING เหมือนเดิม
--       และเมื่อคอร์ดว่างขึ้น 001 จะเป็นตัวเรียกลงเอง เป็นการทำงานคู่กัน)
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run
--         รันได้ซ้ำ (idempotent) ไม่ชน 42710
-- =============================================================================

-- 1) ล็อกท้ายสุด (advisory xact lock) เหมือน 001:81/83011 เพื่อไม่ให้ 008 กับ 001
--    แย่งคิวเดียวกันตอนสองคอร์ดว่างพร้อมกัน (ใช้หมายเลขต่างจาก 001 กัน trigger วน)
create or replace function assign_full_queue_to_available_court()
returns void
language plpgsql
as $$
declare
  v_queue_id text;
  v_court_number integer;
  v_now_ms bigint := (extract(epoch from now()) * 1000)::bigint;
begin
  -- ล็อกทั้งฐานข้อมูล ป้องกัน trigger 008 สองคอร์ดว่างพร้อมกันแย่งคิวเดียวกัน
  perform pg_advisory_xact_lock(83012);

  -- ปลดคอร์ดที่ CALLING ค้างเกิน 3 นาที ก่อนเลือกคิวถัดไป (self-heal เหมือน 001)
  perform expire_calling_queues();

  -- เลือกคิวที่พร้อมลงสนาม (ครบ 4, WAITING/SKIPPED) ถัดไปแบบเดียวกับ 001
  select qid into v_queue_id from pick_next_ready_queue();
  if v_queue_id is null then
    return;  -- ยังไม่มีคิวที่พร้อม -> จอดว่างรอเฉย ๆ
  end if;

  -- หาคอร์ดที่ว่าง (AVAILABLE) คอร์ดแรก เพื่อจองคิวเข้ากับคอร์ด
  select court_number into v_court_number
    from courts
   where status = 'AVAILABLE'
   order by court_number asc
   limit 1;

  if v_court_number is null then
    return;  -- ไม่มีคอร์ดว่าง -> ปล่อยให้ trigger 001 เรียกลงเมื่อคอร์ดว่างทีหลัง
  end if;

  -- 1) จองคิวเข้ากับคอร์ด
  update queues
     set status = 'ASSIGNED',
         assigned_court = v_court_number
   where id = v_queue_id;

  -- 2) เปลี่ยนคอร์ดเป็น CALLING พร้อมเริ่มจับเวลา 3 นาที (จองคิวนี้)
  update courts
     set status = 'CALLING',
         current_queue_id = v_queue_id,
         status_updated_at = v_now_ms
   where court_number = v_court_number
     and status = 'AVAILABLE';
end;
$$;

-- 2) Trigger: เมื่อ queue_members ถูก insert (ผู้เล่นแอดเข้ากลุ่ม) --
--    หลัง insert ทุกครั้ง -> ถ้าคิวนี้ครบ 4 คน -> เรียกคิวลงคอร์ดทันที
create or replace function trigger_call_on_queue_full()
returns trigger
language plpgsql
as $$
declare
  v_member_count integer;
begin
  -- นับสมาชิกของคิวนี้หลัง insert
  select count(*) into v_member_count
    from queue_members
   where queue_id = new.queue_id;

  -- ถ้าครบ 4 -> เรียกลงคอร์ดอัตโนมัติ (ถ้ามีคอร์ดว่าง)
  if v_member_count >= 4 then
    perform assign_full_queue_to_available_court();
  end if;

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 3) สร้าง trigger (drop ก่อนเสมอเพื่อรันซ้ำได้ ไม่ชน 42710)
-- -----------------------------------------------------------------------------
drop trigger if exists trg_call_on_queue_full on queue_members;

create trigger trg_call_on_queue_full
after insert on queue_members
for each row
execute function trigger_call_on_queue_full();

-- -----------------------------------------------------------------------------
-- 4) ให้สิทธิ์ trigger/ฟังก์ชันทำงานได้ (ไม่จำเป็นต้อง grant ต่อ anon เพราะ
--    trigger รันในบทบาทเจ้าของตารางอยู่แล้ว แต่ให้สิทธิ์ RPC นี้ไว้ เผื่อ client
--    อยาก self-heal เองแบบ 001)
-- -----------------------------------------------------------------------------
grant execute on function expire_calling_queues() to anon;
grant execute on function expire_calling_queues() to authenticated;
