-- =============================================================================
-- 012_queue_view_add_member_details.sql
-- เพิ่ม role + faculty เข้าไปใน players ของ active_queues_view
-- -----------------------------------------------------------------------------
-- ต้องการ: ผู้เล่นทั่วไปกดดูสมาชิกในแต่ละการ์ดคิวแล้วเห็นรายละเอียดพื้นฐาน
--   (ชื่อเล่น / ประเภท / สังกัด) — ข้อมูล role/faculty มีอยู่ในตาราง profiles
--   แล้ว แต่ view ตัวเดิมไม่ได้ select ออกมา → แก้ json_build_object ให้เพิ่ม
--   คอลัมน์ `role` และ `faculty` เข้าไป (deviceId/name/avatarId/skillLevel เดิมคงเดิม)
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run หลัง 006
--         รันซ้ำได้ (idempotent — create or replace view)
-- =============================================================================

create or replace view public.active_queues_view as
select
  q.id,
  q.status,
  q.assigned_court,
  q.created_at,
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
group by q.id, q.status, q.assigned_court, q.created_at;

-- รีเฟรช schema cache ของ PostgREST (กันค่าเก่าค้าง — เอกสาร Supabase แนะนำ)
notify pgrst, 'reload schema';