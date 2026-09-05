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

  <div v-else class="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6">

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
            <h3 class="text-lg font-black text-white">เพิ่มคิวกลุ่มใหม่ (โดยแอดมิน)</h3>
            <p class="text-xs text-slate-400">กรอกชื่อผู้เล่นอย่างน้อย 1 คน (สูงสุด 4 คน)</p>
          </div>

          <div class="space-y-3">
            <div class="flex items-center gap-3">
              <label class="text-xs font-bold text-slate-400 w-16">คนที่ 1:</label>
              <input v-model.trim="newGroup.p1" placeholder="ชื่อผู้เล่นคนที่ 1 (จำเป็น)" class="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500">
            </div>
            <div class="flex items-center gap-3">
              <label class="text-xs font-bold text-slate-400 w-16">คนที่ 2:</label>
              <input v-model.trim="newGroup.p2" placeholder="ชื่อผู้เล่นคนที่ 2 (ถ้ามี)" class="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500">
            </div>
            <div class="flex items-center gap-3">
              <label class="text-xs font-bold text-slate-400 w-16">คนที่ 3:</label>
              <input v-model.trim="newGroup.p3" placeholder="ชื่อผู้เล่นคนที่ 3 (ถ้ามี)" class="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500">
            </div>
            <div class="flex items-center gap-3">
              <label class="text-xs font-bold text-slate-400 w-16">คนที่ 4:</label>
              <input v-model.trim="newGroup.p4" placeholder="ชื่อผู้เล่นคนที่ 4 (ถ้ามี)" class="flex-1 bg-slate-950 border border-slate-700 p-3 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500">
            </div>
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

      <header class="bg-slate-900 border border-slate-800 pb-3 px-4 rounded-2xl flex justify-between items-center shadow-xl">
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
          <div class="flex justify-between items-center">
            <span class="text-xs text-slate-400 ml-1">แผงควบคุมระบบแอดมิน</span>
          </div>
        </div>
        <button @click="openSummaryReport" class="bg-slate-800 hover:bg-slate-700 text-xs px-3.5 py-2 rounded-xl transition font-bold text-emerald-400 border border-slate-700 flex items-center gap-1.5 shadow">
          สรุปยอดวันนี้
        </button>
      </header>

      <!-- แผงควบคุม 4 คอร์ด -->
      <section>
        <div class="flex justify-between items-center mb-3">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider">จัดการคอร์ด</h2>
          <button 
            @click="toggleAllCourts" 
            class="text-xs font-bold px-3 py-1.5 rounded-lg transition shadow-md flex items-center gap-1.5" 
            :class="areAllCourtsClosed ? 'bg-emerald-600 text-white hover:bg-emerald-500' : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white border border-rose-500/30'">
            <span>{{ areAllCourtsClosed ? 'เปิดทุกสนาม' : 'ปิดทุกสนาม (ล้างคิวทั้งหมด)' }}</span>
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
              <span class="font-black text-base text-white">คอร์ด {{ c.courtNumber }}</span>
              <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase"
                    :class="c.status === 'AVAILABLE' ? 'bg-slate-800 text-slate-400' : 
                            c.status === 'CALLING' ? 'bg-amber-500 text-slate-950' : 
                            c.status === 'CLOSED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'animate-pulse bg-emerald-500 text-slate-950'">
                {{ c.status === 'AVAILABLE' ? 'ว่าง' : c.status === 'CALLING' ? 'เรียกคิว' : c.status === 'CLOSED' ? 'คอร์ดปิด' : 'กำลังเล่น' }}
                <span v-if="c.status === 'CALLING'" class="tabular-nums font-mono min-w-[28px] text-right ml-1">
                  {{ getRemainingTime(c) }}s
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
              <div v-if="c.status === 'AVAILABLE'" class="col-span-2 text-center text-xs text-slate-500 py-2.5 bg-slate-950 rounded-xl border border-dashed border-slate-800">
                ระบบรอเรียกคิวอัตโนมัติ...
              </div>
              
              <template v-else-if="c.status === 'CALLING'">
                <button @click="startCourt(c.courtNumber)" class="col-span-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2.5 rounded-xl text-xs transition">
                  เริ่มเล่น
                </button>
                <button @click="holdCallingQueue(c.courtNumber)" class="col-span-2 bg-amber-600/20 hover:bg-amber-600 text-amber-400 hover:text-slate-950 border border-amber-500/30 font-bold py-2.5 rounded-xl text-xs transition">
                  ข้ามคิว
                </button>
              </template>

              <template v-else-if="c.status === 'IN_PROGRESS'">
                <button v-if="c.currentQueueId" 
                  @click="openSwapModal(c)"
                  class="col-span-2 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white rounded-xl text-xs font-semibold transition border border-slate-700 flex justify-center gap-1">
                  <span>สลับสนาม</span>
                </button>
                <button @click="finishCourt(c.courtNumber)" class="col-span-2 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs transition shadow-lg">
                  จบเกม 
                </button>
              </template>

              <button v-if="c.status === 'AVAILABLE' || c.status === 'CLOSED'" 
                @click="c.status === 'CLOSED' ? reopenCourt(c) : openCloseCourtModal(c)" 
                class="col-span-2 border font-bold py-2 rounded-xl text-xs transition mt-1 flex items-center justify-center gap-1.5"
                :class="c.status === 'CLOSED' ? 'border-emerald-500/50 text-emerald-400 hover:bg-emerald-900/30' : 'border-rose-500/50 text-rose-400 hover:bg-rose-900/30'">
                <span>{{ c.status === 'CLOSED' ? 'เปิดคอร์ด' : 'ปิดคอร์ด' }}</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- ตารางจัดการคิว -->
      <section class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <h2 class="text-base font-bold text-white">ตารางจัดการคิวทั้งหมด</h2>
          <button @click="openAddModal" :disabled="areAllCourtsClosed" class="bg-emerald-700 hover:bg-emerald-600 disabled:opacity-40 disabled:cursor-not-allowed text-white px-5 py-3 rounded-2xl text-xs font-bold shadow-lg transition">
            เพิ่มคิวกลุ่มใหม่
          </button>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th class="p-3 whitespace-nowrap w-16">ลำดับ</th>
                <th class="p-3 whitespace-nowrap">รหัสคิว</th>
                <th class="p-3 min-w-[280px]">รายชื่อผู้เล่น</th>
                <th class="p-3 text-center whitespace-nowrap">สถานะ</th>
                <th class="p-3 text-right whitespace-nowrap">การจัดการ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-if="queues.length === 0">
                <td colspan="5" class="p-8 text-center text-slate-500 font-medium">ยังไม่มีข้อมูลการ์ดคิวในระบบ</td>
              </tr>
              <tr v-for="(q, index) in queues" :key="q.id" class="hover:bg-slate-800/30 transition">
                <td class="p-3 font-bold text-slate-300">#{{ index + 1 }}</td>
                <td class="p-3 font-mono font-bold text-emerald-400">{{ q.id }}</td>
                <td class="p-3">
                  <div class="flex gap-1.5 flex-wrap items-center">
                    <span v-for="p in q.players" :key="p.deviceId" class="px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-200 text-[11px] flex items-center gap-1.5 shadow-sm">
                      <div class="w-3.5 h-3.5 shrink-0" v-html="getAvatarSvg(p.avatarId)"></div>
                      <span>{{ p.name }}</span>
                      <button v-if="(q.status === 'WAITING' || q.status === 'ON_HOLD') && !areAllCourtsClosed" @click="removePlayer(q.id, p.deviceId)" class="text-rose-400 hover:text-white hover:bg-rose-600 rounded-full w-4 h-4 flex items-center justify-center font-bold transition">×</button>
                    </span>
                    <div v-if="q.players.length < 4 && (q.status === 'WAITING' || q.status === 'ON_HOLD') && !areAllCourtsClosed" class="flex items-center gap-1">
                      <input v-model.trim="addPlayerInputs[q.id]" placeholder="ชื่อเพิ่ม..." class="bg-slate-950 border border-slate-700 text-white px-2 py-1.5 rounded text-[11px] w-24 focus:outline-none focus:border-emerald-500">
                      <button @click="adminAddPlayer(q.id)" class="bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 rounded text-[11px] font-bold shadow transition">
                        + เพิ่ม
                      </button>
                    </div>
                  </div>
                </td>
                <td class="p-3 text-center">
                  <span v-if="q.status === 'ASSIGNED'" class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap">
                    ลงคอร์ด {{ q.assignedCourt }}
                  </span>
                  <span v-else-if="q.status === 'SKIPPED'" class="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap">
                    สิทธิ์เรียกคิวแรก
                  </span>
                  <span v-else-if="q.status === 'ON_HOLD'" class="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap">
                    พักคิว
                  </span>
                  <span v-else class="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-[10px] inline-block whitespace-nowrap">
                    {{ q.players.length === 4 ? 'รอเรียก' : `รอคน (${q.players.length}/4)` }}
                  </span>
                </td>
                <td class="p-3 text-right">
                  <div class="flex justify-end gap-1.5" v-if="q.status !== 'ASSIGNED' && !areAllCourtsClosed">
                    <button v-if="q.status === 'ON_HOLD' || q.status === 'SKIPPED'" @click="updateQueueStatus(q.id, 'WAITING')" class="bg-blue-600/20 text-blue-400 hover:bg-blue-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition">
                      กลับเป็นปกติ
                    </button>
                    <button v-if="q.status === 'WAITING' && q.players.length === 4" @click="updateQueueStatus(q.id, 'SKIPPED')" class="bg-purple-600/20 text-purple-400 hover:bg-purple-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition">
                      ดันขึ้นก่อน
                    </button>
                    <button v-if="q.status === 'WAITING' || q.status === 'SKIPPED'" @click="updateQueueStatus(q.id, 'ON_HOLD')" class="bg-amber-500/20 text-amber-400 hover:bg-amber-500 hover:text-slate-950 px-2.5 py-1.5 rounded-lg font-bold transition">
                      ข้ามคิว
                    </button>
                    <button @click="deleteQueue(q.id)" class="bg-rose-600/20 text-rose-400 hover:bg-rose-600 hover:text-white px-2.5 py-1.5 rounded-lg font-bold transition">
                      ลบทิ้ง
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
          <span class="font-bold text-emerald-400 text-sm">คอร์ด {{ sourceCourt?.courtNumber }}</span>
          <span class="text-slate-400 ml-2">({{ sourceCourt?.currentQueueId || 'ไม่มีคิว' }})</span>
        </div>

        <div>
          <label class="block text-slate-400 mb-1.5 font-medium">ต้องการสลับกับสนามไหน?</label>
          <select v-model="targetCourtNumber" 
                  class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2.5 text-white font-medium focus:border-emerald-500 outline-none">
            <option v-for="c in courts.filter(c => c.courtNumber !== sourceCourt?.courtNumber && c.status !== 'CLOSED')" 
                    :key="c.courtNumber" 
                    :value="c.courtNumber">
              คอร์ด {{ c.courtNumber }} {{ c.currentQueueId ? `(กำลังแข่งขัน: ${c.currentQueueId})` : '(สนามว่าง)' }}
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

  <!-- Modal ระบุเหตุผลการปิดสนาม (ทีละสนาม) -->
  <div v-if="showCloseCourtModal" class="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 w-full max-w-md rounded-3xl p-6 space-y-5 shadow-2xl">
      <div class="flex items-center gap-3 text-rose-400 border-b border-slate-800 pb-3">
        <svg class="w-5 h-5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <h3 class="font-bold text-white text-base">คอร์ดปิด {{ targetCourtToClose?.courtNumber }}</h3>
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
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db } from '../firebase'
import { 
  collection, 
  onSnapshot, 
  doc, 
  setDoc, 
  updateDoc, 
  query, 
  where, 
  writeBatch,
  getDocs
} from 'firebase/firestore'
import { getAvatarSvg } from '../components/avatars'

const isExportingPdf = ref(false)

const exportReportToPdf = async () => {
  const element = document.getElementById('printable-summary-report')
  if (!element) return

  isExportingPdf.value = true
  try {
    const html2pdfModule = await import('html2pdf.js')
    const html2pdf = html2pdfModule.default || html2pdfModule

    const opt = {
      margin: [10, 10, 10, 10],
      filename: `รายงานสรุปผู้เข้าใช้บริการสนามแบดมินตัน_${currentReportDate.value}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, logging: false },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }

    await html2pdf().set(opt).from(element).save()
  } catch (err) {
    console.error('PDF Export Error:', err)
    alert('เกิดข้อผิดพลาดในการสร้างไฟล์ PDF')
  } finally {
    isExportingPdf.value = false
  }
}

const courts = ref([])
const queues = ref([])
const showAddModal = ref(false)
const newGroup = ref({ p1: '', p2: '', p3: '', p4: '' })
const addPlayerInputs = ref({})

const showSummaryModal = ref(false)
const currentReportDate = ref('')
const dailyCheckinRecords = ref([])
const dailyStats = ref({
  totalUsers: 0,
  byRole: { 'นิสิต': 0, 'บุคลากร': 0, 'นักเรียน': 0 },
  byFaculty: {}
})
let unsubCourts = null
let unsubQueues = null
let countdownTimer = null

const now = ref(Date.now())

const getRemainingTime = (court) => {
  if (!court || !court.statusUpdatedAt) return 180
  const elapsed = Math.floor((now.value - court.statusUpdatedAt) / 1000)
  return Math.max(0, 180 - elapsed)
}

const areAllCourtsClosed = computed(() => courts.value.length > 0 && courts.value.every(c => c.status === 'CLOSED'))

const getPlayerName = (queueId, slotIndex) => {
  if (!queueId) return '- ว่าง -'
  const matchQueue = queues.value.find(q => q.id === queueId)
  return (matchQueue && matchQueue.players[slotIndex]) ? matchQueue.players[slotIndex].name : '- ว่าง -'
}

const initializeCourtsIfNeeded = async () => {
  try {
    const snapshot = await getDocs(collection(db, 'courts'))
    if (snapshot.empty) {
      for (let i = 1; i <= 4; i++) {
        await setDoc(doc(db, 'courts', `court_${i}`), {
          courtNumber: i,
          status: 'AVAILABLE',
          currentQueueId: null,
          statusUpdatedAt: Date.now()
        })
      }
    }
  } catch (err) { }
}

const getTodayDateString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getFormattedTime = () => {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
}

const fetchAndCalculateDailySummary = async () => {
  const todayStr = getTodayDateString()
  currentReportDate.value = todayStr

  try {
    const qSnap = await getDocs(query(collection(db, 'daily_checkins'), where('date', '==', todayStr)))
    const records = []
    const roleCount = { 'นิสิต': 0, 'บุคลากร': 0, 'นักเรียน': 0 }
    const facCount = {}

    qSnap.forEach(docSnap => {
      const data = docSnap.data()
      records.push(data)
      const role = data.role || 'นิสิต'
      roleCount[role] = (roleCount[role] || 0) + 1
      if (data.faculty && data.faculty.trim() !== '') {
        const fac = data.faculty.trim()
        facCount[fac] = (facCount[fac] || 0) + 1
      }
    })

    dailyCheckinRecords.value = records
    dailyStats.value = {
      totalUsers: records.length,
      byRole: roleCount,
      byFaculty: facCount
    }
  } catch (err) {
    console.error("Error calculating summary:", err)
  }
}

const openSummaryReport = async () => {
  await fetchAndCalculateDailySummary()
  showSummaryModal.value = true
}

const toggleAllCourts = async () => {
  const targetStatus = areAllCourtsClosed.value ? 'AVAILABLE' : 'CLOSED'
  const confirmMsg = targetStatus === 'CLOSED' 
    ? 'คุณต้องการปิดสนามทั้งหมด และล้างคิวทั้งหมดใช่หรือไม่?' 
    : 'คุณต้องการเปิดสนามทั้งหมดใช่หรือไม่?'

  if (confirm(confirmMsg)) {
    const batch = writeBatch(db)

    courts.value.forEach(c => {
      const courtRef = doc(db, "courts", `court_${c.courtNumber}`)
      batch.update(courtRef, { 
        status: targetStatus, 
        currentQueueId: null, 
        statusUpdatedAt: Date.now() 
      })
    })

    if (targetStatus === 'CLOSED') {
      queues.value.forEach(q => {
        const queueRef = doc(db, "queues", q.id)
        batch.update(queueRef, { status: 'CANCELLED', assignedCourt: null })
      })

      const todayStr = getTodayDateString()
      const qSnap = await getDocs(query(collection(db, 'daily_checkins'), where('date', '==', todayStr)))
      const finalCheckoutTime = getFormattedTime()

      qSnap.forEach(docSnap => {
        const data = docSnap.data()
        if (!data.checkOutAt || data.status === 'INSIDE') {
          batch.update(docSnap.ref, {
            status: 'OUTSIDE',
            checkOutAt: finalCheckoutTime,
            lastActiveAt: Date.now()
          })
        }
      })
    }

    await batch.commit()

    if (targetStatus === 'CLOSED') {
      await fetchAndCalculateDailySummary()
      showSummaryModal.value = true
    }
  }
}

const showCloseCourtModal = ref(false)
const targetCourtToClose = ref(null)
const courtCloseReason = ref('')

const openCloseCourtModal = (court) => {
  targetCourtToClose.value = court
  courtCloseReason.value = ''
  showCloseCourtModal.value = true
}

const confirmCloseCourt = async () => {
  if (!targetCourtToClose.value) return
  if (!courtCloseReason.value.trim()) return alert('กรุณาระบุเหตุผลการปิดสนาม')
  
  const court = targetCourtToClose.value
  const docId = court.id || `court_${court.courtNumber}`

  try {
    if (court.currentQueueId) {
      await updateDoc(doc(db, "queues", court.currentQueueId), { 
        status: 'WAITING', 
        assignedCourt: null 
      })
    }

    const courtRef = doc(db, 'courts', docId)
    await updateDoc(courtRef, {
      status: 'CLOSED',
      isClosed: true,
      closeReason: courtCloseReason.value.trim(),
      currentQueueId: null,
      statusUpdatedAt: Date.now(),
      closedAt: Date.now()
    })

    showCloseCourtModal.value = false
    targetCourtToClose.value = null
    courtCloseReason.value = ''
  } catch (err) {
    console.error('Error closing court:', err)
    alert('เกิดข้อผิดพลาดในการปิดสนาม')
  }
}

const reopenCourt = async (court) => {
  try {
    const docId = typeof court === 'object' ? (court.id || `court_${court.courtNumber}`) : court
    const courtRef = doc(db, 'courts', docId)
    await updateDoc(courtRef, {
      status: 'AVAILABLE',
      isClosed: false,
      closeReason: null,
      currentQueueId: null,
      statusUpdatedAt: Date.now()
    })
  } catch (err) {
    console.error('Error reopening court:', err)
  }
}

const checkCallingTimeout = async () => {
  if (areAllCourtsClosed.value) return
  const nowTime = Date.now()
  const timeoutMs = 180 * 1000

  for (const c of courts.value) {
    if (c.status === 'CALLING' && c.currentQueueId && c.statusUpdatedAt) {
      if (nowTime - c.statusUpdatedAt >= timeoutMs) {
        try {
          await updateDoc(doc(db, "queues", c.currentQueueId), { 
            status: 'ON_HOLD', 
            assignedCourt: null 
          })
          await updateDoc(doc(db, "courts", `court_${c.courtNumber}`), {
            status: 'AVAILABLE',
            currentQueueId: null,
            statusUpdatedAt: Date.now()
          })
        } catch (err) {
          console.error("Auto-timeout skip error:", err)
        }
      }
    }
  }
}

let isAssigning = false

const checkAndAutoAssignCourts = async () => {
  if (areAllCourtsClosed.value || isAssigning) return

  const availableCourts = courts.value
    .filter(c => c.status === 'AVAILABLE')
    .sort((a, b) => a.courtNumber - b.courtNumber)

  if (availableCourts.length === 0) return

  const occupiedQueueIds = new Set()
  courts.value.forEach(c => {
    if (c.currentQueueId) occupiedQueueIds.add(c.currentQueueId)
  })
  queues.value.forEach(q => {
    if (q.status === 'ASSIGNED' || q.assignedCourt) occupiedQueueIds.add(q.id)
  })

  const eligibleQueues = queues.value.filter(q => 
    q.players && 
    q.players.length === 4 && 
    (q.status === 'WAITING' || q.status === 'SKIPPED') &&
    !occupiedQueueIds.has(q.id)
  )

  if (eligibleQueues.length === 0) return

  isAssigning = true
  try {
    const limit = Math.min(availableCourts.length, eligibleQueues.length)
    const batch = writeBatch(db)

    for (let i = 0; i < limit; i++) {
      const court = availableCourts[i]
      const queue = eligibleQueues[i]

      const queueRef = doc(db, "queues", queue.id)
      const courtRef = doc(db, "courts", `court_${court.courtNumber}`)

      batch.update(queueRef, {
        status: 'ASSIGNED',
        assignedCourt: court.courtNumber,
        nudgeAt: Date.now()
      })

      batch.update(courtRef, {
        status: 'CALLING',
        currentQueueId: queue.id,
        statusUpdatedAt: Date.now()
      })

      occupiedQueueIds.add(queue.id)
    }

    await batch.commit()
  } catch (err) {
    console.error("Auto-assign batch error:", err)
  } finally {
    setTimeout(() => {
      isAssigning = false
    }, 500)
  }
}

const startCourt = async (courtNumber) => {
  await updateDoc(doc(db, "courts", `court_${courtNumber}`), { status: 'IN_PROGRESS', statusUpdatedAt: Date.now() })
}

const finishCourt = async (courtNumber) => {
  if (confirm('ยืนยันจบเกมและคืนสนามใช่หรือไม่?')) {
    const c = courts.value.find(c => c.courtNumber === courtNumber)
    if (c && c.currentQueueId) {
      await updateDoc(doc(db, "queues", c.currentQueueId), { 
        status: 'FINISHED', 
        assignedCourt: courtNumber,
        finishedAt: Date.now()
      })
    }
    await updateDoc(doc(db, "courts", `court_${courtNumber}`), { 
      status: 'AVAILABLE', 
      currentQueueId: null, 
      statusUpdatedAt: Date.now() 
    })
  }
}

const holdCallingQueue = async (courtNumber) => {
  if (confirm('กลุ่มนี้ไม่พร้อมลงสนาม ต้องการข้ามคิว (พักคิว) และคืนสนามให้คิวถัดไปใช่หรือไม่?')) {
    const c = courts.value.find(c => c.courtNumber === courtNumber)
    if (c && c.currentQueueId) {
      await updateDoc(doc(db, "queues", c.currentQueueId), { status: 'ON_HOLD', assignedCourt: null })
    }
    await updateDoc(doc(db, "courts", `court_${courtNumber}`), {
      status: 'AVAILABLE',
      currentQueueId: null,
      statusUpdatedAt: Date.now()
    })
  }
}

const openAddModal = () => {
  if (areAllCourtsClosed.value) return alert('สนามปิดให้บริการทั้งหมด ไม่สามารถเพิ่มคิวได้')
  newGroup.value = { p1: '', p2: '', p3: '', p4: '' }
  showAddModal.value = true
}

const adminCreateGroupQueue = async () => {
  if (areAllCourtsClosed.value) return alert('สนามปิดให้บริการทั้งหมด ไม่สามารถเพิ่มคิวได้')
  if (!newGroup.value || !newGroup.value.p1 || !newGroup.value.p1.trim()) return

  try {
    const newId = 'Q-' + Date.now().toString().slice(-4)
    const playersList = []
    const rawGroup = newGroup.value
    const slots = [rawGroup.p1, rawGroup.p2, rawGroup.p3, rawGroup.p4]

    slots.forEach((val, idx) => {
      if (val && typeof val === 'string' && val.trim() !== '') {
        playersList.push({
          name: val.trim(),
          deviceId: 'ADMIN-' + Math.random().toString(36).substr(2, 6) + '-' + (idx + 1),
          avatarId: 'boy-cap'
        })
      }
    })

    if (playersList.length === 0) return

    await setDoc(doc(db, "queues", newId), {
      id: newId,
      status: 'WAITING',
      players: playersList,
      createdAt: Date.now(),
      assignedCourt: null,
      nudgeAt: 0
    })

    showAddModal.value = false
    newGroup.value = { p1: '', p2: '', p3: '', p4: '' }
  } catch (err) { 
    alert("Error: " + err.message) 
  }
}

const adminAddPlayer = async (queueId) => {
  if (areAllCourtsClosed.value) return alert('สนามปิดให้บริการทั้งหมด ไม่สามารถเพิ่มสมาชิกได้')
  const pName = addPlayerInputs.value[queueId]
  if (!pName || !pName.trim()) return
  
  const targetQueue = queues.value.find(q => q.id === queueId)
  if (targetQueue && targetQueue.players.length < 4) {
    try {
      const updatedPlayers = [
        ...targetQueue.players, 
        { 
          name: pName.trim(), 
          deviceId: 'ADMIN-' + Math.random().toString(36).substr(2, 6),
          avatarId: 'boy-cap'
        }
      ]
      await updateDoc(doc(db, "queues", queueId), { players: updatedPlayers })
      addPlayerInputs.value[queueId] = ''
    } catch (err) { alert("Error: " + err.message) }
  }
}

const updateQueueStatus = async (queueId, newStatus) => {
  await updateDoc(doc(db, "queues", queueId), { status: newStatus })
}

const deleteQueue = async (queueId) => {
  if (confirm('ยืนยันการลบการ์ดคิวนี้ทิ้งใช่หรือไม่?')) await updateDoc(doc(db, "queues", queueId), { status: 'CANCELLED' })
}

const removePlayer = async (queueId, deviceId) => {
  if (confirm('ต้องการลบผู้เล่นคนนี้ออกจากคิวใช่หรือไม่?')) {
    const q = queues.value.find(q => q.id === queueId)
    if (q) {
      const updatedPlayers = q.players.filter(p => p.deviceId !== deviceId)
      await updateDoc(doc(db, "queues", queueId), { players: updatedPlayers })
    }
  }
}

// Variables related to Swap Modal
const showSwapModal = ref(false)
const sourceCourt = ref(null)
const targetCourtNumber = ref('')
const isSwapping = ref(false)

const openSwapModal = (court) => {
  sourceCourt.value = court
  targetCourtNumber.value = ''
  showSwapModal.value = true
}

const handleConfirmSwap = async () => {
  if (!sourceCourt.value || !targetCourtNumber.value) return
  isSwapping.value = true

  try {
    const targetCourt = courts.value.find(c => c.courtNumber === targetCourtNumber.value)
    const sourceQueueId = sourceCourt.value.currentQueueId
    const targetQueueId = targetCourt.currentQueueId

    const batch = writeBatch(db)

    // สลับคิวในสนาม
    batch.update(doc(db, "courts", `court_${sourceCourt.value.courtNumber}`), {
      currentQueueId: targetQueueId,
      status: targetCourt.status,
      statusUpdatedAt: Date.now()
    })

    batch.update(doc(db, "courts", `court_${targetCourt.courtNumber}`), {
      currentQueueId: sourceQueueId,
      status: sourceCourt.value.status,
      statusUpdatedAt: Date.now()
    })

    // อัปเดตคอร์ทที่คิวลงไว้
    if (sourceQueueId) {
      batch.update(doc(db, "queues", sourceQueueId), { assignedCourt: targetCourt.courtNumber })
    }
    if (targetQueueId) {
      batch.update(doc(db, "queues", targetQueueId), { assignedCourt: sourceCourt.value.courtNumber })
    }

    await batch.commit()
    showSwapModal.value = false
  } catch (error) {
    console.error("Error swapping courts:", error)
    alert("เกิดข้อผิดพลาดในการสลับสนาม")
  } finally {
    isSwapping.value = false
  }
}

onMounted(() => {
  initializeCourtsIfNeeded()

  unsubCourts = onSnapshot(collection(db, 'courts'), (snapshot) => {
    try {
      courts.value = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .sort((a, b) => (a.courtNumber || 0) - (b.courtNumber || 0))
      checkAndAutoAssignCourts()
    } catch (err) {
      console.error("Error rendering courts:", err)
    }
  }, (err) => console.error("Firebase Courts Error:", err))

  const todayQueuesQuery = query(
    collection(db, 'queues'),
    where('status', 'in', ['WAITING', 'SKIPPED', 'ON_HOLD', 'ASSIGNED'])
  )

  unsubQueues = onSnapshot(todayQueuesQuery, (snapshot) => {
    try {
      const activeList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

      activeList.sort((a, b) => {
        if (a.status === 'SKIPPED' && b.status !== 'SKIPPED') return -1
        if (b.status === 'SKIPPED' && a.status !== 'SKIPPED') return 1
        if (a.status === 'ON_HOLD' && b.status !== 'ON_HOLD') return 1
        if (b.status === 'ON_HOLD' && a.status !== 'ON_HOLD') return -1
        return (a.createdAt || 0) - (b.createdAt || 0)
      })
      queues.value = activeList

      checkAndAutoAssignCourts()
    } catch (err) {
      console.error("Error processing queues data:", err)
    }
  }, (err) => console.error("Firebase Queues Error:", err))

  countdownTimer = setInterval(() => {
    try {
      now.value = Date.now()
      checkCallingTimeout()
    } catch (err) {
      console.error("Error in countdown timer:", err)
    }
  }, 1000)
})

onUnmounted(() => {
  if (unsubCourts) unsubCourts()
  if (unsubQueues) unsubQueues()
  if (countdownTimer) clearInterval(countdownTimer)
})

const ADMIN_SECRET_PIN = 'd^Uf,bo9yo'
const isAdminAuthenticated = ref(sessionStorage.getItem('badminton_admin_auth') === 'true')
const inputPin = ref('')
const pinError = ref('')

const handleVerifyPin = () => {
  pinError.value = ''
  if (inputPin.value === ADMIN_SECRET_PIN) {
    isAdminAuthenticated.value = true
    sessionStorage.setItem('badminton_admin_auth', 'true')
    inputPin.value = ''
  } else {
    pinError.value = 'รหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
    inputPin.value = ''
  }
}

const handleAdminLogout = () => {
  sessionStorage.removeItem('badminton_admin_auth')
  isAdminAuthenticated.value = false
}
</script>

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