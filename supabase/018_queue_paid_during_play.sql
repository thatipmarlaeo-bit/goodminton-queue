-- =============================================================================
-- 018_queue_paid_during_play.sql
-- ติ๊ก "ใครจ่ายเงินแล้ว" ระหว่างเล่นใน modal แตะคอร์ด -> แสดงในประวัติหลังจบเกม
-- -----------------------------------------------------------------------------
-- ต้องการ: แอดมินแตะกราฟิกคอร์ดที่กำลังเล่น (IN_PROGRESS) กรอกเลขลูกแบด แล้ว
--   ติ๊กได้เลยว่าใครจ่ายเงินแล้ว (ระหว่างแข่ง — เลียนแบบหน้า (13) ที่จัดการใน
--   ประวัติหลังจบเกม แต่ตอนแข่งยังไม่มีแถว match_records จึงเก็บทีตาราง queues)
--   ตอนจบเกม recordMatchResult จะคัดลอก paid_player_ids ไป match_records
--   (เหมือนที่คัดลอก shuttlecock_nos จาก 016) เพื่อให้ประวัติโชว์สถานะต่อได้
--
--   เก็บ 2 จุด:
--     * queues.paid_player_ids <- ระหว่างแข่ง (แอดมินติ๊กจุดนี้ -> ตารางนี้)
--     * match_records.paid_player_ids <- ตอนจบเกม (สแนปชอต ดู 017)
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run
--         รันซ้ำได้ (ALTER ... ADD COLUMN IF NOT EXISTS -- idempotent)
-- ⚠️ MUST รัน 018 ก่อน deploy build ใหม่ (ไม่งั้นติ๊กจ่ายเงินใน modal จะ error)
-- =============================================================================

alter table public.queues
  add column if not exists paid_player_ids text[] not null default '{}';

-- เปิด paid_player_ids ใน view เพื่อให้ modal แตะคอร์ดอ่านค่าเดิมกลับมาแสดงได้ตอนเปิด modal ใหม่
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
  q.paid_player_ids,
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
group by q.id, q.status, q.assigned_court, q.created_at, q.shuttlecock_nos, q.paid_player_ids;

-- รีเฟรช schema cache ของ PostgREST (กันค่าเก่าค้าง)
notify pgrst, 'reload schema';