-- =============================================================================
-- 003_one_card_guard.sql
-- One-Card Limit: ผู้เล่น 1 คน (device_id) อยู่ในคิวที่ยัง Active ได้เพียง 1 คิว
-- -----------------------------------------------------------------------------
-- วิธีใช้: เปิด Supabase Dashboard -> SQL Editor -> New query -> วางโค้ดนี้ -> Run
--
-- ปัญหาที่กัน: ตอนนี้โค้ดฝั่ง client กันผ่าน computed isUserInAnyQueue
-- ซึ่งโดน bypass ได้ด้วย race condition (กดสองที่พร้อมกัน)
-- -> ให้ระดับฐานข้อมูลตัดสินใจแทน และ raise เป็นโค้ด 23505
--    ให้ฝั่ง client (QueueService) ตีความว่า "คุณอยู่ในคิวอื่นแล้ว" ได้เหมือนเดิม
-- =============================================================================

create or replace function enforce_one_active_queue()
returns trigger
language plpgsql
as $$
declare
  v_count integer;
begin
  select count(*) into v_count
    from queue_members m
    join queues q on q.id = m.queue_id
   where m.device_id = new.device_id
     and q.status not in ('CANCELLED', 'FINISHED');

  if v_count > 0 then
    raise exception 'คุณมีชื่ออยู่ในคิวอื่นแล้ว (One-Card Limit)'
      using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_one_active_queue on queue_members;

create trigger trg_one_active_queue
before insert on queue_members
for each row
execute function enforce_one_active_queue();

-- -----------------------------------------------------------------------------
-- หมายเหตุ: trigger นี้กัน "ข้ามคิว" ไม่ได้แทน constraint (queue_id, device_id)
-- ที่กันลงชื่อซ้ำในคิวเดียวกัน ซึ่งยังจำเป็นทั้งคู่
-- -----------------------------------------------------------------------------