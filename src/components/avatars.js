// constants/avatars.js
export const AVATAR_PRESETS = [
  {
    id: 'shuttle-speed',
    name: 'ลูกขนไก่พุ่ง',
    // ลูกขนไก่พร้อมสปีดไลน์
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-emerald-400">
      <path d="M8 17a3 3 0 0 0 6 0v-1H8v1z"/>
      <path d="M4 4l4 12h8l4-12"/>
      <path d="M5.5 9h13"/>
      <path d="M7 13h10"/>
      <line x1="2" y1="2" x2="6" y2="2"/>
      <line x1="1" y1="6" x2="4" y2="6"/>
    </svg>`
  },
  {
    id: 'racket-pro',
    name: 'ไม้แบดมินตัน',
    // ไม้แบดทรงโมเดิร์น
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-amber-400">
      <circle cx="15" cy="9" r="6"/>
      <path d="M10.5 13.5L4 20l-1-1 6.5-6.5"/>
      <path d="M12 9h6"/>
      <path d="M15 6v6"/>
    </svg>`
  },
  {
    id: 'champion-cup',
    name: 'ถ้วยรางวัล',
    // ถ้วยแชมป์
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-yellow-400">
      <path d="M6 9H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h2"/>
      <path d="M18 9h2a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2h-2"/>
      <path d="M4 3h16v6a6 6 0 0 1-12 0V3z"/>
      <path d="M12 15v4"/>
      <path d="M8 21h8"/>
    </svg>`
  },
  {
    id: 'smash-fire',
    name: 'ไฟตบหนัก',
    // สัญลักษณ์พลัง/สปีด
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-rose-400">
      <path d="M12 2c0 4-4 6-4 10a6 6 0 0 0 12 0c0-4-3-7-4-8-1 2-2 3-4 3 0-2 1-4 0-5z"/>
    </svg>`
  },
  {
    id: 'court-tactics',
    name: 'แผนการเล่น',
    // ตาข่าย/สนามคอร์ด
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-blue-400">
      <rect x="3" y="4" width="18" height="16" rx="2"/>
      <line x1="3" y1="12" x2="21" y2="12"/>
      <line x1="12" y1="4" x2="12" y2="20"/>
    </svg>`
  },
  {
    id: 'player-spirit',
    name: 'นักกีฬา',
    // ไอคอนผู้เล่นพร้อมสายคาด
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-purple-400">
      <circle cx="12" cy="7" r="4"/>
      <path d="M5.5 21a6.5 6.5 0 0 1 13 0"/>
      <path d="M9 5.5h6"/>
    </svg>`
  },
  {
    id: 'boy-cap',
    name: 'หนุ่มหมวกแก๊ป',
    // เด็กหนุ่มใส่หมวกแก๊ปหันข้าง ยิ้มน่ารัก
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-emerald-400">
      <path d="M5 14a7 7 0 0 0 14 0c0-4-3-7-7-7s-7 3-7 7z"/>
      <path d="M5 11h14l2-1H3l2 1z"/>
      <circle cx="9" cy="14" r="1" fill="currentColor"/>
      <circle cx="15" cy="14" r="1" fill="currentColor"/>
      <path d="M10.5 17c.5.5 2.5.5 3 0"/>
      <path d="M12 7V5"/>
    </svg>`
  },
  {
    id: 'girl-ponytail',
    name: 'สาวมัดผมแกละ',
    // เด็กสาวมัดผมหางม้าพร้อมกิ๊บ
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-rose-400">
      <circle cx="12" cy="13" r="6"/>
      <path d="M6 13c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
      <path d="M17 7c2-1 3-3 3-5-2 0-4 1-5 3"/>
      <circle cx="9.5" cy="13" r="1" fill="currentColor"/>
      <circle cx="14.5" cy="13" r="1" fill="currentColor"/>
      <path d="M11 16a2 2 0 0 0 2 0"/>
      <path d="M8 10c1-1 3-1 4 0"/>
    </svg>`
  },
  {
    id: 'headband-sport',
    name: 'นักแบดสายลุย',
    // หนุ่มคาดผ้าคาดผมสปอร์ต ดูมุ่งมั่น
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-amber-400">
      <circle cx="12" cy="13" r="7"/>
      <!-- ผ้าคาดหัว -->
      <path d="M5 11h14" stroke-width="2.5"/>
      <path d="M19 11l2 2m-2-2l2-1"/>
      <circle cx="9.5" cy="14.5" r="1" fill="currentColor"/>
      <circle cx="14.5" cy="14.5" r="1" fill="currentColor"/>
      <path d="M11 17.5c.5.5 1.5.5 2 0"/>
      <!-- ผมชี้ปุ๊กปิ๊ก -->
      <path d="M9 6l1-3 2 3 2-3 1 3"/>
    </svg>`
  },
  {
    id: 'cute-glasses',
    name: 'สายเนิร์ดนักวางแผน',
    // ใส่แว่นตากลมโต แก้มป่อง
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-blue-400">
      <circle cx="12" cy="13" r="7"/>
      <!-- แว่นตากลมคู่ -->
      <circle cx="9" cy="13" r="2.2"/>
      <circle cx="15" cy="13" r="2.2"/>
      <path d="M11.2 13h1.6"/>
      <path d="M11 17c.5.5 1.5.5 2 0"/>
      <!-- ผมหน้าม้าเต่อ -->
      <path d="M5 11c2-3 5-3 7-2 2-1 5-1 7 2"/>
    </svg>`
  },
  {
    id: 'chill-afro',
    name: 'จอมเสิร์ฟผมฟู',
    // หนุ่มผมหยิกฟู อารมณ์ดี ยิ้มกว้าง
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-purple-400">
      <!-- ทรงผมหยิกฟูรอบหัว -->
      <path d="M6 13a4 4 0 0 1-1-4 4 4 0 0 1 4-4 4 4 0 0 1 6 0 4 4 0 0 1 4 4 4 4 0 0 1-1 4"/>
      <circle cx="12" cy="14" r="5.5"/>
      <circle cx="10" cy="14" r="1" fill="currentColor"/>
      <circle cx="14" cy="14" r="1" fill="currentColor"/>
      <!-- ยิ้มกว้างเห็นฟัน -->
      <path d="M10 16.5c.5 1 3.5 1 4 0z" fill="currentColor" fill-opacity="0.2"/>
    </svg>`
  },
  {
    id: 'champion-wink',
    name: 'มือตบขยิบตา',
    // สวมหมวกไวเซอร์ (Visor) ขยิบตา 1 ข้าง
    svg: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-full h-full text-cyan-400">
      <circle cx="12" cy="13" r="6.5"/>
      <!-- ปีกหมวกไวเซอร์ -->
      <path d="M4 10c4-2 12-2 16 0"/>
      <path d="M6 10h12"/>
      <!-- ตาซ้ายยิ้มขยิบตา ตาขวากลม -->
      <path d="M8.5 14c.5-.8 1.5-.8 2 0"/>
      <circle cx="14.5" cy="13.5" r="1" fill="currentColor"/>
      <!-- ยิ้มมุมปาก -->
      <path d="M11 16.5c1 .5 2 0 2.5-.5"/>
    </svg>`
  }
]

export const getAvatarSvg = (avatarId) => {
  const match = AVATAR_PRESETS.find(a => a.id === avatarId)
  return match ? match.svg : AVATAR_PRESETS[0].svg
}