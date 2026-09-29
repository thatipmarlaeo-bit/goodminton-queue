-- =============================================================================
-- 015_max_four_members_guard.sql
-- DB-level guard: คิวหนึ่งมีสมาชิกได้สูงสุด 4 คน (กัน race เหนือ client check)
-- -----------------------------------------------------------------------------
-- ปัญหาที่กัน: client (QueueService.joinQueue / addPlayerToQueue / createQueueWithPlayers)
--   ตรวจ count >= 4 แล้วค่อย INSERT เป็นคนละ statement — ถ้าหลายคนแอดพร้อมกัน
--   (ตอนคิวเต็มกำลังฮิต) ทุกคนเห็น count = 3 แล้วแทรกพร้อมกัน -> คิวมี 5+ คน
--   และ trigger 008 (เงื่อนไข >= 4) จะเรียก "คิว 5 คน" ลงคอร์ตได้
--   ตัว guard นี้ให้ระบบฐานข้อมูลชี้ขาดแทน โดยรันก่อน insert ทุกครั้ง
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run
--         รันได้ซ้ำ (idempotent) ไม่ชน 42710
--
-- หมายเหตุ:
--   - raise ใช้ errcode พื้นฐาน (P0001) ไม่ใช่ 23505 — กัน client ตีความไปเป็น
--     "คุณมีชื่ออยู่ในคิวนี้หรือคิวอื่นแล้ว" (joinQueue ดูที่ code === '23505')
--     ข้อความ error ที่ client แสดง = ข้อความจาก DB ตรง ๆ ("คิวนี้เต็มแล้ว")
--   - multi-row INSERT 4 แถวของแอดมิน (createQueueWithPlayers) ยังผ่าน:
--     before-insert trigger เห็นเฉพาะแถวที่ commit อยู่แล้วในตอนนั้น
--     ไม่นับแถวที่อยู่ใน statement เดียวกัน
-- =============================================================================

create or replace function enforce_max_four_members()
returns trigger
language plpgsql
as $$
declare
  v_member_count integer;
begin
  select count(*) into v_member_count
    from queue_members
   where queue_id = new.queue_id;

  if v_member_count >= 4 then
    raise exception 'คิวนี้เต็มแล้ว (ครบ 4 คนเรียบร้อย)';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_max_four_members on queue_members;

create trigger trg_max_four_members
before insert on queue_members
for each row
execute function enforce_max_four_members();