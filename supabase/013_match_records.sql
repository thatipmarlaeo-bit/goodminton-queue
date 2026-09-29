-- =============================================================================
-- 013_match_records.sql
-- บันทึกผลการแข่งขันเมื่อแอดมินกด "จบเกม" บนคอร์ด (สถิติผู้เล่น)
-- -----------------------------------------------------------------------------
-- ต้องการ: ผู้เล่นเห็นจำนวนครั้งที่ลงเล่น + จำนวนครั้งที่ชนะในหน้าแก้ไขโปรไฟล์
--   * แอดมินกด "จบเกม" -> ต้องเลือกผู้ชนะ (สูงสุด 2 คน — แบดมินตันคู่) แล้วกด
--     "บันทึกผล" หรือกด "เสมอ" (ไม่มีใครได้แต้ม) ระบบถึงจะปล่อยคอร์ด
--   * แต่ละการ์ดคิว (queue_id) บันทึกผลได้ครั้งเดียว (unique) กันจบเกมซ้อน
--   * จำนวนครั้งที่เล่น = นับ match_records ที่ device_id อยู่ใน player_device_ids
--     จำนวนครั้งที่ชนะ  = นับที่ device_id อยู่ใน winner_device_ids
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run (หลัง 006)
--         รันซ้ำได้ (drop/create ทุกครั้ง — ยังไม่มีข้อมูลจริงให้ลบ)
-- =============================================================================

drop table if exists public.match_records;

create table public.match_records (
  id                bigint generated always as identity primary key,
  queue_id          text        not null unique,          -- 1 การ์ดคิวบันทึกผลได้ครั้งเดียว
  court_number      integer     not null,
  player_device_ids text[]      not null,                 -- สแนปชอตสมาชิกคิวที่ลงสนามทั้งหมด
  winner_device_ids text[]      not null default '{}',    -- ผู้ชนะ 0-2 คน (ว่าง = เสมอ)
  is_draw           boolean     not null default false,
  created_at        timestamptz not null default now()
);

-- กันผู้ชนะเกิน 2 คน (แบดมินตันคู่ เล่นทีมละ 2)
alter table public.match_records
  add constraint match_records_winners_max_2
  check (cardinality(winner_device_ids) <= 2);

-- เร่งนับสถิติที่ filter device_id ในอาเรย์
create index match_records_player_idx on public.match_records using gin (player_device_ids);
create index match_records_winner_idx on public.match_records using gin (winner_device_ids);
create index match_records_queue_idx  on public.match_records (queue_id);

-- เปิดสิทธิ์ให้ anon/authenticated อ่าน-เขียนได้ (แอปนี้ใช้ anon key + ไม่มี real auth)
grant select, insert, update, delete on table public.match_records to anon, authenticated;

-- ปิด RLS สำหรับตารางนี้ — โมเดลเดียวกับตารางอื่น ๆ ของแอป (ดู 004_gps_filter_toggle.sql)
-- สาเหตุ: 2026-09-21 แอดมินกดจบเกมไม่ได้ ขึ้น
--   "new row violates row-level security policy for table match_records"
-- เพราะตารางถูกสร้างขณะ RLS เปิดและไม่มี policy → ปิด RLS ให้เขียนได้ทันที
alter table public.match_records disable row level security;

-- รีเฟรช schema cache ของ PostgREST (กันค่าเก่าค้างแบบที่เอกสารแนะนำ)
notify pgrst, 'reload schema';