-- =============================================================================
-- 006_unify_identity.sql -- รวม identity เหลือ ONE TABLE: profiles
-- -----------------------------------------------------------------------------
-- ผู้อ่าน/Build นิยาม view จริง 2 ตัว (จาก pg_get_viewdef) มาแล้ว:
--   * active_queues_view -> JOIN user_profiles (เดิม)
--   * live_courts_view   -> JOIN profiles (เดิม)
-- คอลัมน์ nickname/real_name/avatar_id/skill_level มีครบเหมือนกันทั้งสองตาราง
-- -> ดังนั้นเปลี่ยน active_queues_view ให้ JOIN profiles (ตามที่ live_courts_view
--    ทำอยู่แล้ว) แล้ว drop user_profiles ได้ปลอดภัย 100% ไม่มีคำสั่งเดา
-- =============================================================================

-- 1) Recreate active_queues_view อ่านจาก profiles ล้วน (ผลลัพธ์เหมือนเดิมทุกรูปแบบ)
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
        coalesce(nullif(up.skill_level, ''::text), 'BG'::text)
      ) order by qm.joined_at
    ) filter (where qm.device_id is not null),
    '[]'::json
  ) as players
from queues q
  left join queue_members qm on q.id = qm.queue_id
  left join profiles up on qm.device_id = up.device_id
group by q.id, q.status, q.assigned_court, q.created_at;

-- 2) live_courts_view สร้างบน profiles อยู่แล้ว (ไม่ต้องแตะ) — ยืนยันเฉย ๆ
select v.table_name,
       pg_get_viewdef(format('%I.%I', v.table_schema, v.table_name)::regclass::oid, true)
from information_schema.views v
where v.table_schema = 'public'
  and v.table_name in ('active_queues_view', 'live_courts_view');

-- 3) กันไม่ให้อักษรสดรีเฟรช schema cache ค้าง (ไม่มีค่าใช้จ่าย ไม่ต้อง Add-on)
--    ถ้ารันแล้วยังมี error "schema cache" ให้รันคำสั่งนี้ซ้ำอีกครั้ง
notify pgrst, 'reload schema';

-- 4) ตอนนี้ไม่มี view/query ไหนอ่าน user_profiles อีกแล้ว -> drop ได้
--    (ถ้ารันตรงนี้ error แปลว่ายังมี object อื่นผูก -> แปะ error มาผมจัดการต่อ
--     อย่าใช้ cascade เอง)
drop table public.user_profiles;
