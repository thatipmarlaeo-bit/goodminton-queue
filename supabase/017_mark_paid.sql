-- =============================================================================
-- 017_mark_paid.sql
-- เพิ่มช่องบันทึก "ผู้เล่นที่จ่ายเงินแล้ว" ในแทบประวัติคิว (ฝั่งแอดมิน)
-- -----------------------------------------------------------------------------
-- ต้องการ: ในหน้า "ประวัติคิว" แอดมินติ๊กได้ว่าใครจ่ายเงินแล้ว (ต่อคน) หรือ
--   กด "จ่ายแล้วทุกคน" ให้ครบในครั้งเดียว — เก็บเป็นชุด device_id ที่จ่ายแล้ว
--
--   เก็บที่:
--     * match_records.paid_player_ids  <- text[] จ่ายแล้ว (ตรงนี้แค่ match เดียว
--                                         ต่อ queue_id unique และ RLS ปิดแล้วจาก 013
--                                         -> แอดมิน update ได้ทันที)
--
--   เปรียบเทียบกับ player_device_ids ว่าครบทุกคนหรือยัง
--   (paid_player_ids == player_device_ids ได้ ก็ยังสลับรายคนย้อนกลับได้
--    เพราะเก็บเป็นชุดจริง ไม่ใช่ boolean)
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run
--         รันซ้ำได้ (ALTER ... ADD COLUMN IF NOT EXISTS — idempotent)
-- ⚠️ MUST รัน 017 ก่อน deploy build ใหม่ (ไม่งั้นกดติ๊กจ่ายเงินจะ error missing column)
-- =============================================================================

alter table public.match_records
  add column if not exists paid_player_ids text[] not null default '{}';

-- รีเฟรช schema cache ของ PostgREST (กันค่าเก่าค้าง)
notify pgrst, 'reload schema';