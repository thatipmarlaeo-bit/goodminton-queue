// =============================================================================
// nameValidator.js — ตรวจรูปแบบชื่อจริง + ชื่อเล่น (ใช้ทั้ง PlayerView/AdminView)
//
// กฎตรงกับ PostgreSQL CHECK constraint ใน supabase/007_name_validation.sql
//   ชื่อจริง : ห้ามว่าง + ภาษาไทยเท่านั้น, เว้นวรรคระหว่างคำได้, ไม่มีนามสกุลก็ได้
//   ชื่อเล่น : ห้ามว่างเท่านั้น — อนุญาต อิโมจิ/ตัวเลข/อักษรพิเศษ ได้ทั้งหมด
//              (อัปเดต 2026-09-20 ตามคำขอ ให้ชื่อเล่นใส่อะไรก็ได้ที่ไม่ว่าง)
//
// ตัว regex ฝั่ง JS = เทียบเท่า `[ก-๙]` ฝั่ง PG (ช่วง U+0E00–U+0E7F ครอบ
// พยัญชนะ/สระ/วรรณยุกต์/เลขไทย ครบ — ฝั่ง JS ใช้ \u{...} escape ตรงตัว)
// =============================================================================

// ต้องรันผ่านแบบอักษรไทยล้วน: ก-ฮ + สระเหนือ/ใต้ (ะ-ำ ิ-์) + วรรณยุกต์ (่-๋) + ๆ ฯลฯ
const THAI_RE = /^[\u0E00-\u0E7F]+(?:\s[\u0E00-\u0E7F]+)*$/

/**
 * ตรวจชื่อจริง (Thai only, นามสกุลไม่บังคับ)
 * @param {string} value
 * @returns {{ ok: boolean, message?: string }}
 */
export function validateRealName(value = '') {
  const v = value.trim()
  if (!v) {
    return { ok: false, message: 'กรุณากรอกชื่อจริง' }
  }
  if (!THAI_RE.test(v)) {
    return {
      ok: false,
      message: 'ชื่อจริงต้องเป็นภาษาไทยเท่านั้น '
    }
  }
  return { ok: true }
}

/**
 * ตรวจชื่อเล่น (อนุญาตทุกตัวอักษร — อิโมจิ/ตัวเลข/อักษรพิเศษ — ห้ามว่างเท่านั้น)
 * @param {string} value
 * @returns {{ ok: boolean, message?: string }}
 */
export function validateNickname(value = '') {
  const v = value.trim()
  if (!v) return { ok: false, message: 'กรุณากรอกชื่อเล่น' }
  return { ok: true }
}
