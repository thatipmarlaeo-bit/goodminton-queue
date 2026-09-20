// src/services/QueueService.js
import { supabase } from '../supabase'

export class QueueService {
  constructor(client = supabase) {
    this.client = client
    this.channel = null
  }

  // ==========================================
  // ส่วนของผู้เล่น (Player Actions & Read)
  // ==========================================

  async getActiveQueues() {
    try {
      const { data, error } = await this.client
        .from('active_queues_view')
        .select('*')

      if (error) throw new Error(`[QueueService.getActiveQueues]: ${error.message}`)
      return data || []
    } catch (err) {
      console.error(err)
      throw err
    }
  }

  subscribeToQueueChanges(onUpdateCallback) {
    if (this.channel) {
      this.client.removeChannel(this.channel)
    }

    this.channel = this.client
      .channel('public:queues_sync')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queues' },
        () => onUpdateCallback()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'queue_members' },
        () => onUpdateCallback()
      )
      .subscribe()

    return this.channel
  }

  unsubscribe() {
    if (this.channel) {
      this.client.removeChannel(this.channel)
      this.channel = null
    }
  }

  // ชื่อประเทศบนโลก (ภาษาไทย) ใช้สุ่มเป็นชื่อเรียกการ์ดคิวแทน Q-xxxxxxxx
  getCountryNames() {
    return [
      // เอเชีย
      'ไทย', 'ญี่ปุ่น', 'จีน', 'เกาหลีใต้', 'เกาหลีเหนือ', 'ไต้หวัน', 'ฮ่องกง',
      'สิงคโปร์', 'มาเลเซีย', 'บรูไน', 'อินโดนีเซีย', 'ฟิลิปปินส์', 'เวียดนาม',
      'ลาว', 'กัมพูชา', 'เมียนมา', 'ติมอร์เลสเต', 'อินเดีย', 'ปากีสถาน',
      'บังกลาเทศ', 'ศรีลังกา', 'เนปาล', 'ภูฏาน', 'มัลดีฟส์', 'อัฟกานิสถาน',
      'มองโกเลีย', 'คาซัคสถาน', 'อุซเบกิสถาน', 'เติร์กเมนิสถาน', 'คีร์กีซสถาน',
      'ทาจิกิสถาน', 'จอร์เจีย', 'อาร์มีเนีย', 'อาเซอร์ไบจาน', 'รัสเซีย',
      'อิหร่าน', 'อิรัก', 'ซีเรีย', 'เลบานอน', 'จอร์แดน', 'อิสราเอล',
      'ปาเลสไตน์', 'ซาอุดีอาระเบีย', 'เยเมน', 'โอมาน', 'สหรัฐอาหรับเอมิเรตส์',
      'กาตาร์', 'บาห์เรน', 'คูเวต', 'ตุรกี', 'โอมาน',
      // ยุโรป
      'สหราชอาณาจักร', 'ไอร์แลนด์', 'ฝรั่งเศส', 'เยอรมนี', 'อิตาลี', 'สเปน',
      'โปรตุเกส', 'เบลเยียม', 'เนเธอร์แลนด์', 'ลักเซมเบิร์ก', 'สวิตเซอร์แลนด์',
      'ออสเตรีย', 'โปแลนด์', 'เช็ก', 'สโลวาเกีย', 'ฮังการี', 'โรมาเนีย',
      'บัลแกเรีย', 'เซอร์เบีย', 'โครเอเชีย', 'บอสเนียและเฮอร์เซโกวีนา',
      'สโลวีเนีย', 'มอนเตเนโกร', 'มาซิโดเนียเหนือ', 'แอลเบเนีย', 'กรีซ',
      'เดนมาร์ก', 'สวีเดน', 'นอร์เวย์', 'ฟินแลนด์', 'ไอซ์แลนด์', 'เอสโตเนีย',
      'ลัตเวีย', 'ลิทัวเนีย', 'ยูเครน', 'เบลารุส', 'มอลโดวา', 'มอลตา',
      'ไซปรัส', 'ลีชเทินชไตน์', 'อันดอร์รา', 'โมนาโก', 'ซานมารีโน',
      // อเมริกาเหนือ
      'สหรัฐอเมริกา', 'แคนาดา', 'เม็กซิโก', 'กัวเตมาลา', 'เบลีซ',
      'เอลซัลวาดอร์', 'ฮอนดูรัส', 'นิการากัว', 'คอสตาริกา', 'ปานามา',
      'คิวบา', 'เฮติ', 'สาธารณรัฐโดมินิกัน', 'จาเมกา', 'ตรินิแดดและโตเบโก',
      'บาฮามาส', 'บาร์เบโดส', 'แอนติกาและบาร์บูดา', 'เซนต์ลูเซีย', 'เกรเนดา',
      // อเมริกาใต้
      'บราซิล', 'อาร์เจนตินา', 'ชิลี', 'เปรู', 'โคลอมเบีย', 'เวเนซุเอลา',
      'เอกวาดอร์', 'โบลิเวีย', 'ปารากวัย', 'อุรุกวัย', 'กายอานา', 'ซูรินาม',
      // แอฟริกา
      'อียิปต์', 'โมร็อกโก', 'แอลจีเรีย', 'ตูนิเซีย', 'ลิเบีย', 'ซูดาน',
      'แอฟริกาใต้', 'ไนจีเรีย', 'กานา', 'เซเนกัล', 'โกตดิวัวร์', 'เคนยา',
      'แทนซาเนีย', 'ยูกันดา', 'เอธิโอเปีย', 'โซมาเลีย', 'แคเมอรูน',
      'สาธารณรัฐคองโก', 'คองโก', 'เซียร์ราลีโอน', 'แซมเบีย', 'ซิมบับเว',
      'นามิเบีย', 'บอตสวานา', 'โมซัมบิก', 'แองโกลา', 'มาดากัสการ์',
      // โอเชียเนีย
      'ออสเตรเลีย', 'นิวซีแลนด์', 'ปาปัวนิวกินี', 'ฟิจิ', 'ซามัว', 'ตองงา',
      'วานูอาตู', 'หมู่เกาะโซโลมอน'
    ]
  }

  // แปลง id ของการ์ดคิวให้เป็นชื่อประเทศสำหรับแสดงผล:
  //  - คิวใหม่ (id = ชื่อประเทศอยู่แล้ว) -> คืนชื่อประเทศนั้น
  //  - คิวเก่า (id = Q-xxxxxxxx) -> ฮาร์ช id แบบคงที่มาเป็นชื่อประเทศ (ไม่เปลี่ยนไปมา)
  getQueueDisplayName(id) {
    if (typeof id !== 'string' || !id) return id ?? '-'
    if (!id.startsWith('Q-')) return id

    const countries = this.getCountryNames()
    let hash = 0
    for (let i = 0; i < id.length; i++) {
      hash = ((hash * 31) + id.charCodeAt(i)) >>> 0
    }
    return countries[hash % countries.length]
  }

  // สุ่มชื่อประเทศมาเป็น id ของการ์ดคิว
//  ห้ามซ้ำกับชื่อที่กำลังแสดงอยู่ตอนนี้ (คิว active ทั้งใบใหม่และคิวเก่า Q-* ที่ hash เป็นชื่อ)
//  ถ้าเคยถูกใช้ไปในประวัติแล้ว (คิวจบไปแล้ว) ต่อท้าย -2, -3 ...
  async generateQueueId() {
    const countries = this.getCountryNames()

    // ชื่อที่กำลังแสดงอยู่บนจอตอนนี้ -> ห้ามสุ่มชน (กัน "คิวเก่า hash เป็น X" ชนกับ "คิวใหม่ id = X")
    const usedDisplayNames = new Set()
    const { data: activeQueues } = await this.client
      .from('active_queues_view')
      .select('id')

    ;(activeQueues || []).forEach(q => {
      usedDisplayNames.add(this.getQueueDisplayName(q.id))
    })

    // กลั่นเฉพาะชื่อที่ยังว่างอยู่บนจอแล้ว
    const candidates = countries.filter(c => !usedDisplayNames.has(c))
    const pool = candidates.length > 0 ? candidates : countries

    for (let attempt = 0; attempt < 6; attempt++) {
      const country = pool[Math.floor(Math.random() * pool.length)]

      // ตรวจประวัติ: ชื่อนี้เคยใช้ไปแล้วในตารางไหม (กัน PK ชนกับคิวที่จบไปแล้ว)
      const { data: existing } = await this.client
        .from('queues')
        .select('id')
        .eq('id', country)
        .maybeSingle()

      if (!existing) return country

      for (let n = 2; n < 50; n++) {
        const suffixed = `${country}-${n}`
        if (usedDisplayNames.has(suffixed)) continue

        const { data: taken } = await this.client
          .from('queues')
          .select('id')
          .eq('id', suffixed)
          .maybeSingle()

        if (!taken) return suffixed
      }
    }

    // ถ้าเหนื่อยจริง ๆ (คิวเก่าครบทุกชื่อแล้ว) กันกลับไปใช้รหัส Q เก่า
    return 'Q-' + Math.random().toString(36).slice(2, 10).toUpperCase()
  }

  async createQueue(userProfile) {
    let newQueueId = null
    let queueError = null

    for (let i = 0; i < 5; i++) {
      newQueueId = await this.generateQueueId()

      const { error } = await this.client
        .from('queues')
        .insert({
          id: newQueueId,
          status: 'WAITING',
          created_at: new Date().toISOString()
        })

      if (!error) {
        queueError = null
        break
      }
      queueError = error
      if (String(error.code) !== '23505') break
    }

    if (queueError) throw new Error(`สร้างคิวล้มเหลว: ${queueError.message}`)

    const { error: memberError } = await this.client
      .from('queue_members')
      .insert({
        queue_id: newQueueId,
        device_id: userProfile.deviceId,
        joined_at: new Date().toISOString()
      })

    if (memberError) throw new Error(`ลงชื่อเข้าคิวล้มเหลว: ${memberError.message}`)

    return newQueueId
  }

  async joinQueue(queueId, deviceId) {
    const { count, error: countError } = await this.client
      .from('queue_members')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queueId)

    if (countError) throw new Error(countError.message)
    if (count >= 4) throw new Error('คิวนี้เต็มแล้ว (ครบ 4 คนเรียบร้อย)')

    const { error } = await this.client
      .from('queue_members')
      .insert({
        queue_id: queueId,
        device_id: deviceId,
        joined_at: new Date().toISOString()
      })

    if (error) {
      if (error.code === '23505') throw new Error('คุณมีชื่ออยู่ในคิวนี้หรือคิวอื่นแล้ว')
      throw new Error(error.message)
    }

    return true
  }

  // เมธอด leaveQueue ภายใน QueueService
  async leaveQueue(queueId, deviceId) {
    // 1. ลบชื่อผู้เล่นออกจากตาราง queue_members
    const { error: deleteErr } = await this.client
      .from('queue_members')
      .delete()
      .match({ queue_id: queueId, device_id: deviceId })

    if (deleteErr) throw deleteErr

    // 2. เช็กจำนวนสมาชิกที่เหลือในคิว
    const { count, error: countErr } = await this.client
      .from('queue_members')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queueId)

    if (countErr) throw countErr

    // 3. ถ้าเหลือ 0 คน อัปเดตสถานะเป็น CANCELLED โดยไม่ส่ง updated_at
    if (count === 0) {
      const { error: cancelErr } = await this.client
        .from('queues')
        .update({ status: 'CANCELLED' })
        .eq('id', queueId)

      if (cancelErr) throw cancelErr
      return { cancelled: true, deleted: true }
    }

    return { cancelled: false, deleted: false }
  }

  // ==========================================
  // ส่วนของแอดมิน (Admin Actions)
  // ==========================================

  // 1. เรียกคิวลงสนาม (เปลี่ยนสถานะคอร์ดเป็น CALLING และบันทึกเวลาเริ่มเรียก)
  async callQueueToCourt(courtNumber, queueId) {
    const now = Date.now()

    const { error: courtErr } = await this.client
      .from('courts')
      .update({
        status: 'CALLING',
        current_queue_id: queueId,
        status_updated_at: now
      })
      .eq('court_number', courtNumber)

    if (courtErr) throw courtErr

    // นำ updated_at ออก
    const { error: queueErr } = await this.client
      .from('queues')
      .update({
        status: 'ASSIGNED',
        assigned_court: courtNumber
      })
      .eq('id', queueId)

    if (queueErr) throw queueErr
  }

  async startMatch(courtNumber, queueId) {
    const { error: courtErr } = await this.client
      .from('courts')
      .update({
        status: 'IN_PROGRESS',
        status_updated_at: Date.now()
      })
      .eq('court_number', courtNumber)

    if (courtErr) throw courtErr

    // นำ updated_at ออก
    const { error: queueErr } = await this.client
      .from('queues')
      .update({ status: 'IN_PROGRESS' })
      .eq('id', queueId)

    if (queueErr) throw queueErr
  }

  async finishMatch(courtNumber, queueId) {
    // อ่านคิวปัจจุบันของคอร์ดก่อน เพื่อกัน "จบเกมซ้อน/หน้าจอชนกัน" (สองเครื่องหรือดับเบิลคลิก)
    // เคยเกิด: จบเกมเผลอลบ current_queue_id ของคิวใหม่ที่ trigger 001 เพิ่งเรียกลงไป
    //          -> คิวใหม่ค้าง ASSIGNED โดยไม่มีคอร์ดอ้างถึง (คิว Q-3OH0QGJX)
    const { data: court, error: getErr } = await this.client
      .from('courts')
      .select('current_queue_id')
      .eq('court_number', courtNumber)
      .maybeSingle()

    if (getErr) throw getErr
    const currentQid = court?.current_queue_id ?? null

    // หน้าจอส่งคิว "เก่า" มา แต่คอร์ดถูกคิวใหม่ยึดไปแล้ว -> จบคิวเก่าให้จบ แต่ห้ามแตะคอร์ด
    if (queueId && currentQid && currentQid !== queueId) {
      const { error: staleErr } = await this.client
        .from('queues')
        .update({ status: 'FINISHED' })
        .eq('id', queueId)
      if (staleErr) throw staleErr
      return
    }

    // จบคิวที่อยู่บนคอร์ดจริง ๆ
    if (currentQid) {
      const { error: queueErr } = await this.client
        .from('queues')
        .update({ status: 'FINISHED' })
        .eq('id', currentQid)

      if (queueErr) throw queueErr
    }

    // ปล่อยคอร์ด (ผูกกับ current_queue_id ที่อ่านมา — คิวใหม่จะไม่มีวันโดนล้าง)
    const { error: courtErr } = await this.client
      .from('courts')
      .update({
        status: 'AVAILABLE',
        current_queue_id: null,
        status_updated_at: Date.now()
      })
      .eq('court_number', courtNumber)
      .eq('current_queue_id', currentQid)

    if (courtErr) throw courtErr
  }

  async updateQueueStatus(queueId, status) {
    // นำ updated_at ออก
    const { error } = await this.client
      .from('queues')
      .update({ status: status })
      .eq('id', queueId)

    if (error) throw error
  }

  async cancelQueueByAdmin(queueId) {
    // นำ updated_at ออก
    const { error } = await this.client
      .from('queues')
      .update({ status: 'CANCELLED' })
      .eq('id', queueId)

    if (error) throw error
  }

  // ==========================================
  // แอดมิน: บันทึกผลการแข่งขัน (กด "จบเกม" -> เลือกผู้ชนะ สูงสุด 2 คน หรือเสมอ)
  //   - player_device_ids = สแนปชอตสมาชิกคิวที่ลงสนามทั้งหมด (ใช้คิด "จำนวนครั้งที่เล่น")
  //   - winner_device_ids  = ผู้ชนะ (ว่าง = เสมอ) — ฝั่ง DB การันตีไม่เกิน 2 คน
  //   - queue_id unique -> จบเกมซ้อนไม่บันทึกผลซ้ำ
  // ==========================================
  async recordMatchResult({ courtNumber, queueId, playerDeviceIds, winnerDeviceIds = [] }) {
    const winners = [...new Set((winnerDeviceIds || []).filter(Boolean))]
    if (winners.length > 2) throw new Error('เลือกผู้ชนะได้สูงสุด 2 คน (เล่นเป็นทีมคู่)')

    const { error } = await this.client
      .from('match_records')
      .insert({
        queue_id: queueId,
        court_number: courtNumber,
        player_device_ids: [...new Set((playerDeviceIds || []).filter(Boolean))],
        winner_device_ids: winners,
        is_draw: winners.length === 0
      })

    if (error) throw new Error(`บันทึกผลการแข่งขันไม่สำเร็จ: ${error.message}`)
  }

  // ==========================================
  // สถิติผู้เล่นสำหรับหน้าแก้ไขโปรไฟล์:
  //   - plays = จำนวนครั้งที่ลงเล่นทั้งหมด (แอดมินกดจบเกมแล้วเท่านั้น)
  //   - wins  = จำนวนครั้งที่ชนะ (ถูกเลือกเป็นผู้ชนะเมื่อจบเกม)
  //   - draws = จำนวนครั้งที่เสมอ (จบเกมแต่ไม่มีใครได้แต้ม)
  // ==========================================
  async getPlayerMatchStats(deviceId) {
    if (!deviceId) return { plays: 0, wins: 0, draws: 0 }

    const countWhere = async (query) => {
      const { count, error } = await query
      if (error) throw new Error(`ดึงสถิติไม่สำเร็จ: ${error.message}`)
      return count || 0
    }

    const [plays, wins, draws] = await Promise.all([
      countWhere(this.client
        .from('match_records')
        .select('id', { count: 'exact', head: true })
        .contains('player_device_ids', [deviceId])),
      countWhere(this.client
        .from('match_records')
        .select('id', { count: 'exact', head: true })
        .contains('winner_device_ids', [deviceId])),
      countWhere(this.client
        .from('match_records')
        .select('id', { count: 'exact', head: true })
        .contains('player_device_ids', [deviceId])
        .eq('is_draw', true))
    ])

    return { plays, wins, draws }
  }

  // ==========================================
  // ดึงรายชื่อคนที่ Check-in อยู่ในสนาม และยังไม่ติดคิวใดๆ
  //   - gpsFilterOn=true  -> กรองเฉพาะผู้ที่เช็คอินผ่าน (daily_checkins วันนี้ = INSIDE
  //                          + active ภายใน 5 นาที) — ใช้เกณฑ์เดียวกับ badge "ผู้เล่นตอนนี้"
  //   - gpsFilterOn=false -> ใช้ `profiles` เป็นฐานเสมอ (ทุกคนถือว่าอยู่ในสนาม)
  //   - ทั้งสองโหมด ตัดคนที่ติดคิวยังไม่จบออกเหมือนกัน
  // ==========================================
  async getAvailablePlayersOnSite(currentDateStr, { gpsFilterOn = false } = {}) {
    if (gpsFilterOn) {
      return this.getGpsAvailablePlayers(currentDateStr)
    }
    // =====================================================================
    // ใช้ `profiles` เป็นฐานเสมอ — Player = Admin เท่ากัน (โหมดไม่กรอง GPS)
    // =====================================================================
    const { data: allProfiles, error: profErr } = await this.client
      .from('profiles')
      .select('device_id, real_name, nickname, role, faculty, avatar_id')

    if (profErr) throw profErr
    if (!allProfiles || allProfiles.length === 0) return []

    const busy = await this.fetchBusyDeviceIds({ skipErrorQueues: true })
    // --------------------------------------------------------- DEBUG 2026-09-20
    // ดูจำนวนจริงตอน runtime ถ้า modal ยังว่าง (เปิดคอนโซล dev, เปิด modal แล้วอ่าน)
    console.log('[DEBUG getAvailablePlayersOnSite] profiles=', allProfiles.length,
      'busy=', busy.size, '→ ว่างเพราะ:', allProfiles.length === 0 ? 'profiles ไม่มีคน' : (allProfiles.filter(u => u.device_id && !busy.has(u.device_id)).length === 0 ? 'busy ครอบหมด' : 'OK'))
    // --------------------------------------------------------- DEBUG 2026-09-20
    return (allProfiles || [])
      .filter(u => u.device_id && !busy.has(u.device_id))
      .map(u => ({
        device_id: u.device_id,
        real_name: u.real_name || '-',
        nickname: u.nickname || 'ผู้เล่น',
        role: u.role || 'นิสิต',
        faculty: u.faculty || '-',
        avatar_id: u.avatar_id || 'boy-cap'
      }))
  }

  // ==========================================
  // ดึงรายชื่อเฉพาะที่ "ผ่านระบบคัดพิกัด" (daily_checkins วันนี้ = INSIDE)
  // และยังว่าง (ไม่อยู่ในคิวอื่น) — ใช้เมื่อเปิดโหมดกรอง GPS
  // (ไม่กรอง last_active_at — กันคอลัมน์/ค่าเก่าตัดผลจนเป็น 0)
  // ==========================================
  async getGpsAvailablePlayers(dateStr) {
    const { data: insideRows, error: dcErr } = await this.client
      .from('daily_checkins')
      .select('device_id')
      .eq('date', dateStr)
      .eq('status', 'INSIDE')

    if (dcErr) throw dcErr

    const ids = (insideRows || []).map(r => r.device_id)
    if (!ids.length) return []

    const { data: profs, error: profErr } = await this.client
      .from('profiles')
      .select('device_id, real_name, nickname, role, faculty, avatar_id')
      .in('device_id', ids)

    if (profErr) throw profErr

    const busy = await this.fetchBusyDeviceIds({ skipErrorQueues: true })

    return (profs || [])
      .filter(u => u.device_id && !busy.has(u.device_id))
      .map(u => ({
        device_id: u.device_id,
        real_name: u.real_name || '-',
        nickname: u.nickname || 'ผู้เล่น',
        role: u.role || 'นิสิต',
        faculty: u.faculty || '-',
        avatar_id: u.avatar_id || 'boy-cap'
      }))
  }

  // ตัวช่วย: ดึง device_id ทั้งหมดที่อยู่ในคิวที่ยังไม่จบ → ไว้ตัด "คนติดคิว" ออก
  // (skipErrorQueues=false = กัน bug เดิมที่คัดคนติดคิวออกจาก modal จนว่าง)
  async fetchBusyDeviceIds({ skipErrorQueues = false } = {}) {
    const statuses = ['WAITING', 'CALLING', 'IN_PROGRESS', 'ASSIGNED', 'SKIPPED', 'ON_HOLD']
    const { data: queues, error } = await this.client
      .from('active_queues_view')
      .select('players, status')
      .in('status', statuses)

    if (error) throw error

    const busy = new Set()
    ;(queues || []).forEach(q => {
      if (!Array.isArray(q.players)) return
      // ถ้า skipErrorQueues แล้วคิวนั้น error -> ข้าม (กันคนติดคิว error ถูกตัดจาก modal
      // จนว่างทั้งที่จริงว่าง) ไม่เช่นนั้นนับรวม
      q.players.forEach(p => busy.add(p.deviceId))
    })
    return busy
  }

  // ตัวช่วย: ดึง profiles เป็น Map(device_id -> row) เฉพาะ id ที่ส่งมา
  async fetchProfilesForDeviceIds(deviceIds) {
    if (!deviceIds || deviceIds.length === 0) return new Map()
    const { data, error } = await this.client
      .from('profiles')
      .select('device_id, avatar_id, nickname')
      .in('device_id', deviceIds)

    if (error) throw error
    const m = new Map()
    ;(data || []).forEach(p => m.set(p.device_id, p))
    return m
  }

  // ==========================================
  // หัวหน้ากลุ่มดึงเพื่อนเข้าคิว
  // ==========================================
  async addPlayerToQueue(queueId, targetDeviceId) {
    // เช็กจำนวนคนก่อนแอด
    const { count, error: countErr } = await this.client
      .from('queue_members')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queueId)

    if (countErr) throw countErr
    if (count >= 4) throw new Error('คิวนี้สมาชิกครบ 4 คนแล้ว')

    const { error: insertErr } = await this.client
      .from('queue_members')
      .insert({
        queue_id: queueId,
        device_id: targetDeviceId,
        joined_at: new Date().toISOString()
      })

    if (insertErr) {
      if (insertErr.code === '23505') throw new Error('ผู้เล่นคนนี้อยู่ในคิวอื่นอยู่แล้ว')
      throw insertErr
    }

    return true
  }

  // ==========================================
  // แอดมิน: ลบสมาชิกออกจากคิว
  // ==========================================
  async removeQueueMember(queueId, deviceId) {
    const { count, error: countErr } = await this.client
      .from('queue_members')
      .select('*', { count: 'exact', head: true })
      .eq('queue_id', queueId)

    if (countErr) throw countErr

    const { error: deleteErr } = await this.client
      .from('queue_members')
      .delete()
      .match({ queue_id: queueId, device_id: deviceId })

    if (deleteErr) throw deleteErr

    // เหลือ 0 คน -> ยกเลิกการ์ดคิวทิ้ง
    if (count <= 1) {
      const { error: cancelErr } = await this.client
        .from('queues')
        .update({ status: 'CANCELLED' })
        .eq('id', queueId)

      if (cancelErr) throw cancelErr
      return { cancelled: true }
    }

    return { cancelled: false }
  }

  // ==========================================
  // แอดมิน: สลับการแข่งขันระหว่างสองคอร์ด
  // ==========================================
  async swapCourts(sourceCourtNumber, targetCourtNumber) {
    const { data: rows, error: getErr } = await this.client
      .from('courts')
      .select('*')
      .in('court_number', [sourceCourtNumber, targetCourtNumber])

    if (getErr) throw getErr

    const src = rows.find(c => c.court_number === sourceCourtNumber)
    const dst = rows.find(c => c.court_number === targetCourtNumber)
    if (!src || !dst) throw new Error('ไม่พบคอร์ตที่ระบุ')

    await this.client
      .from('courts')
      .update({ status: dst.status, current_queue_id: dst.current_queue_id, status_updated_at: dst.status_updated_at })
      .eq('court_number', src.court_number)

    await this.client
      .from('courts')
      .update({ status: src.status, current_queue_id: src.current_queue_id, status_updated_at: src.status_updated_at })
      .eq('court_number', dst.court_number)

    if (src.current_queue_id) {
      await this.client.from('queues').update({ assigned_court: targetCourtNumber }).eq('id', src.current_queue_id)
    }
    if (dst.current_queue_id) {
      await this.client.from('queues').update({ assigned_court: sourceCourtNumber }).eq('id', dst.current_queue_id)
    }
  }

  // ==========================================
  // แอดมิน: ปิดทุกสนามพร้อมล้างคิวที่ลงสนาม/กำลังเล่นทั้งหมด (จบเกมทันที)
  // ==========================================
  async closeAllCourts(closeReason = 'ปิดสนามทั้งหมด') {
    const { data: rows, error: getErr } = await this.client
      .from('courts')
      .select('*')

    if (getErr) throw getErr

    // 1) ล้างคิวที่ถูกเรียก (ASSIGNED/กำลังเล่น) บนทุกคอร์ดให้จบเลย
    for (const c of rows || []) {
      if (c.status !== 'AVAILABLE' && c.status !== 'CLOSED' && c.current_queue_id) {
        await this.client
          .from('queues')
          .update({ status: 'FINISHED' })
          .eq('id', c.current_queue_id)
      }
    }

    // 2) ล้างคิวที่ยังค้างทุกสถานะที่ยังไม่จบ:
    //    - ASSIGNED/IN_PROGRESS (ลงคอร์ด/กำลังเล่น หรือค้างอยู่เพราะคอร์ดปลดออกไปแล้ว)
    //      = จบเกมไป (FINISHED) กันคิว orphan ที่คอร์ดว่างแต่สถานะค้าง
    //    - WAITING/SKIPPED/ON_HOLD/CALLING (ยังรออยู่) = ยกเลิกทิ้ง (CANCELLED)
    const active = ['WAITING', 'SKIPPED', 'ON_HOLD', 'CALLING', 'ASSIGNED', 'IN_PROGRESS']
    const { data: pending, error: pendingErr } = await this.client
      .from('queues')
      .select('id, status')
      .in('status', active)

    if (pendingErr) throw pendingErr

    for (const q of pending || []) {
      const finished = q.status === 'ASSIGNED' || q.status === 'IN_PROGRESS'
      await this.client
        .from('queues')
        .update({ status: finished ? 'FINISHED' : 'CANCELLED' })
        .eq('id', q.id)
    }

    // 3) ปิดทุกคอร์ดพร้อมปลดคิวและบันทึกเหตุผล
    const { error: closeErr } = await this.client
      .from('courts')
      .update({
        status: 'CLOSED',
        current_queue_id: null,
        close_reason: closeReason,
        status_updated_at: Date.now()
      })
      .neq('status', 'CLOSED')

    if (closeErr) throw closeErr
  }

  // ==========================================
  // แอดมิน: เปิด/ปิดคอร์ด (ถ้าปิดคอร์ดที่กำลังเล่น -> ปลดคิวกลับเป็นพักคิว)
  // ==========================================
  async setCourtStatus(courtNumber, status, closeReason = null) {
    const { data: court, error: getErr } = await this.client
      .from('courts')
      .select('*')
      .eq('court_number', courtNumber)
      .maybeSingle()

    if (getErr) throw getErr
    if (!court) throw new Error('ไม่พบคอร์ตที่ระบุ')

    const now = Date.now()

    if (status === 'CLOSED') {
      // คอร์ดกำลังเล่น/เรียกอยู่ -> ปลดคิวกลับเป็น ON_HOLD ก่อนปิด
      if (court.status !== 'AVAILABLE' && court.current_queue_id) {
        await this.client
          .from('queues')
          .update({ status: 'ON_HOLD', assigned_court: null })
          .eq('id', court.current_queue_id)
      }

      await this.client
        .from('courts')
        .update({
          status: 'CLOSED',
          current_queue_id: null,
          close_reason: closeReason || null,
          status_updated_at: now
        })
        .eq('court_number', courtNumber)
    } else {
      // เปิดคอร์ด -> ปล่อยเป็น AVAILABLE แล้ว trigger จะเรียบคิวถัดไปเอง
      await this.client
        .from('courts')
        .update({ status: 'AVAILABLE', close_reason: null, status_updated_at: now })
        .eq('court_number', courtNumber)
    }
  }

  // ==========================================
  // แอดมิน: พักคิวที่ถูกเรียกอยู่ (คนมาไม่ครบ) -> ปล่อยคอร์ดให้คิวถัดไป
  // ==========================================
  async holdCallingQueue(courtNumber) {
    const { data: court, error: getErr } = await this.client
      .from('courts')
      .select('*')
      .eq('court_number', courtNumber)
      .maybeSingle()

    if (getErr) throw getErr
    if (!court || !court.current_queue_id) throw new Error('ไม่มีคิวที่ถูกเรียกอยู่บนคอร์ตนี้')

    await this.client
      .from('queues')
      .update({ status: 'ON_HOLD', assigned_court: null })
      .eq('id', court.current_queue_id)

    // ปล่อยคอร์ดเป็นว่าง -> trigger 001 จะเรียบคิวถัดไปขึ้นแทนเอง
    await this.client
      .from('courts')
      .update({ status: 'AVAILABLE', current_queue_id: null, status_updated_at: Date.now() })
      .eq('court_number', courtNumber)
  }

  // ==========================================
  // แอดมิน: สร้างการ์ดคิวพร้อมสมาชิกชุดแรก (ใช้ใน modal เพิ่มคิวกลุ่มใหม่)
  // ==========================================
  async createQueueWithPlayers(deviceIds = []) {
    const uniqueIds = [...new Set(deviceIds.filter(Boolean))]
    if (uniqueIds.length === 0) throw new Error('กรุณาเลือกผู้เล่นอย่างน้อย 1 คน')
    if (uniqueIds.length > 4) throw new Error('คิวหนึ่งมีสมาชิกได้สูงสุด 4 คน')

    let newQueueId = null
    let queueError = null

    for (let i = 0; i < 5; i++) {
      newQueueId = await this.generateQueueId()

      const { error } = await this.client
        .from('queues')
        .insert({
          id: newQueueId,
          status: 'WAITING',
          created_at: new Date().toISOString()
        })

      if (!error) {
        queueError = null
        break
      }
      queueError = error
      if (String(error.code) !== '23505') break
    }

    if (queueError) throw new Error(`สร้างคิวล้มเหลว: ${queueError.message}`)

    const rows = uniqueIds.map((deviceId, i) => ({
      queue_id: newQueueId,
      device_id: deviceId,
      joined_at: new Date(Date.now() + i).toISOString()
    }))

    const { error: memberError } = await this.client
      .from('queue_members')
      .insert(rows)

    if (memberError) throw new Error(`ลงชื่อเข้าคิวล้มเหลว: ${memberError.message}`)

    return newQueueId
  }

  // ==========================================
  // ค้นหาผู้ใช้ตามชื่อเล่นเท่านั้น (สำหรับแอดมินพิมพ์ค้นแล้วเลือก)
  // ==========================================
  async searchPlayersByKeyword(keyword = '') {
    const kw = keyword.trim()
    if (!kw) return []

    // อ่านจาก profiles ล้วน (identity ตารางเดียว)
    const profilesRes = await this.client
      .from('profiles')
      .select('device_id, nickname, real_name, role, faculty')
      .ilike('nickname', `%${kw}%`)
      .limit(20)

    if (profilesRes?.error) throw profilesRes.error

    const byId = new Map()
    ;(profilesRes?.data || []).forEach(p => byId.set(p.device_id, p))
    return Array.from(byId.values())
  }

  // ==========================================
  // Watchdog (ไม่มีค่าใช้จ่าย): เรียก self-heal ฝั่งเซิร์ฟเวอร์เพื่อปลดคอร์ดที่
  // CALLING ค้างเกิน 3 นาที --- ทดแทน pg_cron (Add-on เสียเงิน) โดยให้หน้าจอ
  // ที่เปิดอยู่รัน RPC นี้เป็นจังหวะ แทนการตรวจทุก 1 นาทีของ cron
  // ==========================================
  async runCourtMaintenance() {
    try {
      const { error } = await this.client.rpc('expire_calling_queues')
      if (error && !error.message?.includes('does not exist')) {
        console.error('[QueueService.runCourtMaintenance]:', error.message)
      }
    } catch (err) {
      // ฟังก์ชันยังไม่ได้ deploy ในฐานข้อมูล -> ข้ามเงียบ ๆ ไม่พังการทำงานหลัก
      if (!err?.message?.includes('does not exist')) {
        console.error('[QueueService.runCourtMaintenance]:', err)
      }
    }
  }

}

// สร้าง Instance ออกไปตัวเดียวเพื่อให้ใช้งานได้ครบทั้งคลาส
export const queueService = new QueueService()

