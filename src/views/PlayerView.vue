<template>
  <div class="max-w-4xl mx-auto space-y-6 pb-12 p-3 md:p-6 relative">
    
    <!-- แถบแจ้งเตือนเมื่ออยู่นอกพื้นที่ หรือยังไม่เปิด GPS -->
    <div v-if="gpsStatus === 'OUT_OF_RANGE' || gpsStatus === 'DENIED'" 
         class="border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-lg transition"
         :class="gpsStatus === 'OUT_OF_RANGE' ? 'bg-amber-950/40 border-amber-500/40 text-amber-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2 font-bold text-xs">
          <svg class="w-4 h-4 shrink-0 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ gpsStatus === 'OUT_OF_RANGE' ? 'โหมดดูข้อมูล: คุณอยู่นอกพื้นที่สนาม' : 'กรุณาเปิดการระบุตำแหน่ง (GPS)' }}</span>
        </div>
        <p class="text-[11px] text-slate-400">
          {{ gpsStatus === 'OUT_OF_RANGE' 
              ? `สามารถเช็กสถานะสนามและคิวได้ แต่ต้องอยู่ในระยะสนามจึงจะลงชื่อหรือจองคิวได้ (ห่าง ~${userDistance} ม.)` 
              : 'เปิดสิทธิ์ระบุตำแหน่งเพื่อปลดล็อกการสร้างและแจมคิว' }}
        </p>
      </div>

      <button @click="requestLocation" 
              :disabled="isCheckingGps"
              class="shrink-0 bg-slate-800 hover:bg-slate-700 active:scale-95 disabled:opacity-50 text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-700">
        <span :class="{'animate-spin': isCheckingGps}" class="inline-block">
          <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </span>
        <span>{{ isCheckingGps ? 'กำลังตรวจสอบ...' : 'อัปเดตตำแหน่ง' }}</span>
      </button>
    </div>

    <!-- แถบแจ้งเตือนเมื่อถึงคิวลงสนาม -->
    <div v-if="isAlerting" class="bg-amber-500 text-slate-950 p-4 rounded-2xl shadow-2xl border-2 border-amber-300 animate-bounce flex items-center justify-between">
      <div class="flex items-center gap-3">
        <span class="text-3xl animate-pulse">
          <svg class="w-5 h-5 text-emerald-400 stroke-current inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 2v4M12 18a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z"/>
            <path d="m9 6 3 8 3-8"/>
            <path d="m6 8 6 6 6-6"/>
          </svg>
        </span>
        <div>
          <h2 class="text-base font-black uppercase tracking-wide">ถึงคิวของคุณแล้ว!</h2>
          <p class="text-xs font-bold">
            {{ myActiveCourt ? 'กรุณาลงสนาม คอร์ด ' + myActiveCourt + ' ภายใน 3 นาที' : 'แอดมินกำลังเรียกคิวของคุณ' }}
          </p>
        </div>
      </div>
      <button @click="stopAlarm" class="bg-slate-950 hover:bg-slate-900 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition">
        รับทราบ 
      </button>
    </div>

    <!-- Header -->
    <div class="gap-3 flex flex-col sticky top-0 z-50">
      <!-- แถบเมื่อสนามทั้งหมดถูกปิด -->
      <div v-if="areAllCourtsClosed" class="bg-rose-950/80 border border-rose-600/50 p-4 rounded-2xl text-center space-y-1 z-30 shadow-xl">
        <p class="text-rose-300 font-black sticky text-sm">ขณะนี้สนามปิดให้บริการทั้งหมด</p>
        <p class="text-xs text-slate-400">ระบบปิดรับการจองและการลงชื่อชั่วคราว กรุณารอเจ้าหน้าที่เปิดสนาม</p>
      </div>

      <header class="bg-slate-900 border border-slate-800 py-2 px-4 rounded-2xl flex justify-between items-center sticky top-0 z-30 shadow-xl">
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
        </div>
        <div class="flex flex-col items-end gap-2"> 
          <p class="text-xs text-slate-400 mt-0.5">
            ผู้เล่น: <b class="text-white">{{ playerName || 'ยังไม่ได้ระบุ' }}</b>
            <span v-if="userProfile?.role" class="ml-1.5 text-[10px] bg-slate-800 text-emerald-400 px-2 py-0.5 rounded-full border border-slate-700">{{ userProfile.role }}</span>
          </p>
      
          <button v-if="playerName" @click="resetPlayer" 
                  class="flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-[11px] font-medium transition active:scale-95">
            <svg class="w-3.5 h-3.5 stroke-current text-emerald-400 group-hover:text-rose-400 transition" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>แก้ไขโปรไฟล์</span>
          </button>
        </div>
      </header>
    </div>

    <!-- ฟอร์มระบุข้อมูลก่อนเข้าใช้งานครั้งแรก -->
    <section v-if="!playerName || isEditingProfile" class="bg-slate-900 border border-slate-800 p-5 rounded-2xl space-y-4 shadow-xl">
      <div class="space-y-1">
        <h2 class="text-base font-bold text-white">
          {{ isEditingProfile ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'ลงทะเบียนข้อมูลผู้ใช้งาน' }}
        </h2>
        <p class="text-xs text-slate-400">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อใช้ระบุตัวตนและจัดเก็บสถิติการใช้งาน</p>
      </div>

      <div class="space-y-3 pt-1">
        <!-- ชื่อ-นามสกุล -->
        <div>
          <label class="text-xs font-bold text-slate-400 block mb-1">ชื่อ - นามสกุล *</label>
          <input v-model.trim="formRealName" 
                placeholder="เช่น โทนี่ สตาร์ก" 
                class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm">
        </div>

        <!-- ชื่อเล่น -->
        <div>
          <label class="text-xs font-bold text-slate-400 block mb-1">ชื่อเล่น (ใช้เพื่อลงคิว) *</label>
          <input v-model.trim="tempName" 
                placeholder="เช่น ตู่, ป้อม, ศรีนวล" 
                class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm">
        </div>

        <!-- ประเภทผู้ใช้งาน -->
        <div>
          <label class="text-xs font-bold text-slate-400 block mb-1">ประเภทผู้ใช้งาน *</label>
          <select v-model="formRole" @change="onRoleChange" class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm">
            <option value="นิสิต">นิสิต</option>
            <option value="บุคลากร">บุคลากร</option>
            <option value="นักเรียน">นักเรียน</option>
          </select>
        </div>

        <!-- ช่องค้นหาและเลือกคณะ/สังกัด -->
        <div class="relative">
          <label class="text-xs font-bold text-slate-400 block mb-1">คณะฯ / หน่วยงานสังกัด *</label>
          <input v-model.trim="formFaculty" 
                @focus="isFacultyDropdownOpen = true"
                :disabled="formRole === 'นักเรียน'"
                :placeholder="formRole === 'นักเรียน' ? 'โรงเรียนสาธิตฯ' : 'พิมพ์เพื่อค้นหาคณะฯ/สังกัด...'" 
                class="w-full bg-slate-950 border border-slate-700 p-3 rounded-xl text-white focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-60 disabled:cursor-not-allowed">
          
          <!-- Dropdown รายการคณะ -->
          <div v-if="isFacultyDropdownOpen && formRole !== 'นักเรียน'" 
              class="absolute left-0 right-0 top-full mt-1.5 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-800">
            <div v-if="filteredFaculties.length === 0" class="p-3 text-xs text-slate-500 text-center">
              ไม่พบคณะที่ค้นหา
            </div>
            <div v-for="fac in filteredFaculties" :key="fac" 
                @click="selectFaculty(fac)" 
                class="p-3 text-xs text-slate-200 hover:bg-emerald-600/20 hover:text-emerald-300 cursor-pointer transition">
              {{ fac }}
            </div>
          </div>
        </div>

        <!-- กล่องเลือกอวาตาร -->
        <div class="space-y-2 pt-1">
          <label class="text-xs font-bold text-slate-400 block">เลือกอวาตาร</label>
          <div class="grid grid-cols-6 gap-2">
            <button 
              type="button"
              v-for="item in AVATAR_PRESETS" 
              :key="item.id"
              @click="selectedAvatarId = item.id"
              class="p-2.5 rounded-xl border bg-slate-950 flex items-center justify-center transition active:scale-90"
              :class="selectedAvatarId === item.id ? 'border-emerald-500 ring-2 ring-emerald-500/40 bg-emerald-950/20' : 'border-slate-800 hover:border-slate-700'"
            >
              <div class="w-6 h-6" v-html="item.svg"></div>
            </button>
          </div>
        </div>

        <!-- แผงปุ่มกดยืนยัน / ยกเลิก -->
        <div class="flex gap-2 pt-2">
          <button v-if="isEditingProfile" 
                  type="button"
                  @click="isEditingProfile = false" 
                  class="w-1/3 bg-slate-800 hover:bg-slate-700 font-bold py-3.5 rounded-xl text-sm transition text-slate-300">
            ยกเลิก
          </button>
          <button @click="saveName" 
                  :disabled="!tempName || !formRealName || !formFaculty || !isFacultyValid" 
                  class="flex-1 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 font-bold py-3.5 rounded-xl text-sm transition shadow-lg text-white">
            {{ isEditingProfile ? 'บันทึกการแก้ไข' : 'บันทึกและเข้าสู่ระบบคิว' }}
          </button>
        </div>
      </div>
    </section>

    <!-- หน้าต่างหลักเมื่อระบุชื่อแล้ว -->
    <div v-else-if="playerName && !isEditingProfile" class="space-y-6">
      <!-- 1. สถานะ 4 คอร์ด -->
      <section>
        <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">สถานะสนามปัจจุบัน</h2>
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="c in courts" :key="c.courtNumber" 
            class="bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between shadow-lg transition relative"
            :class="{
              'is-calling-card': c.status === 'CALLING' || myActiveCourt === c.courtNumber,
              'border-rose-900/60 opacity-80': c.status === 'CLOSED',
              'border-slate-800': c.status !== 'CLOSED' && c.status !== 'CALLING' && myActiveCourt !== c.courtNumber
            }">
            
            <div class="flex justify-between items-center mb-2">
              <span class="font-black text-base text-white">คอร์ด {{ c.courtNumber }}</span>
              <div class="flex items-center">
                <span class="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase"
                      :class="c.status === 'AVAILABLE' ? 'bg-slate-800 text-slate-400' : 
                              c.status === 'CALLING' ? 'bg-amber-500 text-slate-950' : 
                              c.status === 'CLOSED' ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'animate-pulse bg-emerald-500 text-slate-950'">
                  <span>{{ c.status === 'AVAILABLE' ? 'ว่าง' : c.status === 'CALLING' ? 'เรียกคิว' : c.status === 'CLOSED' ? 'คอร์ดปิด' : 'กำลังเล่น' }}</span>
                  <span v-if="c.status === 'CALLING'" class="tabular-nums font-mono min-w-[28px] text-right ml-1 font-black">
                    {{ getRemainingTime(c) }}s
                  </span>
                </span>
              </div>
            </div>

            <!-- กราฟิกสนาม -->
            <div :class="c.status === 'CLOSED' ? 'court-closed-bg border-2 border-slate-700' : 'court-bg border-2 border-emerald-600/60'"
                 class="rounded-xl h-52 p-1.5 relative flex flex-col justify-between overflow-hidden shadow-inner my-2">
              <div class="court-net"></div>
              
              <div class="grid grid-cols-2 gap-1.5 h-[calc(50%-4px)] z-10">
                <div class="bg-black/50 backdrop-blur border rounded-lg flex items-center justify-center p-2 text-center transition" :class="isMySlot(c, 0) ? 'border-amber-400 bg-amber-950/60 font-black text-amber-300' : 'border-white/10 text-white'">
                  <p class="text-sm md:text-base font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 0) }}</p>
                </div>
                <div class="bg-black/50 backdrop-blur border rounded-lg flex items-center justify-center p-2 text-center transition" :class="isMySlot(c, 1) ? 'border-amber-400 bg-amber-950/60 font-black text-amber-300' : 'border-white/10 text-white'">
                  <p class="text-sm md:text-base font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 1) }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-1.5 h-[calc(50%-4px)] z-10">
                <div class="bg-black/50 backdrop-blur border rounded-lg flex items-center justify-center p-2 text-center transition" :class="isMySlot(c, 2) ? 'border-amber-400 bg-amber-950/60 font-black text-amber-300' : 'border-white/10 text-white'">
                  <p class="text-sm md:text-base font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 2) }}</p>
                </div>
                <div class="bg-black/50 backdrop-blur border rounded-lg flex items-center justify-center p-2 text-center transition" :class="isMySlot(c, 3) ? 'border-amber-400 bg-amber-950/60 font-black text-amber-300' : 'border-white/10 text-white'">
                  <p class="text-sm md:text-base font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 3) }}</p>
                </div>
              </div>
            </div>

            <div class="mt-2 pt-2 border-t border-slate-800 text-xs">
              <div class="flex justify-between text-slate-400">
                <span>คิวปัจจุบัน:</span>
                <span class="text-white font-mono font-bold">{{ c.status === 'CLOSED' ? 'คอร์ดปิด' : (c.currentQueueId || '-') }}</span>
              </div>
              <p class="text-[11px] text-center mt-2" 
                 :class="c.status === 'AVAILABLE' ? 'text-slate-500 italic' : c.status === 'CLOSED' ? 'text-rose-400 font-semibold' : c.status === 'CALLING' ? 'text-amber-400 font-bold animate-pulse' : 'text-emerald-400 font-medium'">
                {{ 
                  c.status === 'AVAILABLE' ? 'พร้อมรับคิวถัดไป...' : 
                  c.status ===  'CLOSED' ? (c.closeReason ? `${c.closeReason}` : 'คอร์ดปิดให้บริการชั่วคราว') : 
                  c.status === 'CALLING' ? 'เรียกคิว' : 'กำลังแข่งขัน' 
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Tab Switcher -->
      <div class="flex gap-2 p-1.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-md sticky top-4 z-20">
        <button @click="activeTab = 'booking'" 
                :class="activeTab === 'booking' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'"
                class="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition flex justify-center items-center gap-1.5">
          <span>สร้างคิว/แจมคิว</span>
        </button>
        <button @click="activeTab = 'table'" 
                :class="activeTab === 'table' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'"
                class="flex-1 py-2.5 rounded-xl text-[13px] font-bold transition flex justify-center items-center gap-1.5">
          <span>เช็กลำดับคิว</span>
        </button>
      </div>

      <!-- 3. TAB 1: จอง/ลงชื่อเข้าคิว -->
      <div v-if="activeTab === 'booking'" class="space-y-6">
        <div>
          <button @click="handleCreateQueue" 
                  :disabled="loading || isUserInAnyQueue || areAllCourtsClosed || gpsStatus !== 'IN_RANGE'" 
                  class="w-full bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl shadow-xl flex items-center justify-center gap-2 text-sm transition">
            {{ areAllCourtsClosed ? 'สนามปิดให้บริการทั้งหมด' : isUserInAnyQueue ? 'คุณมีชื่ออยู่ในคิวแล้ว' : gpsStatus !== 'IN_RANGE' ? 'กรุณาอยู่ในระยะสนามเพื่อจองคิว' : 'สร้างการ์ดคิวใหม่' }}
          </button>
        </div>

        <section class="space-y-3">
          <h2 class="text-xs font-bold text-slate-400 uppercase tracking-wider">การ์ดคิวที่เปิดรับคนเพิ่ม</h2>
          
          <div v-if="queues.length === 0" class="text-center py-10 bg-slate-900/60 rounded-2xl border border-dashed border-slate-800 text-xs text-slate-500">
            {{ areAllCourtsClosed ? 'สนามปิดให้บริการทั้งหมด' : 'ยังไม่มีการ์ดคิวในระบบ กดปุ่ม "สร้างการ์ดคิวใหม่" ด้านบนเพื่อเริ่ม' }}
          </div>

          <div v-for="q in queues" :key="q.id" class="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3 shadow-md">
            <div class="flex justify-between items-center">
              <span class="font-mono font-bold text-sm text-white">{{ q.id }}</span>
              <span v-if="q.status === 'ASSIGNED'" class="text-[10px] bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 px-2.5 py-0.5 rounded-full font-bold animate-pulse">ลงคอร์ด {{ q.assignedCourt }}</span>
              <span v-else-if="q.status === 'SKIPPED'" class="text-[10px] bg-purple-500/20 border border-purple-500/40 text-purple-300 px-2.5 py-0.5 rounded-full font-bold">⚡ พร้อม (สิทธิ์ก่อน)</span>
              <span v-else-if="q.status === 'ON_HOLD'" class="text-[10px] bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded-full font-bold">พักคิวอยู่</span>
              <span v-else class="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-0.5 rounded-full">
                {{ q.players.length === 4 ? 'รอคอร์ดว่าง (ครบ 4 คน)' : `รอคนครบ (${q.players.length}/4)` }}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div v-for="p in q.players" :key="p.deviceId" 
                   class="p-2.5 rounded-xl text-xs flex items-center justify-between transition"
                   :class="p.deviceId === deviceId ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border border-slate-800 text-slate-200'">
                <div class="flex items-center gap-1.5 truncate">
                  <div class="w-4 h-4 shrink-0" v-html="getAvatarSvg(p.avatarId)"></div>
                  <span class="truncate">{{ p.name }} {{ p.deviceId === deviceId ? '(คุณ)' : '' }}</span>
                </div>
              </div>
              <button v-for="empty in (4 - q.players.length)" :key="empty" 
                @click="handleJoinQueue(q.id)"
                :disabled="loading || isUserInAnyQueue || areAllCourtsClosed || (gpsStatus !== 'IN_RANGE' && !DEV_BYPASS_GPS)"
                class="border border-dashed border-emerald-500/40 hover:border-emerald-400 bg-emerald-950/20 hover:bg-emerald-600/20 text-emerald-400 disabled:opacity-40 p-2.5 rounded-xl text-xs flex items-center justify-center font-bold transition active:scale-95">
                + ว่าง บวกเลย!
              </button>
            </div>

            <div class="pt-1" v-if="isPlayerInQueue(q) && (q.status === 'WAITING' || q.status === 'ON_HOLD' || q.status === 'SKIPPED')">
              <button @click="handleLeaveQueue(q.id)" 
                :disabled="loading"
                class="w-full bg-rose-600/20 hover:bg-rose-600 border border-rose-500/40 hover:border-rose-500 active:scale-[0.99] text-rose-300 hover:text-white font-bold py-2.5 rounded-xl text-xs transition shadow flex items-center justify-center gap-1.5">
                <span>✕</span> ออกจากการ์ดคิวนี้ (ยกเลิกสิทธิ์)
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- 4. TAB 2: ตารางลำดับคิวทั้งหมด -->
      <div v-if="activeTab === 'table'" class="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl space-y-4">
        <div class="flex flex-wrap justify-between items-center gap-3">
          <h2 class="text-base font-bold text-white flex items-center gap-2">
            ตารางลำดับคิวที่พร้อมลงสนาม
          </h2>
          <span class="bg-slate-800 text-emerald-400 border border-slate-700 text-xs px-3 py-2 rounded-xl font-bold shadow-inner">
            รอคิว: {{ fullQueues.length }} กลุ่ม
          </span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="border-b border-slate-800 text-slate-400 bg-slate-950/50">
                <th class="p-3 whitespace-nowrap w-16">ลำดับ</th>
                <th class="p-3 min-w-[200px]">ผู้เล่นในกลุ่ม</th>
                <th class="p-3 text-center whitespace-nowrap">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-800/60">
              <tr v-if="fullQueues.length === 0">
                <td colspan="3" class="p-6 text-center text-slate-500">
                  {{ areAllCourtsClosed ? 'สนามปิดให้บริการทั้งหมด' : 'ยังไม่มีคิวที่คนครบ 4 คน ในขณะนี้' }}
                </td>
              </tr>
              <tr v-for="(q, index) in fullQueues" :key="q.id" class="hover:bg-slate-800/30 transition">
                <td class="p-3 font-black text-slate-300">#{{ index + 1 }}</td>
                <td class="p-3">
                  <div class="flex gap-1.5 flex-wrap items-center">
                    <span v-for="p in q.players" :key="p.deviceId" 
                          class="px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 shadow-sm"
                          :class="p.deviceId === deviceId ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300 font-bold' : 'bg-slate-950 border border-slate-700 text-slate-200'">
                      <div class="w-3.5 h-3.5 shrink-0" v-html="getAvatarSvg(p.avatarId)"></div>
                      <span>{{ p.name }}</span>
                    </span>
                  </div>
                </td>
                <td class="p-3 text-center">
                  <span v-if="q.status === 'ASSIGNED'" class="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap shadow-sm">
                    ลงคอร์ด {{ q.assignedCourt }}
                  </span>
                  <span v-else-if="q.status === 'SKIPPED'" class="bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap shadow-sm">
                    ⚡ สิทธิ์เรียกคิวแรก
                  </span>
                  <span v-else-if="q.status === 'ON_HOLD'" class="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap shadow-sm opacity-75">
                    พักคิวอยู่
                  </span>
                  <span v-else class="bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full text-[10px] inline-block whitespace-nowrap border border-slate-700 shadow-sm">
                    รอคอร์ดว่าง
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { db, auth } from '../firebase'
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth'
import { collection, onSnapshot, doc, setDoc, updateDoc, getDoc, runTransaction, query, where } from 'firebase/firestore'
import { AVATAR_PRESETS, getAvatarSvg } from '../components/avatars'

const DEV_BYPASS_GPS = true // สำหรับทดสอบในเครื่อง ไม่ต้องเช็ค GPS
const VENUE_LAT = 19.033213
const VENUE_LNG = 99.885612
const MAX_DISTANCE_METERS = 60

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

let unsubCourts = null
let unsubQueues = null
let gpsInterval = null

const getRemainingTime = (court) => {
  if (!court || !court.statusUpdatedAt) return 180
  const elapsed = Math.floor((now.value - court.statusUpdatedAt) / 1000)
  return Math.max(0, 180 - elapsed)
}

const areAllCourtsClosed = computed(() => {
  return courts.value.length > 0 && courts.value.every(c => c.status === 'CLOSED')
})

const fullQueues = computed(() => {
  return queues.value.filter(q => q.players && q.players.length === 4)
})

const isUserInAnyQueue = computed(() => {
  if (!deviceId.value) return false
  return queues.value.some(q => 
    q.status !== 'CANCELLED' && 
    q.status !== 'FINISHED' && 
    q.players && q.players.some(p => p.deviceId === deviceId.value)
  )
})

const myActiveCourt = computed(() => {
  if (!deviceId.value) return null
  const callingCourt = courts.value.find(c => {
    if (c.status !== 'CALLING' && c.status !== 'IN_PROGRESS') return false
    const matchQ = queues.value.find(q => q.id === c.currentQueueId)
    return matchQ && matchQ.players && matchQ.players.some(p => p.deviceId === deviceId.value)
  })
  return callingCourt ? callingCourt.courtNumber : null
})

const isPlayerInQueue = (queue) => {
  return queue.players && queue.players.some(p => p.deviceId === deviceId.value)
}

const isMySlot = (court, slotIndex) => {
  if (!court.currentQueueId) return false
  const matchQueue = queues.value.find(q => q.id === court.currentQueueId)
  return matchQueue && matchQueue.players && matchQueue.players[slotIndex]?.deviceId === deviceId.value
}

const getPlayerName = (court, slotIndex) => {
  if (!court.currentQueueId) return '- ว่าง -'
  const matchQueue = queues.value.find(q => q.id === court.currentQueueId)
  return (matchQueue && matchQueue.players && matchQueue.players[slotIndex]) ? matchQueue.players[slotIndex].name : '- ว่าง -'
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

const getFormattedTime = () => {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
}

const getTodayDateString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const requestLocation = () => {
  if (DEV_BYPASS_GPS) {
    gpsStatus.value = 'IN_RANGE'
    userDistance.value = 0
    return
  }

  if (!navigator.geolocation) {
    gpsStatus.value = 'DENIED'
    return
  }

  isCheckingGps.value = true

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      isCheckingGps.value = false
      const lat = pos.coords.latitude
      const lng = pos.coords.longitude
      const dist = calculateDistance(lat, lng, VENUE_LAT, VENUE_LNG)
      userDistance.value = dist
      const newState = dist <= MAX_DISTANCE_METERS ? 'IN_RANGE' : 'OUT_OF_RANGE'
      gpsStatus.value = newState
      lastGpsState.value = newState
      // ลบคำสั่งซิงค์ขึ้น Firebase ทิ้งทั้งหมด เซฟได้มหาศาล
    },
    (err) => {
      isCheckingGps.value = false
      gpsStatus.value = 'DENIED'
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  )
}

const saveName = async () => {
  unlockAudioContext()
  if (!tempName.value || !formRealName.value || !formFaculty.value || !isFacultyValid.value) return
  if (!deviceId.value) return

  playerName.value = tempName.value

  const prof = {
    deviceId: deviceId.value,
    nickname: tempName.value,
    name: tempName.value,
    realName: formRealName.value,
    role: formRole.value,
    faculty: formFaculty.value,
    registeredAt: Date.now(),
    avatarId: selectedAvatarId.value
  }

  localStorage.setItem('badminton_user_profile', JSON.stringify(prof))
  localStorage.setItem('badminton_player_name', tempName.value)
  userProfile.value = prof

  const todayStr = getTodayDateString()
  const checkinDocId = `checkin_${todayStr}_${deviceId.value}`
  const checkinRef = doc(db, "daily_checkins", checkinDocId)
  const userRef = doc(db, "users", deviceId.value)

  try {
    await setDoc(userRef, prof, { merge: true })
    const snap = await getDoc(checkinRef)
    if (snap.exists()) {
      await updateDoc(checkinRef, {
        realName: prof.realName,
        nickname: prof.nickname,
        role: prof.role,
        faculty: prof.faculty,
        avatarId: prof.avatarId,
        lastActiveAt: Date.now()
      })
    } else {
      // เซฟ Check-in แค่ครั้งแรกครั้งเดียวของวัน เพื่อทำสถิติให้หน้าแอดมิน
      await setDoc(checkinRef, {
        deviceId: deviceId.value,
        realName: prof.realName,
        nickname: prof.nickname,
        role: prof.role,
        faculty: prof.faculty,
        avatarId: prof.avatarId,
        date: todayStr,
        checkInAt: getFormattedTime(),
        checkOutAt: null,
        status: gpsStatus.value === 'IN_RANGE' ? 'INSIDE' : 'OUTSIDE',
        lastActiveAt: Date.now()
      })
    }

    const activeQ = queues.value.find(q => 
      q.status !== 'CANCELLED' && 
      q.status !== 'FINISHED' && 
      q.players && q.players.some(p => p.deviceId === deviceId.value)
    )

    if (activeQ) {
      const updatedPlayers = activeQ.players.map(p => {
        if (p.deviceId === deviceId.value) {
          return { ...p, name: prof.nickname, avatarId: prof.avatarId }
        }
        return p
      })
      await updateDoc(doc(db, "queues", activeQ.id), { players: updatedPlayers })
    }
  } catch (err) {
    console.error("Error updating profile and queue:", err)
    alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง")
  }
  isEditingProfile.value = false
}

const resetPlayer = () => {
  if (confirm('คุณต้องการแก้ไขข้อมูลผู้ใช้งานใช่หรือไม่?')) {
    if (userProfile.value) {
      formRealName.value = userProfile.value.realName || ''
      tempName.value = userProfile.value.nickname || userProfile.value.name || ''
      formRole.value = userProfile.value.role || 'นิสิต'
      formFaculty.value = userProfile.value.faculty || ''
      selectedAvatarId.value = userProfile.value.avatarId || 'boy-cap'
    }
    isEditingProfile.value = true
  }
}

const handleCreateQueue = async () => {
  unlockAudioContext()
  if (areAllCourtsClosed.value || gpsStatus.value !== 'IN_RANGE' || isUserInAnyQueue.value) return
  loading.value = true

  const userFcmToken = localStorage.getItem('badminton_fcm_token') || null

  try {
    const newId = 'Q-' + Date.now().toString().slice(-4)
    await setDoc(doc(db, "queues", newId), {
      id: newId,
      status: 'WAITING',
      players: [{
        name: playerName.value,
        deviceId: deviceId.value,
        avatarId: userProfile.value?.avatarId || selectedAvatarId.value,
        fcmToken: userFcmToken
      }],
      createdAt: Date.now(),
      assignedCourt: null,
      nudgeAt: 0
    })
  } catch (err) {
    alert("Error: " + err.message)
  } finally {
    loading.value = false
  }
}

const handleJoinQueue = async (queueId) => {
  unlockAudioContext()
  if (areAllCourtsClosed.value) return alert('สนามปิดให้บริการในขณะนี้')
  if (gpsStatus.value !== 'IN_RANGE') return alert('กรุณาอยู่ในระยะสนามเพื่อลงชื่อ')
  if (isUserInAnyQueue.value) return alert('คุณมีชื่ออยู่ในคิวแล้ว')

  loading.value = true
  const queueRef = doc(db, 'queues', queueId)
  const userFcmToken = localStorage.getItem('badminton_fcm_token') || null

  try {
    await runTransaction(db, async (transaction) => {
      const qDoc = await transaction.get(queueRef)
      if (!qDoc.exists()) throw new Error('ไม่พบข้อมูลการ์ดคิวนี้ในระบบ')

      const qData = qDoc.data()
      if (qData.status !== 'WAITING' && qData.status !== 'ON_HOLD') {
        throw new Error('คิวนี้ไม่เปิดรับผู้เล่นเพิ่มแล้ว')
      }

      const currentPlayers = qData.players || []
      if (currentPlayers.length >= 4) {
        throw new Error('คิวนี้เต็มแล้ว (ครบ 4 คนเรียบร้อย)')
      }

      if (currentPlayers.some(p => p.deviceId === deviceId.value)) {
        throw new Error('คุณอยู่ในคิวนี้อยู่แล้ว')
      }

      const updatedPlayers = [
        ...currentPlayers,
        {
          name: playerName.value,
          deviceId: deviceId.value,
          avatarId: userProfile.value?.avatarId || selectedAvatarId.value,
          fcmToken: userFcmToken
        }
      ]

      transaction.update(queueRef, { players: updatedPlayers })
    })
  } catch (err) {
    alert(err.message || 'ไม่สามารถเข้าร่วมคิวได้ กรุณาลองใหม่อีกครั้ง')
  } finally {
    loading.value = false
  }
}

const handleLeaveQueue = async (queueId) => {
  if (!confirm('ต้องการยกเลิกและออกจากคิวนี้ใช่หรือไม่?')) return

  loading.value = true
  const queueRef = doc(db, 'queues', queueId)

  try {
    await runTransaction(db, async (transaction) => {
      const qDoc = await transaction.get(queueRef)
      if (!qDoc.exists()) return

      const qData = qDoc.data()
      if (qData.status === 'ASSIGNED' || qData.status === 'IN_PROGRESS' || qData.assignedCourt) {
        throw new Error('ไม่สามารถออกจากคิวได้เนื่องจากกลุ่มของคุณถูกเรียกคิวหรือกำลังแข่งขันอยู่')
      }
      const currentPlayers = qData.players || []
      const updatedPlayers = currentPlayers.filter(p => p.deviceId !== deviceId.value)

      if (updatedPlayers.length === 0) {
        transaction.update(queueRef, { status: 'CANCELLED' })
      } else {
        transaction.update(queueRef, { players: updatedPlayers })
      }
    })
  } catch (err) {
    alert('เกิดข้อผิดพลาดในการออกจากคิว: ' + err.message)
  } finally {
    loading.value = false
  }
}

const FACULTIES_LIST = [
  'คณะเกษตรศาสตร์และทรัพยากรธรรมชาติ',
  'คณะทันตแพทยศาสตร์',
  'คณะเทคโนโลยีสารสนเทศและการสื่อสาร',
  'คณะนิติศาสตร์',
  'คณะบริหารธุรกิจและนิเทศศาสตร์',
  'คณะพยาบาลศาสตร์',
  'คณะแพทยศาสตร์',
  'คณะเภสัชศาสตร์',
  'คณะพลังงานและสิ่งแวดล้อม',
  'คณะวิทยาศาสตร์',
  'คณะวิทยาศาสตร์การแพทย์',
  'คณะวิศวกรรมศาสตร์',
  'คณะศิลปศาสตร์',
  'คณะสถาปัตยกรรมศาสตร์และศิลปกรรมศาสตร์',
  'คณะสหเวชศาสตร์',
  'คณะสาธารณสุขศาสตร์',
  'คณะรัฐศาสตร์และสังคมศาสตร์',
  'วิทยาลัยการศึกษา',
  'โรงเรียนสาธิตฯ'
]

const isFacultyDropdownOpen = ref(false)

const filteredFaculties = computed(() => {
  if (!formFaculty.value) return FACULTIES_LIST
  return FACULTIES_LIST.filter(fac => fac.includes(formFaculty.value.trim()))
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

let audioCtx = null
let alarmInterval = null

const triggerVibration = () => {
  if ('vibrate' in navigator) navigator.vibrate([500, 250, 500])
}

const stopVibration = () => {
  if ('vibrate' in navigator) navigator.vibrate(0)
}

const unlockAudioContext = () => {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (AudioContextClass) audioCtx = new AudioContextClass()
  }
  if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume()
}

const playBeepSound = () => {
  if (!audioCtx) return
  if (audioCtx.state === 'suspended') audioCtx.resume()

  const osc = audioCtx.createOscillator()
  const gain = audioCtx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(880, audioCtx.currentTime)
  osc.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.15)

  gain.gain.setValueAtTime(0.3, audioCtx.currentTime)
  gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3)

  osc.connect(gain)
  gain.connect(audioCtx.destination)

  osc.start()
  osc.stop(audioCtx.currentTime + 0.3)
}

const startAlarm = () => {
  isAlerting.value = true
  playBeepSound()
  triggerVibration()
  if (!alarmInterval) {
    alarmInterval = setInterval(() => {
      playBeepSound()
      triggerVibration()
    }, 1500)
  }
}

const stopAlarm = () => {
  isAlerting.value = false
  stopVibration()
  if (alarmInterval) {
    clearInterval(alarmInterval)
    alarmInterval = null
  }
}

onMounted(() => {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      deviceId.value = user.uid
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          const data = userDoc.data()
          userProfile.value = data
          playerName.value = data.nickname || data.name || ''
          tempName.value = playerName.value
          formRealName.value = data.realName || ''
          formRole.value = data.role || 'นิสิต'
          formFaculty.value = data.faculty || ''
          selectedAvatarId.value = data.avatarId || 'boy-cap'
        }
      } catch (err) {
        console.error("Error fetching user profile:", err)
      }
    } else {
      try {
        await signInAnonymously(auth)
      } catch (error) {
        console.error("Anonymous auth failed:", error)
      }
    }
  })

  const storedProfile = localStorage.getItem('badminton_user_profile')
  if (storedProfile) {
    try {
      userProfile.value = JSON.parse(storedProfile)
      playerName.value = userProfile.value.nickname || userProfile.value.name || ''
      tempName.value = playerName.value
      formRealName.value = userProfile.value.realName || ''
      formRole.value = userProfile.value.role || 'นิสิต'
      formFaculty.value = userProfile.value.faculty || ''
      selectedAvatarId.value = userProfile.value.avatarId || 'boy-cap'
    } catch (e) {
      console.error("Parse stored profile error:", e)
    }
  }

  const handleFirstInteraction = () => {
    unlockAudioContext()
    window.removeEventListener('click', handleFirstInteraction)
    window.removeEventListener('touchstart', handleFirstInteraction)
  }
  window.addEventListener('click', handleFirstInteraction)
  window.addEventListener('touchstart', handleFirstInteraction)

  unsubCourts = onSnapshot(collection(db, 'courts'), (snapshot) => {
    courts.value = snapshot.docs.map(doc => doc.data()).sort((a, b) => a.courtNumber - b.courtNumber)
    
    const activeCourt = courts.value.find(c => {
      if (c.status !== 'CALLING') return false
      const matchQ = queues.value.find(q => q.id === c.currentQueueId)
      return matchQ && matchQ.players && matchQ.players.some(p => p.deviceId === deviceId.value)
    })

    if (activeCourt) {
      if (!isAlerting.value) {
        startAlarm()
        triggerVibration()
      }
    } else {
      stopAlarm()
    }
  })

  // ✅ เปลี่ยนคำสั่ง Query เพื่อเซฟโควตา Read ไม่ดึงคิวจบแล้วมากวนใจ
  const activeQueuesQuery = query(
    collection(db, 'queues'),
    where('status', 'in', ['WAITING', 'SKIPPED', 'ON_HOLD', 'ASSIGNED'])
  )

  unsubQueues = onSnapshot(activeQueuesQuery, (snapshot) => {
    let allTodayDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    
    allTodayDocs.sort((a, b) => {
      if (a.status === 'SKIPPED' && b.status !== 'SKIPPED') return -1
      if (b.status === 'SKIPPED' && a.status !== 'SKIPPED') return 1
      if (a.status === 'ON_HOLD' && b.status !== 'ON_HOLD') return 1
      if (b.status === 'ON_HOLD' && a.status !== 'ON_HOLD') return -1
      return (a.createdAt || 0) - (b.createdAt || 0)
    })
    queues.value = allTodayDocs
  }, (err) => {
    console.error("Error fetching queues:", err)
  })

  countdownInterval = setInterval(() => {
    now.value = Date.now()
  }, 1000)

  requestLocation()
  
  // ลดความถี่ GPS ลงเพื่อเซฟแบตผู้ใช้ (ไม่มีผลต่อโควตาแล้วเพราะตัดอัปเดตลง Base ออก)
  gpsInterval = setInterval(() => {
    requestLocation()
  }, 30000) 
})

onUnmounted(() => {
  if (unsubCourts) unsubCourts()
  if (unsubQueues) unsubQueues()
  if (gpsInterval) clearInterval(gpsInterval)
  if (alarmInterval) clearInterval(alarmInterval)
  if (countdownInterval) clearInterval(countdownInterval)
  if (audioCtx) audioCtx.close()
  stopVibration()
})
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