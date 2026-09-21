<template>
  <div class="max-w-4xl bg-slate-50 dark:bg-slate-900 mx-auto space-y-6 pb-12 p-3 md:p-6 relative">
    
    <!-- แถบแจ้งเตือนเมื่ออยู่นอกพื้นที่ หรือยังไม่เปิด GPS -->
    <div v-if="(gpsStatus === 'OUT_OF_RANGE' || gpsStatus === 'DENIED') && !areAllCourtsClosed" 
     class="border p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 shadow-sm dark:shadow-lg transition-colors"
     :class="gpsStatus === 'OUT_OF_RANGE' ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-500/40 text-amber-800 dark:text-amber-300' : 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-500/40 text-rose-800 dark:text-rose-300'">
      <div class="space-y-0.5">
        <div class="flex items-center gap-2 font-bold text-xs">
          <svg class="w-4 h-4 shrink-0 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span>{{ gpsStatus === 'OUT_OF_RANGE' ? 'โหมดดูข้อมูล: คุณอยู่นอกพื้นที่สนาม' : 'กรุณาเปิดการระบุตำแหน่ง (GPS)' }}</span>
        </div>
        <p class="text-[11px] font-medium" :class="gpsStatus === 'OUT_OF_RANGE' ? 'text-amber-700/70 dark:text-amber-400/70' : 'text-rose-700/70 dark:text-rose-400/70'">
          {{ gpsStatus === 'OUT_OF_RANGE' 
              ? `สามารถเช็กสถานะสนามและคิวได้ แต่ต้องอยู่ในระยะสนามจึงจะลงชื่อหรือจองคิวได้ (ห่าง ~${userDistance} ม.)` 
              : 'เปิดสิทธิ์ระบุตำแหน่งเพื่อปลดล็อกการสร้างและแจมคิว' }}
        </p>
      </div>

      <button @click="requestLocation" 
              :disabled="isCheckingGps"
              class="shrink-0 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-95 disabled:opacity-50 text-slate-700 dark:text-white font-bold px-3.5 py-2 rounded-xl text-xs transition flex items-center gap-1.5 border border-slate-300 dark:border-slate-700 shadow-sm">
        <span :class="{'animate-spin': isCheckingGps}" class="inline-block">
          <svg class="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/>
            <path d="M3 3v5h5"/>
          </svg>
        </span>
        <span>{{ isCheckingGps ? 'กำลังตรวจสอบ...' : 'อัปเดตตำแหน่ง' }}</span>
      </button>
    </div>

    <!-- Header -->
    <div class="gap-3 flex flex-col sticky top-0 z-50">
      <!-- แถบเมื่อสนามทั้งหมดถูกปิด -->
      <div v-if="areAllCourtsClosed" class="bg-rose-50 dark:bg-rose-950/80 border border-rose-200 dark:border-rose-600/50 p-4 rounded-2xl text-center space-y-1 z-30 shadow-sm dark:shadow-xl transition-colors">
        <p class="text-rose-700 dark:text-rose-300 font-black sticky text-sm">ขณะนี้สนามปิดให้บริการทั้งหมด</p>
        <p class="text-xs text-rose-500 dark:text-slate-400 font-medium dark:font-normal">ระบบปิดรับการจอง เปิดรับอีกครั้งเวลา 16:00น.-22:00น. วันทำการ</p>
      </div>

      <header class="bg-white dark:bg-slate-900 py-2 px-4 rounded-2xl flex justify-between items-center sticky top-0 z-30 shadow-sm dark:shadow-xl border border-slate-200 dark:border-slate-800 transition-all duration-300 overflow-hidden">
        
        <!-- 1. ส่วนของ Logo (ใช้ flex-1 เพื่อให้ขยายเต็มพื้นที่ที่เหลือฝั่งซ้ายเสมอ) -->
        <div class="flex-1 min-w-[90px] pr-3 sm:pr-6 transition-all duration-300 ease-in-out flex items-center">
          <svg class="w-full max-w-[300px] h-auto block transition-all duration-300 origin-left" viewBox="-1 4 86 28" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                <stop offset="0%" stop-color="#78B6F4" stop-opacity="0.8"/>
                <stop offset="50%" stop-color="#78B6F4" stop-opacity="0.2"/>
                <stop offset="100%" stop-color="#78B6F4" stop-opacity="0"/>
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
        
        <!-- 2. ส่วนของข้อมูลผู้เล่น (ใช้ shrink-0 เพื่อรักษาขนาดตัวเองและผลักโลโก้ให้หดลงตอนเรียงแนวนอน) -->
        <div class="flex items-center justify-end gap-3 transition-all duration-300 shrink-0">
  
          <!-- กลุ่มข้อมูลผู้เล่น + อวาตาร์ -->
          <div class="relative flex border-l border-slate-200 dark:border-slate-700 transition-all duration-300 ease-in-out overflow-visible"
               :class="isScrolled ? 'h-[56px] pl-[76px] items-center delay-[150ms]' : 'h-[116px] pl-3 min-w-[120px] items-start delay-0'">
            
            <!-- รูปอวาตาร์: กดแล้วแก้ไขโปรไฟล์ได้ (ล็อคขนาด w-14 h-14 เท่าเดิมตลอดเวลา) -->
            <div v-if="playerName && userProfile?.avatarId" 
                 @click="resetPlayer" title="แก้ไขโปรไฟล์"
                 class="absolute w-14 h-14 p-1.5 transition-all duration-300 ease-in-out shrink-0 rounded-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center shadow-sm z-10 cursor-pointer hover:ring-2 hover:ring-emerald-400/60 hover:scale-105 active:scale-95"
                 :class="isScrolled ? 'top-0 left-3 translate-x-0 delay-[150ms]' : 'top-0 left-1/2 -translate-x-1/2 delay-0'">
              <div class="w-full h-full [&>svg]:w-full [&>svg]:h-full" v-html="getAvatarSvg(userProfile.avatarId)"></div>
            </div>

            <!-- ส่วนข้อความและปุ่ม -->
            <div class="flex flex-col w-full transition-all duration-300 ease-in-out"
                 :class="isScrolled ? 'pt-0 items-start delay-[150ms]' : 'pt-[64px] items-center delay-0'"> 
              
              <!-- แถวที่ 1: ชื่อ + เหรียญ + ป้ายประเภท (อยู่บรรทัดเดียวกันเสมอ และขนาดเท่าเดิมเป๊ะ) -->
              <div class="flex flex-wrap items-center gap-1.5 w-full transition-all duration-300"
                   :class="isScrolled ? 'justify-start delay-[150ms]' : 'justify-center delay-0'">
                
                <!-- ล็อคขนาดชื่อเป็น text-xs คงที่ -->
                <b class="text-slate-800 dark:text-white text-l leading-none whitespace-nowrap">
                   {{ playerName || 'ยังไม่ได้ระบุ' }}
                </b>
                
                <!-- ล็อคขนาดเหรียญเป็น h-5 w-5 คงที่ -->
              
                <span v-if="userProfile?.skillLevel" 
                      class="h-5 w-5 inline-flex items-center justify-center shrink-0 drop-shadow-sm" 
                      :title="`ระดับ: ${userProfile.skillLevel}`"
                      v-html="getSkillBadgeSvg(userProfile.skillLevel)">
                </span>

                <!-- ป้ายประเภทผู้ใช้ (แสดงอยู่บรรทัดนี้ตลอดไป ไม่ซ่อน และขนาดเท่าเดิม) -->
                <span v-if="userProfile?.role" 
                      class="inline-flex items-center h-5 text-[10px] bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 px-2 rounded-full border border-emerald-200 dark:border-slate-700 leading-none whitespace-nowrap">
                  {{ userProfile.role }}
                </span>
              </div>

              <!-- แถวที่ 2: ปุ่มแก้ไขโปรไฟล์ (มีแค่ปุ่มนี้ที่เฟดหายไป) -->
              <transition name="smooth-collapse">
                <button v-show="!isScrolled" v-if="playerName" @click="resetPlayer" 
                        class="flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-medium transition active:scale-95 hover:bg-slate-100 dark:hover:bg-slate-700 group w-fit mt-1.5">
                  <svg class="w-3.5 h-3.5 stroke-current text-emerald-500 dark:text-emerald-400 group-hover:text-emerald-600 dark:group-hover:text-rose-400 transition" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  <span>แก้ไขโปรไฟล์</span>
                </button>
              </transition>
              
            </div>
          </div>
        </div>
      </header>

      <!-- แถบแจ้งเตือนเมื่อถึงคิวลงสนาม -->
      <div v-if="isAlerting" class="bg-amber-400 dark:bg-amber-500 text-slate-900 dark:text-slate-950 p-4 mt-3 rounded-2xl shadow-xl dark:shadow-2xl border-2 border-amber-500 dark:border-amber-300 animate-[bounce_1s_infinite_reverse] flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-3xl animate-pulse">
            <svg class="w-5 h-5 text-slate-900 dark:text-emerald-400 stroke-current inline-block mr-1.5" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z"/>
              <path d="m9 6 3 8 3-8"/>
              <path d="m6 8 6 6 6-6"/>
            </svg>
          </span>
          <div class="sticky top-0 z-30">
            <h2 class="text-base font-black uppercase tracking-wide">ถึงคิวของคุณแล้ว!</h2>
            <p class="text-xs font-bold">
              {{ myActiveCourt ? 'กรุณาลงสนาม คอร์ต ' + myActiveCourt + ' ภายใน 3 นาที' : 'แอดมินกำลังเรียกคิวของคุณ' }}
            </p>
          </div>
        </div>
        <button @click="stopAlarm" class="bg-slate-900 dark:bg-slate-950 hover:bg-slate-800 dark:hover:bg-slate-900 text-white text-xs font-black px-4 py-2.5 rounded-xl shadow-lg transition">
          รับทราบ 
        </button>
      </div>
    </div>

    <!-- ฟอร์มระบุข้อมูลก่อนเข้าใช้งานครั้งแรก -->
    <section v-if="!playerName || isEditingProfile" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl space-y-4 shadow-sm dark:shadow-xl transition-colors">
      <div class="space-y-1">
        <h2 class="text-base font-bold text-slate-900 dark:text-white">
          {{ isEditingProfile ? 'แก้ไขข้อมูลผู้ใช้งาน' : 'ลงทะเบียนข้อมูลผู้ใช้งาน' }}
        </h2>
        <p class="text-xs text-slate-500 dark:text-slate-400">กรุณากรอกข้อมูลให้ครบถ้วนเพื่อใช้ระบุตัวตนและจัดเก็บสถิติการใช้งาน</p>
      </div>

      <!-- สถิติการเล่นของผู้ใช้ (แสดงเฉพาะเมื่อแก้ไขข้อมูลที่มีแอคเคาท์อยู่แล้ว) -->
      <div v-if="isEditingProfile && playerStats" class="grid grid-cols-2 gap-2 pt-1">
        <div class="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 text-center space-y-1">
          <span class="block text-[10px] font-bold text-slate-500 dark:text-slate-400">เล่นทั้งหมด</span>
          <span class="text-xl font-black text-slate-900 dark:text-white tabular-nums">{{ playerStats.plays }}</span>
          <span class="block text-[10px] font-bold text-slate-400 dark:text-slate-500">ครั้ง</span>
        </div>
        <div class="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 rounded-2xl p-3 text-center space-y-1">
          <span class="block text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">ชนะ</span>
          <span class="text-xl font-black text-emerald-600 dark:text-emerald-400 tabular-nums">{{ playerStats.wins }}</span>
          <span class="block text-[10px] font-bold text-emerald-600/80 dark:text-emerald-400/80">ครั้ง</span>
        </div>
      </div>

      <div class="space-y-3 pt-1">
        <!-- ชื่อ-นามสกุล -->
        <div>
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">ชื่อ - นามสกุล </label>
          <input v-model.trim="formRealName" 
                placeholder="เช่น โทนี่ สตาร์ก" 
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 dark:focus:ring-0 focus:ring-emerald-500 text-sm transition-colors">
        </div>

        <!-- ชื่อเล่น -->
        <div>
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">ชื่อเล่น</label>
          <input v-model.trim="tempName" 
                placeholder="เช่น ตู่, ป้อม, ศรีนวล" 
                class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 dark:focus:ring-0 focus:ring-emerald-500 text-sm transition-colors">
        </div>

        <!-- ประเภทผู้ใช้งาน -->
        <div>
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1 ">ประเภทผู้ใช้งาน </label>
          <select v-model="formRole" @change="onRoleChange" class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 focus:ring-1 dark:focus:ring-0 focus:ring-emerald-500 text-sm transition-colors">
            <option value="นิสิต">นิสิต</option>
            <option value="บุคลากร">บุคลากร</option>
            <option value="นักเรียน">นักเรียน</option>
          </select>
        </div>

        <!-- ช่องค้นหาและเลือกคณะ/สังกัด -->
        <div class="relative">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-1">คณะฯ / หน่วยงานสังกัด </label>
          
          <div class="relative">
            <input 
              :value="formFaculty" 
              @input="formFaculty = $event.target.value; isFacultyDropdownOpen = true"
              @focus="isFacultyDropdownOpen = true"
              @blur="closeDropdownDelay"
              :disabled="formRole === 'นักเรียน'"
              :placeholder="formRole === 'นักเรียน' ? 'โรงเรียนสาธิตฯ' : 'พิมพ์เพื่อค้นหาคณะฯ/สังกัด...'" 
              class="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-3 pr-10 rounded-xl text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 text-sm disabled:opacity-60 transition-colors"
            />

            <!-- ปุ่มลูกศร -->
            <button 
              v-if="formRole !== 'นักเรียน'"
              type="button"
              tabindex="-1"
              @click="isFacultyDropdownOpen = !isFacultyDropdownOpen"
              class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1">
              <svg class="w-4 h-4 transition-transform duration-200" :class="{'rotate-180': isFacultyDropdownOpen}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>

          <!-- แผ่นคลิกข้างนอกเพื่อปิด (ใส่ z-40) -->
          <div 
            v-if="isFacultyDropdownOpen && formRole !== 'นักเรียน'" 
            @click="isFacultyDropdownOpen = false" 
            class="fixed inset-0 z-40 bg-transparent">
          </div>

          <!-- กล่องรายการคณะฯ (ใส่ z-50 ลอยเหนือทุกอย่าง + ใช้ pointerdown.prevent) -->
          <div 
            v-if="isFacultyDropdownOpen && formRole !== 'นักเรียน'" 
            class="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-2xl max-h-56 overflow-y-auto z-50 divide-y divide-slate-100 dark:divide-slate-800 touch-pan-y">
            
            <div v-if="filteredFaculties.length === 0" class="p-3 text-xs text-slate-400 text-center">
              ไม่พบคณะที่ค้นหา
            </div>

            <!-- รายการตัวเลือกคณะฯ -->
            <div 
              v-for="fac in filteredFaculties" 
              :key="fac" 
              @click="selectFaculty(fac)"
              class="p-3 text-xs text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-emerald-600/20 active:bg-emerald-100 dark:active:bg-emerald-900/40 cursor-pointer select-none">
              {{ fac }}
            </div>
          </div>
        </div>
        <!-- ตัวเลือกระดับฝีมือผู้เล่น -->
        <div class="space-y-2 pt-1">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 block">
            ระดับฝีมือของผู้เล่น 
          </label>
          <div class="grid grid-cols-6 gap-2">
            <button 
              type="button"
              v-for="item in SKILL_LEVELS" 
              :key="item.id"
              @click="formSkillLevel = item.id"
              class="p-2.5 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition active:scale-95"
              :class="formSkillLevel === item.id 
                ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/40 ring-2 ring-emerald-500/30' 
                : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 dark:hover:border-slate-700'">
              
              <!-- ตราสัญลักษณ์ SVG -->
              <div class="w-8 h-8 flex items-center justify-center" v-html="getSkillBadgeSvg(item.id)"></div>
              <span class="text-[10px] text-slate-500 dark:text-slate-400 leading-none">{{ item.label }}</span>
            </button>
          </div>
        </div>

        <!-- กล่องเลือกอวาตาร -->
       <div class="space-y-2 pt-1">
          <label class="text-xs font-bold text-slate-600 dark:text-slate-400 block">เลือกอวาตาร</label>
          <div class="grid grid-cols-6 gap-2">
            <button 
              type="button"
              v-for="item in AVATAR_PRESETS" 
              :key="item.id"
              @click="selectedAvatarId = item.id"
              class="w-full aspect-square p-2 overflow-hidden rounded-full border bg-slate-50 dark:bg-slate-950 flex items-center justify-center transition active:scale-90"
              :class="selectedAvatarId === item.id ? 'border-emerald-500 bg-emerald-50/80 ring-2 ring-emerald-500/30 dark:ring-emerald-500/40 bg-emerald-50 dark:bg-emerald-950/20' : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100 dark:hover:bg-transparent'"
            >
              <!-- แก้ไขการแสดงผล SVG ให้ถูกต้อง -->
              <div class="w-full h-full [&>svg]:w-full [&>svg]:h-full" v-html="getAvatarSvg(item.id)"></div>
            </button>
          </div>
        </div>
      
        <!-- แผงปุ่มกดยืนยัน / ยกเลิก -->
        <div class="flex gap-2 pt-2">
          <button v-if="isEditingProfile" 
                  type="button"
                  @click="isEditingProfile = false" 
                  class="w-1/3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold py-3.5 rounded-xl text-sm transition text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            ยกเลิก
          </button>
          <button @click="saveName" 
                  :disabled="!tempName || !formRealName || !formFaculty || !isFacultyValid" 
                  class="flex-1 bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed font-bold py-3.5 rounded-xl text-sm transition shadow-md shadow-emerald-600/20 dark:shadow-lg text-white">
            {{ isEditingProfile ? 'บันทึกการแก้ไข' : 'บันทึกและเข้าสู่ระบบคิว' }}
          </button>
        </div>
      </div>
    </section>

    <!-- หน้าต่างหลักเมื่อระบุชื่อแล้ว -->
    <div v-else-if="playerName && !isEditingProfile" class="space-y-6">
      
      <!-- 1. สถานะ 4 คอร์ด -->
      <section>
        <div class="flex items-center justify-between mb-2 px-1">
          <!-- หัวข้อชิดซ้าย กึ่งกลางแนวตั้ง -->
          <h2 class="ml-1 text-base font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider leading-none">
            สถานะสนามปัจจุบัน
            <span class="normal-case text-[11px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-2 py-0.5 rounded-full font-bold ml-1">ผู้เล่นตอนนี้ {{ onSiteCount }} คน</span>
          </h2>

          <!-- ปุ่มสลับโหมดชิดขวา กึ่งกลางแนวตั้ง -->
          <button @click="toggleTheme" 
                  class="p-2 mr-2 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white border border-slate-200 dark:border-slate-700 transition active:scale-95 shadow-sm">
            <svg v-if="!isDarkMode" class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
            </svg>
            <svg v-else class="w-4 h-4 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="4"></circle>
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"></path>
            </svg>
          </button>
        </div>
        
        <div class="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div v-for="c in courts" :key="c.courtNumber" 
            class="bg-slate-200 dark:bg-slate-900 border rounded-2xl p-4 flex flex-col justify-between shadow-sm dark:shadow-lg transition-colors relative overflow-hidden"
            :class="{
              'is-calling-card': c.status === 'CALLING' || myActiveCourt === c.courtNumber,
              'border-rose-200 dark:border-rose-900/60 bg-rose-50/30 dark:bg-transparent opacity-80': c.status === 'CLOSED',
              'border-slate-200 dark:border-slate-800': c.status !== 'CLOSED' && c.status !== 'CALLING' && myActiveCourt !== c.courtNumber
            }">
            
            <div class="flex justify-between items-center mb-2">
              <span class="font-black text-base text-slate-800 dark:text-white">คอร์ต {{ c.courtNumber }}</span>
              <div class="flex items-center">
                <span class="inline-flex items-center text-[11px] px-2.5 py-0.5 rounded-full font-bold uppercase border"
                      :class="c.status === 'AVAILABLE' ? 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-transparent' : 
                              c.status === 'CALLING' ? 'bg-amber-100 dark:bg-amber-500 text-amber-700 dark:text-slate-950 border-amber-200 dark:border-transparent' : 
                              c.status === 'CLOSED' ? 'bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-300 border-rose-200 dark:border-rose-800' : 
                              'animate-pulse bg-emerald-100 dark:bg-emerald-500 text-emerald-700 dark:text-slate-950 border-emerald-200 dark:border-transparent'">
                  <span>{{ c.status === 'AVAILABLE' ? 'ว่าง' : c.status === 'CALLING' ? 'เรียกคิว' : c.status === 'CLOSED' ? 'คอร์ตปิด' : 'กำลังเล่น' }}</span>
                  <span v-if="c.status === 'CALLING'" class="tabular-nums font-mono min-w-[28px] text-right ml-1 font-black">
                    {{ getRemainingTime(c) }}s
                  </span>
                </span>
              </div>
            </div>

            <!-- กราฟิกสนาม -->
            <div :class="c.status === 'CLOSED' ? 'court-closed-bg border-2 border-slate-300 dark:border-slate-700' : 'court-bg border-2 border-emerald-500/40 dark:border-emerald-600/60'"
                 class="rounded-xl h-52 p-1.5 relative flex flex-col justify-between overflow-hidden shadow-inner my-2">
              <div class="court-net opacity-60 dark:opacity-100"></div>
              
              <div class="grid grid-cols-2 gap-1.5 h-[calc(50%-4px)] z-10">
                <div class="bg-black/50 text-white dark:bg-black/50 backdrop-blur-sm border rounded-lg flex items-center justify-center p-2 text-center transition" 
                     :class="isMySlot(c, 0) ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black ring-1 ring-amber-400 dark:ring-0' : 'border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white'">
                  <p class="text-sm md:text-base font-bold dark:font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 0) }}</p>
                </div>
                <div class="bg-black/50 text-white dark:bg-black/50 backdrop-blur-sm border rounded-lg flex items-center justify-center p-2 text-center transition" 
                     :class="isMySlot(c, 1) ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black ring-1 ring-amber-400 dark:ring-0' : 'border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white'">
                  <p class="text-sm md:text-base font-bold dark:font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 1) }}</p>
                </div>
              </div>
              
              <div class="grid grid-cols-2 gap-1.5 h-[calc(50%-4px)] z-10">
                <div class="bg-black/50 text-white dark:bg-black/50 backdrop-blur-sm border rounded-lg flex items-center justify-center p-2 text-center transition" 
                     :class="isMySlot(c, 2) ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black ring-1 ring-amber-400 dark:ring-0' : 'border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white'">
                  <p class="text-sm md:text-base font-bold dark:font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 2) }}</p>
                </div>
                <div class="bg-black/50 text-white dark:bg-black/50 backdrop-blur-sm border rounded-lg flex items-center justify-center p-2 text-center transition" 
                     :class="isMySlot(c, 3) ? 'border-amber-400 bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-black ring-1 ring-amber-400 dark:ring-0' : 'border-slate-200/50 dark:border-white/10 text-slate-800 dark:text-white'">
                  <p class="text-sm md:text-base font-bold dark:font-black truncate drop-shadow-sm tracking-wide">{{ c.status === 'CLOSED' ? '-' : getPlayerName(c, 3) }}</p>
                </div>
              </div>
            </div>

            <div class="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
              <div class="flex justify-between text-slate-500 dark:text-slate-400">
                <span>คิวปัจจุบัน:</span>
                <span class="text-slate-800 dark:text-white font-mono font-bold">{{ c.status === 'CLOSED' ? 'คอร์ตปิด' : (c.currentQueueId || '-') }}</span>
              </div>
              <p class="text-[11px] text-center mt-2" 
                 :class="c.status === 'AVAILABLE' ? 'text-slate-400 dark:text-slate-500 italic' : c.status === 'CLOSED' ? 'text-rose-500 dark:text-rose-400 font-semibold' : c.status === 'CALLING' ? 'text-amber-500 dark:text-amber-400 font-bold animate-pulse' : 'text-emerald-600 dark:text-emerald-400 font-semibold dark:font-medium'">
                {{ 
                  c.status === 'AVAILABLE' ? 'ว่าง' : 
                  c.status ===  'CLOSED' ? (c.closeReason ? `${c.closeReason}` : 'คอร์ตปิดให้บริการชั่วคราว') : 
                  c.status === 'CALLING' ? 'เรียกคิว' : ('กำลังแข่งขัน · ' + getPlayElapsed(c) + ' น.')
                }}
              </p>
            </div>
          </div>
        </div>
      </section>

      <!-- 2. Tab Switcher -->
      <div class="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm dark:shadow-md sticky top-4 z-20 transition-colors">
        <button @click="activeTab = 'booking'" 
                :class="activeTab === 'booking' ? 'bg-emerald-600 text-white shadow-md dark:shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'"
                class="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2">
          <svg class="w-4 h-4 shrink-0 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
          <span class="truncate">สร้าง/แจมคิว</span>
        </button>
        <button @click="activeTab = 'table'" 
                :class="activeTab === 'table' ? 'bg-emerald-600 text-white shadow-md dark:shadow-lg' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800'"
                class="flex-1 py-2.5 px-3 rounded-xl text-sm font-bold transition flex justify-center items-center gap-2">
          <svg class="w-4 h-4 shrink-0 stroke-current" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="10" y1="6" x2="21" y2="6"></line>
            <line x1="10" y1="12" x2="21" y2="12"></line>
            <line x1="10" y1="18" x2="21" y2="18"></line>
            <polyline points="4 6 6 6 4 10 6 10"></polyline>
            <path d="M4 14h2v2H4v-2z"></path>
            <path d="M4 18h2"></path>
          </svg>
          <span class="truncate">เช็กลำดับคิว</span>
        </button>
      </div>

      <!-- 3. TAB 1: จอง/ลงชื่อเข้าคิว -->
      <div v-if="activeTab === 'booking'" class="space-y-6">
        <div>
          <button @click="handleCreateQueue" 
                  :disabled="loading || isUserInAnyQueue || areAllCourtsClosed || gpsStatus !== 'IN_RANGE'" 
                  class="w-full bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-500 active:scale-[0.99] disabled:opacity-50 dark:disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-2xl shadow-md shadow-emerald-600/20 dark:shadow-xl flex items-center justify-center gap-2 text-sm transition">
            {{ areAllCourtsClosed ? 'สนามปิดให้บริการทั้งหมด' : isUserInAnyQueue ? 'คุณมีชื่ออยู่ในคิวแล้ว' : gpsStatus !== 'IN_RANGE' ? 'เอ๊ะ คุณไม่ได้อยู่สนาม' : '+ สร้างการ์ดคิวใหม่' }}
          </button>
        </div>

        <section class="space-y-3">
          <h2 class="text-sm ml-2 font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">การ์ดคิวปัจจุบัน</h2>
          
          <div v-if="queues.length === 0" class="text-center py-10 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-xs text-slate-500 font-medium dark:font-normal">
            {{ areAllCourtsClosed ? 'สนามปิดให้บริการทั้งหมด' : 'ยังไม่มีการ์ดคิวในระบบ กดปุ่ม "สร้างการ์ดคิวใหม่" ด้านบนเพื่อเริ่ม' }}
          </div>

          <div v-for="q in supabaseActiveQueues" :key="q.id" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl space-y-3 shadow-sm dark:shadow-md hover:border-slate-300 transition-colors">
            <div class="flex justify-between items-center">
              <span class="font-bold text-sm text-slate-800 dark:text-white">{{ queueService.getQueueDisplayName(q.id) }}</span>
              <span v-if="q.status === 'ASSIGNED' || q.status === 'IN_PROGRESS'" class="text-[10px] bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-200 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full font-bold animate-pulse">ลงคอร์ต {{ q.assigned_court }}</span>
              <span v-else-if="q.status === 'CALLING'" class="text-[10px] bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold animate-pulse">กำลังเรียก</span>
              <span v-else-if="q.status === 'SKIPPED'" class="text-[10px] bg-purple-50 dark:bg-purple-500/20 border border-purple-200 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full font-bold">⚡ พร้อม (สิทธิ์ก่อน)</span>
              <span v-else-if="q.status === 'ON_HOLD'" class="text-[10px] bg-amber-50 dark:bg-amber-500/20 border border-amber-200 dark:border-amber-500/40 text-amber-700 dark:text-amber-300 px-2.5 py-0.5 rounded-full font-bold">พักคิวอยู่</span>
              <span v-else class="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-transparent px-2.5 py-0.5 rounded-full font-medium dark:font-normal">
                {{ q.players.length === 4 ? getEstimatedWaitText(q) : `รอคนครบ (${q.players.length}/4)` }}
              </span>
            </div>

            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button v-for="p in q.players" :key="p.deviceId" 
                  @click="openPlayerInfo(p)"
                  class="p-2.5 rounded-xl text-sm flex items-center justify-between transition border text-left w-full cursor-pointer active:scale-[0.99]"
                  :class="p.deviceId === deviceId ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900'">
                <div class="flex items-center gap-1.5 truncate">
                  <div class="w-4 h-4 shrink-0" v-html="getAvatarSvg(p.avatarId)"></div>
                  <span class="truncate">{{ p.name }} {{ p.deviceId === deviceId ? '(คุณ)' : '' }}</span>
                </div>
                <!-- 🚨 เปลี่ยนจาก userProfile?.skillLevel เป็น p.skillLevel -->
                <span v-if="p.skillLevel" 
                      class="h-5 w-5 inline-flex items-center justify-center shrink-0 drop-shadow-sm" 
                      :title="`ระดับ: ${p.skillLevel}`"
                      v-html="getSkillBadgeSvg(p.skillLevel)">
                </span>
              </button>
              <template v-for="(empty, idx) in (4 - q.players.length)" :key="empty">
                <!-- ถ้าเป็นผู้สร้างการ์ด ให้แสดงปุ่มดึงเพื่อนเข้าคิว -->
                <button 
                  v-if="isQueueCreator(q)"
                  @click="openInviteModal(q.id)"
                  :disabled="loading || areAllCourtsClosed"
                  class="border border-dashed border-emerald-400 dark:border-emerald-500/50 bg-emerald-50/50 dark:bg-emerald-950/20 hover:bg-emerald-100 text-emerald-700 dark:text-emerald-400 p-2.5 rounded-xl text-xs flex items-center justify-center font-bold transition active:scale-95">
                  <span>+ ดึงเพื่อนเข้า</span>
                </button>

                <!-- ถ้าเป็นคนอื่น ให้แสดงปุ่มแจมตามปกติ -->
                <button 
                  v-else
                  @click="handleJoinQueue(q.id)"
                  :disabled="loading || isUserInAnyQueue || areAllCourtsClosed || (gpsStatus !== 'IN_RANGE' && !isGpsBypass())"
                  class="border border-dashed p-2.5 rounded-xl text-xs flex items-center justify-center font-bold transition active:scale-95"
                  :class="isUserInAnyQueue 
                    ? 'border-slate-200 dark:border-slate-800 bg-slate-100/50  text-slate-400 cursor-not-allowed' 
                    : 'border-emerald-300 bg-emerald-50 dark:bg-slate-950 hover:bg-emerald-100 text-emerald-600 dark:text-emerald-300 cursor-pointer'">
                  <span>{{ isUserInAnyQueue ? 'ติดคิวอยู่' : '+ ว่าง บวกเลย!' }}</span>
                </button>
              </template>
            </div>

            <div class="pt-1" v-if="isPlayerInQueue(q) && (q.status === 'WAITING' || q.status === 'ON_HOLD' || q.status === 'SKIPPED')">
              <button @click="handleLeaveQueue(q.id)" 
                :disabled="loading"
                class="w-full bg-rose-50 dark:bg-rose-600/20 hover:bg-rose-100 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-500/40 dark:hover:border-rose-500 text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-white font-bold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1.5 active:scale-[0.99] shadow-sm dark:shadow">
                <span>✕</span> ออกจากคิวนี้ 
              </button>
            </div>
          </div>
        </section>
      </div>

      <!-- 4. TAB 2: ตารางลำดับคิวทั้งหมด -->
      <div v-if="activeTab === 'table'" class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 sm:p-5 shadow-sm dark:shadow-xl space-y-4 transition-colors">
        <div class="flex flex-wrap justify-between items-center gap-3">
          <h2 class="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
            ตารางลำดับคิวที่พร้อมลงสนาม
          </h2>
          <span class="bg-emerald-50 dark:bg-slate-800 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-slate-700 text-xs px-3 py-2 rounded-xl font-bold dark:shadow-inner">
            รอคิว: {{ fullQueues.length }} กลุ่ม
          </span>
        </div>

        <div class="overflow-x-auto rounded-xl border border-slate-200 dark:border-transparent">
          <table class="w-full text-left text-xs border-collapse bg-white dark:bg-transparent">
            <thead>
              <tr class="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-950/50">
                <th class="p-3 whitespace-nowrap w-16 font-bold dark:font-normal">ลำดับ</th>
                <th class="p-3 min-w-[200px] font-bold dark:font-normal">ผู้เล่นในกลุ่ม</th>
                <th class="p-3 text-center whitespace-nowrap font-bold dark:font-normal">สถานะ</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/60">
              <tr v-if="fullQueues.length === 0">
                <td colspan="3" class="p-6 text-center text-slate-500 font-medium dark:font-normal bg-slate-50/50 dark:bg-transparent">
                  {{ areAllCourtsClosed ? 'สนามปิดให้บริการทั้งหมด' : 'ยังไม่มีคิวที่คนครบ 4 คน ในขณะนี้' }}
                </td>
              </tr>
              <tr v-for="(q, index) in fullQueues" :key="q.id" class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition">
                <td class="p-3 font-black text-slate-800 dark:text-slate-300">#{{ index + 1 }}</td>
                <td class="p-3">
                  <div class="flex gap-1.5 flex-wrap items-center">
                    <span v-for="p in q.players" :key="p.deviceId" 
                          class="px-2 py-1.5 rounded-lg text-[11px] flex items-center gap-1.5 border"
                          :class="p.deviceId === deviceId ? 'bg-emerald-50 dark:bg-emerald-950/80 border-emerald-400 dark:border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold shadow-sm' : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 shadow-sm'">
                      <div class="w-3.5 h-3.5 shrink-0" v-html="getAvatarSvg(p.avatarId)"></div>
                      <span>{{ p.name }}</span>
                    </span>
                  </div>
                </td>
                <td class="p-3 text-center">
                  <span v-if="q.status === 'ASSIGNED' || q.status === 'IN_PROGRESS'" class="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap shadow-sm">
                    ลงคอร์ต {{ q.assigned_court }}
                  </span>
                  <span v-else-if="q.status === 'CALLING'" class="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap shadow-sm">
                    กำลังเรียก
                  </span>
                  <span v-else-if="q.status === 'SKIPPED'" class="bg-purple-50 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap shadow-sm">
                    ⚡ สิทธิ์เรียกคิวแรก
                  </span>
                  <span v-else-if="q.status === 'ON_HOLD'" class="bg-amber-50 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/30 px-2.5 py-1 rounded-full text-[10px] font-bold inline-block whitespace-nowrap opacity-80 shadow-sm">
                    พักคิวอยู่
                  </span>
                  <span v-else class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full text-[10px] inline-block whitespace-nowrap border border-slate-200 dark:border-slate-700 font-medium dark:font-normal shadow-sm">
                    {{ q.players.length === 4 ? `รอเรียก${getEstimatedWaitTextShort(q)}` : `รอคน (${q.players.length}/4)` }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <!-- Modal เลือกผู้เล่นที่อยู่ในสนามเข้าคิว -->
<div v-if="showInviteModal" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-md rounded-3xl p-5 shadow-2xl space-y-4">
    <!-- กำลังโหลด -->
    <div v-if="isFetchingFriends" class="py-8 text-center text-xs text-slate-400">
      กำลังตรวจสอบรายชื่อผู้เล่นในสนาม...
    </div>

    <template v-else>
      <!-- ไม่มีใครว่าง -->
      <div v-if="availableFriends.length === 0" class="py-8 text-center text-xs text-slate-500">
        ไม่มีผู้เล่นอื่นที่ว่างอยู่ในสนามขณะนี้
      </div>

      <template v-else>
        <!-- ช่องค้นหาชื่อเพื่อน (กรองในเครื่อง ไม่ยิง query ใหม่) -->
        <div class="relative">
          <input
            v-model="inviteSearchKeyword"
            type="text"
            placeholder="ค้นหาชื่อเพื่อน / ชื่อเล่น / คณะ..."
            class="w-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-8 text-xs outline-none focus:ring-2 focus:ring-emerald-500/60 placeholder:italic placeholder:text-slate-400 dark:placeholder:text-slate-500"
          >
          <span v-if="inviteSearchKeyword" @click="inviteSearchKeyword = ''"
                class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 cursor-pointer text-xs font-bold">✕</span>
        </div>

        <!-- ไม่มีใครที่ตรงกับคำค้นหา -->
        <div v-if="filteredAvailableFriends.length === 0" class="py-8 text-center text-xs text-slate-500">
          ไม่มีชื่อที่ตรงกับ "{{ inviteSearchKeyword }}"
        </div>

        <!-- รายชื่อผู้เล่นที่เลือกได้ (กรองตามคำค้นหา) -->
        <div v-else class="max-h-60 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
          <div v-for="friend in filteredAvailableFriends" :key="friend.device_id" 
               class="flex items-center justify-between pt-2">
            <div>
              <p class="text-xs font-bold text-slate-800 dark:text-white">{{ friend.nickname }}</p>
              <span class="text-[10px] text-slate-500">{{ friend.role }} · {{ friend.faculty || '-' }}</span>
            </div>
            <button 
              @click="inviteFriendToQueue(friend.device_id)"
              :disabled="loading"
              class="bg-emerald-600 hover:bg-emerald-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs transition active:scale-95 shadow">
              เลือกเข้าคิว
            </button>
          </div>
        </div>
      </template>
    </template>

    <div class="pt-2 flex justify-end">
      <button @click="showInviteModal = false" class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs">
        ปิด
      </button>
    </div>
  </div>
</div>
<!-- Modal ดูข้อมูลผู้เล่น (แตะชื่อ/อวาตาร์ในการ์ดคิว) -->
<div v-if="showPlayerInfoModal && playerInfoTarget" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
  <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 w-full max-w-sm rounded-3xl p-5 shadow-2xl space-y-4">
    <div class="text-center space-y-3">
      <div class="mx-auto w-20 h-20 rounded-full bg-gradient-to-b from-emerald-50 to-emerald-100 dark:from-slate-800 dark:to-slate-700 p-2 border border-slate-200 dark:border-slate-700 shadow-inner">
        <div class="w-full h-full [&>svg]:w-full [&>svg]:h-full" v-html="getAvatarSvg(playerInfoTarget.avatarId)"></div>
      </div>
      <div>
        <p class="text-base font-bold text-slate-900 dark:text-white">{{ playerInfoTarget.name }}</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{{ playerInfoTarget.deviceId === deviceId ? 'คุณ' : 'ผู้เล่นในคิว' }}</p>
      </div>
    </div>

    <div class="space-y-2">
      <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
        <span class="text-xs text-slate-500 dark:text-slate-400">ประเภท</span>
        <span class="text-xs font-bold text-slate-800 dark:text-white">{{ playerInfoTarget.role || 'นิสิต' }}</span>
      </div>
      <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
        <span class="text-xs text-slate-500 dark:text-slate-400">คณะ</span>
        <span class="text-xs font-bold text-slate-800 dark:text-white">{{ playerInfoTarget.faculty || '-' }}</span>
      </div>
      <div class="flex items-center justify-between bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5">
        <span class="text-xs text-slate-500 dark:text-slate-400">ระดับฝีมือ</span>
        <span class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-white">
          <span v-if="playerInfoTarget.skillLevel" class="h-5 w-5 inline-flex items-center justify-center shrink-0 drop-shadow-sm" v-html="getSkillBadgeSvg(playerInfoTarget.skillLevel)"></span>
          {{ getPlayerSkillLabel(playerInfoTarget.skillLevel) }}
        </span>
      </div>
    </div>

    <div class="pt-1 flex justify-end">
      <button @click="showPlayerInfoModal = false" class="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold px-4 py-2 rounded-xl text-xs">
        ปิด
      </button>
    </div>
  </div>
</div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
// 🚨 ถอด Firebase Auth ออก (ตัดตัวต้นเหตุ "ข้อมูลชนกัน") ใช้ device_id จาก localStorage เป็นตัวตนเดียว
import { supabase } from '../supabase'
import { AVATAR_PRESETS, getAvatarSvg } from '../components/avatars'
import { queueService } from '../services/QueueService'
import { userService } from '../services/UserService'
import { validateRealName, validateNickname } from '../utils/nameValidator'
import { useTheme } from '../composables/useTheme'
import { SKILL_LEVELS, getSkillBadgeSvg } from '../components/skillBadges'

// เพิ่มตัวแปรระดับฝีมือ
const formSkillLevel = ref('BG')

const { isDarkMode, toggleTheme } = useTheme()

const DEV_BYPASS_GPS = false // 🚨 ค่าตายตัวเดิม (กันใช้งานบังคับเฉพาะ local demo)

// Flag ส่วนกลางจากตาราง system_settings (key = gps_filter_enabled)
// แอดมินเท่านั้นที่สลับได้จากหน้าแอดมิน -> ผู้เล่นทุกหน้าเชื่อถือค่านี้
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
    // สลับโหมดแล้ว -> ต้องรีดจำนวนผู้เล่นบนสนามทันที (โหมดไม่กรอง = นับทุกโปรไฟล์)
    loadOnSiteCount()
  } catch (err) {
    console.error('ดึงค่า gps_filter_enabled ไม่ได้:', err.message)
  }
}

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

// สถิติการเล่นของผู้ใช้ (จำนวนครั้งที่ลงเล่น / ชนะ / เสมอ) — โหลดเมื่อเปิดหน้าแก้ไขโปรไฟล์
const playerStats = ref(null)


// State สำหรับ Modal ดึงเพื่อนเข้าคิว
const showInviteModal = ref(false)
const targetQueueIdForInvite = ref(null)
const availableFriends = ref([])
const inviteSearchKeyword = ref('')

// ตัวกรองรายชื่อใน modal "เพิ่มผู้เล่น" — ผูกกับ inviteSearchKeyword
// (template ใช้ filteredAvailableFriends ที่บรรทัด 599/600/605 แต่ script ไม่เคย
//  ประกาศ → เป็น undefined → v-for วนไม่ได้ → modal ว่างทั้งที่ availableFriends มีคน
//  แก้ 2026-09-20: ประกาศ computed นี้ให้ตรงกับที่ template ใช้)
const filteredAvailableFriends = computed(() => {
  const kw = (inviteSearchKeyword.value || '').trim().toLowerCase()
  if (!kw) return availableFriends.value
  return (availableFriends.value || []).filter(u =>
    (u.nickname || '').toLowerCase().includes(kw) ||
    (u.real_name || '').toLowerCase().includes(kw) ||
    (u.role || '').toLowerCase().includes(kw) ||
    (u.faculty || '').toLowerCase().includes(kw)
  )
})
const isFetchingFriends = ref(false)

// State สำหรับ Modal ดูข้อมูลผู้เล่น (แตะชื่อ/อวาตาร์ในการ์ดคิว)
const showPlayerInfoModal = ref(false)
const playerInfoTarget = ref(null)
const openPlayerInfo = (p) => {
  playerInfoTarget.value = p || null
  showPlayerInfoModal.value = !!p
}
const getPlayerSkillLabel = (id) => {
  const found = SKILL_LEVELS.find(l => l.id === id)
  return found ? found.label : (id || 'มือทั่วไป')
}

// ตรวจสอบว่าผู้ใช้ปัจจุบันเป็นคนสร้างการ์ด (สมาชิกคนแรกในการ์ด) หรือไม่
const isQueueCreator = (queue) => {
  return Array.isArray(queue.players) && 
         queue.players.length > 0 && 
         queue.players[0].deviceId === deviceId.value
}

// เปิดหน้าต่างเลือกเพื่อน
const openInviteModal = async (queueId) => {
  targetQueueIdForInvite.value = queueId
  showInviteModal.value = true
  isFetchingFriends.value = true
  try {
    const todayStr = getTodayDateString()
    const list = await queueService.getAvailablePlayersOnSite(todayStr, { gpsFilterOn: gpsFilterEnabled.value })
    // ตัดตัวเองออก
    availableFriends.value = list.filter(u => u.device_id !== deviceId.value)
    // ========================================================================
    // DEBUG 2026-09-20: เช็คว่าข้อมูลถึง view แล้วจริงไหม (service OK ≠ modal เห็น)
    //   - availableFriends=0  +  service คืน OK -> ตัว filter นี้ตัดหมด?
    //   - availableFriends>0  +  modal ว่าง            -> อยู่ที่ computed/template
    //   อย่าลืม hard refresh ให้ script re-run
    // ========================================================================
    console.log('[DEBUG openInviteModal] list=', list.length,
      '→ availableFriends=', availableFriends.value.length,
      '(ตัดตัวเองออกแล้ว) search=', (inviteSearchKeyword.value || '').trim() || '(ว่าง)')
    // ========================================================================
  } catch (err) {
    alert('ไม่สามารถดึงรายชื่อผู้เล่นในสนามได้: ' + err.message)
  } finally {
    isFetchingFriends.value = false
  }
}

// ยืนยันการดึงเพื่อนเข้าคิว
const inviteFriendToQueue = async (friendDeviceId) => {
  if (!targetQueueIdForInvite.value) return
  loading.value = true
  try {
    await queueService.addPlayerToQueue(targetQueueIdForInvite.value, friendDeviceId)
    showInviteModal.value = false
    await fetchActiveQueuesFromSupabase()
  } catch (err) {
    alert(err.message)
  } finally {
    loading.value = false
  }
}

// 🚨 ประกาศตัวแปร Channel ให้ครบ เพื่อไม่ให้ Error ตอน Unmount
let gpsInterval = null
let watchdogInterval = null
let settingsChannel = null
let queueChannel = null
let courtChannel = null
let queueMembersChannel = null
let dailyCheckinsChannel = null

const supabaseQueues = ref([])
const supabaseActiveQueues = ref([])

// 1. ดึงคิวจาก Supabase อย่างถูกต้อง (กรองคิวผีออก)
const fetchActiveQueuesFromSupabase = async () => {
  try {
    const { data, error } = await supabase.from('active_queues_view').select('*')
    if (error) throw error

    if (data) {
      // 🚨 บังคับกรอง: เอาเฉพาะสถานะที่กำลังเล่น/รอเล่น และ "ต้องมีคนอย่างน้อย 1 คน"
      const validQueues = data.filter(q =>
        ['WAITING', 'CALLING', 'IN_PROGRESS', 'ASSIGNED', 'SKIPPED', 'ON_HOLD'].includes(q.status) &&
        Array.isArray(q.players) &&
        q.players.length > 0
      )

      // จัดเรียงคิวตามลำดับเวลา
      validQueues.sort((a, b) => new Date(a.created_at) - new Date(b.created_at))

      supabaseActiveQueues.value = validQueues
      queues.value = validQueues 
    }
  } catch (err) {
    console.error('Error fetching queues:', err)
  }
}

// 2. ดึงข้อมูลสนาม
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

// เวลาที่เล่นไปแล้วของคู่ที่กำลังแข่ง (นับจากแอดมินกดเริ่มเกม = statusUpdatedAt)
const getPlayElapsed = (court) => {
  if (!court || !court.statusUpdatedAt) return '00:00'
  const elapsed = Math.max(0, Math.floor((now.value - court.statusUpdatedAt) / 1000))
  const m = Math.floor(elapsed / 60)
  const s = elapsed % 60
  return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
}

// ------------------------------------------------------------------
// ประมาณเวลารอแบบเรียลไทม์ของคิวที่ครบ 4 คน (สถานะ "รอเรียก") — ตรรกะเดียวกับ AdminView
//   * คอร์ดกำลังเล่น/กำลังเรียก -> ว่างอีกครั้งเวลา (statusUpdatedAt || now) + T (ยึดกับ wall-clock)
//   * คอร์ดว่าง -> ว่างทันที
//   * จองคอร์ดที่ว่างเร็วที่สุดให้คิวครบ 4 คนที่มีลำดับอยู่ก่อน (FIFO) ทีละคิว
//     แต่ละคิวที่แซงหน้า = 1 แมตช์ (20 นาที)
// ใช้ now.value ที่ tick ทุกวินาที -> นับถอยหลังอัตโนมัติ
const ESTIMATED_MATCH_MINUTES = 20
const ESTIMATED_MATCH_MS = ESTIMATED_MATCH_MINUTES * 60 * 1000

const getEstimatedWaitSeconds = (queue) => {
  if (!queue || !Array.isArray(queue.players) || queue.players.length !== 4) return 0
  const T = ESTIMATED_MATCH_MS

  // รายการเวลาที่แต่ละคอร์ดจะว่าง (wall-clock ms) — now = ว่างอยู่แล้ว
  const freeAt = []
  courts.value.forEach(c => {
    if (c.status === 'CLOSED') return
    if (c.status === 'AVAILABLE') {
      freeAt.push(now.value)
      return
    }
    if (c.status === 'IN_PROGRESS') {
      // แมตช์เล่นเกิน 20 นาทีมาแล้ว (freeAt ตกในอดีต) -> คอร์ดนี้กำลังจะว่างทันที
      freeAt.push(Math.max((c.statusUpdatedAt || now.value) + T, now.value))
      return
    }
    if (c.status === 'CALLING') {
      // เรียกคิวแล้ว -> นับเต็ม 1 แมตช์จากตอนนี้ (กัน statusUpdatedAt ค้างอยู่ในอดีต)
      freeAt.push(Math.max((c.statusUpdatedAt || now.value) + T, now.value + T))
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
  freeAt.sort((a, b) => a - b)
  for (let i = 0; i < aheadCount && freeAt.length > 0; i++) {
    freeAt[0] += T
    freeAt.sort((a, b) => a - b)
  }

  if (freeAt.length === 0) return 0
  return Math.max(0, Math.ceil((freeAt[0] - now.value) / 1000))
}

// pill บนการ์ดคิว (ผู้เล่น) — เต็มรูปแบบ
const getEstimatedWaitText = (queue) => {
  const secs = getEstimatedWaitSeconds(queue)
  if (secs <= 0) return 'กำลังจะถึงคิวคุณ'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `รอคอร์ตว่างประมาณ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} น.`
}

// เซลล์ตารางลำดับคิว — รูปสั้น (ไว้ต่อท้ายคำว่า "รอเรียก")
const getEstimatedWaitTextShort = (queue) => {
  const secs = getEstimatedWaitSeconds(queue)
  if (secs <= 0) return 'กำลังจะถึงคิว'
  const m = Math.floor(secs / 60)
  const s = secs % 60
  return `ประมาณ ${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')} น.`
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
  if (!court.currentQueueId) return '- ว่าง -'
  const matchQueue = queues.value.find(q => q.id === court.currentQueueId) || supabaseActiveQueues.value.find(q => q.id === court.currentQueueId)
  return (matchQueue && matchQueue.players && matchQueue.players[slotIndex]) ? matchQueue.players[slotIndex].name : '- ว่าง -'
}

// ---------------------------------------------------------
// ระบบเช็คอินรายวัน (Daily Check-in)
// ---------------------------------------------------------
const getTodayDateString = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const getFormattedTime = () => {
  return new Date().toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' }) + ' น.'
}

const handleDailyCheckIn = async () => {
  if (!userProfile.value || !deviceId.value) return

  // daily_checkins มี FK ชี้ไปที่ profiles -> ต้องการให้ device มี identity ก่อน
  await userService.ensureIdentity(deviceId.value)
  
  const todayStr = getTodayDateString()
  const nowTime = getFormattedTime()

  try {
    const { data: existing } = await supabase
      .from('daily_checkins')
      .select('id')
      .eq('date', todayStr)
      .eq('device_id', deviceId.value)

    if (existing && existing.length > 0) {
      await supabase.from('daily_checkins').update({
        status: 'INSIDE',
        last_active_at: Date.now()
      }).eq('id', existing[0].id)
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
    .eq('date', getTodayDateString())
    .eq('device_id', deviceId.value)
    .is('check_out_at', null) 
  } catch (err) { console.error("Check-out error:", err) }
}

// ---------------------------------------------------------
// จำนวนผู้ใช้ปัจจุบันบนสนาม = daily_checkins วันนี้ที่มี status INSIDE
// (เพิ่ม/ลดตามผู้ที่เช็คอินจริง หรือผ่านเงื่อนไขกรองพิกัดแล้ว)
// ---------------------------------------------------------
const onSiteCount = ref(0)

const loadOnSiteCount = async () => {
  try {
    if (gpsFilterEnabled.value === false) {
      // แอดมินปิดกรอง GPS -> ทุกคนผ่านการกรอง -> นับทุกโปรไฟล์
      const { count, error } = await supabase
        .from('profiles')
        .select('device_id', { count: 'exact', head: true })
      if (error) throw error
      onSiteCount.value = count || 0
      return
    }
    // โหมดกรอง GPS -> นับเฉพาะผู้ที่เช็คอินผ่านวันนี้ (daily_checkins = INSIDE)
    // (ไม่กรอง last_active_at — ใช้เช็คอิน/เช็คเอาต์ควบคุมการเพิ่ม-ลดแทน กันคอลัมน์เก่าตัดเลขจนเป็น 0)
    const { data, error } = await supabase
      .from('daily_checkins')
      .select('device_id')
      .eq('date', getTodayDateString())
      .eq('status', 'INSIDE')
    if (error) throw error
    onSiteCount.value = new Set((data || []).map(r => r.device_id)).size
  } catch (err) {
    console.error('ดึงจำนวนผู้ใช้บนสนามไม่ได้:', err.message)
  }
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

const requestLocation = () => {
  if (isGpsBypass()) {
    gpsStatus.value = 'IN_RANGE'
    lastGpsState.value = 'IN_RANGE'
    userDistance.value = 0
    // เช็คอินเข้าสู่ระบบเมื่อเปิดเว็บ
    if (userProfile.value && deviceId.value) {
      handleDailyCheckIn()
    }
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
      const dist = calculateDistance(pos.coords.latitude, pos.coords.longitude, VENUE_LAT, VENUE_LNG)
      userDistance.value = dist
      
      const newState = dist <= MAX_DISTANCE_METERS ? 'IN_RANGE' : 'OUT_OF_RANGE'
      gpsStatus.value = newState
      
      if (lastGpsState.value !== newState) {
        lastGpsState.value = newState
        if (newState === 'IN_RANGE') handleDailyCheckIn()
        else if (newState === 'OUT_OF_RANGE') handleDailyCheckOut()
      }
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

  // ✅ ตรวจรูปแบบชื่อก่อนบันทึก (ชื่อจริงไทย / ชื่อเล่นไทย-อังกฤษ)
  const realNameCheck = validateRealName(formRealName.value)
  if (!realNameCheck.ok) {
    alert(realNameCheck.message)
    return
  }
  const nickCheck = validateNickname(tempName.value)
  if (!nickCheck.ok) {
    alert(nickCheck.message)
    return
  }

  // ถ้าไม่มี deviceId ให้สร้างหรือดึงจาก LocalStorage ทันที
  if (!deviceId.value) {
    let localId = localStorage.getItem('badminton_local_device_id')
    if (!localId) {
      localId = 'USR-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
      localStorage.setItem('badminton_local_device_id', localId)
    }
    deviceId.value = localId
  }

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

    playerName.value = tempName.value
    userProfile.value = prof
    localStorage.setItem('badminton_user_profile', JSON.stringify(prof))
    isEditingProfile.value = false

    if (isGpsBypass() || gpsStatus.value === 'IN_RANGE') {
      await handleDailyCheckIn()
    }
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
    loadPlayerStats()
  }
}

const loadPlayerStats = async () => {
  if (!deviceId.value) return
  try {
    playerStats.value = await queueService.getPlayerMatchStats(deviceId.value)
  } catch (err) {
    console.error('[PlayerView] โหลดสถิติไม่สำเร็จ:', err.message)
    playerStats.value = null
  }
}

const handleCreateQueue = async () => {
  unlockAudioContext()
  if (isUserInAnyQueue.value) {
    alert('คุณมีชื่ออยู่ในคิวแล้ว ไม่สามารถสร้างคิวใหม่ได้')
    return
  }
  if (areAllCourtsClosed.value || gpsStatus.value !== 'IN_RANGE') return
  
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
const unlockAudioContext = () => {
  try {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext
      if (!AC) return
      audioCtx = new AC()
    }
    if (audioCtx.state === 'suspended') audioCtx.resume()
  } catch (err) {
    // บราวเซอร์ที่ไม่รองรับ WebAudio -> ข้าม
  }
}

const playBeepSound = () => {
  try {
    if (!audioCtx) return
    if (audioCtx.state === 'suspended') audioCtx.resume()
    const now = audioCtx.currentTime
    for (const [freq, start, dur] of [[880, 0, 0.18], [660, 0.2, 0.22]]) {
      const osc = audioCtx.createOscillator()
      const gain = audioCtx.createGain()
      osc.type = 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, now + start)
      gain.gain.exponentialRampToValueAtTime(0.45, now + start + 0.03)
      gain.gain.exponentialRampToValueAtTime(0.0001, now + start + dur)
      osc.connect(gain)
      gain.connect(audioCtx.destination)
      osc.start(now + start)
      osc.stop(now + start + dur + 0.05)
    }
  } catch (err) {
    // ไม่มี WebAudio -> ข้ามเสียง แต่ยังสั่นได้
  }
}

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

// ปลุกเมื่อคิวของเราถูกเรียก (court -> CALLING) และหยุดเมื่อเริ่มเกม/เปลี่ยนสถานะ
// ครั้งเดียวต่อการเรียกคิวหนึ่งครั้ง (กด "รับทราบ" แล้วจะไม่ปลุกซ้ำ)
let alarmAckedQueueId = null

watch(
  () => courts.value.map(c => ({ id: c.currentQueueId, status: c.status })),
  () => {
    const mine = courts.value.find(c => c.status === 'CALLING' && c.currentQueueId && myActiveCourt.value)
    if (mine) {
      if (alarmAckedQueueId !== mine.id) {
        unlockAudioContext()
        alarmAckedQueueId = mine.id
        startAlarm()
      }
    } else {
      alarmAckedQueueId = null
      if (isAlerting.value) {
        stopAlarm()
      }
    }
  },
  { deep: true }
)

onMounted(async () => {
  // 🚨 1. โหลดข้อมูลครั้งแรก (ใช้คำสั่งที่ถูกต้อง)
  loadCourtsData()
  fetchActiveQueuesFromSupabase()

  let localId = localStorage.getItem('badminton_local_device_id')
  
  if (!localId) {
    // เช็กว่ามีโปรไฟล์เก่าค้างอยู่ในเครื่องไหม ถ้ามีให้เอารหัสเดิมมาใช้
    const oldProfile = JSON.parse(localStorage.getItem('badminton_user_profile') || '{}')
    if (oldProfile && oldProfile.deviceId) {
      localId = oldProfile.deviceId
    } else {
      // ถ้าไม่มีจริงๆ ถึงจะสร้าง USR- ใหม่
      localId = 'USR-' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36)
    }
    localStorage.setItem('badminton_local_device_id', localId)
  }
  
  deviceId.value = localId

  // 🚨 2. จัดการ Realtime Channels (ประกาศแค่ชุดเดียว)
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

  // 3. โหลดโปรไฟล์เดิมจากฐานข้อมูล (ยึด device_id เป็นตัวตนเดียว)
  try {
    const data = await userService.getProfile(deviceId.value)
    if (data) {
      userProfile.value = data
      playerName.value = data.nickname || data.name || ''
      tempName.value = playerName.value
      formRealName.value = data.realName || ''
      formRole.value = data.role || 'นิสิต'
      formFaculty.value = data.faculty || ''
      selectedAvatarId.value = data.avatarId || 'boy-cap'
      formSkillLevel.value = data.skillLevel || 'BG'
      localStorage.setItem('badminton_user_profile', JSON.stringify(data))
      if (gpsStatus.value === 'IN_RANGE') handleDailyCheckIn()
    }
  } catch (err) {
    console.error("Error fetching user profile:", err)
  }

  // 3.5 โหลดค่าตั้งค่าระบบ (แอดมินปิดกรอง GIS ทั่วสนามแล้วหรือยัง) + ฟังการเปลี่ยนแบบ realtime
  loadGpsFilterSetting()
  settingsChannel = supabase
    .channel('player:settings_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'system_settings' }, () => {
      loadGpsFilterSetting()
    })
    .subscribe()

  // 3.6 จำนวนผู้ใช้บนสนาม (เพิ่ม/ลดตาม daily_checkins วันนี้ = INSIDE) + ฟัง realtime
  loadOnSiteCount()
  dailyCheckinsChannel = supabase
    .channel('player:daily_checkins_sync')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_checkins' }, () => {
      loadOnSiteCount()
    })
    .subscribe()

  // 4. Timer ต่างๆ
  countdownInterval = setInterval(() => { now.value = Date.now() }, 1000)
  requestLocation()
  // check-in เป็นแบบ upsert -> ลองใหม่ทุก tick กันพลาดตอนโปรไฟล์ยังไม่โหลด
  gpsInterval = setInterval(() => {
    requestLocation()
    if (gpsStatus.value === 'IN_RANGE') handleDailyCheckIn()
    loadOnSiteCount()
  }, 30000)

  // 5. Watchdog (แทน pg_cron ฟรี): ช่วยปลดคอร์ด CALLING ค้างเกิน 3 นาที
  //    เรียก self-heal ฝั่งเซิร์ฟเวอร์ทุก 60 วินาที (RPC ฟรี) เผื่อหน้าแอดมินไม่ได้เปิด
  watchdogInterval = setInterval(() => { queueService.runCourtMaintenance() }, 60000)
})

onUnmounted(() => {
  if (gpsInterval) clearInterval(gpsInterval)
  if (watchdogInterval) clearInterval(watchdogInterval)
  if (alarmInterval) clearInterval(alarmInterval)
  if (countdownInterval) clearInterval(countdownInterval)
  if (audioCtx) audioCtx.close()
  stopVibration()
  if (settingsChannel) supabase.removeChannel(settingsChannel)
  if (dailyCheckinsChannel) supabase.removeChannel(dailyCheckinsChannel)
  if (queueChannel) supabase.removeChannel(queueChannel)
  if (courtChannel) supabase.removeChannel(courtChannel)
  if (queueMembersChannel) supabase.removeChannel(queueMembersChannel)
})

// ตัวแปรเช็กสถานะการเลื่อนหน้าจอ
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