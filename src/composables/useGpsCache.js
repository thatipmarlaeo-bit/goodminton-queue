// src/composables/useGpsCache.js
// แคชตำแหน่งล่าสุดไว้ localStorage เพื่อว่า reload/กลับมาแท็บใหม่จะไม่ต้อง
// เรียก navigator.geolocation ซ้ำจนเด้งถาม permission ทุกครั้ง
// (ใช้ร่วมกันทั้ง PlayerView และ AdminView → key เดียวกัน)
const GPS_CACHE_KEY = 'badminton_last_gps'
export const GPS_CACHE_TTL_MS = 10 * 60 * 1000

export function readGpsCache() {
  try {
    const raw = localStorage.getItem(GPS_CACHE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed.lat !== 'number' || typeof parsed.lng !== 'number') return null
    return parsed
  } catch (err) {
    console.warn('[useGpsCache] อ่านแคชล้มเหลว:', err)
    return null
  }
}

export function writeGpsCache(lat, lng) {
  try {
    localStorage.setItem(GPS_CACHE_KEY, JSON.stringify({ lat, lng, ts: Date.now() }))
  } catch (err) {
    console.warn('[useGpsCache] เขียนแคชล้มเหลว:', err)
  }
}

export function isGpsCacheFresh(cache, now = Date.now()) {
  return !!cache && now - (cache.ts || 0) <= GPS_CACHE_TTL_MS
}