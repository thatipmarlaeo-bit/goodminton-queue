-- =============================================================================
-- 009_auto_call_on_queue_resume.sql
-- เรียกลงคอร์ดทันที เมื่อคิวถูก "กลับปกติ" (กลับเป็น WAITING หลังถูกพัก/ข้าม)
-- -----------------------------------------------------------------------------
-- ปัญหาที่แก้:
--   001 เรียกลงเฉพาะตอน court.status เปลี่ยนเป็น AVAILABLE
--   008 เรียกลงเฉพาะตอน queue_members ถูก insert จนครบ 4
--   แต่ตอนแอดมินกด "กลับปกติ" (SKIPPED/ON_HOLD -> WAITING) -> เป็นการ
--   UPDATE queues.status -> ไม่ได้ insert queue_members -> 008 ไม่จุดชนวน
--   -> คิวที่กลับเป็น WAITING ค้างเฉย ๆ ไม่โดนเรียกลง จนกว่าจะมีคอร์ดว่าง
--   (แล้ว 001/008 เป็นตัวเลือก -> ถ้าคอร์ดถูกครอบหมดตอนนั้น -> รอเป็นนานมาก)
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run
--         ต้องรันหลัง 008 (ฟังก์ชัน assign_full_queue_to_available_court() และ
--         pick_next_ready_queue() อยู่ใน 008) รันซ้ำได้ ไม่ชน 42710
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) ฟังก์ชัน trigger: เมื่อคิวกลับมาเป็น WAITING (จาก SKIPPED/ON_HOLD -> กลับปกติ
--    หรือสร้างคิวใหม่ก็ตามแต่) -> ถ้าคิวนี้ครบ 4 -> เรียกลงคอร์ด AVAILABLE ทันที
--    โดยไม่ต้องรอให้คอร์ดว่างก่อน (เหมือน 008 แต่จุดชนวนที่การเปลี่ยน status)
-- -----------------------------------------------------------------------------
create or replace function trigger_call_on_queue_resume()
returns trigger
language plpgsql
as $$
begin
  -- ถ้าเป็นแค่การอัปเดตสถานะอื่น (เช่น กำหนดสนาม/เปลี่ยนเป็น ASSIGNED) ไม่ต้องทำ
  if new.status is distinct from 'WAITING' then
    return new;
  end if;

  -- 1.1) กัน trigger วน: assign_full_queue_to_available_court() เองก็อัปเดต
  --      queues.status -> WAITING (ตอนปลดคอร์ด CALLING ค้าง -> คิวกลับ WAITING)
  --      -> trigger จะยิงซ้ำ -> ใช้ advisory lock ตัวเดียวกับ 008 (83012)
  --      เพื่อให้ trigger นี้กับ 008 ไม่แย่งคิวเดียวกันตอนเรียกลง
  if old.status is not distinct from 'WAITING' then
    return new;  -- เดิมเป็น WAITING อยู่แล้ว -> กันวน (เช่น ปลดคอร์ด CALLING ค้าง)
  end if;

  -- 2) เรียกลงคอร์ดทันที (เหมือน 008 — มี pg_advisory_xact_lock(83012) ในตัว
  --    แล้ว กัน 008 กับ 009 แย่งคิวเดียวกัน)
  perform assign_full_queue_to_available_court();

  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- 2) Trigger: เมื่อ queues.status เปลี่ยนเป็น WAITING (กลับปกติ / สร้างคิวใหม่)
--    -> เรียกลงคอร์ดทันที (แต่ trigger 008 ก็ทำงานตอน insert queue_members ครบ 4
--    แล้ว -> trigger นี้จะทำงานเมื่อกลับปกติเป็น WAITING เมื่อคิวครบ 4 แล้ว)
-- -----------------------------------------------------------------------------
drop trigger if exists trg_call_on_queue_resume on queues;

create trigger trg_call_on_queue_resume
after update of status on queues
for each row
when (old.status is distinct from 'WAITING' and new.status = 'WAITING')
execute function trigger_call_on_queue_resume();

-- -----------------------------------------------------------------------------
-- 3) ให้สิทธิ์ trigger/ฟังก์ชันทำงานได้ (เหมือน 008 ไม่จำเป็นต้อง grant ต่อ anon
--    แต่ให้ไว้ เผื่อ client อยาก self-heal เอง)
-- -----------------------------------------------------------------------------
grant execute on function assign_full_queue_to_available_court() to anon;
grant execute on function assign_full_queue_to_available_court() to authenticated;
