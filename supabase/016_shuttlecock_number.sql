-- =============================================================================
-- 016_shuttlecock_number.sql
-- เพิ่มช่องบันทึก "เลขลูกแบดที่ซื้อ" ระหว่างแข่ง -> แสดงในประวัติคิวหลังจบเกม
-- -----------------------------------------------------------------------------
-- ต้องการ: แอดมินแตะกราฟิกคอร์ดที่กำลังเล่น (IN_PROGRESS) แล้วบันทึกเลขลูกแบด
--   ที่ซื้อได้ (เช่น "412, 413") ระหว่างแข่ง หน้าแสดงไม่ต้องโชว์เลขอะไรเลย
--   แต่เมื่อแอดมินจบเกมคิวนั้น (recordMatchResult) ต้องคัดลอกเลขลงไปใน
--   match_records เพื่อให้แทบ "ประวัติคิว" แสดงเลขลูกแบดของคิวนั้นได้
--
--   เก็บ 2 จุด:
--     * queues.shuttlecock_nos      <- ระหว่างแข่ง (แอดมินบันทึกสด -> ตารางนี้)
--     * match_records.shuttlecock_nos <- ตอนจบเกม (สแนปชอต กันคิวถูกลบ/แก้ทีหลัง)
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run
--         รันซ้ำได้ (ALTER ... ADD COLUMN IF NOT EXISTS — idempotent)
-- ⚠️ MUST รัน 016 ก่อน deploy build ใหม่ (ไม่งั้นกดบันทึกเลขลูกแบดจะ error)
-- =============================================================================

alter table public.queues
  add column if not exists shuttlecock_nos text;

alter table public.match_records
  add column if not exists shuttlecock_nos text;

-- เปิดเลขลูกแบดใน view เพื่อให้หน้าแอดมินอ่านค่าเดิมกลับมาแสดงได้ตอนเปิด modal ใหม่
-- ⚠️ ใช้ DROP VIEW ก่อน (create or replace view เปลี่ยนจำนวน/ลำดับคอลัมน์ไม่ได้
--    → error 42P16 "cannot change name of view column players to shuttlecock_nos")
drop view if exists public.active_queues_view;

create view public.active_queues_view as
select
  q.id,
  q.status,
  q.assigned_court,
  q.created_at,
  q.shuttlecock_nos,
  coalesce(
    json_agg(
      json_build_object(
        'deviceId', qm.device_id,
        'name',
        coalesce(nullif(up.nickname, ''::text), nullif(up.real_name, ''::text), 'ผู้เล่น'::text),
        'avatarId',
        coalesce(nullif(up.avatar_id, ''::text), 'boy-cap'::text),
        'skillLevel',
        coalesce(nullif(up.skill_level, ''::text), 'BG'::text),
        'role',
        coalesce(nullif(up.role, ''::text), 'นิสิต'::text),
        'faculty',
        coalesce(nullif(up.faculty, ''::text), '-'::text)
      ) order by qm.joined_at
    ) filter (where qm.device_id is not null),
    '[]'::json
  ) as players
from queues q
  left join queue_members qm on q.id = qm.queue_id
  left join profiles up on qm.device_id = up.device_id
group by q.id, q.status, q.assigned_court, q.created_at, q.shuttlecock_nos;

-- รีเฟรช schema cache ของ PostgREST (กันค่าเก่าค้าง)
notify pgrst, 'reload schema';