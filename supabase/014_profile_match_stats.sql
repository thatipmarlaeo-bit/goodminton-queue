-- =============================================================================
-- 014_profile_match_stats.sql
-- เก็บสถิติการเล่น (เล่น/ชนะ/เสมอ) ไว้ที่ profiles แบบถาวร (hybrid)
-- -----------------------------------------------------------------------------
-- ปัญหาที่แก้:
--   * เดิม PlayerView นับสถิติสดจาก public.match_records ทุกครั้ง (013)
--     → ถ้าต้องลบ match_records เก่าเพื่อคืนพื้นที่ สถิติผู้เล่นจะหายไปด้วย
--   * และตาราง match_records โตขึ้นเรื่อย ๆ ไม่มีที่สิ้นสุด
--
-- แนวทาง hybrid:
--   * เพิ่มคอลัมน์ตัวนับถาวรใน profiles: plays / wins / draws
--   * trigger AFTER INSERT ON match_records -> บวกตัวนับให้ผู้เล่นแบบ atomic
--     (ผู้เล่นทุกคนได้ plays, ผู้ชนะได้ wins, ถ้า is_draw ผู้เล่นทุกคนได้ draws)
--   * PlayerView อ่านสถิติจาก profiles (เร็ว + ไม่หาย)
--   * match_records ยังคงอยู่เป็น "ประวัติ/audit + ตัวกันบันทึกซ้ำ"
--     (queue_id unique) → ลบแถวเก่าได้โดยสถิติไม่หาย
--
-- วิธีใช้: Supabase Console -> SQL Editor -> New query -> วาง -> Run (หลัง 013)
--         รันซ้ำได้ (idempotent: add column if not exists / create or replace /
--         drop trigger if exists / backfill เป็นการ SET ค่า ไม่ใช่บวกเพิ่ม)
-- =============================================================================

-- 1) เพิ่มคอลัมน์ตัวนับถาวรใน profiles
alter table public.profiles
  add column if not exists plays integer not null default 0,
  add column if not exists wins  integer not null default 0,
  add column if not exists draws integer not null default 0;

-- 2) ฟังก์ชัน trigger: บวกตัวนับเมื่อมีแถวใหม่ใน match_records
--    security definer + search_path คงที่ เพื่อให้รันได้แม้ผู้เรียกจะไม่มีสิทธิ์ตรง
create or replace function public.apply_match_record_to_profile_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- ทุกคนที่ลงเล่นได้ plays +1
  update public.profiles
    set plays = plays + 1
    where device_id = any(new.player_device_ids);

  -- ผู้ชนะได้ wins +1
  update public.profiles
    set wins = wins + 1
    where device_id = any(new.winner_device_ids);

  -- เกมเสมอ: ทุกคนที่ลงเล่นได้ draws +1 (winner_device_ids ว่าง)
  if new.is_draw then
    update public.profiles
      set draws = draws + 1
      where device_id = any(new.player_device_ids);
  end if;

  return new;
end;
$$;

drop trigger if exists trg_apply_match_record_to_profile_stats on public.match_records;
create trigger trg_apply_match_record_to_profile_stats
  after insert on public.match_records
  for each row execute function public.apply_match_record_to_profile_stats();

-- 3) Backfill สถิติเดิมจาก match_records -> profiles
--    ใช้การ SET ค่าจากการนับรวม (ไม่ใช่ +=) → รันซ้ำได้ผลเท่าเดิม
with play_counts as (
  select unnest(player_device_ids) as device_id, count(*) as c
  from public.match_records
  group by 1
),
win_counts as (
  select unnest(winner_device_ids) as device_id, count(*) as c
  from public.match_records
  group by 1
),
draw_counts as (
  select unnest(player_device_ids) as device_id, count(*) as c
  from public.match_records
  where is_draw
  group by 1
)
update public.profiles p
set plays = coalesce(pc.c, 0),
    wins  = coalesce(wc.c, 0),
    draws = coalesce(dc.c, 0)
from play_counts pc
left join win_counts  wc on wc.device_id = pc.device_id
left join draw_counts dc on dc.device_id = pc.device_id
where p.device_id = pc.device_id;

-- 4) รีเฟรช schema cache ของ PostgREST (กันคอลัมน์ใหม่ยังไม่รู้จัก)
notify pgrst, 'reload schema';
