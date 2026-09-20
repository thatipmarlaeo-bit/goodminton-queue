<template>
  <div v-if="!isAdminAuthenticated" class="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
    <div class="w-full max-w-xs bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-4">
      <div class="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 mx-auto flex items-center justify-center text-xl">
        <svg class="w-6 h-6 stroke-current text-amber-400" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      </div>
      <div>
        <h2 class="font-bold text-base text-white">พื้นที่สำหรับผู้ดูแลระบบ</h2>
        <p class="text-xs text-slate-400 mt-1">กรุณาระบุรหัส PIN เพื่อเข้าสู่ระบบจัดการ</p>
      </div>

      <form @submit.prevent="handleVerifyPin" class="space-y-3">
        <input 
          v-model="inputPin" 
          type="password" 
          placeholder="ใส่รหัสผ่านแอดมิน" 
          class="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 rounded-xl px-3 py-2.5 text-center text-sm tracking-widest outline-none text-white placeholder:text-slate-600 font-mono"
          autofocus
        />

        <p v-if="pinError" class="text-rose-400 text-[11px] font-medium">{{ pinError }}</p>

        <button 
          type="submit" 
          class="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white transition shadow-lg shadow-emerald-900/30">
          เข้าสู่ระบบ
        </button>
      </form>
    </div>
  </div>

  <div v-else class="min-h-screen bg-slate-950 text-slate-100">

    <!-- Modal สรุปรายงานประจำวัน -->
    <div v-if="showSummaryModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div class="bg-slate-900 border border-slate-800 w-full max-w-3xl rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
        <div id="printable-summary-report" class="space-y-6 bg-slate-900 p-2 rounded-2xl"> 
          <div class="flex justify-between items-start border-b border-slate-800 pb-4">
            <div>
              <h3 class="text-xl font-black text-white flex items-center gap-2">
                <span class="text-emerald-400">
                  <svg class="w-5 h-5 stroke-current inline-block" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>
                  </svg>
                </span> สรุปรายงานผู้เข้าใช้บริการประจำวัน
              </h3>
              <p class="text-xs text-slate-400 mt-1">ประจำวันที่ {{ currentReportDate }}</p>
            </div>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div class="bg-slate-950 border border-slate-800 py-4 rounded-2xl text-center space-y-1">
              <span class="text-xs text-slate-400 font-bold block">ผู้ใช้บริการทั้งหมด</span>
              <span class="text-2xl font-black text-white">{{ dailyStats.totalUsers }}</span>
              <span class="text-[10px] text-slate-500 block">คน</span>
            </div>
            <div class="bg-blue-950/40 border border-blue-800/40 p-4 rounded-2xl text-center space-y-1">
              <span class="text-sm text-blue-300 font-bold block">นิสิต</span> 
              <span class="text-2xl font-black text-blue-400">{{ dailyStats.byRole['นิสิต'] || 0 }}</span>
              <span class="text-[10px] text-blue-400/60 block">คน</span>
            </div>
            <div class="bg-purple-950/40 border border-purple-800/40 p-4 rounded-2xl text-center space-y-1">
              <span class="text-sm text-purple-300 font-bold block">บุคลากร</span>
              <span class="text-2xl font-black text-purple-400">{{ dailyStats.byRole['บุคลากร'] || 0 }}</span>
              <span class="text-[10px] text-purple-400/60 block">คน</span>
            </div>
            <div class="bg-amber-950/40 border border-amber-800/40 p-4 rounded-2xl text-center space-y-1">
              <span class="text-xs text-amber-300 font-bold block">นักเรียน</span>
              <span class="text-2xl font-black text-amber-400">{{ dailyStats.byRole['นักเรียน'] || 0 }}</span>
              <span class="text-[10px] text-amber-400/60 block">คน</span>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">จำแนกตามคณะ / หน่วยงานสังกัด</h4>
            <div class="overflow-x-auto border border-slate-800 rounded-2xl px-4">
              <div v-if="Object.keys(dailyStats.byFaculty).length === 0" class="text-center text-xs text-slate-500 py-3">
                ไม่มีข้อมูลผู้ใช้งานในวันนี้
              </div>
              <div v-for="(count, fac) in dailyStats.byFaculty" :key="fac" class="flex justify-between items-center py-2 text-xs">
                <span class="text-slate-300">{{ fac }}</span>
                <span class="font-bold font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-2 py-0.5 rounded-lg">{{ count }} คน</span>
              </div>
            </div>
          </div>

          <div class="space-y-3">
            <h4 class="text-xs font-bold text-slate-300 uppercase tracking-wider">รายละเอียดผู้เข้าใช้งานทั้งหมด ({{ dailyCheckinRecords.length }} คน)</h4>
            <div class="overflow-x-auto border border-slate-800 rounded-2xl">
              <table class="w-full text-left text-xs border-collapse">
                <thead>
                  <tr class="border-b border-slate-800 text-slate-400 bg-slate-950">
                    <th class="p-2.5">ชื่อจริง-นามสกุล</th>
                    <th class="p-2.5">ชื่อเล่น</th>
                    <th class="p-2.5">ประเภท</th>
                    <th class="p-2.5">สังกัด</th>
                    <th class="p-2.5 text-center">เวลาเข้า</th>
                    <th class="p-2.5 text-center">เวลาออก</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-800/60 bg-slate-950/40">
                  <tr v-if="dailyCheckinRecords.length === 0">
                    <td colspan="6" class="p-4 text-center text-slate-500">ไม่มีประวัติการ Check-in</td>
                  </tr>
                  <tr v-for="rec in dailyCheckinRecords" :key="rec.deviceId" class="hover:bg-slate-800/20">
                    <td class="p-2.5 font-medium text-white">{{ rec.realName || '-' }}</td>
                    <td class="p-2.5 text-emerald-400 font-bold">{{ rec.nickname || '-' }}</td>
                    <td class="p-2.5">{{ rec.role || '-' }}</td>
                    <td class="p-2.5 text-slate-300">{{ rec.faculty || '-' }}</td>
                    <td class="p-2.5 text-center font-mono text-slate-400">{{ rec.checkInAt || '-' }}</td>
                    <td class="p-2.5 text-center font-mono text-slate-400">{{ rec.checkOutAt || 'ยังไม่ออก' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div> 
        </div>
        
        <div class="flex justify-end pt-2 gap-3">
          <button @click="exportReportToPdf" 
            :disabled="isExportingPdf || dailyCheckinRecords.length === 0"
            class="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold px-5 py-2.5 rounded-2xl text-xs transition shadow-lg flex items-center gap-2">
            <span>{{ isExportingPdf ? 'กำลังสร้างไฟล์ PDF...' : 'ดาวน์โหลดรายงาน (PDF)' }}</span>
          </button>
          <button @click="showSummaryModal = false" class="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-2xl text-xs transition shadow">
            ปิดหน้าต่างสรุปยอด
          </button>
        </div>
      </div>
    </div>

    <div class="max-w-6xl mx-auto space-y-6 pb-12 p-3 md:p-6 font-sans text-slate-100 relative">
      <!-- Modal ป๊อปอัปเพิ่มคิวกลุ่มใหม่ -->
      <div v-if="showAddModal" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
        <div class="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl p-6 md:p-8 space-y-6 shadow-2xl">
          <div class="space-y-1">
            <h3 class="text-lg font-black text-white">เพิ่มคิวกลุ่มใหม่ </h3>
            <p class="text-xs text-slate-400">พิมพ์ชื่อเพื่อค้นหาผู้เล่นที่ว่าง แล้วเลือกเข้าช่อง คนที่ 1-4 (อย่างน้อย 1 คน) </p>
          </div>

          <div class="space-y-3">
            <div v-for="slot in [1, 2, 3, 4]" :key="slot" class="flex items-start gap-3">
              <label class="text-xs font-bold text-slate-400 w-16 mt-3">คนที่ {{ slot }}:</label>
              <div class="relative flex-1">
                <!-- เลือกผู้เล่นแล้ว -> แสดงเป็น chip แก้ไขได้ -->
                <div v-if="newGroup['d' + slot]"
                     class="flex items-center justify-between bg-slate-950 border border-emerald-700/60 rounded-xl px-3 py-3 text-xs text-white">
                  <span class="font-bold truncate min-w-0">
                    {{ newGroup['p' + slot] }}
                    <span class="font-normal text-slate-500">· เลือกแล้ว</span>
                  </span>
                  <button type="button" @click="clearGroupSlot(slot)" class="ml-2 shrink-0 text-rose-400 hover:text-rose-300 font-bold">✕</button>
                </div>
                <!-- ยังไม่เลือก -> ช่องค้นหาชื่อ -->
                <input v-else
                       v-model.trim="newGroup['p' + slot]"
                       :placeholder="slot === 1 ? 'พิมพ์ชื่อค้นหาผู้เล่นคนที่ 1 (จำเป็น)' : 'พิมพ์ชื่อค้นหาผู้เล่นคนที่ ' + slot + ' (ถ้ามี)'"
                       class="flex-1 w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
                       @focus="groupActiveSlot = slot"
                       @input="onGroupSlotInput(slot)"
                       @blur="onGroupSlotBlur(slot)"
                >
                <!-- dropdown แนะนำผู้เล่นที่ว่าง -->
                <div v-if="groupActiveSlot === slot && groupSlotSuggestions(slot).length"
                     class="absolute z-20 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl max-h-44 overflow-y-auto shadow-2xl">
                  <button v-for="p in groupSlotSuggestions(slot)" :key="p.device_id" type="button"
                          class="w-full text-left px-3 py-2.5 hover:bg-slate-800 active:bg-slate-800 flex items-center justify-between gap-2"
                          @mousedown.prevent="selectGroupSlotPlayer(slot, p)"
                  >
                    <span class="text-xs text-white font-bold truncate">{{ p.nickname }}</span>
                    <span class="text-[10px] text-slate-400 truncate">{{ p.role }} · {{ p.faculty || '-' }}</span>
                  </button>
                </div>
                <!-- พิมพ์แล้วแต่ไม่เจอ -->
                <div v-else-if="groupActiveSlot === slot && !isGroupLoadingPlayers && (newGroup['p' + slot] || '').trim()"
                     class="absolute z-20 left-0 right-0 top-full mt-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-[11px] text-slate-400 shadow-2xl">
                  ไม่พบผู้เล่นที่ว่างตรงกับคำค้นหา
                </div>
              </div>
            </div>
            <p v-if="isGroupLoadingPlayers" class="text-[11px] text-slate-500">กำลังโหลดรายชื่อผู้เล่นออนไซต์...</p>
          </div>

          <div class="flex gap-3 pt-2">
            <button @click="showAddModal = false" class="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold py-3.5 rounded-2xl text-xs transition shadow">
              ยกเลิก
            </button>
            <button @click="adminCreateGroupQueue" :disabled="!newGroup.p1 || areAllCourtsClosed" class="flex-1 bg-emerald-700 hover:bg-emerald-600 active:scale-95 disabled:opacity-40 text-white font-bold py-3.5 rounded-2xl text-xs transition shadow-lg">
              สร้างกลุ่มคิวทันที
            </button>
          </div>
        </div>
      </div>

      <header class="bg-slate-900 border border-slate-800 pb-3 px-4 mt-2 rounded-2xl flex justify-between items-center sticky top-0 z-50 shadow-xl">
        <div>
          <svg style="width:180px; height:auto;" viewBox="0 0 87 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="grad-green-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#1DBF85"/>
                <stop offset="60%" stop-color="#2AC794"/>
                <stop offset="100%" stop-color="#46EBB3"/>
              </linearGradient>
              <linearGradient id="grad-gold-main" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#D99B16"/>
                <stop offset="45%" stop-color="#F1B728"/>
                <stop offset="100%" stop-color="#FFDE6A"/>
              </linearGradient>
              <linearGradient id="grad-text" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#3ADAA5"/>
                <stop offset="100%" stop-color="#1EA87A"/>
              </linearGradient>
              <linearGradient id="grad-sheen" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#FFFFFF" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0"/>
              </linearGradient>
              <filter id="glow-gold" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.2" flood-color="#F1B728" flood-opacity="0.45"/>
              </filter>
              <filter id="glow-green" x="-20%" y="-20%" width="140%" height="140%">
                <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#2AC794" flood-opacity="0.35"/>
              </filter>
            </defs>

            <g id="primary-symbol" filter="url(#glow-green)">
              <path d="M20.736 27.3791C21.3027 27.9832 21.2722 28.9324 20.6681 29.4992C20.064 30.0659 19.1148 30.0354 18.548 29.4314L9.98584 20.3076L11.4643 17.4999L20.736 27.3791Z" fill="url(#grad-gold-main)" filter="url(#glow-gold)"/>
              <path d="M10.92 28.364C9.464 28.364 8.11067 28.1027 6.86 27.58C5.628 27.0573 4.54533 26.3293 3.612 25.396C2.69733 24.4627 1.97867 23.3893 1.456 22.176C0.952 20.944 0.7 19.628 0.7 18.228C0.7 16.828 0.952 15.512 1.456 14.28C1.97867 13.048 2.69733 11.9653 3.612 11.032C4.54533 10.0987 5.628 9.37067 6.86 8.848C8.11067 8.30667 9.464 8.036 10.92 8.036C12.5813 8.036 13.9907 8.30667 15.148 8.848C16.324 9.37067 17.3133 10.1267 18.116 11.116L15.316 13.524C14.7933 12.9453 14.1587 12.4973 13.412 12.18C12.6653 11.844 11.8347 11.676 10.92 11.676C9.66933 11.676 8.57733 11.9747 7.644 12.572C6.72933 13.1693 6.02 13.9627 5.516 14.952C5.012 15.9413 4.76 17.0333 4.76 18.228C4.76 19.4227 5.012 20.5147 5.516 21.504C6.02 22.4933 6.72933 23.2867 7.644 23.884C8.57733 24.4813 9.66933 24.78 10.92 24.78C12.4693 24.78 13.72 24.416 14.672 23.688C15.624 22.9413 16.212 21.8027 16.436 20.272L9.996 20.328V16.8H20.216C20.2533 17.0987 20.2813 17.4627 20.3 17.892C20.3373 18.3027 20.356 18.6667 20.356 18.984C20.356 20.7947 19.9733 22.4093 19.208 23.828C18.4613 25.228 17.3787 26.3387 15.96 27.16C14.56 27.9627 12.88 28.364 10.92 28.364Z" fill="url(#grad-green-main)"/>
              <path d="M3.612 11.032C4.54533 10.0987 5.628 9.37067 6.86 8.848C8.11067 8.30667 9.464 8.036 10.92 8.036C12.5813 8.036 13.9907 8.30667 15.148 8.848" stroke="url(#grad-sheen)" stroke-width="0.8" stroke-linecap="round"/>
            </g>

            <g id="face-elements">
              <path d="M26 20C26 20 26.1362 21.2583 26.5 22.1538C27 23.3846 28.0474 24.5 30 24.5C32 24.5 32.8333 23.3846 33.5 22.1538C33.9744 21.2781 34 20 34 20" stroke="url(#grad-green-main)" stroke-width="2" stroke-linecap="square"/>
              <path d="M26 20C26 20 26.1362 22.0448 26.5 23.5C27 25.5 28.0474 26.5 30 26.5C32 26.5 32.8333 25.5 33.5 23.5C33.9744 22.077 34 20 34 20" stroke="url(#grad-gold-main)" stroke-width="2" stroke-linecap="square"/>
              <path d="M23 9C24.4602 9 26 10.5711 26 13C26 15.4289 24.4602 17 23 17C21.5398 17 20 15.4289 20 13C20 10.5711 21.5398 9 23 9Z" stroke="url(#grad-gold-main)" stroke-width="2"/>
              <ellipse cx="22" cy="13.5" rx="1" ry="1.5" fill="url(#grad-green-main)"/>
              <path d="M32 9C33.4602 9 35 10.5711 35 13C35 15.4289 33.4602 17 32 17C30.5398 17 29 15.4289 29 13C29 10.5711 30.5398 9 32 9Z" stroke="url(#grad-gold-main)" stroke-width="2"/>
              <path d="M31 12.5C31.057 12.5 31.1696 12.5347 31.291 12.7168C31.41 12.8954 31.5 13.1708 31.5 13.5C31.5 13.8292 31.41 14.1046 31.291 14.2832C31.1696 14.4653 31.057 14.5 31 14.5C30.943 14.5 30.8304 14.4653 30.709 14.2832C30.59 14.1046 30.5 13.8292 30.5 13.5C30.5 13.1708 30.59 12.8954 30.709 12.7168C30.8304 12.5347 30.943 12.5 31 12.5Z" fill="#2AC794" stroke="#2AC794"/>
            </g>

            <g id="typography" fill="url(#grad-text)">
              <path d="M39.601 17.169C38.9857 17.169 38.4223 17.013 37.911 16.701C37.4083 16.3803 37.0053 15.9557 36.702 15.427C36.4073 14.8897 36.26 14.296 36.26 13.646C36.26 13.1607 36.3467 12.7057 36.52 12.281C36.6933 11.8477 36.9317 11.4707 37.235 11.15C37.5383 10.8207 37.8893 10.565 38.288 10.383C38.6953 10.1923 39.133 10.097 39.601 10.097C40.1817 10.097 40.6367 10.2053 40.966 10.422C41.2953 10.6387 41.551 10.9247 41.733 11.28V7.51H43.488V17H41.785V15.895C41.603 16.2763 41.343 16.584 41.005 16.818C40.6757 17.052 40.2077 17.169 39.601 17.169ZM39.887 15.583C40.277 15.583 40.6107 15.4963 40.888 15.323C41.174 15.141 41.395 14.9027 41.551 14.608C41.707 14.3133 41.785 13.9927 41.785 13.646C41.785 13.2907 41.707 12.9657 41.551 12.671C41.395 12.3763 41.174 12.138 40.888 11.956C40.6107 11.774 40.277 11.683 39.887 11.683C39.5143 11.683 39.185 11.774 38.899 11.956C38.6217 12.1293 38.405 12.3633 38.249 12.658C38.093 12.9527 38.015 13.2777 38.015 13.633C38.015 13.971 38.093 14.2917 38.249 14.595C38.405 14.8897 38.6217 15.128 38.899 15.31C39.185 15.492 39.5143 15.583 39.887 15.583ZM44.5307 17V10.24H46.2597V11.228C46.6151 10.4653 47.3041 10.084 48.3267 10.084C48.8034 10.084 49.2324 10.1967 49.6137 10.422C49.9951 10.6387 50.2984 10.9507 50.5237 11.358C50.7491 10.9507 51.0351 10.6387 51.3817 10.422C51.7371 10.1967 52.2137 10.084 52.8117 10.084C53.2971 10.084 53.7347 10.1967 54.1247 10.422C54.5147 10.6473 54.8224 10.968 55.0477 11.384C55.2731 11.8 55.3857 12.294 55.3857 12.866V17H53.6307V13.295C53.6307 12.7057 53.5051 12.281 53.2537 12.021C53.0024 11.7523 52.6774 11.618 52.2787 11.618C51.8714 11.618 51.5377 11.735 51.2777 11.969C51.0264 12.203 50.9007 12.645 50.9007 13.295V17H49.1457V13.295C49.1457 12.7057 49.0114 12.281 48.7427 12.021C48.4741 11.7523 48.1231 11.618 47.6897 11.618C47.3171 11.618 46.9877 11.7523 46.7017 12.021C46.4244 12.281 46.2857 12.7057 46.2857 13.295V17H44.5307ZM57.2338 9.681C56.9391 9.681 56.6878 9.58133 56.4798 9.382C56.2804 9.174 56.1808 8.927 56.1808 8.641C56.1808 8.36367 56.2804 8.12533 56.4798 7.926C56.6878 7.718 56.9391 7.614 57.2338 7.614C57.5371 7.614 57.7884 7.718 57.9878 7.926C58.1871 8.12533 58.2868 8.36367 58.2868 8.641C58.2868 8.93567 58.1871 9.18267 57.9878 9.382C57.7884 9.58133 57.5371 9.681 57.2338 9.681ZM56.3628 17V10.24H58.1178V17H56.3628ZM59.1557 17V10.24H60.8847V11.228C61.2401 10.4653 61.9291 10.084 62.9517 10.084C63.4371 10.084 63.8747 10.1967 64.2647 10.422C64.6547 10.6473 64.9624 10.968 65.1877 11.384C65.4131 11.8 65.5257 12.294 65.5257 12.866V17H63.7707V13.295C63.7707 12.7057 63.6364 12.281 63.3677 12.021C63.0991 11.7523 62.7481 11.618 62.3147 11.618C61.9421 11.618 61.6127 11.7523 61.3267 12.021C61.0494 12.281 60.9107 12.7057 60.9107 13.295V17H59.1557ZM68.9531 17C68.2857 17 67.7744 16.8353 67.4191 16.506C67.0637 16.1767 66.8861 15.6437 66.8861 14.907V11.735H65.9371V10.24H66.8861V8.875L68.6411 8.693V10.24H70.0711V11.735H68.6411V14.816C68.6411 15.232 68.8231 15.44 69.1871 15.44H69.9151V17H68.9531ZM73.821 17.169C73.1276 17.169 72.508 17.0087 71.962 16.688C71.416 16.3673 70.987 15.9427 70.675 15.414C70.3716 14.8767 70.22 14.283 70.22 13.633C70.22 12.983 70.3716 12.3893 70.675 11.852C70.987 11.3147 71.416 10.8857 71.962 10.565C72.508 10.2443 73.1276 10.084 73.821 10.084C74.523 10.084 75.1426 10.2443 75.68 10.565C76.226 10.8857 76.6506 11.3147 76.954 11.852C77.266 12.3893 77.422 12.983 77.422 13.633C77.422 14.283 77.266 14.8767 76.954 15.414C76.6506 15.9427 76.226 16.3673 75.68 16.688C75.1426 17.0087 74.523 17.169 73.821 17.169ZM73.821 15.57C74.1936 15.57 74.5186 15.4833 74.796 15.31C75.0733 15.128 75.2856 14.8897 75.433 14.595C75.589 14.3003 75.667 13.9797 75.667 13.633C75.667 13.2777 75.589 12.9527 75.433 12.658C75.2856 12.3633 75.0733 12.1293 74.796 11.956C74.5186 11.774 74.1936 11.683 73.821 11.683C73.4483 11.683 73.1233 11.774 72.846 11.956C72.5686 12.1293 72.352 12.3633 72.196 12.658C72.0486 12.9527 71.975 13.2777 71.975 13.633C71.975 13.9797 72.0486 14.3003 72.196 14.595C72.352 14.8897 72.5686 15.128 72.846 15.31C73.1233 15.4833 73.4483 15.57 73.821 15.57ZM78.1987 17V10.24H79.9277V11.228C80.283 10.4653 80.972 10.084 81.9947 10.084C82.48 10.084 82.9177 10.1967 83.3077 10.422C83.6977 10.6473 84.0054 10.968 84.2307 11.384C84.456 11.8 84.5687 12.294 84.5687 12.866V17H82.8137V13.295C82.8137 12.7057 82.6794 12.281 82.4107 12.021C82.142 11.7523 81.791 11.618 81.3577 11.618C80.985 11.618 80.6557 11.7523 80.3697 12.021C80.0924 12.281 79.9537 12.7057 79.9537 13.295V17H78.1987Z"/>
              <path d="M39.757 27.169C39.0637 27.169 38.4527 27.0087 37.924 26.688C37.3953 26.3673 36.9837 25.9427 36.689 25.414C36.403 24.8767 36.26 24.283 36.26 23.633C36.26 22.983 36.4117 22.3893 36.715 21.852C37.0183 21.306 37.43 20.8727 37.95 20.552C38.4787 20.2313 39.081 20.071 39.757 20.071C40.433 20.071 41.0267 20.2313 41.538 20.552C42.058 20.8727 42.461 21.306 42.747 21.852C43.0417 22.3893 43.189 22.983 43.189 23.633C43.189 23.7283 43.1847 23.828 43.176 23.932C43.1673 24.036 43.1543 24.1443 43.137 24.257H38.08C38.1753 24.6557 38.366 24.9807 38.652 25.232C38.9467 25.4833 39.315 25.609 39.757 25.609C40.1383 25.609 40.4677 25.5223 40.745 25.349C41.031 25.1757 41.252 24.959 41.408 24.699L42.773 25.726C42.5043 26.1507 42.1013 26.4973 41.564 26.766C41.0267 27.0347 40.4243 27.169 39.757 27.169ZM39.731 21.579C39.315 21.579 38.9597 21.7047 38.665 21.956C38.3703 22.2073 38.1753 22.5367 38.08 22.944H41.421C41.3257 22.5713 41.1263 22.2507 40.823 21.982C40.5283 21.7133 40.1643 21.579 39.731 21.579ZM46.4685 27.156C45.9831 27.156 45.5455 27.0433 45.1555 26.818C44.7655 26.5927 44.4578 26.272 44.2325 25.856C44.0071 25.4313 43.8945 24.9373 43.8945 24.374V20.24H45.6495V23.945C45.6495 24.5257 45.7665 24.9503 46.0005 25.219C46.2345 25.4877 46.5681 25.622 47.0015 25.622C47.3741 25.622 47.6991 25.4877 47.9765 25.219C48.2625 24.9503 48.4055 24.5257 48.4055 23.945V20.24H50.1605V27H48.4575V25.986C48.2928 26.376 48.0501 26.6707 47.7295 26.87C47.4175 27.0607 46.9971 27.156 46.4685 27.156ZM54.4328 27.169C53.7394 27.169 53.1284 27.0087 52.5998 26.688C52.0711 26.3673 51.6594 25.9427 51.3648 25.414C51.0788 24.8767 50.9358 24.283 50.9358 23.633C50.9358 22.983 51.0874 22.3893 51.3908 21.852C51.6941 21.306 52.1058 20.8727 52.6258 20.552C53.1544 20.2313 53.7568 20.071 54.4328 20.071C55.1088 20.071 55.7024 20.2313 56.2138 20.552C56.7338 20.8727 57.1368 21.306 57.4228 21.852C57.7174 22.3893 57.8648 22.983 57.8648 23.633C57.8648 23.7283 57.8604 23.828 57.8518 23.932C57.8431 24.036 57.8301 24.1443 57.8128 24.257H52.7558C52.8511 24.6557 53.0418 24.9807 53.3278 25.232C53.6224 25.4833 53.9908 25.609 54.4328 25.609C54.8141 25.609 55.1434 25.5223 55.4208 25.349C55.7068 25.1757 55.9278 24.959 56.0838 24.699L57.4488 25.726C57.1801 26.1507 56.7771 26.4973 56.2398 26.766C55.7024 27.0347 55.1001 27.169 54.4328 27.169ZM54.4068 21.579C53.9908 21.579 53.6354 21.7047 53.3408 21.956C53.0461 22.2073 52.8511 22.5367 52.7558 22.944H56.0968C56.0014 22.5713 55.8021 22.2507 55.4988 21.982C55.2041 21.7133 54.8401 21.579 54.4068 21.579Z"/>
            </g>
          </svg>
          <div class="flex items-center gap-3">
            <span class="text-xs text-slate-400 ml-1">แผงควบคุมระบบแอดมิน</span>
            <button @click="handleAdminLogout" title="ออกจากระบบ" class="text-rose-400 hover:text-rose-300 transition flex items-center">
              <svg class="w-auto h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button @click="toggleGpsFilter"
            :title="gpsFilterEnabled ? 'เปิดกรองพิกัด' : 'ปิดกรองพิกัด'"
            class="px-3 py-2 rounded-xl transition shadow-md flex items-center justify-center border"
            :class="gpsFilterEnabled
              ? 'bg-slate-800 hover:bg-slate-700 text-amber-400 border-slate-700'
              : 'bg-emerald-600 text-white hover:bg-emerald-500 border-emerald-500'">
            <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 21s-7-4.35-7-11a7 7 0 0 1 14 0c0 6.65-7 11-7 11z"></path>
              <circle cx="12" cy="10" r="2.5"></circle>
            </svg>
          </button>
          <button @click="openSummaryReport" title="สรุปยอด" class="bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-xl transition text-emerald-400 border border-slate-700 flex items-center justify-center shadow">
            <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>
            </svg>
          </button>
        </div>
      </header>   

      <!-- แผงควบคุม 4 คอร์ด -->
      <section>
        <div class="flex items-center justify-between mb-2 px-1">
          <h2 class="ml-1 text-base font-bold text-slate-400 uppercase tracking-wider leading-none">จัดการคอร์ต</h2>
          <button @click="toggleAllCourts" 
            class="text-xs font-bold px-3.5 py-2 rounded-xl transition shadow-md flex items-center gap-1.5" 
            :class="areAllCourtsClosed ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30'">
            <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
              <line x1="12" y1="2" x2="12" y2="12"></line>
            </svg>
            <span>{{ areAllCourtsClosed ? 'เปิดสนาม' : 'ปิดสนาม' }}</span>
          </button>
        </div>

        <div class="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="c in courts" :key="c.courtNumber" 
            class="bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between shadow-lg transition relative"
            :class="{
              'is-calling-card': c.status === 'CALLING',
              'border-rose-900/60 opacity-80': c.status === 'CLOSED',
              'border-slate-800': c.status !== 'CLOSED' && c.status !== 'CALLING'
            }">
            
            <div class="flex justify-between items-center mb-2">
              <span class="font-black text-base text-white">คอร์ต {{ c.courtNumber }}</span>
              <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase"
                    :class="c.status === 'AVAILABLE' ? 'bg-slate-800 text-slate-400' : 
                            c.status === 'CALLING' ? 'bg-amber-500 text-slate-950' : 
                            c.status === 'CLOSED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'animate-pulse bg-emerald-500 text-slate-950'">
                {{ c.status === 'AVAILABLE' ? 'ว่าง' : c.status === 'CALLING' ? 'เรียกคิว' : c.status === 'CLOSED' ? 'คอร์ตปิด' : 'กำลังเล่น' }}
                <span v-if="c.status === 'CALLING'" class="tabular-nums font-mono min-w-[28px] text-right ml-1">
                  {{ getRemainingTime(c) }}s
                </span>
                <span v-else-if="c.status === 'IN_PROGRESS'" class="tabular-nums font-mono min-w-[40px] text-right ml-1">
                  {{ getPlayElapsed(c) }}
                </span>
              </span>
            </div>

            <!-- กราฟิกสนาม -->
            <div :class="c.status === 'CLOSED' ? 'court-closed-bg border-2 border-slate-700' : 'court-bg border-2 border-emerald-600/60'"
                 class="rounded-xl h-52 p-1.5 relative flex flex-col justify-between overflow-hidden shadow-inner my-2">
              <div class="court-net"></div>
              
              <div class="grid grid-cols-2 gap-1.5 h-[calc(50%-4px)] z-10">
                <div class="bg-black/50 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center p-2 text-center text-white">
                  <p class="text-sm font-black truncate">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c.currentQueueId, 0) }}</p>
                </div>
                <div class="bg-black/50 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center p-2 text-center text-white">
                  <p class="text-sm font-black truncate">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c.currentQueueId, 1) }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-1.5 h-[calc(50%-4px)] z-10">
                <div class="bg-black/50 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center p-2 text-center text-white">
                  <p class="text-sm font-black truncate">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c.currentQueueId, 2) }}</p>
                </div>
                <div class="bg-black/50 backdrop-blur border border-white/10 rounded-lg flex items-center justify-center p-2 text-center text-white">
                  <p class="text-sm font-black truncate">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c.currentQueueId, 3) }}</p>
                </div>
              </div>
            </div>

            <div class="mt-2 pt-2 border-t border-slate-800 text-xs mb-3">
              <div class="flex justify-between text-slate-400">
                <span>คิวปัจจุบัน:</span>
                <span class="text-white font-mono font-bold">{{ c.status === 'CLOSED' ? 'ปิด' : (c.currentQueueId || '-') }}</span>
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2 mt-auto">
              <div v-if="c.status === 'AVAILABLE'" class="col-span-2 text-center text-xs text-slate-500 py-2.5 bg-slate-950 rounded-xl border border-dashed border-slate-800 flex items-center justify-center gap-1.5 ">
                <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                </svg>
                รอเรียกคิวอัตโนมัติ...
              </div>
              
              <template v-else-if="c.status === 'CALLING'">
                <button @click="markCourtPlaying(c.courtNumber, c.currentQueueId)" class="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                  </svg>
                  <span>เริ่มเล่น</span>
                </button>
                <button @click="holdCallingQueue(c.courtNumber)" class="col-span-2 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5">
                 <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4"></polygon>
                  <line x1="19" y1="5" x2="19" y2="19"></line>
                </svg>ข้ามคิว
                </button>
              </template>

              <template v-else-if="c.status === 'IN_PROGRESS'">
                <button v-if="c.currentQueueId" 
                  @click="openSwapModal(c)"
                  class="col-span-2 px-2.5 py-2 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5 stroke-current text-amber-400" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/>
                  </svg>
                  <span>สลับสนาม</span>
                </button>
                <button @click="openFinishResultModal(c.courtNumber, c.currentQueueId)" class="col-span-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg flex items-center justify-center gap-1.5">
                  <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
                    <line x1="4" y1="22" x2="4" y2="15"></line>
                  </svg>
                  จบเกม 
                </button>
              </template>

              <button v-if="c.status === 'AVAILABLE' || c.status === 'CLOSED'" 
                @click="c.status === 'CLOSED' ? reopenCourt(c) : openCloseCourtModal(c)" 
                class="col-span-2 border font-bold py-2 rounded-xl text-xs transition mt-1 flex items-center justify-center gap-1.5"
                :class="c.status === 'CLOSED' ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30' : 'border-rose-500/50 text-rose-400 hover:bg-rose-900/30'">
                <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path>
                  <line x1="12" y1="2" x2="12" y2="12"></line>
                </svg>
                <span>{{ c.status === 'CLOSED' ? 'เปิดคอร์ต' : 'ปิดคอร์ต' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ตารางจัดการคิว -->
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 class="text-base font-bold text-white">ตารางจัดการคิวทั้งหมด</h2>
          <button @click="openAddModal" :disabled="areAllCourtsClosed" class="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition flex items-center gap-1.5">
            <svg class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <span>เพิ่มคิวกลุ่มใหม่</span>
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th class="p-3 whitespace-nowrap w-16">ลำดับ</th>
                <th class="p-3 min-w-[280px]">รายชื่อผู้เล่น</th>
                <th class="p-3 text-center whitespace-nowrap">สถานะ</th>
                <th class="p-3 text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-if="queues.length === 0">
                <td colspan="4" class="p-8 text-center text-slate-500 font-medium">ยังไม่มีข้อมูลการ์ดคิวในระบบ</td>
              </tr>
              <tr v-for="(q, index) in queues" :key="q.id" class="hover:bg-slate-800/30 transition">
                <td class="p-3 font-bold text-slate-300">#{{ index + 1 }}</td>
                <td class="p-3">
                  <div class="flex gap-1.5 flex-wrap items-center">
                    <span v-for="p in q.players" :key="p.deviceId" class="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 shadow-sm">
                      <div class="w-3.5 h-3.5 shrink-0" v-html="getAvatarSvg(p.avatarId)"></div>
                      <span>{{ p.name }}</span>
                      <button v-if="(q.status === 'WAITING' || q.status === 'ON_HOLD') && !areAllCourtsClosed" @click="removePlayer(q.id, p.deviceId)" class="text-rose-400 hover:text-white hover:bg-rose-600 rounded-full w-4 h-4 flex items-center justify-center font-bold transition">×</button>
                    </span>
                    <div v-if="q.players.length < 4 && (q.status === 'WAITING' || q.status === 'ON_HOLD') && !areAllCourtsClosed" class="flex items-center gap-1">
                      <button @click="openAddPlayerPicker(q.id)" class="bg-emerald-600/90 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded text-[11px] font-bold shadow transition">
                        + เพิ่มผู้เล่น
                      </button>
                    </div>
                  </div>
                </td>
                <td class="p-3 text-center">
                  <span v-if="q.status === 'ASSIGNED'" class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap">
                    ลงคอร์ต {{ q.assigned_court }}
                  </span>
                  <span v-else-if="q.status === 'SKIPPED'" class="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap">
                    สิทธิ์เรียกคิวแรก
                  </span>
                  <span v-else-if="q.status === 'ON_HOLD'" class="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap flex item-center justify-center">
                    <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <polygon points="5 4 15 12 5 20 5 4"></polygon>
                      <line x1="19" y1="5" x2="19" y2="19"></line>
                    </svg>
                    พักคิว
                  </span>
                  <span v-else-if="q.status === 'IN_PROGRESS'" class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap">
                    ลงคอร์ต {{ q.assigned_court }}
                  </span>
                  <span v-else-if="q.status === 'CALLING'" class="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap">
                    กำลังเรียก
                  </span>
                  <span v-else class="flex flex-col items-center gap-0.5">
                    <span class="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-[10px] inline-block whitespace-nowrap">
                      {{ q.players.length === 4 ? `รอเรียก · ${getEstimatedWaitText(q)}` : `รอคน (${q.players.length}/4)` }}
                    </span>
                  </span>
                </td>
                <td class="p-3 text-right">
                  <div class="flex justify-end gap-1.5" v-if="q.status !== 'ASSIGNED' && !areAllCourtsClosed">
                    <button v-if="q.status === 'ON_HOLD' || q.status === 'SKIPPED'" 
                      @click="resumeQueue(q.id)" 
                      class="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
                        <path d="M3 3v5h5"/>
                      </svg>
                      <span>กลับเป็นปกติ</span>
                    </button>
                    <button v-if="q.status === 'WAITING' && q.players.length === 4" 
                      @click="givePriority(q.id)" 
                      class="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                      </svg>
                      <span>ดันขึ้นก่อน</span>
                    </button>
                    <button v-if="q.status === 'WAITING' || q.status === 'SKIPPED'" 
                      @click="holdQueue(q.id)" 
                      class="bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1">
                      <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polygon points="5 4 15 12 5 20 5 4"></polygon>
                        <line x1="19" y1="5" x2="19" y2="19"></line>
                      </svg>
                      <span>ข้ามคิว</span>
                    </button>
                    <button @click="cancelQueue(q.id)" 
                      class="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1">
                      <svg class="w-3 h-3 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                      </svg>
                      <span>ลบทิ้ง</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  </div>

  <!-- Modal สำหรับสลับสนามแข่งขัน -->
  <div v-if="showSwapModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 shadow-2xl space-y-4 text-slate-200">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-sm text-white flex items-center gap-2">
          <span class="text-amber-400">
            <svg class="w-4 h-4 stroke-current text-green-400" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M7 16V4m0 0L3 8m4-4l4 4m6 4v12m0 0l4-4m-4 4l-4-4"/>
            </svg>  
          </span> สลับสนามแข่งขัน
        </h3>
      </div>

      <div class="space-y-3 text-xs">
        <div class="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
          <span class="text-slate-400 block mb-1">สนามต้นทาง:</span>
          <span class="font-bold text-emerald-400 text-sm">คอร์ต {{ sourceCourt?.courtNumber }}</span>
          <span class="text-slate-400 ml-2">({{ sourceCourt?.currentQueueId || 'ไม่มีคิว' }})</span>
        </div>

        <div>
          <label class="block text-slate-400 mb-1.5 font-medium">ต้องการสลับกับสนามไหน?</label>
          <select v-model="targetCourtNumber" 
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:border-emerald-500 outline-none">
            <option v-for="c in courts.filter(c => c.courtNumber !== sourceCourt?.courtNumber && c.status !== 'CLOSED')" 
                    :key="c.courtNumber" 
                    :value="c.courtNumber">
              คอร์ต {{ c.courtNumber }} {{ c.currentQueueId ? `(กำลังแข่งขัน: ${c.currentQueueId})` : '(สนามว่าง)' }}
            </option>
          </select>
        </div>
      </div>

      <div class="flex items-center gap-2 pt-2">
        <button @click="showSwapModal = false" class="flex-1 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300">ยกเลิก</button>
        <button @click="handleConfirmSwap" :disabled="isSwapping" class="flex-1 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-50 transition shadow-lg flex items-center justify-center gap-1.5">
          <span v-if="isSwapping" class="animate-spin text-xs">⏳</span>
          <span>ยืนยันสลับ</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal จบเกม: เลือกผู้ชนะ (สูงสุด 2 คน) หรือกดเสมอ -->
  <div v-if="showFinishResultModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl">
      <div class="flex items-center gap-2.5 border-b border-slate-800 pb-3">
        <svg class="w-5 h-5 stroke-current text-rose-400" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"></path>
          <line x1="4" y1="22" x2="4" y2="15"></line>
        </svg>
        <div>
          <h3 class="font-bold text-white text-base">จบเกม · บันทึกผลการแข่งขัน</h3>
          <p class="text-[10px] text-slate-400">คอร์ต {{ finishResultTarget?.courtNumber }} · {{ finishResultTarget?.queueId }}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-xs font-bold text-slate-300 mb-2 flex items-center justify-between">
            <span>ผู้ชนะ (เลือกได้สูงสุด 2 คน — เล่นเป็นทีมคู่)</span>
            <span class="text-[10px] text-emerald-400 font-mono">{{ selectedWinners.length }}/2</span>
          </p>
          <div v-if="finishResultPlayers.length === 0" class="text-center text-xs text-slate-500 py-6 bg-slate-950 rounded-xl border border-slate-800">
            ไม่พบข้อมูลผู้เล่นในคิวนี้
          </div>
          <div class="grid grid-cols-2 gap-2" v-else>
            <button v-for="p in finishResultPlayers" :key="p.deviceId" type="button"
              @click="toggleWinner(p.deviceId)"
              class="flex items-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition active:scale-95"
              :class="selectedWinners.includes(p.deviceId)
                ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300 ring-2 ring-emerald-500/30'
                : 'border-slate-700 bg-slate-950 text-slate-300 hover:border-slate-600'">
              <div class="w-6 h-6 shrink-0 rounded-full bg-slate-800 border border-slate-700 overflow-hidden flex items-center justify-center">
                <div class="w-full h-full [&>svg]:w-full [&>svg]:h-full" v-html="getAvatarSvg(p.avatarId)"></div>
              </div>
              <span class="truncate">{{ p.name }}</span>
              <span class="ml-auto text-emerald-400" v-if="selectedWinners.includes(p.deviceId)">✓</span>
            </button>
          </div>
        </div>

        <p class="text-[10px] text-slate-500 leading-relaxed">กดเลือกชื่อผู้ชนะ แล้วกด "บันทึกผล" หรือถ้าเสมอกัน (ไม่มีใครได้แต้ม) ให้กดปุ่ม "เสมอ"</p>
      </div>

      <div class="flex items-center gap-2 pt-1">
        <button @click="showFinishResultModal = false" :disabled="savingResult"
          class="px-3 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 disabled:opacity-40 transition">ยกเลิก</button>
        <button @click="submitFinishResult(true)" :disabled="savingResult"
          class="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-700 hover:bg-slate-600 text-slate-100 disabled:opacity-40 transition shadow">
          เสมอ (ไม่มีใครได้แต้ม)
        </button>
        <button @click="submitFinishResult(false)" :disabled="savingResult || selectedWinners.length === 0"
          class="flex-1 py-2.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white disabled:opacity-40 transition shadow-lg flex items-center justify-center gap-1.5">
          <span v-if="savingResult" class="animate-spin text-xs">⏳</span>
          <span>บันทึกผลและจบเกม</span>
        </button>
      </div>
    </div>
  </div>

  <!-- Modal ระบุเหตุผลการปิดสนาม (ทีละสนาม) -->
  <div v-if="showCloseCourtModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
        <svg class="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h3 class="font-bold text-white text-base">คอร์ตปิด {{ targetCourtToClose?.courtNumber }}</h3>
      </div>

      <div class="space-y-2">
        <label class="text-xs font-bold text-slate-300">ระบุเหตุผลให้ผู้เล่นทราบ</label>
        <textarea 
          v-model="courtCloseReason" 
          rows="3" 
          placeholder="เช่น ปรับปรุงพื้นสนาม, ตาข่ายชำรุด, แข่งขันรอบพิเศษ..."
          class="w-full bg-slate-950 border border-slate-700 rounded-2xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 transition resize-none"
        ></textarea>
        
        <span class="text-[10px] text-slate-400 block">สามารถเลือกข้อความด่วนด้านล่างเพื่อกรอกอัตโนมัติ</span>
        <div class="flex flex-wrap gap-1.5 pt-1">
          <button type="button" @click="courtCloseReason = 'สนามปิดให้บริการชั่วคราว'" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition">สนามปิดให้บริการ</button>
          <button type="button" @click="courtCloseReason = 'คณะฯ ขอใช้สนามชั่วคราว'" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition">คณะฯยืมสนาม</button>
          <button type="button" @click="courtCloseReason = 'ปรับปรุงพื้นสนามชั่วคราว'" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition">พื้นสนามชำรุด</button>
          <button type="button" @click="courtCloseReason = 'ใช้ในการเรียนการสอน/กิจกรรม'" class="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-lg transition">กิจกรรมการเรียน</button>
        </div>
      </div>

      <div class="flex justify-end gap-2 pt-2">
        <button @click="showCloseCourtModal = false" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">ยกเลิก</button>
        <button @click="confirmCloseCourt" class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition shadow-lg flex items-center gap-1.5">ยืนยันปิดสนาม</button>
      </div>
    </div>
  </div>

  <!-- Modal เลือกผู้เล่นจากสนาม (เพิ่มเข้าคิว) -->
  <div v-if="showPlayerPicker" class="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="font-bold text-sm text-white">เพิ่มผู้เล่นเข้าคิว</h3>
        <button @click="showPlayerPicker = false" class="text-slate-400 hover:text-white text-xs font-bold">ปิด</button>
      </div>

      <div class="relative">
        <input
          v-model.trim="pickerKeyword"
          @input="filterPickerPlayers"
          placeholder="พิมพ์ชื่อเล่น / ชื่อจริงเพื่อค้นหา (หรือเลื่อนดูรายชื่อ)"
          class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
        />
      </div>

      <div v-if="isPickerLoading" class="py-8 text-center text-xs text-slate-400">
        กำลังตรวจสอบรายชื่อผู้เล่นในสนาม...
      </div>
      <div v-else-if="filteredPickerPlayers.length === 0" class="py-8 text-center text-xs text-slate-500">
        ไม่มีผู้เล่นที่ว่างอยู่บนสนามตามที่ค้นหา
      </div>
      <div v-else class="max-h-72 overflow-y-auto divide-y divide-slate-800 rounded-xl border border-slate-800">
        <div v-for="p in filteredPickerPlayers" :key="p.device_id"
             class="flex items-center justify-between px-3 py-2.5 bg-slate-950/40 cursor-pointer hover:bg-slate-800/50 transition"
             @click="addPlayerFromPicker(p.device_id)">
          <div>
            <p class="text-xs font-bold text-white">{{ p.nickname }} <span class="font-normal text-slate-400">({{ p.real_name }})</span></p>
            <span class="text-[10px] text-slate-500">{{ p.role }} · {{ p.faculty || '-' }}</span>
          </div>
          <button class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition active:scale-95 shadow">
            + เพิ่ม
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import html2pdf from 'html2pdf.js'
// 🚨 ลบการ import Firebase Auth ออกทั้งหมด เพื่อแก้บั๊กข้อมูลชนกัน
import { supabase } from '../supabase'
import { AVATAR_PRESETS, getAvatarSvg } from '../components/avatars'
import { queueService } from '../services/QueueService'
import { userService } from '../services/UserService'
import { useTheme } from '../composables/useTheme'
import { SKILL_LEVELS, getSkillBadgeSvg } from '../components/skillBadges'
import { readGpsCache, writeGpsCache, isGpsCacheFresh } from '../composables/useGpsCache'

const formSkillLevel = ref('BG')
const { isDarkMode, toggleTheme } = useTheme()

// 🚨 ปิดโหมดจำลอง บังคับใช้ GPS ของจริง!
const DEV_BYPASS_GPS = false 
const VENUE_LAT = 19.033213
const VENUE_LNG = 99.885612
const MAX_DISTANCE_METERS = 900

// Flag ส่วนกลางจากตาราง system_settings (key = gps_filter_enabled)
// แอดมินกดปุ่ม "ปิดกรองพิกัด" เพื่อให้ทุกหน้าจอถือว่าทุกคนอยู่ในสนาม (สำหรับทดสอบ)
const gpsFilterEnabled = ref(true)

const isGpsBypass = () => DEV_BYPASS_GPS || gpsFilterEnabled.value === false

const loadGpsFilterSetting = async () => {
  try {
    const { data, error } = await supabase
      .from('system_settings')
      .select('value')
      .eq('key', 'gps_filter_enabled')
      .maybeSingle()
    if (error) throw error
    if (data) gpsFilterEnabled.value = data.value !== 'false'
  } catch (err) {
    console.error('ดึงค่า gps_filter_enabled ไม่ได้:', err.message)
  }
}

const toggleGpsFilter = async () => {
  const target = !gpsFilterEnabled.value
  const { error } = await supabase
    .from('system_settings')
    .upsert({ key: 'gps_filter_enabled', value: String(target) }, { onConflict: 'key' })
  if (error) {
    alert('ปรับค่านักพิกัดไม่สำเร็จ: ' + error.message)
    return
  }
  gpsFilterEnabled.value = target
}

const courts = ref([])
const queues = ref([])
const activeTab = ref('booking')
const loading = ref(false)
const isAlerting = ref(false)

const now = ref(Date.now())
let countdownInterval = null

const gpsStatus = ref('CHECKING')
const isCheckingGps = ref(false)
const userDistance = ref(0)
const lastGpsState = ref(null)

const deviceId = ref('')
const playerName = ref('')
const tempName = ref('')
const formRealName = ref('')
const formRole = ref('นิสิต')
const formFaculty = ref('')
const userProfile = ref(null)
const selectedAvatarId = ref('boy-cap')
const isEditingProfile = ref(false)

let gpsInterval = null
let watchdogInterval = null
let queueChannel = null
let courtChannel = null
let settingsChannel = null
let queueMembersChannel = null

const supabaseQueues = ref([])
const supabaseActiveQueues = ref([])

const fetchActiveQueuesFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('active_queues_view').select('*')
    if (error) throw error

    if (data) {
      const validQueues = data.filter(q =>
        ['WAITING', 'CALLING', 'IN_PROGRESS', 'ASSIGNED', 'SKIPPED', 'ON_HOLD'].includes(q.status) &&
        Array.isArray(q.players) &&
        q.players.length > 0
      )

      validQueues.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

      supabaseActiveQueues.value = validQueues
      queues.value = validQueues 
    }
  } catch (err) {
    console.error('Error fetching queues:', err)
  }
}

const loadCourtsData = async () => {
  try {
    const { data, error } = await supabase
      .from('courts')
      .select('*')
      .order('court_number', { ascending: true }) 

    if (error) throw error

    if (data) {
      courts.value = data.map(row => ({
        courtNumber: row.court_number, 
        status: row.status,           
        currentQueueId: row.current_queue_id,
        statusUpdatedAt: row.status_updated_at || Date.now(), 
        closeReason: row.close_reason 
      }))
    }
  } catch (err) {
    console.error("Failed to load courts from Supabase:", err)
  }
}

const getRemainingTime = (court) => {
  if (!court || !court.statusUpdatedAt) return 180
  const elapsed = Math.floor((now.value - court.statusUpdatedAt) / 1000)
  return Math.max(0, 180 - elapsed)
}

// ประมาณเวลารอแบบเรียลไทม์ของคิวที่ครบ 4 คน (สถานะ "รอเรียก") — ตรรกะเดียวกับ PlayerView
//   * คอร์ดกำลังเล่น -> เหลืออีกเท่าไรกว่าจะว่าง (จับเวลา real-time)
//   * คอร์ดกำลังเรียกคิว -> นับเป็นเต็ม 1 แมตช์
//   * คอร์ดว่าง -> ว่างทันที
//   * จองคอร์ดที่ว่างเร็วที่สุดให้คิวครบ 4 คนที่มีลำดับอยู่ก่อน (FIFO) ทีละคิว
//     แต่ละคิวที่แซงหน้า = 1 แมตช์ (20 นาที)
// ใช้ now.value ที่ tick ทุกวินาที -> นับถอยหลังอัตโนมัติ
const ESTIMATED_MATCH_MINUTES = 20

const getEstimatedWaitSeconds = (queue) => {
  if (!queue || !Array.isArray(queue.players) || queue.players.length !== 4) return 0
  const T = ESTIMATED_MATCH_MINUTES * 60

  // รายการเวลาที่แต่ละคอร์ดจะว่าง (วินาที) — 0 = ว่างอยู่แล้ว
  const freeInSeconds = []
  courts.value.forEach(c => {
    if (c.status === 'CLOSED') return
    if (c.status === 'AVAILABLE') {
      freeInSeconds.push(0)
      return
    }
    if (c.status === 'IN_PROGRESS') {
      const elapsed = Math.max(0, Math.floor((now.value - (c.statusUpdatedAt || Date.now())) / 1000))
      freeInSeconds.push(Math.max(0, T - elapsed))
      return
    }
    // CALLING -> คิวที่ถูกเรียกจะเริ่มเล่นจริง -> นับเป็นเต็ม 1 แมตช์
    if (c.status === 'CALLING') {
      freeInSeconds.push(T)
    }
  })

  // จำนวนคิวที่ครบ 4 คน และมีลำดับอยู่ก่อนเรา (ยังรออยู่ ไม่ใช่ ASSIGNED/กำลังเล่น)
  const aheadCount = supabaseActiveQueues.value.filter(q =>
    q.id !== queue.id &&
    (q.status === 'WAITING' || q.status === 'SKIPPED') &&
    Array.isArray(q.players) &&
    q.players.length === 4 &&
    new Date(q.created_at).getTime() <= new Date(queue.created_at).getTime()
  ).length

  // จองคอร์ดที่ว่างเร็วที่สุดให้ทีละคิวที่แซงหน้าเรา (ทุกคิวใช้เวลา 1 แมตช์)
  freeInSeconds.sort((a, b) => a - b)
  for (let i = 0; i < aheadCount && freeInSeconds.length > 0; i++) {
    freeInSeconds[0] += T
    freeInSeconds.sort((a, b) => a - b)
  }

  return freeInSeconds.length > 0 ? freeInSeconds[0] : 0
}

const getEstimatedWaitText = (queue) => {
  const secs = getEstimatedWaitSeconds(queue)
  if (secs <= 0) return 'กำลังจะถึงคิว'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `ประมาณ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const getPlayElapsed = (court) => {
  if (!court || !court.statusUpdatedAt) return '00:00'
  const elapsed = Math.max(0, Math.floor((now.value - court.statusUpdatedAt) / 1000))
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

const areAllCourtsClosed = computed(() => {
  return courts.value.length > 0 && courts.value.every(c => c.status === 'CLOSED')
})

const isUserInAnyQueue = computed(() => {
  if (!deviceId.value) return false
  const targetList = supabaseActiveQueues.value.length > 0 ? supabaseActiveQueues.value : queues.value
  return targetList.some(q => {
    if (q.status === 'CANCELLED' || q.status === 'FINISHED') return false
    return Array.isArray(q.players) && q.players.some(p => p.deviceId === deviceId.value)
  })
})

const fullQueues = computed(() => {
  return supabaseActiveQueues.value.filter(q => q.players && q.players.length === 4)
})

const myActiveCourt = computed(() => {
  if (!deviceId.value) return null
  const callingCourt = courts.value.find(c => {
    if (c.status !== 'CALLING' && c.status !== 'IN_PROGRESS') return false
    const matchQ = queues.value.find(q => q.id === c.currentQueueId) || supabaseActiveQueues.value.find(q => q.id === c.currentQueueId)
    return matchQ && matchQ.players && matchQ.players.some(p => p.deviceId === deviceId.value)
  })
  return callingCourt ? callingCourt.courtNumber : null
})

const isPlayerInQueue = (queue) => {
  return queue.players && queue.players.some(p => p.deviceId === deviceId.value)
}

const isMySlot = (court, slotIndex) => {
  if (!court.currentQueueId) return false
  const matchQueue = queues.value.find(q => q.id === court.currentQueueId) || supabaseActiveQueues.value.find(q => q.id === court.currentQueueId)
  return matchQueue && matchQueue.players && matchQueue.players[slotIndex]?.deviceId === deviceId.value
}

const getPlayerName = (court, slotIndex) => {
  const queueId = typeof court === 'string' ? court : (court && court.currentQueueId)
  if (!queueId) return '- ว่าง -'
  const matchQueue = queues.value.find(q => q.id === queueId) || supabaseActiveQueues.value.find(q => q.id === queueId)
  return (matchQueue && matchQueue.players && matchQueue.players[slotIndex]) ? matchQueue.players[slotIndex].name : '- ว่าง -'
}

const getTodayDateString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

// ใช้วันถัดไปเป็นขอบบนของช่วงวันที่ (กัน DB ชนิด date/timestamp ต่างกัน)
const getNextDayString = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getFormattedTime = () => {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
}

const handleDailyCheckIn = async () => {
  if (!userProfile.value || !deviceId.value) return
  
  const todayStr = getTodayDateString()
  const nowTime = getFormattedTime()

  try {
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .gte('date', todayStr)
      .lt('date', getNextDayString())
      .eq('device_id', deviceId.value)

    if (existing && existing.length > 0) {
      // กันแถวซ้ำในวันเดียวกัน — อัปเดตแถวล่าสุด
      const latest = existing[existing.length - 1]
      await supabase.from('daily_checkins').update({
        status: 'INSIDE',
        last_active_at: Date.now()
      }).eq('id', latest.id)
    } else {
      await supabase.from('daily_checkins').insert({
        date: todayStr,
        device_id: deviceId.value,
        real_name: userProfile.value.realName || '',
        nickname: userProfile.value.nickname || userProfile.value.name || '',
        role: userProfile.value.role || 'นิสิต',
        faculty: userProfile.value.faculty || '',
        status: 'INSIDE',
        check_in_at: nowTime,
        last_active_at: Date.now()
      })
    }
  } catch (err) { console.error("Check-in error:", err) }
}

const handleDailyCheckOut = async () => {
  if (!deviceId.value) return
  try {
    await supabase.from('daily_checkins').update({
      status: 'OUTSIDE',
      check_out_at: getFormattedTime()
    })
    .gte('date', getTodayDateString())
    .lt('date', getNextDayString())
    .eq('device_id', deviceId.value)
    .is('check_out_at', null) 
  } catch (err) { console.error("Check-out error:", err) }
}

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3
  const phi1 = (Number(lat1) * Math.PI) / 180
  const phi2 = (Number(lat2) * Math.PI) / 180
  const deltaPhi = ((Number(lat2) - Number(lat1)) * Math.PI) / 180
  const deltaLambda = ((Number(lon2) - Number(lon1)) * Math.PI) / 180
  const a = Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) + Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return Math.round(R * c)
}

const applyPosition = (lat, lng) => {
  const dist = calculateDistance(lat, lng, VENUE_LAT, VENUE_LNG)
  userDistance.value = dist
  
  const newState = dist <= MAX_DISTANCE_METERS ? 'IN_RANGE' : 'OUT_OF_RANGE'
  gpsStatus.value = newState
  
  if (lastGpsState.value !== newState) {
    lastGpsState.value = newState
    if (newState === 'IN_RANGE') handleDailyCheckIn()
    else if (newState === 'OUT_OF_RANGE') handleDailyCheckOut()
  }
}

let gpsFetchInFlight = false
const fetchRealPosition = () => {
  if (gpsFetchInFlight) return
  gpsFetchInFlight = true
  isCheckingGps.value = true
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      gpsFetchInFlight = false
      isCheckingGps.value = false
      writeGpsCache(pos.coords.latitude, pos.coords.longitude)
      applyPosition(pos.coords.latitude, pos.coords.longitude)
    },
    (err) => {
      gpsFetchInFlight = false
      isCheckingGps.value = false
      if (err && err.code === err.PERMISSION_DENIED) {
        gpsStatus.value = 'DENIED'
      }
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

const requestLocation = () => {
  if (DEV_BYPASS_GPS) {
    if (gpsStatus.value !== 'IN_RANGE') {
      gpsStatus.value = 'IN_RANGE'
      lastGpsState.value = 'IN_RANGE'
      handleDailyCheckIn() 
    }
    userDistance.value = 0
    return
  }

  if (!navigator.geolocation) {
    gpsStatus.value = 'DENIED'
    return
  }

  // 1) ใช้ตำแหน่งที่แคชไว้ทันที (เงียบ ๆ ไม่เด้งถาม permission)
  const cache = readGpsCache()
  if (cache && isGpsCacheFresh(cache)) {
    applyPosition(cache.lat, cache.lng)
  }

  // 2) รีเฟรชตำแหน่งแบบเงียบ ๆ ต่อเมื่อทำได้โดยไม่เด้งคำถาม
  //    granted -> ขอตำแหน่งจริง (ไม่เด้งคำถาม)
  //    prompt  -> เด้งเฉพาะครั้งแรก / ตอน cache เก่าเกิน TTL เท่านั้น
  //    denied / ไม่รองรับ API -> ข้ามเงียบ ๆ ใช้ค่า cache ไปก่อน
  const fallbackRefresh = () => {
    if (!cache || !isGpsCacheFresh(cache)) {
      fetchRealPosition()
    }
    // cache สด + ไม่มี API permission -> ข้ามเงียบ ๆ
  }

  if (navigator.permissions && navigator.permissions.query) {
    navigator.permissions
      .query({ name: 'geolocation' })
      .then((status) => {
        if (status.state === 'granted') {
          fetchRealPosition()
        } else if (status.state === 'prompt') {
          if (!cache || !isGpsCacheFresh(cache)) fetchRealPosition()
        }
        // 'denied' -> ข้ามเงียบ ๆ
      })
      .catch(() => {
        fallbackRefresh()
      })
  } else {
    fallbackRefresh()
  }
}

const saveName = async () => {
  unlockAudioContext()
  if (!tempName.value || !formRealName.value || !formFaculty.value || !isFacultyValid.value) return

  // ผูกโปรไฟล์เข้ากับ deviceId แบบสมบูรณ์
  const prof = {
    deviceId: deviceId.value,
    nickname: tempName.value,
    name: tempName.value,
    realName: formRealName.value,
    role: formRole.value,
    faculty: formFaculty.value,
    avatarId: selectedAvatarId.value,
    skillLevel: formSkillLevel.value
  }

  try {
    loading.value = true 
    await userService.saveProfile(prof)
    
    // อัปเดตข้อมูลขึ้นหน้าจอ
    playerName.value = tempName.value
    userProfile.value = prof
    localStorage.setItem('badminton_user_profile', JSON.stringify(prof))
    isEditingProfile.value = false 

    if (gpsStatus.value === 'IN_RANGE') handleDailyCheckIn()
  } catch (err) {
    alert("บันทึกข้อมูลไม่สำเร็จ: " + err.message)
  } finally {
    loading.value = false
  }
}

const resetPlayer = () => {
  if (confirm('คุณต้องการแก้ไขข้อมูลผู้ใช้งานใช่หรือไม่?')) {
    if (userProfile.value) {
      formRealName.value = userProfile.value.realName || ''
      tempName.value = userProfile.value.nickname || userProfile.value.name || ''
      formRole.value = userProfile.value.role || 'นิสิต'
      formFaculty.value = userProfile.value.faculty || ''
      selectedAvatarId.value = userProfile.value.avatarId || 'boy-cap'
      formSkillLevel.value = userProfile.value?.skillLevel || 'BG'
    }
    isEditingProfile.value = true
  }
}

const handleCreateQueue = async () => {
  unlockAudioContext()
  if (isUserInAnyQueue.value) {
    alert('คุณมีชื่ออยู่ในคิวแล้ว ไม่สามารถสร้างคิวใหม่ได้')
    return
  }
  if (areAllCourtsClosed.value || (gpsStatus.value !== 'IN_RANGE' && !isGpsBypass())) return
  
  loading.value = true
  try {
    await queueService.createQueue({ deviceId: deviceId.value })
    await fetchActiveQueuesFromSupabase()
  } catch (err) { 
    alert(err.message) 
  } finally { 
    loading.value = false 
  }
}

const handleJoinQueue = async (queueId) => {
  unlockAudioContext()
  if (isUserInAnyQueue.value) {
    alert('คุณมีชื่ออยู่ในคิวแล้ว ไม่สามารถเข้าร่วมคิวอื่นซ้ำได้')
    return
  }
  if (areAllCourtsClosed.value || (gpsStatus.value !== 'IN_RANGE' && !isGpsBypass())) return
  
  loading.value = true
  try {
    await queueService.joinQueue(queueId, deviceId.value)
    await fetchActiveQueuesFromSupabase()
  } catch (err) { 
    alert(err.message) 
  } finally { 
    loading.value = false 
  }
}

const handleLeaveQueue = async (queueId) => {
  if (!confirm('ต้องการยกเลิกและออกจากคิวนี้ใช่หรือไม่?')) return
  loading.value = true
  try {
    const result = await queueService.leaveQueue(queueId, deviceId.value)
    if (result?.deleted || result?.cancelled) {
      supabaseActiveQueues.value = supabaseActiveQueues.value.filter(q => q.id !== queueId)
      queues.value = queues.value.filter(q => q.id !== queueId)
    }
    await fetchActiveQueuesFromSupabase()
  } catch (err) { 
    alert(err.message) 
  } finally { 
    loading.value = false 
  }
}

const refreshAll = async () => {
  await Promise.all([loadCourtsData(), fetchActiveQueuesFromSupabase()])
}

// ==========================================
// สิทธิ์เข้าใช้หน้าแอดมิน (PIN)
// ==========================================
const ADMIN_PIN = 'd^Uf,bo9yo' // 🚨 เปลี่ยนก่อนใช้งานจริง
const isAdminAuthenticated = ref(sessionStorage.getItem('bm_admin_session') === '1')
const inputPin = ref('')
const pinError = ref('')

const handleVerifyPin = () => {
  if (inputPin.value === ADMIN_PIN) {
    sessionStorage.setItem('bm_admin_session', '1')
    isAdminAuthenticated.value = true
    pinError.value = ''
    fetchActiveQueuesFromSupabase()
    loadCourtsData()
  } else {
    pinError.value = 'รหัสผ่านไม่ถูกต้อง'
    inputPin.value = ''
  }
}

const handleAdminLogout = () => {
  sessionStorage.removeItem('bm_admin_session')
  isAdminAuthenticated.value = false
}

// ==========================================
// สรุปรายงานผู้ใช้บริการประจำวัน
// ==========================================
const showSummaryModal = ref(false)
const currentReportDate = ref('')
const dailyStats = ref({ totalUsers: 0, byRole: {}, byFaculty: {} })
const dailyCheckinRecords = ref([])
const isExportingPdf = ref(false)

const openSummaryReport = async () => {
  showSummaryModal.value = true
  currentReportDate.value = new Date().toLocaleDateString('th-TH', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  })

  try {
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('id, date, device_id, real_name, nickname, role, faculty, check_in_at, check_out_at')
      .gte('date', getTodayDateString())
      .lt('date', getNextDayString())

    if (error) throw error

    // Dedupe ตาม device_id — กันแถวเช็กอินซ้ำของคนเดิมในวันเดียวกัน
    // (ให้ทุกหัวข้อนับจากชุดคนเดียวกัน ยอดจะสมดุลกันเสมอ)
    const latestById = new Map()
    ;(data || []).forEach(r => {
      const prev = latestById.get(r.device_id)
      if (!prev || (r.id || 0) >= (prev.id || 0)) latestById.set(r.device_id, r)
    })

    // ดึง role/faculty ปัจจุบันจาก profiles (ตาราง identity เดียว) — แยกประเภท
    // ตามแบบฟอร์มปัจจุบัน ไม่ใช่ snapshot ที่ตอนเช็กอิน (ข้อมูลเก่า/ว่างโดนแทนที่)
    const ids = [...latestById.keys()].filter(Boolean)
    const profileMap = new Map()
    if (ids.length) {
      const { data: profs, error: profErr } = await supabase
        .from('profiles')
        .select('device_id, role, faculty')
        .in('device_id', ids)
      if (profErr) throw profErr
      ;(profs || []).forEach(p => profileMap.set(p.device_id, p))
    }

    const rows = [...latestById.values()].map(r => {
      const prof = profileMap.get(r.device_id)
      return {
        deviceId: r.device_id,
        realName: r.real_name,
        nickname: r.nickname,
        role: (prof && prof.role) || r.role || 'นิสิต',
        faculty: (prof && prof.faculty) || r.faculty || '-',
        checkInAt: r.check_in_at,
        checkOutAt: r.check_out_at || null
      }
    })
    dailyCheckinRecords.value = rows

    const byRole = {}
    const byFaculty = {}
    const deviceSet = new Set()
    rows.forEach(r => {
      deviceSet.add(r.deviceId)
      const roleKey = r.role || 'อื่นๆ'
      byRole[roleKey] = (byRole[roleKey] || 0) + 1
      const facKey = r.faculty || 'ไม่ระบุ'
      byFaculty[facKey] = (byFaculty[facKey] || 0) + 1
    })

    dailyStats.value = { totalUsers: deviceSet.size, byRole, byFaculty }
  } catch (err) {
    alert('โหลดรายงานไม่สำเร็จ: ' + err.message)
  }
}

const exportReportToPdf = async () => {
  if (isExportingPdf.value) return
  isExportingPdf.value = true
  try {
    const el = document.getElementById('printable-summary-report')
    if (!el) throw new Error('ไม่พบเนื้อหารายงาน')
    await html2pdf().set({
      margin: 8,
      filename: 'รายงานประจำวัน-' + getTodayDateString() + '.pdf',
      image: { type: 'jpeg', quality: 0.95 },
      html2canvas: { scale: 2, backgroundColor: '#0f172a' },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).from(el).save()
  } catch (err) {
    alert('สร้าง PDF ไม่สำเร็จ: ' + err.message)
  } finally {
    isExportingPdf.value = false
  }
}

// ==========================================
// ควบคุมคอร์ด: เปิด/ปิดสลับทั้งหมด
// ==========================================
const toggleAllCourts = async () => {
  if (!confirm(areAllCourtsClosed.value 
    ? 'เปิดทุกสนามให้บริการ?' 
    : 'ปิดสนามทั้งหมด (คิวที่กำลังเล่น/ลงคอร์ตอยู่จะถูกล้างให้จบทันที)?')) 
    return
  loading.value = true
  try {
    const target = areAllCourtsClosed.value ? 'AVAILABLE' : 'CLOSED'
    if (target === 'CLOSED') {
      // ปิดทุกสนาม: ล้างคิวที่ลงคอร์ด/กำลังเล่นแล้วเปิดตารางสรุปยอด
      await queueService.closeAllCourts('ปิดสนามทั้งหมด')
      await refreshAll()
      await openSummaryReport()
    } else {
      for (const c of courts.value) {
        await queueService.setCourtStatus(c.courtNumber, target, null)
      }
      await refreshAll()
    }
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

// ควบคุมคอร์ด: เริ่มเล่น / จบเกม / พักคิวที่ถูกเรียก
const markCourtPlaying = async (courtNumber, queueId) => {
  if (!confirm('ยืนยันเริ่มการแข่งขันที่คอร์ต ' + courtNumber + '?')) return
  loading.value = true
  try {
    await queueService.startMatch(courtNumber, queueId)
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

// จบเกม: เปิด modal ให้แอดมินเลือกผู้ชนะ (สูงสุด 2 คน) หรือกดเสมอ ก่อนปล่อยคอร์ด
const showFinishResultModal = ref(false)
const finishResultTarget = ref(null) // { courtNumber, queueId }
const selectedWinners = ref([])      // device_id ของผู้ชนะ (สูงสุด 2)
const savingResult = ref(false)

const finishResultPlayers = computed(() => {
  const t = finishResultTarget.value
  if (!t?.queueId) return []
  const matchQueue = queues.value.find(q => q.id === t.queueId) || supabaseActiveQueues.value.find(q => q.id === t.queueId)
  return (matchQueue && Array.isArray(matchQueue.players)) ? matchQueue.players : []
})

const openFinishResultModal = (courtNumber, queueId) => {
  if (!queueId) return
  finishResultTarget.value = { courtNumber, queueId }
  selectedWinners.value = []
  showFinishResultModal.value = true
}

const toggleWinner = (deviceId) => {
  if (selectedWinners.value.includes(deviceId)) {
    selectedWinners.value = selectedWinners.value.filter(id => id !== deviceId)
    return
  }
  if (selectedWinners.value.length >= 2) {
    alert('เลือกผู้ชนะได้สูงสุด 2 คน (เล่นเป็นทีมคู่)')
    return
  }
  selectedWinners.value = [...selectedWinners.value, deviceId]
}

const submitFinishResult = async (isDraw) => {
  const t = finishResultTarget.value
  if (!t) return
  savingResult.value = true
  try {
    await queueService.recordMatchResult({
      courtNumber: t.courtNumber,
      queueId: t.queueId,
      playerDeviceIds: finishResultPlayers.value.map(p => p.deviceId),
      winnerDeviceIds: isDraw ? [] : selectedWinners.value
    })
    showFinishResultModal.value = false
    await queueService.finishMatch(t.courtNumber, t.queueId)
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    savingResult.value = false
  }
}

const holdCallingQueue = async (courtNumber) => {
  if (!confirm('พักคิวที่ถูกเรียกอยู่บนคอร์ต ' + courtNumber + ' (คนมาไม่ครบ)? คอร์ตจะปล่อยให้คิวถัดไป')) return
  loading.value = true
  try {
    await queueService.holdCallingQueue(courtNumber)
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

// สลับการแข่งขันระหว่างคอร์ด
const showSwapModal = ref(false)
const sourceCourt = ref(null)
const targetCourtNumber = ref(null)
const isSwapping = ref(false)

const openSwapModal = (c) => {
  sourceCourt.value = c
  targetCourtNumber.value = null
  showSwapModal.value = true
}

const handleConfirmSwap = async () => {
  if (!sourceCourt.value || !targetCourtNumber.value) {
    alert('กรุณาเลือกสนามปลายทาง')
    return
  }
  isSwapping.value = true
  try {
    await queueService.swapCourts(sourceCourt.value.courtNumber, targetCourtNumber.value)
    showSwapModal.value = false
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    isSwapping.value = false
  }
}

// เปิด/ปิดคอร์ดทีละสนาม
const showCloseCourtModal = ref(false)
const targetCourtToClose = ref(null)
const courtCloseReason = ref('')

const openCloseCourtModal = (c) => {
  targetCourtToClose.value = c
  courtCloseReason.value = ''
  showCloseCourtModal.value = true
}

const confirmCloseCourt = async () => {
  if (!courtCloseReason.value.trim()) {
    alert('กรุณาระบุเหตุผลที่ปิดสนาม')
    return
  }
  if (!targetCourtToClose.value) return
  loading.value = true
  try {
    await queueService.setCourtStatus(targetCourtToClose.value.courtNumber, 'CLOSED', courtCloseReason.value.trim())
    showCloseCourtModal.value = false
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

const reopenCourt = async (c) => {
  if (!confirm('เปิดคอร์ต ' + c.courtNumber + ' ให้บริการ?') ) return
  loading.value = true
  try {
    await queueService.setCourtStatus(c.courtNumber, 'AVAILABLE')
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

// ==========================================
// จัดการคิว: พัก / ดันขึ้น / กลับปกติ / ลบ / จัดการสมาชิก
// ==========================================
const resumeQueue = async (queueId) => {
  loading.value = true
  try {
    await queueService.updateQueueStatus(queueId, 'WAITING')
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

const givePriority = async (queueId) => {
  const q = queues.value.find(x => x.id === queueId)
  if (!q || !q.players || q.players.length < 4) {
    alert('ต้องให้สมาชิกครบ 4 คนก่อน จึงจะดันขึ้นเป็นสิทธิ์เรียกก่อนได้')
    return
  }
  if (!confirm('ดันคิว ' + queueId + ' ขึ้นเป็นสิทธิ์เรียกก่อน?')) return
  loading.value = true
  try {
    await queueService.updateQueueStatus(queueId, 'SKIPPED')
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

const holdQueue = async (queueId) => {
  if (!confirm('พักคิว ' + queueId + ' ไว้ก่อน (ข้ามไม่เรียง)?')) return
  loading.value = true
  try {
    await queueService.updateQueueStatus(queueId, 'ON_HOLD')
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

const cancelQueue = async (queueId) => {
  if (!confirm('ลบคิว ' + queueId + ' ทิ้ง?')) return
  loading.value = true
  try {
    await queueService.cancelQueueByAdmin(queueId)
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

const removePlayer = async (queueId, deviceId) => {
  if (!confirm('นำสมาชิกคนนี้ออกจากคิว?')) return
  loading.value = true
  try {
    await queueService.removeQueueMember(queueId, deviceId)
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

// ==========================================
// เลือกผู้เล่นจากสนาม (พิมพ์ค้น + เลื่อนหา แล้วเลือก)
// ==========================================
const showPlayerPicker = ref(false)
const pickerQueueId = ref(null)
const pickerKeyword = ref('')
const availablePickerPlayers = ref([])
const isPickerLoading = ref(false)

const openAddPlayerPicker = async (queueId) => {
  pickerQueueId.value = queueId
  pickerKeyword.value = ''
  showPlayerPicker.value = true
  isPickerLoading.value = true
  try {
    const todayStr = getTodayDateString()
    availablePickerPlayers.value = await queueService.getAvailablePlayersOnSite(todayStr, { gpsFilterOn: gpsFilterEnabled.value })
  } catch (err) {
    alert(err.message)
  } finally {
    isPickerLoading.value = false
  }
}

const filteredPickerPlayers = computed(() => {
  const kw = (pickerKeyword.value || '').trim().toLowerCase()
  if (!kw) return availablePickerPlayers.value
  return availablePickerPlayers.value.filter(p =>
    (p.nickname || '').toLowerCase().includes(kw) ||
    (p.real_name || '').toLowerCase().includes(kw) ||
    (p.role || '').toLowerCase().includes(kw) ||
    (p.faculty || '').toLowerCase().includes(kw)
  )
})

const filterPickerPlayers = () => {}

const addPlayerFromPicker = async (deviceId) => {
  if (!pickerQueueId.value) return
  loading.value = true
  try {
    await queueService.addPlayerToQueue(pickerQueueId.value, deviceId)
    showPlayerPicker.value = false
    await refreshAll()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

// ==========================================
// เพิ่มคิวกลุ่มใหม่ — แต่ละช่องคนที่ 1-4 เป็นช่องค้นหา:
// พิมพ์ชื่อแล้วมี dropdown เสนอรายชื่อผู้เล่นที่ว่าง (ไม่อยู่ในคิวอื่น)
// ==========================================
const showAddModal = ref(false)
const newGroup = ref({ p1: '', p2: '', p3: '', p4: '', d1: '', d2: '', d3: '', d4: '' })
const groupAvailablePlayers = ref([])
const groupActiveSlot = ref(null)
const isGroupLoadingPlayers = ref(false)
let groupSlotBlurTimer = null

const openAddModal = async () => {
  newGroup.value = { p1: '', p2: '', p3: '', p4: '', d1: '', d2: '', d3: '', d4: '' }
  groupActiveSlot.value = null
  showAddModal.value = true
  isGroupLoadingPlayers.value = true
  try {
    // ฐานเดียวกับ modal "เพิ่มผู้เล่น" ฝั่งผู้เล่น: ใช้ `profiles` ทั้งหมด
    // (Player = Admin — ไม่ต้องมี daily_checkins วันนี้)
    // ฐานเดียวกับ modal "เพิ่มผู้เล่น" ฝั่งผู้เล่น: เปิดกรอง GPS -> เอาเฉพาะที่เช็คอินผ่าน
    // (Player = Admin — เกณฑ์เดียวกันทุกจุด)
    groupAvailablePlayers.value = await queueService.getAvailablePlayersOnSite(getTodayDateString(), { gpsFilterOn: gpsFilterEnabled.value })
  } catch (err) {
    groupAvailablePlayers.value = []
  } finally {
    isGroupLoadingPlayers.value = false
  }
}

const clearGroupSlot = (slot) => {
  newGroup.value['p' + slot] = ''
  newGroup.value['d' + slot] = ''
  groupActiveSlot.value = null
}

const onGroupSlotInput = (slot) => {
  newGroup.value['d' + slot] = ''
  groupActiveSlot.value = slot
}

const onGroupSlotBlur = (slot) => {
  clearTimeout(groupSlotBlurTimer)
  groupSlotBlurTimer = setTimeout(() => {
    if (groupActiveSlot.value === slot) groupActiveSlot.value = null
  }, 120)
}

const selectedGroupDeviceIds = computed(() => {
  const s = new Set()
  for (let i = 1; i <= 4; i++) {
    if (newGroup.value['d' + i]) s.add(newGroup.value['d' + i])
  }
  return s
})

const groupSlotSuggestions = (slot) => {
  const kw = (newGroup.value['p' + slot] || '').trim().toLowerCase()
  const taken = selectedGroupDeviceIds.value
  const kwPlayers = (p) =>
    ((p.nickname || '').toLowerCase().includes(kw) ||
     (p.real_name || '').toLowerCase().includes(kw) ||
     (p.role || '').toLowerCase().includes(kw) ||
     (p.faculty || '').toLowerCase().includes(kw))
  // พิมพ์แล้ว -> กรองตามคำค้นหา, ยังไม่พิมพ์ -> แสดงรายชื่อที่ว่าง+ผ่านระบบคัดพิกัดทั้งหมด
  const filtered = (groupAvailablePlayers.value || []).filter(p =>
    p.device_id && !taken.has(p.device_id) && (!kw || kwPlayers(p))
  )
  return filtered.slice(0, 8)
}

const selectGroupSlotPlayer = (slot, p) => {
  newGroup.value['p' + slot] = p.nickname || p.real_name || 'ผู้เล่น'
  newGroup.value['d' + slot] = p.device_id
  groupActiveSlot.value = null
}

const resolveNameToDeviceId = async (name) => {
  const nm = (name || '').trim()
  if (!nm) return null

  const hit = availablePickerPlayers.value.find(p =>
    (p.nickname || '').toLowerCase() === nm.toLowerCase() ||
    (p.real_name || '').toLowerCase() === nm.toLowerCase()
  )
  if (hit) return hit.device_id

  try {
    const res = await queueService.searchPlayersByKeyword(nm)
    if (!res.length) return null
    const exact = res.find(p =>
      (p.nickname || '').toLowerCase() === nm.toLowerCase() ||
      (p.real_name || '').toLowerCase() === nm.toLowerCase()
    )
    return exact ? exact.device_id : res[0].device_id
  } catch (err) {
    return null
  }
}

const adminCreateGroupQueue = async () => {
  if (loading.value) return
  loading.value = true
  try {
    const devices = []
    const deviceSet = new Set()
    const missing = []

    for (let i = 1; i <= 4; i++) {
      const nm = (newGroup.value['p' + i] || '').trim()
      if (!nm) continue

      const dev = newGroup.value['d' + i] || (await resolveNameToDeviceId(nm))
      if (!dev) {
        missing.push(nm)
        continue
      }
      if (deviceSet.has(dev)) continue
      deviceSet.add(dev)
      devices.push(dev)
    }

    if (missing.length) {
      alert('ไม่พบผู้เล่นต่อไปนี้ในระบบ: ' + missing.join(', ') + ' (กรอกชื่อให้ตรง หรือเลือกจากรายการค้นหา)')
      return
    }

    const qid = await queueService.createQueueWithPlayers(devices)
    showAddModal.value = false
    await refreshAll()
    alert('สร้างคิว ' + qid + ' เรียบร้อย')
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

const FACULTIES_LIST = [
  'คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ', 'คณะทันตแพทยศาสตร์', 'คณะเทคโนโลยีสารสนเทศและการสื่อสาร',
  'คณะนิติศาสตร์', 'คณะบริหารธุรกิจและนิเทศศาสตร์', 'คณะพยาบาลศาสตร์', 'คณะแพทยศาสตร์',
  'คณะเภสัชศาสตร์', 'คณะพลังงานและสิ่งแวดล้อม', 'คณะวิทยาศาสตร์', 'คณะวิทยาศาสตร์การแพทย์',
  'คณะวิศวกรรมศาสตร์', 'คณะศิลปศาสตร์', 'คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์',
  'คณะสหเวชศาสตร์', 'คณะสาธารณสุขศาสตร์', 'คณะรัฐศาสตร์และสังคมศาสตร์', 'วิทยาลัยการศึกษา', 'โรงเรียนสาธิตฯ'
]

const isFacultyDropdownOpen = ref(false)

const filteredFaculties = computed(() => {
  const query = formFaculty.value ? formFaculty.value.trim().toLowerCase() : ''
  if (!query) return FACULTIES_LIST
  return FACULTIES_LIST.filter(fac => fac.toLowerCase().includes(query))
})

const isFacultyValid = computed(() => {
  if (formRole.value === 'นักเรียน') return true
  if (!formFaculty.value) return false
  const trimmed = formFaculty.value.trim()
  return FACULTIES_LIST.includes(trimmed) || trimmed.length >= 3
})

const onRoleChange = () => {
  if (formRole.value === 'นักเรียน') {
    formFaculty.value = 'โรงเรียนสาธิตฯ'
    isFacultyDropdownOpen.value = false
  } else if (formFaculty.value === 'โรงเรียนสาธิตฯ') {
    formFaculty.value = ''
  }
}

const selectFaculty = (fac) => {
  formFaculty.value = fac
  isFacultyDropdownOpen.value = false
}

const closeDropdownDelay = () => {
  setTimeout(() => {
    isFacultyDropdownOpen.value = false
  }, 200) 
}

let audioCtx = null
let alarmInterval = null

const triggerVibration = () => { if ('vibrate' in navigator) navigator.vibrate([500, 250, 500]) }
const stopVibration = () => { if ('vibrate' in navigator) navigator.vibrate(0) }
const unlockAudioContext = () => { /* ... (คงเดิม) ... */ }
const playBeepSound = () => { /* ... (คงเดิม) ... */ }

const startAlarm = () => {
  isAlerting.value = true
  playBeepSound()
  triggerVibration()
  if (!alarmInterval) {
    alarmInterval = setInterval(() => {
      playBeepSound(); triggerVibration()
    }, 1500)
  }
}
const stopAlarm = () => {
  isAlerting.value = false
  stopVibration()
  if (alarmInterval) { clearInterval(alarmInterval); alarmInterval = null }
}

onMounted(async () => {
  // 🚨 1. จัดการ Device ID เบ็ดเสร็จในเครื่อง (เลิกพึ่ง Firebase)
  let localId = localStorage.getItem('badminton_local_device_id')
  if (!localId) {
    localId = 'USR-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    localStorage.setItem('badminton_local_device_id', localId)
  }
  deviceId.value = localId

  // 🚨 2. โหลดโปรไฟล์เดิมจากฐานข้อมูล (ถ้ามี)
  try {
    const data = await userService.getProfile(deviceId.value)
    if (data) {
      userProfile.value = data
      playerName.value = data.nickname || data.name || ''
      tempName.value = playerName.value
      formRealName.value = data.real_name || data.realName || ''
      formRole.value = data.role || 'นิสิต'
      formFaculty.value = data.faculty || ''
      selectedAvatarId.value = data.avatar_id || data.avatarId || 'boy-cap'
      formSkillLevel.value = data.skill_level || data.skillLevel || 'BG'
      localStorage.setItem('badminton_user_profile', JSON.stringify(data))
    }
  } catch (err) {
    console.error("Error fetching user profile:", err)
  }

  // 3. โหลดข้อมูลสนามและคิว
  loadCourtsData()
  fetchActiveQueuesFromSupabase()

  // 4. จัดการ Realtime Channels
  queueChannel = supabase
    .channel('player:queues_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'queues' }, () => {
      fetchActiveQueuesFromSupabase()
    })
    .subscribe()

  queueMembersChannel = supabase
    .channel('player:queue_members_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'queue_members' }, () => {
      fetchActiveQueuesFromSupabase()
    })
    .subscribe()
  
  courtChannel = supabase
    .channel('player:courts_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'courts' }, () => {
      loadCourtsData()
    })
    .subscribe()

  // 5. Timer และ GPS
  countdownInterval = setInterval(() => { now.value = Date.now() }, 1000)
  requestLocation()
  gpsInterval = setInterval(() => { requestLocation() }, 30000)

  // 5.5 ค่ากรองพิกัด (ปุ่ม "ปิดกรองพิกัด") + ฟังการเปลี่ยนแบบ realtime
  loadGpsFilterSetting()
  settingsChannel = supabase
    .channel('admin:settings_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, () => {
      loadGpsFilterSetting()
    })
    .subscribe()

  // 6. Watchdog (แทน pg_cron ฟรี): ปลดคอร์ด CALLING ค้างเกิน 3 นาที
  //    เรียก self-heal ฝั่งเซิร์ฟเวอร์ทุก 30 วินาที (RPC ที่ grant ให้เรียกราคาฟรี)
  watchdogInterval = setInterval(() => { queueService.runCourtMaintenance() }, 30000)
})

onUnmounted(() => {
  if (gpsInterval) clearInterval(gpsInterval)
  if (watchdogInterval) clearInterval(watchdogInterval)
  if (alarmInterval) clearInterval(alarmInterval)
  if (countdownInterval) clearInterval(countdownInterval)
  if (audioCtx) audioCtx.close()
  stopVibration()
  if (queueChannel) supabase.removeChannel(queueChannel)
  if (courtChannel) supabase.removeChannel(courtChannel)
  if (queueMembersChannel) supabase.removeChannel(queueMembersChannel)
  if (settingsChannel) supabase.removeChannel(settingsChannel)
})

const isScrolled = ref(false)

const handleScroll = () => {
  if (window.scrollY > 60 && !isScrolled.value) {
    isScrolled.value = true
  } else if (window.scrollY < 10 && isScrolled.value) {
    isScrolled.value = false
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>
<style scoped>
/* ปุ่มแก้ไขโปรไฟล์ (ยุบตัวแนวตั้งอย่างเดียว) */
.smooth-collapse-enter-active,
.smooth-collapse-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
}
.smooth-collapse-enter-from,
.smooth-collapse-leave-to {
  max-height: 0 !important;
  opacity: 0 !important;
  margin-top: 0 !important;
  transform: scale(0.95) translateY(-5px);
}
.smooth-collapse-enter-to,
.smooth-collapse-leave-from {
  max-height: 30px;
  opacity: 1;
  margin-top: 6px; 
  transform: scale(1) translateY(0);
}
</style>

<style scoped>
.is-calling-card {
  border-color: #f59e0b !important;
}

.is-calling-card::after {
  content: '';
  position: absolute;
  top: -3px;
  left: -3px;
  right: -3px;
  bottom: -3px;
  border-radius: 1rem;
  border: 2px solid #f59e0b;
  pointer-events: none;
  animation: mobile-wave 1.5s infinite ease-out;
}

@keyframes mobile-wave {
  0% {
    transform: scale(1);
    opacity: 0.9;
  }
  100% {
    transform: scale(1.08, 1.05);
    opacity: 0;
  }
}
</style>