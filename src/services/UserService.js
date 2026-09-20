// src/services/UserService.js
import { supabase } from '../supabase'

export class UserService {
  constructor(client = supabase) {
    this.client = client
  }

  /**
   * profiles คือตาราง identity เดียวของระบบทั้งระบบ
   * (FK ของ queue_members/daily_checkins ชี้มายังตารางนี้ และ live_courts_view อิงอยู่)
   * — ห้าม drop/เปลี่ยนชื่อโดยไม่ปรับ constraint ฝั่ง DB
   */

  /**
   * บันทึกหรืออัปเดตข้อมูลผู้ใช้งานลง Supabase (Upsert)
   * @param {Object} profile - ข้อมูลโปรไฟล์จากฝั่ง UI
   */
  async saveProfile(profile) {
    if (!profile.deviceId) {
      throw new Error('ไม่พบ deviceId กรุณาลองใหม่อีกครั้ง')
    }

    const payload = {
      device_id: profile.deviceId,
      nickname: profile.nickname || profile.name,
      real_name: profile.realName,
      role: profile.role || 'นิสิต',
      faculty: profile.faculty,
      avatar_id: profile.avatarId || 'boy-cap',
      skill_level: profile.skillLevel || 'BG',
      updated_at: new Date().toISOString()
    }

    const { data, error } = await this.client
      .from('profiles')
      .upsert(payload, { onConflict: 'device_id' })

    if (error) throw error
    return data
  }

  /**
   * ดึงข้อมูลโปรไฟล์ผู้ใช้จาก Supabase (ตาราง profiles)
   * @param {string} deviceId - รหัสประจำเครื่อง/ผู้ใช้งาน
   */
  async getProfile(deviceId) {
    if (!deviceId) return null

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('device_id', deviceId)
        .maybeSingle()

      if (error) throw new Error(error.message)
      if (!data) return null

      return {
        deviceId: data.device_id,
        nickname: data.nickname,
        name: data.nickname || data.real_name,
        realName: data.real_name,
        role: data.role,
        faculty: data.faculty,
        avatarId: data.avatar_id || 'boy-cap',
        skillLevel: data.skill_level || 'BG'
      }
    } catch (err) {
      console.error('[UserService.getProfile] Error:', err)
      throw err
    }
  }

  /**
   * การันตีว่า device_id มีแถว identity ใน profiles (ตารางแม่ของ FK)
   * เพราะ daily_checkins/queue_members ชี้ FK มาตรงนี้ — อุปกรณ์ใหม่หรือ
   * ผู้เล่นที่แอดมินเพิ่มจะได้ check-in/เข้าคิวได้ (แก้รายชื่อ "ในสนาม" ค้างว่าง)
   */
  async ensureIdentity(deviceId, fallbackName = 'ผู้เล่น') {
    if (!deviceId) return
    try {
      await this.client
        .from('profiles')
        .upsert(
          { device_id: deviceId, nickname: fallbackName, updated_at: new Date().toISOString() },
          { onConflict: 'device_id', ignoreDuplicates: true }
        )
    } catch (err) {
      console.error('[UserService.ensureIdentity] Error:', err)
    }
  }
}

export const userService = new UserService()