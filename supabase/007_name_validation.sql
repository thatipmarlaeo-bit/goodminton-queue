-- =============================================================================
-- 007_name_validation.sql — บังคับภาษา/รูปแบบ ชื่อจริง + ชื่อเล่น ที่ชั้น DB
-- -----------------------------------------------------------------------------
-- เกราะสุดท้าย (ไม่ว่าจะ bypass client แค่ไหนก็กันไมได้ — ได้ แต่ข้อมูลจะไป
-- กระแทกตรงนี้แทน) ตรวจแบบเดียวกับ src/utils/nameValidator.js ทุกประการ
--
--   ชื่อจริง  : ห้ามว่าง + [ก-๙]+ เว้นวรรคระหว่างคำได้, ไม่มีนามสกุลก็ได้ (nullable
--               ไว้เฉพาะแถวเก่า; แถวใหม่บังคับไม่ว่าง)
--   ชื่อเล่น  : ห้ามว่างเท่านั้น — อนุญาต อิโมจิ/ตัวเลข/อักษรพิเศษ ได้ทั้งหมด
--               (อัปเดต 2026-09-20 ตามคำขอ ให้ชื่อเล่นใส่อะไรก็ได้ที่ไม่ว่าง)
--
-- ⚠️ ใช้ `NOT VALID` = บังคับเฉพาะแถวใหม่/อัปเดต ไม่แสกนแถวเก่า → ข้อมูลผู้ใช้
--    ที่มีอยู่แล้ว (อาจมีชื่อจริงว่าง/อังกฤษเก่าบ้าง) จะไม่โดนปิดใช้งาน แต่แถวใหม่
--    จะเข้าคอนสเตรนต์นี้เสมอ  รอ data สะอาดแล้วค่อยถอด comments ที่ท้ายไฟล์
-- ⚠️ regex ฝั่ง PG ต้องเป็นลิเทอรัล `ก-๙` (ช่วง U+0E01–U+0E59); ห้ามใช้ `\u0E00`
--    เพระ PostgreSQL POSIX regex ไม่รองรับ escape `\u` จะ error ตอน apply
-- =============================================================================

-- ชื่อจริง: ห้ามว่าง + ภาษาไทยเท่านั้น (เว้นวรรคได้, ไม่มีนามสกุลก็ได้)
-- ⚠️ drop-if-exists ก่อน = idempotent → apply ซ้ำได้ไม่เจอ 42710
alter table public.profiles
  drop constraint if exists profiles_real_name_thai_ck;

alter table public.profiles
  add constraint profiles_real_name_thai_ck
  check (
    real_name is null
    or real_name ~ '^[ก-๙]+(?:[[:space:]][ก-๙]+)*$'
  )
  not valid;

-- ชื่อเล่น: ห้ามว่างเท่านั้น (อนุญาตทุกอย่าง อิโมจิ/ตัวเลข/อักษรพิเศษ ไม่จำกัดสก์ริปต์)
alter table public.profiles
  drop constraint if exists profiles_nickname_thai_eng_ck;

alter table public.profiles
  add constraint profiles_nickname_thai_eng_ck
  check (
    nickname is null
    or nickname = ''
    or btrim(nickname) <> ''
  )
  not valid;
