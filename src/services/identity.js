// src/services/identity.js
// ตัวตนผู้ใช้ = device_id ที่เคยเก็บไว้แค่ localStorage -> iOS Safari จัดการตัด/evict
// localStorage เมื่อปิดแท็บ (โดยเฉพาะเว็บที่ไม่ได้ Add to Home Screen + ITP/storage pressure)
// => เปิดกลับมา = สร้าง USR- ใหม่ = กลายเป็น "ผู้ใช้ใหม่" (ผี) -> จำนวนบนสนามบวม + สมัครผีซ้ำได้
// วิธีแก้: เก็บ device_id ครบใน 3 ช่อง (cookie + IndexedDB + localStorage) อ่านเอา "ตัวที่รอด"
// แล้วเขียน sync กลับให้ครบทุกช่องในการโหลดหน้าเดียว กันช่องไหนถูก wipe ทิ้งโดยไม่ตั้งใจ

const COOKIE_NAME = 'badminton_devid'
const IDB_NAME = 'badminton_identity'
const IDB_STORE = 'device_id'
const LS_KEY = 'badminton_local_device_id'
const LS_PROFILE_KEY = 'badminton_user_profile'

const COOKIE_MAX_AGE_SECONDS = 400 * 24 * 3600 // 400 วัน

const generateDeviceId = () => {
  return 'USR-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
}

// ---------------- cookie (ช่องที่ iOS เก็บอยู่นานที่สุดเทียบกับ tab-close) ----------------
const getCookieDeviceId = () => {
  try {
    const match = document.cookie.split('; ').find(part => part.startsWith(COOKIE_NAME + '='))
    return match ? decodeURIComponent(match.split('=').slice(1).join('=')) : null
  } catch (err) {
    console.error('[identity] getCookieDeviceId:', err)
    return null
  }
}

const setCookieDeviceId = (id) => {
  try {
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(id)}; path=/; max-age=${COOKIE_MAX_AGE_SECONDS}; SameSite=Lax`
  } catch (err) {
    console.error('[identity] setCookieDeviceId:', err)
  }
}

// ---------------- IndexedDB (รอดจากการ evict ของ localStorage ได้ดีกว่า) ----------------
const openIdb = () => new Promise((resolve, reject) => {
  try {
    const req = indexedDB.open(IDB_NAME, 1)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE)
      }
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  } catch (err) {
    reject(err)
  }
})

const getIdbDeviceId = async () => {
  try {
    const db = await openIdb()
    return await new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readonly')
        const reqStore = tx.objectStore(IDB_STORE).get('value')
        reqStore.onsuccess = () => resolve(reqStore.result || null)
        reqStore.onerror = () => resolve(null)
      } catch (err) {
        resolve(null)
      }
    })
  } catch (err) {
    return null
  }
}

const setIdbDeviceId = async (id) => {
  try {
    const db = await openIdb()
    return await new Promise((resolve) => {
      try {
        const tx = db.transaction(IDB_STORE, 'readwrite')
        tx.objectStore(IDB_STORE).put(id, 'value')
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => resolve(false)
      } catch (err) {
        resolve(false)
      }
    })
  } catch (err) {
    return false
  }
}

// ---------------- localStorage (ช่องเดิม) ----------------
const getLsDeviceId = () => {
  try {
    return localStorage.getItem(LS_KEY)
  } catch (err) {
    return null
  }
}

const setLsDeviceId = (id) => {
  try {
    localStorage.setItem(LS_KEY, id)
  } catch (err) {
    console.error('[identity] setLsDeviceId:', err)
  }
}

// ---------------- migration: สมัยที่เคยเหลือแต่ cache โปรไฟล์ ----------------
const getLegacyProfileDeviceId = () => {
  try {
    const oldProfile = JSON.parse(localStorage.getItem(LS_PROFILE_KEY) || '{}')
    return oldProfile && oldProfile.deviceId ? oldProfile.deviceId : null
  } catch (err) {
    return null
  }
}

// เขียนเก็บทุกช่อง (fire-and-forget ฝั่ง IndexedDB) — ใช้เมื่ออยาก sync ให้ครบ
export const persistDeviceId = (id) => {
  if (!id) return
  setLsDeviceId(id)
  setCookieDeviceId(id)
  setIdbDeviceId(id)
  requestPersistentStorage()
}

// ขอ persistent storage — iOS Safari ให้เกียรติเฉพาะเว็บที่ถูก "Add to Home Screen"
// (ช่วยไม่ให้ Safari evict ข้อมูลตัวตนออกเมื่อปิดแท็บ/พื้นที่เครื่องเต็ม)
const requestPersistentStorage = () => {
  try {
    if (navigator.storage && navigator.storage.persist) {
      navigator.storage.persist()
        .catch(() => {})
    }
  } catch (err) {
    console.error('[identity] requestPersistentStorage:', err)
  }
}

// เช็คสภาพ store ทั้งหมด — เปิด URL ด้วย ?bmit=1 หน้าจอจะโชว์ว่า device_id รอดช่องไหนบ้าง
// (ใช้ตอน debug iPhone Safari ที่ identity เด้ง: ถ้าทุกช่องว่าง = Safari purge ข้อมูลทั้งเว็บ)
export const identityDebugInfo = async () => {
  const idbId = await getIdbDeviceId()
  return [
    'device_id = ' + (getCookieDeviceId() || idbId || getLsDeviceId() || '(none)'),
    'cookie = ' + (getCookieDeviceId() || '(none)'),
    'localStorage = ' + (getLsDeviceId() || '(none)'),
    'IndexedDB = ' + (idbId || '(none)'),
    'origin = ' + window.location.origin
  ].join('\n')
}

// อ่านแบบ async (ลำดับ: cookie -> IndexedDB -> localStorage -> cache เก่า -> สร้างใหม่)
// ใช้ตอน mount (await ได้); เมื่อเจอแล้วจะเขียน sync กลับทุกช่องให้ตรงกัน
export const getOrCreateDeviceIdInfo = async () => {
  const found = getCookieDeviceId() || (await getIdbDeviceId()) || getLsDeviceId() || getLegacyProfileDeviceId()
  const id = found || generateDeviceId()
  persistDeviceId(id)
  return { id, isNew: !found }
}

export const getOrCreateDeviceId = async () => {
  return (await getOrCreateDeviceIdInfo()).id
}

// อ่านแบบ sync สำหรับ path ที่ await ไม่ได้ (เช่นฟอลแบ็กตอน saveName) — cookie/localStorage ก่อน
export const getDeviceIdSync = () => {
  return getCookieDeviceId() || getLsDeviceId() || getLegacyProfileDeviceId() || null
}