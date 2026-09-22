-- =============================================================================
-- check_007_offenders.sql
-- OPS ROUTINE: หาแถว profiles ที่ real_name ผิดเงื่อนไข 007 (Check NOT VALID)
-- -----------------------------------------------------------------------------
-- ทำไมต้องเฝ้า: 007 `NOT VALID` ยังบังคับทุก UPDATE (ไม่ใช่แค่แถวใหม่) — ถ้า user
--   มี real_name ไม่ใช่ภาษาไทยล้วน (เช่น "Thanatip Malaew"):
--   (1) user คนนั้นจะ edit profile ไม่ได้อีกเลย (23514 บน UPDATE)
--   (2) แย่สุด: ถ้า user นั้นอยู่ในแมตช์ตอน "จบเกม" trigger 014 จะ UPDATE profiles
--       ทุกคนในคิว -> ละเมิด 23514 -> ทั้ง INSERT match_records ระเบิด
--       -> admin บันทึกผลไม่ได้ และคอร์ตค้าง IN_PROGRESS (self-heal ดูแค่ CALLING)
--   ดังนั้นต้องรักษายอด offenders = 0 แถวตลอดการใช้งานจริง
--
-- รันใน Supabase Console -> SQL Editor (รันได้ปลอดภัย ไม่แก้ข้อมูล)
-- =============================================================================

-- 1) ดูว่าใครบ้างที่ผิดเงื่อนไข (แถวที่ "แช่แข็ง" + ทำ 014 พังได้)
select device_id, nickname, real_name, updated_at
  from profiles
 where real_name is not null and real_name !~ '^[ก-๙]+(?:[[:space:]][ก-๙]+)*$';

-- 2) แก้แถวที่อยากเก็บไว้ (ค่าไทยผ่าน CHECK — แถวนี้จะกลับมา update ได้ปกติ)
-- update profiles set real_name = '<ชื่อไทย>' where device_id = '...';

-- 3) ลบแถวทดสอบ/ถังขยะ แบบ FK-safe (ลูกลบก่อนพ่อ ตัวหลัง FK ไปที่ profiles)
-- delete from queue_members where device_id in ('...');
-- delete from daily_checkins where device_id in ('...');
-- delete from profiles where device_id in ('...');