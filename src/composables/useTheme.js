import { ref, onMounted } from 'vue'

export function useTheme() {
  const isDarkMode = ref(false)

  // ดึงค่าโหมดเดิมที่เคยเลือกไว้ตอนเข้าเว็บมาใหม่
  const initTheme = () => {
    if (localStorage.getItem('theme') === 'dark' || 
       (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      isDarkMode.value = true
      document.documentElement.classList.add('dark')
    } else {
      isDarkMode.value = false
      document.documentElement.classList.remove('dark')
    }
  }

  // ฟังก์ชันสลับโหมด
  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value
    if (isDarkMode.value) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  onMounted(() => {
    initTheme()
  })

  return { isDarkMode, toggleTheme }
}