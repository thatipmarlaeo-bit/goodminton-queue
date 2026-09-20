-- =============================================================================
-- 002_calling_timeout_cron.sql
-- คอร์ดที่ถูกเรียกคิว (CALLING) ค้างเกิน 3 นาที -> ปล่อยคอร์ด + พักคิวเป็น ON_HOLD
-- -----------------------------------------------------------------------------
-- หมายเหตุสำคัญ:
--   * โปรเจกต์นี้ (ตามที่ลองแล้ว) ยังไม่มีไฟล์ cron.control บนเซิร์ฟเวอร์ หมายถึง
--     ยังไม่ได้เปิดใช้งาน pg_cron -> เปิดจาก Dashboard อย่างเดียวไม่ได้ ต้องผ่าน
--     Add-ons "pg_cron" (แผนจ่าย) ก่อน
--   * ถ้าอยากได้เวลา-หมดอัตโนมัติทันทีโดยไม่ต้องพึ่ง pg_cron ให้รัน
--     supabase/001_auto_call_trigger.sql ตัวใหม่ล่าสุด ซึ่งมี self-heal ปลด
--     CALLING ค้างในตัวอยู่แล้ว (ทำงานเมื่อมีคอร์ดใดคอร์ดหนึ่งเปลี่ยนเป็นว่าง)
--   * ไฟล์นี้ เอาไว้ "เปิด cron ให้ตรวจทุก 1 นาที" สำหรับโปรเจกต์ที่เปิด pg_cron ได้
-- =============================================================================

-- 1) ฟังก์ชันคืนคอร์ดที่ค้างเกินเวลากลับเป็นว่าง (เหมือนใน 001 เพื่อให้ไฟล์นี้
--    รันอิสระได้ ถ้าใครรัน 002 โดยยังไม่รัน 001)
create or replace function expire_calling_queues()
returns void
language plpgsql
as $$
declare
  r record;
begin
  for r in
    select court_number, current_queue_id
      from courts
     where status = 'CALLING'
       and (extract(epoch from now()) * 1000)::bigint
           - coalesce(status_updated_at, 0) > 3 * 60 * 1000
  loop
    -- พักคิวที่ถูกเรียกแต่ไม่มา -> กลับไปรอ (คนยังครบอยู่ = ON_HOLD)
    if r.current_queue_id is not null then
      update queues
         set status = 'ON_HOLD',
             assigned_court = null
       where id = r.current_queue_id;
    end if;

    -- ปล่อยคอร์ดเป็นว่าง -> trigger 001 จะเรียบคิวถัดไปขึ้นแทนเอง
    update courts
       set status = 'AVAILABLE',
           current_queue_id = null,
           status_updated_at = (extract(epoch from now()) * 1000)::bigint
     where court_number = r.court_number;
  end loop;
end;
$$;

-- 2) เมื่อ enable pg_cron สำเร็จแล้ว รันคำสั่งเหล่านี้ (ถ้ายังไม่ enable ให้ลอง
--    create extension if not exists cron; หรือเปิดผ่าน Dashboard/Add-ons ก่อน)

-- 2.1) เปิดใช้งาน pg_cron (ข้ามได้ถ้า enable ผ่าน Dashboard แล้ว)
create extension if not exists cron;

-- 2.2) ตั้งนาฬิกาปลุก: ทุก ๆ 1 นาที (unschedule ก่อนเสมอเพื่อให้รันซ้ำได้)
select cron.unschedule('calling-timeout-every-minute')
 where exists (select 1 from cron.job where jobname = 'calling-timeout-every-minute');

select cron.schedule(
  'calling-timeout-every-minute',
  '*/1 * * * *',
  'select expire_calling_queues();'
);

-- -----------------------------------------------------------------------------
-- ยกเลิกงานเมื่อไม่ใช้: select cron.unschedule('calling-timeout-every-minute');
-- -----------------------------------------------------------------------------